import * as THREE from 'three';

import type { Node, NodeId, RoadId, SimSnapshot } from '@/sim';
import type { SimFrame } from '@/sim/systems/interpolation';
import {
  GRAPH_NODE_HEIGHT,
  GRAPH_ROAD_ELEVATION,
  createGraphNodeMesh,
  createGraphRoadLine,
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
  private readonly roadLines = new Map<RoadId, THREE.Line>();
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

    for (const line of this.roadLines.values()) {
      this.roadGroup.remove(line);
      line.geometry.dispose();
      disposeMaterial(line.material);
    }
    this.roadLines.clear();
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
      let line = this.roadLines.get(road.id);
      if (!line) {
        line = createGraphRoadLine();
        line.name = `GraphView.Road.${road.id}`;
        this.roadLines.set(road.id, line);
        this.roadGroup.add(line);
      }

      const attribute = line.geometry.getAttribute(
        'position',
      ) as THREE.BufferAttribute;
      toVector3(startNode, transform, this.tempStart);
      toVector3(endNode, transform, this.tempEnd);
      attribute.setXYZ(0, this.tempStart.x, this.tempStart.y, this.tempStart.z);
      attribute.setXYZ(1, this.tempEnd.x, this.tempEnd.y, this.tempEnd.z);
      attribute.needsUpdate = true;
      line.geometry.computeBoundingSphere();
    }

    for (const [id, line] of this.roadLines) {
      if (seen.has(id)) continue;
      this.roadGroup.remove(line);
      line.geometry.dispose();
      disposeMaterial(line.material);
      this.roadLines.delete(id);
    }
  }
}
