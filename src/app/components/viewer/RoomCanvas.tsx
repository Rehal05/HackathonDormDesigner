import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getRoomConfig } from "../../data/rooms/index";
import type { RoomConfig } from "../../types/room3d";
import Room from "./Room";

export type CaptureHandle = { capture: () => void };

function ScreenshotHelper({
  handleRef,
  config,
  orbitRef,
}: {
  handleRef: React.MutableRefObject<CaptureHandle | null>;
  config: RoomConfig;
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { gl } = useThree();
  const { width, height, depth } = config.dimensions;

  useEffect(() => {
    handleRef.current = {
      capture: () => {
        if (orbitRef.current) {
          orbitRef.current.object.position.set(width * 1.5, height * 1.8, depth * 1.5);
          orbitRef.current.target.set(width / 2, height / 3, depth / 2);
          orbitRef.current.update();
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const dataURL = gl.domElement.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "room-design.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        });
      },
    };
    return () => { handleRef.current = null; };
  }, [gl, width, height, depth, handleRef, orbitRef]);

  return null;
}

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
      <ambientLight intensity={2.5} color="#ffffff" />
      <directionalLight
        position={[width * 1.5, 20, depth * 1.5]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-width, 15, -depth]}
        intensity={1.2}
        color="#e8f0ff"
      />
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

export const RoomCanvas = forwardRef<CaptureHandle, RoomCanvasProps>(
  function RoomCanvas(
    { roomId, showGrid, showDoor, showDimensions = true, showElectrics = false },
    ref
  ) {
    const config = getRoomConfig(roomId);
    const orbitRef = useRef<OrbitControlsImpl>(null);
    const captureHandleRef = useRef<CaptureHandle | null>(null);

    useImperativeHandle(ref, () => ({
      capture: () => captureHandleRef.current?.capture(),
    }), []);

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
        <ScreenshotHelper handleRef={captureHandleRef} config={config} orbitRef={orbitRef} />
        <SceneCamera config={config} />
        <Lights config={config} />
        <Room
          config={config}
          showDoor={showDoor}
          showGrid={showGrid}
          showDimensions={showDimensions}
          showElectrics={showElectrics}
          orbitRef={orbitRef}
        />
        <OrbitControls
          ref={orbitRef}
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
);
