import * as THREE from "three";
import { createGround } from "./objects/ground";
import { Colors } from "../app/colors";
import { createLake } from "./objects/lake";
import { RoadMapBuilder } from "./objects/roads";
import { createTree } from "./objects/tree";
import { createForest } from "./objects/forest";

export class SceneManager {
  public readonly scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(Colors.background);
    this.scene.fog = new THREE.Fog(Colors.fog, 60, 100);

    const ambient = new THREE.AmbientLight(Colors.lightAmbient, 0.9);
    this.scene.add(ambient);

    const point = new THREE.PointLight(Colors.lightPoint, 1.0, 0, 2);
    point.position.set(20, 20, 20);
    this.scene.add(point);

    const ground = createGround({ width: 500, height: 500, useTexture: false });
    this.scene.add(ground);

    // Example lakes placed on ground at (x, y) with rectangle bounds
    const lake1 = createLake(-5, 12, {
      length: 24,
      width: 18,
      irregularity: 0.4,
    });
    const lake2 = createLake(5, -20, {
      length: 10,
      width: 8,
      irregularity: 0.1,
    });
    const lake3 = createLake(25, -15, {
      length: 16,
      width: 12,
      irregularity: 0.6,
    });
    this.scene.add(lake1, lake2, lake3);

    // A sample tree placed near the first lake
    const tree = createTree({ trunkHeight: 2.6, canopyLobes: 4 });
    tree.position.set(0, 0, 20);
    this.scene.add(tree);

    // Sample forest inside a rectangle centered at (x, y)
    const forest = createForest(-22, -20, {
      length: 40,
      width: 28,
      minDistance: 2.8,
      trunkHeightRange: [2.0, 3.2],
      canopyRadiusRange: [0.75, 1.35],
      canopyLobesRange: [3, 5],
    });
    this.scene.add(forest);

    // Road tiles demo (3x3) with 10m tiles
    const roads = RoadMapBuilder.create({
      width: 5,
      height: 5,
      tileSize: 10,
      lanesPerDirection: 1,
      laneWidth: 2.2,
      shoulderWidth: 0.6,
      dashedCenter: true,
      debugBorders: true,
    })
      .straight(0, 2, 0)
      .straight(1, 2, 0)
      .straight(2, 2, 0)
      .turn(3, 2, 0) // +X → +Z
      .straight(3, 3, 90)
      .build();
    roads.position.set(0, 0, -2);
    this.scene.add(roads);
  }
}
