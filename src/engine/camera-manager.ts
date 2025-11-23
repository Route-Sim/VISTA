import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { focusStore } from '@/hud/state/focus-state';
import { SimStore } from '@/sim';
import {
  computeGraphTransform,
  toVector3,
  type GraphTransform,
} from '@/view/graph/graph-transform';
import { type OrbitMoveController } from './controls/orbit-move-controls';
import type { FocusType } from '@/hud/state/focus-state';
import { GRAPH_ROAD_ELEVATION, ROAD_THICKNESS } from './objects/road';

export class CameraManager {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private orbitMoveController: OrbitMoveController;
  private store: SimStore;
  private currentMode: 'free' | 'focused' = 'free';
  private tempVector = new THREE.Vector3();

  // Helper to cache transform since it is relatively expensive and static for a given map
  private cachedTransform: GraphTransform | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    orbitMoveController: OrbitMoveController,
    store: SimStore,
  ) {
    this.camera = camera;
    this.controls = controls;
    this.orbitMoveController = orbitMoveController;
    this.store = store;

    // Subscribe to focus changes
    focusStore.subscribe(() => this.handleFocusChange());
  }

  private handleFocusChange() {
    const { focusedId } = focusStore.getState();
    if (focusedId) {
      this.currentMode = 'focused';
      // When entering focus mode, ensure controls are enabled but we'll manage the target
      this.controls.enabled = true;
      // Prevent rotating below the ground (approx 85 degrees max)
      this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    } else {
      this.currentMode = 'free';
      // Reset to free move controller behavior
      this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    }
  }

  update(deltaSeconds: number) {
    if (this.currentMode === 'free') {
      this.orbitMoveController.update(deltaSeconds);
    } else {
      this.updateFocusedMode(deltaSeconds);
    }
  }

  private updateFocusedMode(deltaSeconds: number) {
    const { focusedId, focusedType, focusedPosition } = focusStore.getState();
    if (!focusedId || !focusedType) {
      this.currentMode = 'free';
      return;
    }

    let targetPos: THREE.Vector3 | null = null;

    // If we have a static object type (or just have a position stored), try to use it
    if (focusedType === 'tree' || focusedType === 'building') {
      // Static objects: Use the position stored at click time
      if (focusedPosition) {
        targetPos = focusedPosition;
      } else {
        // Fallback to attempting to compute it (likely fails for tree, approximates for building)
        const snapshot = this.store.getWorkingDraft();
        if (!this.cachedTransform) {
          this.cachedTransform = computeGraphTransform(snapshot);
        }
        targetPos = this.getObjectPosition(
          focusedId,
          focusedType,
          snapshot,
          this.cachedTransform,
        );
      }
    } else {
      // Dynamic objects (Agent) or network objects (Node/Road) where we prefer live data
      const snapshot = this.store.getWorkingDraft();
      if (!this.cachedTransform) {
        this.cachedTransform = computeGraphTransform(snapshot);
      }
      targetPos = this.getObjectPosition(
        focusedId,
        focusedType,
        snapshot,
        this.cachedTransform,
      );

      // Fallback to stored position if simulation lookup fails (e.g. edge case)
      if (!targetPos && focusedPosition) {
        targetPos = focusedPosition;
      }
    }

    if (targetPos) {
      // Smoothly interpolate camera target to the object's position
      const lerpFactor = 5 * deltaSeconds; // Adjust speed as needed

      const oldTarget = this.controls.target.clone();
      this.controls.target.lerp(targetPos, lerpFactor);
      const delta = this.controls.target.clone().sub(oldTarget);

      this.camera.position.add(delta);
    }

    this.controls.update();
  }

  private getObjectPosition(
    id: string,
    type: FocusType,
    snapshot: any, // SimSnapshot
    transform: GraphTransform,
  ): THREE.Vector3 | null {
    // Reuse logic from agents-view / graph-view

    if (type === 'node') {
      const node = snapshot.nodes[id];
      if (node) {
        toVector3(node, transform, this.tempVector);
        this.tempVector.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS + 0.001;
        return this.tempVector;
      }
    } else if (type === 'road') {
      const road = snapshot.roads[id];
      if (road) {
        const start = snapshot.nodes[road.startNodeId];
        const end = snapshot.nodes[road.endNodeId];
        if (start && end) {
          const p1 = toVector3(start, transform, new THREE.Vector3());
          const p2 = toVector3(end, transform, new THREE.Vector3());
          this.tempVector.lerpVectors(p1, p2, 0.5);
          this.tempVector.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
          return this.tempVector;
        }
      }
    } else if (type === 'building') {
      // Handle site or parking
      // Ideally we use the stored position from InteractionManager (passed in setFocus)
      // But as a fallback, we use the node position.
      const building = snapshot.buildings[id];
      if (building) {
        const node = snapshot.nodes[building.nodeId];
        if (node) {
          toVector3(node, transform, this.tempVector);
          return this.tempVector;
        }
      }
    } else if (type === 'agent') {
      const truck = snapshot.trucks[id];
      if (truck) {
        // Compute position based on edge/node
        if (truck.currentEdgeId) {
          const road = snapshot.roads[truck.currentEdgeId];
          if (road) {
            const start = snapshot.nodes[road.startNodeId];
            const end = snapshot.nodes[road.endNodeId];
            if (start && end) {
              const p1 = toVector3(start, transform, new THREE.Vector3());
              const p2 = toVector3(end, transform, new THREE.Vector3());
              const ratio = Math.max(
                0,
                Math.min(1, truck.edgeProgress / road.lengthM),
              );
              this.tempVector.lerpVectors(p1, p2, ratio);
              this.tempVector.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
              return this.tempVector;
            }
          }
        } else if (truck.currentNodeId) {
          const node = snapshot.nodes[truck.currentNodeId];
          if (node) {
            toVector3(node, transform, this.tempVector);
            this.tempVector.y = GRAPH_ROAD_ELEVATION + ROAD_THICKNESS;
            return this.tempVector;
          }
        }
      }
    }

    return null;
  }
}
