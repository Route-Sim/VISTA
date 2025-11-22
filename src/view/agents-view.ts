import * as THREE from 'three';

import type { SimFrame } from '@/sim/systems/interpolation';
import type { TruckId } from '@/sim/domain/ids';
import type { Truck } from '@/sim/domain/entities';
import { createTruckMesh } from '@/engine/objects/truck';
import { type GraphTransform, toVector3 } from '@/view/graph/graph-transform';
import { GRAPH_ROAD_ELEVATION, ROAD_THICKNESS } from '@/engine/objects/road';

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

export class AgentsView {
  private readonly scene: THREE.Scene;
  private readonly root = new THREE.Group();
  private readonly truckGroup = new THREE.Group();
  private readonly truckMeshes = new Map<TruckId, THREE.Group>();

  // Reusable vectors to avoid allocation
  private readonly tempStart = new THREE.Vector3();
  private readonly tempEnd = new THREE.Vector3();
  private readonly tempPos = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'AgentsView.Root';
    this.truckGroup.name = 'AgentsView.Trucks';

    this.root.add(this.truckGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame, transform: GraphTransform): void {
    const snapshot = frame.snapshotB;
    const seenTrucks = new Set<TruckId>();

    // Update Trucks
    for (const truck of Object.values(snapshot.trucks)) {
      seenTrucks.add(truck.id);
      let mesh = this.truckMeshes.get(truck.id);

      if (!mesh) {
        mesh = createTruckMesh();
        mesh.name = `Truck.${truck.id}`;
        // Scale truck to match graph scale
        mesh.scale.setScalar(transform.scale);
        this.truckMeshes.set(truck.id, mesh);
        this.truckGroup.add(mesh);
      }

      this.updateTruckPosition(truck, mesh, frame, transform);
    }

    // Cleanup invisible trucks
    for (const [id, mesh] of this.truckMeshes) {
      if (!seenTrucks.has(id)) {
        this.truckGroup.remove(mesh);
        disposeObject3D(mesh);
        this.truckMeshes.delete(id);
      }
    }
  }

  private updateTruckPosition(
    truck: Truck,
    mesh: THREE.Group,
    frame: SimFrame,
    transform: GraphTransform,
  ): void {
    const snapshot = frame.snapshotB;

    // 1. Edge traversal (moving on road)
    if (truck.currentEdgeId) {
      // In this system, usually we have current_edge + progress.
      // Or current_node if stationary/at intersection.
      // Let's rely on edge + progress first.

      const road = snapshot.roads[truck.currentEdgeId];
      if (road) {
        const startNode = snapshot.nodes[road.startNodeId];
        const endNode = snapshot.nodes[road.endNodeId];

        if (startNode && endNode) {
          toVector3(startNode, transform, this.tempStart);
          toVector3(endNode, transform, this.tempEnd);

          // Calculate progress ratio (0..1)
          // Clamp to ensure it stays on segment
          const ratio = Math.max(
            0,
            Math.min(1, truck.edgeProgress / road.lengthM),
          );

          // Interpolate position
          this.tempPos.lerpVectors(this.tempStart, this.tempEnd, ratio);

          // Height adjustment: Road elevation + thickness + slight offset
          this.tempPos.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;

          mesh.position.copy(this.tempPos);

          // Orientation: Look at end node
          mesh.lookAt(this.tempEnd.x, mesh.position.y, this.tempEnd.z);
          return;
        }
      }
    }

    // 2. Node stationary (or fallback)
    if (truck.currentNodeId) {
      const node = snapshot.nodes[truck.currentNodeId];
      if (node) {
        toVector3(node, transform, this.tempPos);
        this.tempPos.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
        mesh.position.copy(this.tempPos);
        // Rotation? Maybe keep last, or zero.
        return;
      }
    }
  }

  dispose(): void {
    this.scene.remove(this.root);

    for (const mesh of this.truckMeshes.values()) {
      this.truckGroup.remove(mesh);
      disposeObject3D(mesh);
    }
    this.truckMeshes.clear();
  }
}
