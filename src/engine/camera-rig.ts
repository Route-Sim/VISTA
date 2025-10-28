import * as THREE from "three";

export function createCamera(
  canvas: HTMLCanvasElement
): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 15, 15);

  const handleResize = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", handleResize);
  handleResize();

  return camera;
}
