import * as THREE from "three";

export function calculateScaleToFit(
  scene: THREE.Object3D,
  dimensions: { width: number; height: number; depth: number }
): number {
  const box = new THREE.Box3().setFromObject(scene);
  const modelSize = new THREE.Vector3();
  box.getSize(modelSize);

  if (modelSize.x === 0 || modelSize.y === 0 || modelSize.z === 0) return 1;

  const scaleX = dimensions.width / modelSize.x;
  const scaleY = dimensions.height / modelSize.y;
  const scaleZ = dimensions.depth / modelSize.z;

  return Math.min(scaleX, scaleY, scaleZ);
}
