import { useMemo } from "react";
import * as THREE from "three";

interface DoorSwingProps {
  position: [number, number, number];
  doorWidth?: number;
  rotation?: number;
  color?: string;
  opacity?: number;
}

export default function DoorSwing({
  position,
  doorWidth = 2.67,
  rotation = 0,
  color = "#F07B6A",
  opacity = 0.25,
}: DoorSwingProps) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, doorWidth, 0, Math.PI / 2, false);
    s.lineTo(0, 0);
    return s;
  }, [doorWidth]);

  const shapeGeom = useMemo(() => new THREE.ShapeGeometry(shape), [shape]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <edgesGeometry args={[shapeGeom]} />
        <lineBasicMaterial color={color} />
      </lineSegments>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[doorWidth / 2, 0.02, 0]}>
        <planeGeometry args={[doorWidth, 0.15]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
