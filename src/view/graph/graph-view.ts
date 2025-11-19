import * as THREE from 'three';

import type { Node, NodeId, RoadId, SimSnapshot } from '@/sim';
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
import {
  type GraphTransform,
  computeGraphTransform,
} from '@/view/graph/graph-transform';

function toVector3(
  node: Node,
  transform: GraphTransform,
  target: THREE.Vector3,
): THREE.Vector3 {
  const normalizedX = (node.x - transform.centerX) * transform.scale;
  const normalizedZ = (node.y - transform.centerY) * transform.scale;
  target.set(normalizedX, GRAPH_ROAD_ELEVATION, normalizedZ);
  return target;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    for (const m of material) m.dispose();
  } else {
    material.dispose();
  }
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
  private readonly intersectionMeshes = new Map<NodeId, THREE.Mesh>();
  private readonly roadMeshes = new Map<RoadId, THREE.Mesh>();
  private readonly nodePosition = new THREE.Vector3();
  private readonly tempStart = new THREE.Vector3();
  private readonly tempEnd = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'GraphView.Root';
    this.intersectionGroup.name = 'GraphView.Intersections';
    this.roadGroup.name = 'GraphView.Roads';

    this.root.add(this.roadGroup);
    this.root.add(this.intersectionGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame): void {
    const snapshot = frame.snapshotB;
    const transform = computeGraphTransform(snapshot);

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
  }
}
