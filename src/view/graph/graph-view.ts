import * as THREE from 'three';

import type {
  BuildingId,
  NodeId,
  Parking,
  RoadId,
  Site,
  SimSnapshot,
} from '@/sim';
import type { SimFrame } from '@/sim/systems/interpolation';
import { createIntersectionMesh } from '@/engine/objects/node';
import {
  GRAPH_ROAD_ELEVATION,
  LANE_WIDTH_METERS,
  ROAD_THICKNESS,
  createRoadMesh,
  getRoadZOffset,
  getRoadWidth,
} from '@/engine/objects/road';
import { createSite } from '@/engine/objects/site';
import {
  createParkingLot,
  PARKING_SPOT_WIDTH,
  PARKING_SPOT_DEPTH,
  PARKING_CORRIDOR_WIDTH,
} from '@/engine/objects/parking';
import {
  type GraphTransform,
  computeGraphTransform,
  toVector3,
} from '@/view/graph/graph-transform';

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    for (const m of material) m.dispose();
  } else {
    material.dispose();
  }
}

function disposeObject3D(obj: THREE.Object3D): void {
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      disposeMaterial(child.material);
    }
  });
}

interface ConnectedRoad {
  roadId: RoadId;
  angle: number;
  width: number;
}

interface RoadOffsets {
  start: number;
  end: number;
}

export class GraphView {
  private readonly scene: THREE.Scene;
  private readonly root = new THREE.Group();
  private readonly intersectionGroup = new THREE.Group();
  private readonly roadGroup = new THREE.Group();
  private readonly siteGroup = new THREE.Group();
  private readonly parkingGroup = new THREE.Group();
  private readonly intersectionMeshes = new Map<NodeId, THREE.Mesh>();
  private readonly roadMeshes = new Map<RoadId, THREE.Mesh>();
  private readonly siteMeshes = new Map<BuildingId, THREE.Group>();
  private readonly parkingMeshes = new Map<BuildingId, THREE.Group>();
  private readonly nodePosition = new THREE.Vector3();
  private readonly tempStart = new THREE.Vector3();
  private readonly tempEnd = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'GraphView.Root';
    this.intersectionGroup.name = 'GraphView.Intersections';
    this.roadGroup.name = 'GraphView.Roads';
    this.siteGroup.name = 'GraphView.Sites';
    this.parkingGroup.name = 'GraphView.Parkings';

    this.root.add(this.roadGroup);
    this.root.add(this.intersectionGroup);
    this.root.add(this.siteGroup);
    this.root.add(this.parkingGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame, externalTransform?: GraphTransform): void {
    const snapshot = frame.snapshotB;
    const transform = externalTransform || computeGraphTransform(snapshot);

    // 1. Build adjacency list with geometry info
    const adjacency = new Map<NodeId, ConnectedRoad[]>();

    for (const road of Object.values(snapshot.roads)) {
      const startNode = snapshot.nodes[road.startNodeId];
      const endNode = snapshot.nodes[road.endNodeId];
      if (!startNode || !endNode) continue;

      // Use graph space for angle calculations to match rendering
      toVector3(startNode, transform, this.tempStart);
      toVector3(endNode, transform, this.tempEnd);

      // Direction from start to end
      const dx = this.tempEnd.x - this.tempStart.x;
      const dz = this.tempEnd.z - this.tempStart.z;
      const angleStart = Math.atan2(dz, dx);
      const angleEnd = Math.atan2(-dz, -dx); // Direction from end to start

      const width = getRoadWidth(road.lanes) * transform.scale;

      if (!adjacency.has(road.startNodeId)) adjacency.set(road.startNodeId, []);
      adjacency
        .get(road.startNodeId)!
        .push({ roadId: road.id, angle: angleStart, width });

      if (!adjacency.has(road.endNodeId)) adjacency.set(road.endNodeId, []);
      adjacency
        .get(road.endNodeId)!
        .push({ roadId: road.id, angle: angleEnd, width });
    }

    // 2. Calculate Offsets and Sync Intersections
    const roadOffsets = new Map<RoadId, RoadOffsets>();
    const seenIntersections = new Set<NodeId>();

    const getOffsets = (id: RoadId) => {
      if (!roadOffsets.has(id)) roadOffsets.set(id, { start: 0, end: 0 });
      return roadOffsets.get(id)!;
    };

    for (const [nodeId, connections] of adjacency) {
      seenIntersections.add(nodeId);

      // If only 1 road, it's a dead end. Don't cut it, don't draw intersection.
      // Just leave the road ending at the node center.
      if (connections.length < 2) {
        const mesh = this.intersectionMeshes.get(nodeId);
        if (mesh) {
          this.intersectionGroup.remove(mesh);
          mesh.geometry.dispose();
          disposeMaterial(mesh.material);
          this.intersectionMeshes.delete(nodeId);
        }
        continue;
      }

      // Sort by angle
      connections.sort((a, b) => a.angle - b.angle);

      const points: THREE.Vector2[] = [];

      for (const conn of connections) {
        const margin = conn.width; // Start with road width as margin

        const offsets = getOffsets(conn.roadId);
        const road = snapshot.roads[conn.roadId];
        if (road.startNodeId === nodeId) offsets.start = margin;
        else if (road.endNodeId === nodeId) offsets.end = margin;

        // Geometry calculation (in local 2D around node)
        // Angle is direction AWAY from node.
        const cos = Math.cos(conn.angle);
        const sin = Math.sin(conn.angle);

        // Center of cut
        const cx = cos * margin;
        const cy = sin * margin;

        // Right vector (rotated -90 deg: y, -x)
        const rx = sin;
        const ry = -cos;

        // Corners
        const halfWidth = conn.width / 2;

        // Right corner
        const rCx = cx + rx * halfWidth;
        const rCy = cy + ry * halfWidth;

        // Left corner
        const lCx = cx - rx * halfWidth;
        const lCy = cy - ry * halfWidth;

        // Add both corners to polygon in order
        // Map Sim Z (cy) to Shape Y (-cy) to match rotation.x = -Math.PI/2
        points.push(new THREE.Vector2(rCx, -rCy));
        points.push(new THREE.Vector2(lCx, -lCy));
      }

      // Sync Mesh
      let mesh = this.intersectionMeshes.get(nodeId);
      // Always recreate intersection mesh if it exists to update geometry
      if (mesh) {
        this.intersectionGroup.remove(mesh);
        mesh.geometry.dispose();
        disposeMaterial(mesh.material);
      }

      // Only create if we have points
      if (points.length > 0) {
        // Reverse points to maintain CCW winding after reflection (Z -> -Y)
        points.reverse();
        mesh = createIntersectionMesh(points);
        const node = snapshot.nodes[nodeId];
        toVector3(node, transform, this.nodePosition);
        mesh.position.copy(this.nodePosition);
        // Align with road surface top (Road center is at elev + thickness/2, so top is at elev + thickness)
        // Add small offset to stay above ground/road base
        mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS + 0.001;

        this.intersectionMeshes.set(nodeId, mesh);
        this.intersectionGroup.add(mesh);
      } else {
        this.intersectionMeshes.delete(nodeId);
      }
    }

    // Remove unseen intersections
    for (const [id, mesh] of this.intersectionMeshes) {
      if (!seenIntersections.has(id)) {
        this.intersectionGroup.remove(mesh);
        mesh.geometry.dispose();
        disposeMaterial(mesh.material);
        this.intersectionMeshes.delete(id);
      }
    }

    // 3. Sync Roads
    this.syncRoads(snapshot, transform, roadOffsets);

    // 4. Sync Buildings (parking lots and sites)
    this.syncBuildings(snapshot, transform, adjacency);
  }

  private syncBuildings(
    snapshot: SimSnapshot,
    transform: GraphTransform,
    adjacency: Map<NodeId, ConnectedRoad[]>,
  ): void {
    const seenSites = new Set<BuildingId>();
    const seenParkings = new Set<BuildingId>();

    // Group buildings by node
    const buildingsByNode = new Map<NodeId, Array<Parking | Site>>();

    for (const building of Object.values(snapshot.buildings)) {
      if (building.kind !== 'site' && building.kind !== 'parking') continue;

      if (!buildingsByNode.has(building.nodeId)) {
        buildingsByNode.set(building.nodeId, []);
      }
      buildingsByNode.get(building.nodeId)!.push(building);
    }

    // Process each building group
    for (const [nodeId, buildings] of buildingsByNode) {
      const connections = adjacency.get(nodeId);
      if (!connections || connections.length === 0) continue;

      // Create slots for this node
      // A slot is a position next to a road (left or right) within a sector
      const slots: Array<{
        conn: ConnectedRoad;
        side: 'left' | 'right';
        sectorAngle: number;
        neighborWidth: number;
      }> = [];

      const count = connections.length;
      for (let i = 0; i < count; i++) {
        const curr = connections[i];
        const next = connections[(i + 1) % count];

        // Sector angle (CCW from curr to next)
        let angle = next.angle - curr.angle;
        if (angle <= 0) angle += Math.PI * 2;

        // Slot 1: Left of Current Road (start of sector)
        slots.push({
          conn: curr,
          side: 'left',
          sectorAngle: angle,
          neighborWidth: next.width,
        });

        // Slot 2: Right of Next Road (end of sector)
        slots.push({
          conn: next,
          side: 'right',
          sectorAngle: angle,
          neighborWidth: curr.width,
        });
      }

      // Sort slots: prioritize large sectors, then right side
      slots.sort((a, b) => {
        if (Math.abs(b.sectorAngle - a.sectorAngle) > 0.01) {
          return b.sectorAngle - a.sectorAngle;
        }
        return a.side === 'right' ? -1 : 1;
      });

      // Sort buildings: Sites first (larger)
      buildings.sort((a, b) => {
        const scoreA = a.kind === 'site' ? 2 : 1;
        const scoreB = b.kind === 'site' ? 2 : 1;
        return scoreB - scoreA;
      });

      // Assign buildings to slots
      for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        const slot = slots[i % slots.length];

        // Calculate corner push
        // If sector is sharp (< 90 deg), push out
        let cornerPush = 0;
        if (slot.sectorAngle < Math.PI / 2) {
          const factor = 1.0 / Math.sin(slot.sectorAngle / 2);
          cornerPush = factor * (slot.neighborWidth + 2 * transform.scale);
        }

        if (building.kind === 'site') {
          seenSites.add(building.id);
          this.syncSite(
            building,
            snapshot,
            transform,
            nodeId,
            slot.conn,
            cornerPush,
            slot.side,
          );
        } else if (building.kind === 'parking') {
          seenParkings.add(building.id);
          this.syncParking(
            building,
            snapshot,
            transform,
            nodeId,
            slot.conn,
            cornerPush,
            slot.side,
          );
        }
      }
    }

    // Cleanup unseen buildings
    for (const [id, mesh] of this.siteMeshes) {
      if (!seenSites.has(id)) {
        this.siteGroup.remove(mesh);
        disposeObject3D(mesh);
        this.siteMeshes.delete(id);
      }
    }

    for (const [id, mesh] of this.parkingMeshes) {
      if (!seenParkings.has(id)) {
        this.parkingGroup.remove(mesh);
        disposeObject3D(mesh);
        this.parkingMeshes.delete(id);
      }
    }
  }

  private syncSite(
    building: Site,
    snapshot: SimSnapshot,
    transform: GraphTransform,
    nodeId: NodeId,
    conn: ConnectedRoad,
    cornerPush: number,
    side: 'left' | 'right',
  ): void {
    let mesh = this.siteMeshes.get(building.id);
    if (!mesh) {
      mesh = createSite();
      mesh.userData = { buildingId: building.id };
      // Scale the site group to match graph scale, but make it 3x smaller
      // Note: createDeliverySite already applies 0.375 scale
      // So: (transform.scale / 0.375) / 3 = transform.scale / 1.125
      mesh.scale.multiplyScalar(transform.scale / 1.125);
      this.siteMeshes.set(building.id, mesh);
      this.siteGroup.add(mesh);
    }

    const node = snapshot.nodes[nodeId];
    if (!node) return;

    toVector3(node, transform, this.nodePosition);

    const dirX = Math.cos(conn.angle);
    const dirZ = Math.sin(conn.angle);

    // Right vector (rotated -90 deg in XZ plane)
    // or Left (rotated +90 deg)
    let perpX, perpZ;
    if (side === 'right') {
      perpX = dirZ;
      perpZ = -dirX;
    } else {
      perpX = -dirZ;
      perpZ = dirX;
    }

    // Site dimensions after createDeliverySite's 0.375 scale, then divided by 3
    // apronWidth = 60 * 0.375 / 3 = 7.5, apronDepth = 45 * 0.375 / 3 = 5.625
    const siteWidth = 7.5 * (transform.scale / 0.375);
    const siteDepth = 5.625 * (transform.scale / 0.375);

    // Offsets
    // Move along road enough to clear intersection + half site width + corner push
    const distAlong =
      conn.width + 2 * transform.scale + siteWidth / 2 + cornerPush;

    // Move sideways to clear road half-width + half site depth
    const roadHalfWidth = conn.width / 2;
    const distSide = roadHalfWidth + 1 * transform.scale + siteDepth / 2;

    mesh.position.x = this.nodePosition.x + dirX * distAlong + perpX * distSide;
    mesh.position.z = this.nodePosition.z + dirZ * distAlong + perpZ * distSide;
    // Use graph road elevation so it sits on same plane
    mesh.position.y = GRAPH_ROAD_ELEVATION;

    // Align rotation with road
    // If right: -conn.angle
    // If left: -conn.angle + PI
    mesh.rotation.y = -conn.angle + (side === 'left' ? Math.PI : 0);
  }

  private syncParking(
    building: Parking,
    snapshot: SimSnapshot,
    transform: GraphTransform,
    nodeId: NodeId,
    conn: ConnectedRoad,
    cornerPush: number,
    side: 'left' | 'right',
  ): void {
    let mesh = this.parkingMeshes.get(building.id);
    if (!mesh) {
      mesh = createParkingLot({ spots: building.capacity });
      mesh.userData = { buildingId: building.id };
      // Scale the parking lot group to match graph scale
      mesh.scale.setScalar(transform.scale);
      this.parkingMeshes.set(building.id, mesh);
      this.parkingGroup.add(mesh);
    }

    const node = snapshot.nodes[nodeId];
    if (!node) return;

    toVector3(node, transform, this.nodePosition);

    const dirX = Math.cos(conn.angle);
    const dirZ = Math.sin(conn.angle);

    // Right vector (rotated -90 deg in XZ plane)
    // or Left (rotated +90 deg)
    let perpX, perpZ;
    if (side === 'right') {
      perpX = dirZ;
      perpZ = -dirX;
    } else {
      perpX = -dirZ;
      perpZ = dirX;
    }

    const spotsPerRow = Math.ceil(building.capacity / 2);
    const pWidth = spotsPerRow * PARKING_SPOT_WIDTH;
    const pDepth = PARKING_SPOT_DEPTH * 2 + PARKING_CORRIDOR_WIDTH;

    const sWidth = pWidth * transform.scale;
    const sDepth = pDepth * transform.scale;

    // Offsets
    // Move along road enough to clear intersection + half parking width + corner push
    const distAlong =
      conn.width + 2 * transform.scale + sWidth / 2 + cornerPush;

    // Move sideways to clear road half-width + half parking depth
    const roadHalfWidth = conn.width / 2;
    const distSide = roadHalfWidth + 1 * transform.scale + sDepth / 2;

    mesh.position.x = this.nodePosition.x + dirX * distAlong + perpX * distSide;
    mesh.position.z = this.nodePosition.z + dirZ * distAlong + perpZ * distSide;
    // Use graph road elevation so it sits on same plane
    mesh.position.y = GRAPH_ROAD_ELEVATION;

    // Align rotation with road
    // If right: -conn.angle
    // If left: -conn.angle + PI
    mesh.rotation.y = -conn.angle + (side === 'left' ? Math.PI : 0);
  }

  private syncRoads(
    snapshot: SimSnapshot,
    transform: GraphTransform,
    offsets: Map<RoadId, RoadOffsets>,
  ): void {
    const seen = new Set<RoadId>();

    for (const road of Object.values(snapshot.roads)) {
      const startNode = snapshot.nodes[road.startNodeId];
      const endNode = snapshot.nodes[road.endNodeId];
      if (!startNode || !endNode) continue;

      seen.add(road.id);
      let mesh = this.roadMeshes.get(road.id);
      if (!mesh) {
        mesh = createRoadMesh(road.roadClass);
        mesh.name = `GraphView.Road.${road.id}`;
        this.roadMeshes.set(road.id, mesh);
        this.roadGroup.add(mesh);
      }

      toVector3(startNode, transform, this.tempStart);
      toVector3(endNode, transform, this.tempEnd);

      // Apply offsets
      const roadOffset = offsets.get(road.id) || { start: 0, end: 0 };

      const startVec = this.tempStart.clone();
      const endVec = this.tempEnd.clone();

      const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();

      // Move start point
      startVec.addScaledVector(dir, roadOffset.start);
      // Move end point
      endVec.addScaledVector(dir, -roadOffset.end);

      // Calculate new length
      let length = startVec.distanceTo(endVec);
      const originalLength = this.tempStart.distanceTo(this.tempEnd);

      // Safety check for small roads or large offsets
      if (
        length > originalLength ||
        roadOffset.start + roadOffset.end > originalLength
      ) {
        length = 0.01; // Minimal length
        startVec.copy(this.tempStart).lerp(this.tempEnd, 0.5);
        endVec.copy(startVec);
      }

      const width = road.lanes * LANE_WIDTH_METERS * transform.scale;

      // Position at midpoint of NEW segment
      mesh.position.lerpVectors(startVec, endVec, 0.5);

      const zOffset = getRoadZOffset(road.roadClass);
      mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS / 2 + zOffset;

      mesh.scale.set(width, ROAD_THICKNESS, length);

      mesh.lookAt(endVec.x, mesh.position.y, endVec.z);
    }

    for (const [id, mesh] of this.roadMeshes) {
      if (seen.has(id)) continue;
      this.roadGroup.remove(mesh);
      disposeMaterial(mesh.material);
      this.roadMeshes.delete(id);
    }
  }

  dispose(): void {
    this.scene.remove(this.root);

    for (const mesh of this.intersectionMeshes.values()) {
      this.intersectionGroup.remove(mesh);
      mesh.geometry.dispose();
      disposeMaterial(mesh.material);
    }
    this.intersectionMeshes.clear();

    for (const mesh of this.roadMeshes.values()) {
      this.roadGroup.remove(mesh);
      disposeMaterial(mesh.material);
    }
    this.roadMeshes.clear();

    for (const mesh of this.siteMeshes.values()) {
      this.siteGroup.remove(mesh);
      disposeObject3D(mesh);
    }
    this.siteMeshes.clear();

    for (const mesh of this.parkingMeshes.values()) {
      this.parkingGroup.remove(mesh);
      disposeObject3D(mesh);
    }
    this.parkingMeshes.clear();
  }
}
