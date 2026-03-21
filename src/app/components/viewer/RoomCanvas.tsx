import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { getRoomConfig } from "../../data/rooms/index";
import type { RoomConfig } from "../../types/room3d";
import Room from "./Room";

function SceneCamera({ config }: { config: RoomConfig }) {
  const { camera } = useThree();
  const { width, height, depth } = config.dimensions;

  useEffect(() => {
    camera.position.set(width * 1.5, height * 1.8, depth * 1.5);
    camera.lookAt(width / 2, 0, depth / 2);
  }, [camera, width, height, depth]);

  return null;
}

function Lights({ config }: { config: RoomConfig }) {
  const { width, depth } = config.dimensions;
  return (
    <>
      {/* Strong ambient — fills the whole scene evenly, no darkness */}
      <ambientLight intensity={2.5} color="#ffffff" />

      {/* Soft directional from upper-front-right — main light source */}
      <directionalLight
        position={[width * 1.5, 20, depth * 1.5]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Fill light from opposite side to kill harsh shadows */}
      <directionalLight
        position={[-width, 15, -depth]}
        intensity={1.2}
        color="#e8f0ff"
      />

      {/* Soft warm fill from below to brighten floor */}
      <hemisphereLight args={["#ffffff", "#d4c4a8", 1.0]} />
    </>
  );
}

interface RoomCanvasProps {
  roomId: string;
  showGrid: boolean;
  showDoor: boolean;
  showDimensions?: boolean;
  showElectrics?: boolean;
}

export function RoomCanvas({
  roomId,
  showGrid,
  showDoor,
  showDimensions = true,
  showElectrics = false,
}: RoomCanvasProps) {
  const config = getRoomConfig(roomId);

  if (!config) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A879E", fontSize: "14px" }}>
        Room config not found: {roomId}
      </div>
    );
  }

  const { width, height, depth } = config.dimensions;

  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ width: "100%", height: "100%", background: "#1a1a2e" }}
    >
      <SceneCamera config={config} />
      <Lights config={config} />
      <Room
        config={config}
        showDoor={showDoor}
        showGrid={showGrid}
        showDimensions={showDimensions}
        showElectrics={showElectrics}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={Math.min(width, depth)}
        maxDistance={Math.max(width, depth) * 4}
        target={[width / 2, height / 3, depth / 2]}
        makeDefault
      />
    </Canvas>
  );
}
