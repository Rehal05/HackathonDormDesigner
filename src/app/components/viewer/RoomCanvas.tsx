import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getRoomConfig } from "../../data/rooms/index";
import type { RoomConfig } from "../../types/room3d";
import Room from "./Room";
import { useFurnitureCollision } from "../../context/FurnitureContext";
import * as THREE from "three";

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

function MouseHandler({
  placementItem,
  updatePlacement,
  rotatePlacement,
  confirmPlacement,
  cancelPlacement,
  config
}: {
  placementItem: any;
  updatePlacement: (pos: [number, number]) => void;
  rotatePlacement: () => void;
  confirmPlacement: () => void;
  cancelPlacement: () => void;
  config: RoomConfig;
}) {
  const { camera, gl } = useThree();
  const { width, depth } = config.dimensions;
  const raycaster = useRef(new THREE.Raycaster());
  const floorPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useEffect(() => {
    if (!placementItem) return;

    const handlePointerMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera({ x, y }, camera);
      const intersectionPoint = new THREE.Vector3();
      raycaster.current.ray.intersectPlane(floorPlane.current, intersectionPoint);

      // Clamp to room bounds
      const clampedX = Math.max(0, Math.min(width, intersectionPoint.x));
      const clampedZ = Math.max(0, Math.min(depth, intersectionPoint.z));

      updatePlacement([clampedX, clampedZ]);
    };

    const handleClick = () => {
      confirmPlacement();
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      cancelPlacement();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        rotatePlacement();
      }
    };

    gl.domElement.addEventListener('pointermove', handlePointerMove);
    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      gl.domElement.removeEventListener('pointermove', handlePointerMove);
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [placementItem, camera, gl, width, depth, updatePlacement, rotatePlacement, confirmPlacement, cancelPlacement]);

  return null;
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

    const {
      dynamicFurniture,
      placementItem,
      updatePlacement,
      rotatePlacement,
      confirmPlacement,
      cancelPlacement,
      removalMode,
      selectedForRemoval,
    } = useFurnitureCollision();

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
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ width: "100%", height: "100%", background: "#1a1a2e" }}
        >
          <ScreenshotHelper handleRef={captureHandleRef} config={config} orbitRef={orbitRef} />
          <SceneCamera config={config} />
          <Lights config={config} />
          <MouseHandler
            placementItem={placementItem}
            updatePlacement={updatePlacement}
            rotatePlacement={rotatePlacement}
            confirmPlacement={confirmPlacement}
            cancelPlacement={cancelPlacement}
            config={config}
          />
          <Room
            config={config}
            showDoor={showDoor}
            showGrid={showGrid}
            showDimensions={showDimensions}
            showElectrics={showElectrics}
            orbitRef={orbitRef}
            dynamicFurniture={dynamicFurniture}
            placementItem={placementItem}
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

        {placementItem && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none"
          }}>
            Click to place • Press R to rotate • Right-click to cancel
          </div>
        )}
        {removalMode && !selectedForRemoval && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none"
          }}>
            Click furniture to select for removal
          </div>
        )}
        {removalMode && selectedForRemoval && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255, 107, 107, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none"
          }}>
            Furniture selected • Use controls to confirm or cancel
          </div>
        )}
      </div>
    );
  }
);
