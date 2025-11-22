import * as THREE from 'three';

import type { SimSnapshot } from '@/sim';
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
  private readonly tempPosA = new THREE.Vector3();
  private readonly tempPosB = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'AgentsView.Root';
    this.truckGroup.name = 'AgentsView.Trucks';

    this.root.add(this.truckGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame, transform: GraphTransform): void {
    const { snapshotA, snapshotB, alpha } = frame;
    const seenTrucks = new Set<TruckId>();

    // Update Trucks
    for (const truckB of Object.values(snapshotB.trucks)) {
      if (!truckB.currentEdgeId) continue;

      seenTrucks.add(truckB.id);
      let mesh = this.truckMeshes.get(truckB.id);

      if (!mesh) {
        mesh = createTruckMesh();
        mesh.name = `Truck.${truckB.id}`;
        // Scale truck to match graph scale
        mesh.scale.setScalar(transform.scale);
        this.truckMeshes.set(truckB.id, mesh);
        this.truckGroup.add(mesh);
      }

      const truckA = snapshotA.trucks[truckB.id];
      this.updateTruckPosition(
        truckB,
        truckA,
        alpha,
        mesh,
        snapshotB,
        snapshotA,
        transform,
      );
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

  private computePosition(
    truck: Truck,
    snapshot: SimSnapshot,
    transform: GraphTransform,
    target: THREE.Vector3,
  ): boolean {
    // 1. Edge traversal (moving on road)
    if (truck.currentEdgeId) {
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
          target.lerpVectors(this.tempStart, this.tempEnd, ratio);
          // Height adjustment: Road elevation + thickness
          target.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
          return true;
        }
      }
    }

    // 2. Node stationary (or fallback)
    if (truck.currentNodeId) {
      const node = snapshot.nodes[truck.currentNodeId];
      if (node) {
        toVector3(node, transform, target);
        target.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
        return true;
      }
    }

    return false;
  }

  private updateTruckPosition(
    truckB: Truck,
    truckA: Truck | undefined,
    alpha: number,
    mesh: THREE.Group,
    snapshotB: SimSnapshot,
    snapshotA: SimSnapshot,
    transform: GraphTransform,
  ): void {
    // 1. Compute Target Position (B)
    const hasPosB = this.computePosition(
      truckB,
      snapshotB,
      transform,
      this.tempPosB,
    );
    if (!hasPosB) return;

    // 2. Compute Start Position (A)
    let hasPosA = false;
    if (truckA) {
      hasPosA = this.computePosition(
        truckA,
        snapshotA,
        transform,
        this.tempPosA,
      );
    }

    // 3. Interpolate or Snap
    if (hasPosA) {
      mesh.position.lerpVectors(this.tempPosA, this.tempPosB, alpha);

      // 4. Orientation: Look in direction of movement
      const distSq = this.tempPosA.distanceToSquared(this.tempPosB);
      if (distSq > 0.000001) {
        // Face direction A -> B
        // clone() to avoid mutating temp vectors
        const lookTarget = mesh.position
          .clone()
          .add(this.tempPosB.clone().sub(this.tempPosA));
        mesh.lookAt(lookTarget.x, mesh.position.y, lookTarget.z);
      } else {
        // Stationary
        this.applyStaticOrientation(truckB, mesh, snapshotB, transform);
      }
    } else {
      // Snap to B
      mesh.position.copy(this.tempPosB);
      this.applyStaticOrientation(truckB, mesh, snapshotB, transform);
    }
  }

  private applyStaticOrientation(
    truck: Truck,
    mesh: THREE.Group,
    snapshot: SimSnapshot,
    transform: GraphTransform,
  ): void {
    if (truck.currentEdgeId) {
      const road = snapshot.roads[truck.currentEdgeId];
      if (road) {
        const endNode = snapshot.nodes[road.endNodeId];
        if (endNode) {
          toVector3(endNode, transform, this.tempEnd);
          mesh.lookAt(this.tempEnd.x, mesh.position.y, this.tempEnd.z);
        }
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
