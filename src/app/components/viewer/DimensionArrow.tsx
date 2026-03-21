import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface DimensionArrowProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  color?: string;
}

export default function DimensionArrow({
  start,
  end,
  label,
  color = "#9B87F5",
}: DimensionArrowProps) {
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ]);
  }, [start[0], start[1], start[2], end[0], end[1], end[2]]);

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color }))} />
      <mesh position={start}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={end}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[midPoint.x, midPoint.y + 0.3, midPoint.z]}
        fontSize={0.35}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#0C0C10"
      >
        {label}
      </Text>
    </group>
  );
}
