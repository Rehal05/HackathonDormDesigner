import * as THREE from "three";
import type { RoomConfig } from "../../types/room3d";
import DimensionArrow from "./DimensionArrow";
import DoorSwing from "./DoorSwing";

interface RoomProps {
  config: RoomConfig;
  showDoor: boolean;
  showGrid: boolean;
  showDimensions?: boolean;
  showElectrics?: boolean;
}

export default function Room({
  config,
  showDoor,
  showGrid,
  showDimensions = true,
  showElectrics = false,
}: RoomProps) {
  const { width, height, depth } = config.dimensions;

  return (
    <group>
      {/* Floor — warm light wood tone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Floor grid */}
      {showGrid && (
        <gridHelper
          args={[Math.max(width, depth), Math.max(width, depth), "#9B87F5", "#c0a882"]}
          position={[width / 2, 0.01, depth / 2]}
        />
      )}

      {/* Back wall — translucent */}
      <mesh position={[width / 2, height / 2, 0]}>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial
          color="#a8b4c8"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Left wall — translucent */}
      <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, height, 0.12]} />
        <meshStandardMaterial
          color="#a8b4c8"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Right wall — translucent */}
      <mesh position={[width, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, height, 0.12]} />
        <meshStandardMaterial
          color="#a8b4c8"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wall edge outlines — crisp lines showing room boundary */}
      {/* Back wall edges */}
      <lineSegments position={[width / 2, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>

      {/* Left wall edges */}
      <lineSegments position={[0, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(depth, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>

      {/* Right wall edges */}
      <lineSegments position={[width, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(depth, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>

      {/* Floor border line */}
      <lineSegments position={[width / 2, 0.01, depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.4} />
      </lineSegments>

      {/* Outlets */}
      {showElectrics && config.outlets.map((outlet) => (
        <group key={outlet.id} position={outlet.position as [number, number, number]}>
          <mesh>
            <boxGeometry args={[0.2, 0.3, 0.08]} />
            <meshStandardMaterial color="#888" />
          </mesh>
        </group>
      ))}

      {/* Door swing */}
      {showDoor && (
        <DoorSwing
          position={config.door.hingePosition}
          doorWidth={config.door.width}
          rotation={config.door.swingRotation}
          color="#F07B6A"
          opacity={0.3}
        />
      )}

      {/* Dimension arrows */}
      {showDimensions && (
        <group>
          <DimensionArrow start={[0, -0.5, -0.8]} end={[width, -0.5, -0.8]} label={`${width}'`} color="#5DD4B0" />
          <DimensionArrow start={[-0.8, -0.5, 0]} end={[-0.8, -0.5, depth]} label={`${depth}'`} color="#5DD4B0" />
          <DimensionArrow start={[-0.8, 0, -0.5]} end={[-0.8, height, -0.5]} label={`${height}'`} color="#5DD4B0" />
        </group>
      )}
    </group>
  );
}
