import * as THREE from 'three';

import type { Node, NodeId, RoadId, SimSnapshot } from '@/sim';
import type { SimFrame } from '@/sim/systems/interpolation';
import {
  GRAPH_NODE_HEIGHT,
  GRAPH_ROAD_ELEVATION,
  LANE_WIDTH_METERS,
  ROAD_THICKNESS,
  createGraphNodeMesh,
  createRoadMesh,
} from '@/engine/objects/graph-primitives';
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

export class GraphView {
  private readonly scene: THREE.Scene;
  private readonly root = new THREE.Group();
  private readonly nodeGroup = new THREE.Group();
  private readonly roadGroup = new THREE.Group();
  private readonly nodeMeshes = new Map<NodeId, THREE.Mesh>();
  private readonly roadMeshes = new Map<RoadId, THREE.Mesh>();
  private readonly nodePosition = new THREE.Vector3();
  private readonly tempStart = new THREE.Vector3();
  private readonly tempEnd = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'GraphView.Root';
    this.nodeGroup.name = 'GraphView.Nodes';
    this.roadGroup.name = 'GraphView.Roads';

    this.root.add(this.roadGroup);
    this.root.add(this.nodeGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame): void {
    const snapshot = frame.snapshotB;
    const transform = computeGraphTransform(snapshot);
    this.syncRoads(snapshot, transform);
    this.syncNodes(snapshot, transform);
  }

  dispose(): void {
    this.scene.remove(this.root);

    for (const mesh of this.nodeMeshes.values()) {
      this.nodeGroup.remove(mesh);
      mesh.geometry.dispose();
      disposeMaterial(mesh.material);
    }
    this.nodeMeshes.clear();

    for (const mesh of this.roadMeshes.values()) {
      this.roadGroup.remove(mesh);
      // We share geometry for roads (BoxGeometry), so we shouldn't dispose it here if it's shared.
      // However, createRoadMesh uses a shared constant geometry.
      // So we only dispose material.
      disposeMaterial(mesh.material);
    }
    this.roadMeshes.clear();
  }

  private syncNodes(snapshot: SimSnapshot, transform: GraphTransform): void {
    const seen = new Set<NodeId>();
    for (const node of Object.values(snapshot.nodes)) {
      seen.add(node.id);
      let mesh = this.nodeMeshes.get(node.id);
      if (!mesh) {
        mesh = createGraphNodeMesh();
        mesh.name = `GraphView.Node.${node.id}`;
        this.nodeMeshes.set(node.id, mesh);
        this.nodeGroup.add(mesh);
      }
      toVector3(node, transform, this.nodePosition);
      mesh.position.copy(this.nodePosition);
      mesh.position.y += GRAPH_NODE_HEIGHT / 2;
    }

    for (const [id, mesh] of this.nodeMeshes) {
      if (seen.has(id)) continue;
      this.nodeGroup.remove(mesh);
      mesh.geometry.dispose();
      disposeMaterial(mesh.material);
      this.nodeMeshes.delete(id);
    }
  }

  private syncRoads(snapshot: SimSnapshot, transform: GraphTransform): void {
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

      const length = this.tempStart.distanceTo(this.tempEnd);
      const width = road.lanes * LANE_WIDTH_METERS * transform.scale;

      // Position at midpoint
      mesh.position.lerpVectors(this.tempStart, this.tempEnd, 0.5);
      // Lift slightly to sit on ground (Box center is at 0)
      mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS / 2;

      // Scale
      // X = width
      // Y = thickness
      // Z = length
      // Note: BoxGeometry is 1x1x1.
      mesh.scale.set(width, ROAD_THICKNESS, length);

      // Rotation
      // Align local Z to direction from start to end
      // We assume start and end are at same Y (GRAPH_ROAD_ELEVATION).
      // mesh.lookAt aligns +Z axis to target.
      // Our mesh length is along Z (scale.z).
      mesh.lookAt(this.tempEnd.x, mesh.position.y, this.tempEnd.z);
    }

    for (const [id, mesh] of this.roadMeshes) {
      if (seen.has(id)) continue;
      this.roadGroup.remove(mesh);
      // Do not dispose geometry as it is shared (BoxGeometry)
      disposeMaterial(mesh.material);
      this.roadMeshes.delete(id);
    }
  }
}
