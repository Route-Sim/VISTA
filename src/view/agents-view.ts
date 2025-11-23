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
  private readonly tempEnd = new THREE.Vector3();
  private readonly tempStart = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.root.name = 'AgentsView.Root';
    this.truckGroup.name = 'AgentsView.Trucks';

    this.root.add(this.truckGroup);
    this.scene.add(this.root);
  }

  update(frame: SimFrame, transform: GraphTransform): void {
    const { snapshotB } = frame;
    const seenTrucks = new Set<TruckId>();

    // Update Trucks
    for (const truck of Object.values(snapshotB.trucks)) {
      // Filter based on required states
      const isAtNode =
        truck.currentNodeId !== null && truck.currentBuildingId === null;
      const isOnRoad =
        truck.currentNodeId === null && truck.currentEdgeId !== null;

      if (!isAtNode && !isOnRoad) continue;

      seenTrucks.add(truck.id);
      let mesh = this.truckMeshes.get(truck.id);

      if (!mesh) {
        mesh = createTruckMesh();
        mesh.name = `Truck.${truck.id}`;
        mesh.userData = { id: truck.id, type: 'agent' };
        // Scale truck to match graph scale
        mesh.scale.setScalar(transform.scale);
        this.truckMeshes.set(truck.id, mesh);
        this.truckGroup.add(mesh);
      }

      this.updateTruckPosition(truck, mesh, snapshotB, transform);
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
    snapshot: SimSnapshot,
    transform: GraphTransform,
  ): void {
    if (truck.currentNodeId !== null && truck.currentBuildingId === null) {
      // State 1: At Node
      const node = snapshot.nodes[truck.currentNodeId];
      if (node) {
        toVector3(node, transform, mesh.position);
        mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;

        // Orientation: Face route[0] (first node in route array)
        if (truck.route && truck.route.length > 0) {
          const nextNodeId = truck.route[0];
          const nextNode = snapshot.nodes[nextNodeId];
          if (nextNode) {
            toVector3(nextNode, transform, this.tempEnd);
            mesh.lookAt(this.tempEnd.x, mesh.position.y, this.tempEnd.z);
          }
        }
      }
    } else if (truck.currentNodeId === null && truck.currentEdgeId !== null) {
      // State 2: On Road (Interpolated)
      const road = snapshot.roads[truck.currentEdgeId];
      if (road) {
        const startNode = snapshot.nodes[road.startNodeId];
        const endNode = snapshot.nodes[road.endNodeId];

        if (startNode && endNode) {
          toVector3(startNode, transform, this.tempStart);
          toVector3(endNode, transform, this.tempEnd);

          // Calculate ratio
          // Clamp ratio to [0, 1] just in case
          const ratio = Math.max(
            0,
            Math.min(1, truck.edgeProgress / road.lengthM),
          );

          // Interpolate position
          mesh.position.lerpVectors(this.tempStart, this.tempEnd, ratio);
          mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;

          // Face direction of the road (towards endNode)
          mesh.lookAt(this.tempEnd.x, mesh.position.y, this.tempEnd.z);
        } else if (startNode) {
          // Fallback if endNode missing (unlikely)
          toVector3(startNode, transform, mesh.position);
          mesh.position.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
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
