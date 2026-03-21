/// <reference types="@react-three/fiber" />
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useGLTF, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { RoomConfig } from "../../types/room3d";
import DimensionArrow from "./DimensionArrow";
import DoorSwing from "./DoorSwing";

import ww_bed_url   from "../../../haolin_components/ww_bed.glb";
import loft_bed_url from "../../../haolin_components/loft_bed.glb";
import desk_url     from "../../../haolin_components/desk_drawer_chair.glb";
import closet_url   from "../../../haolin_components/closet.glb";
import window_url   from "../../../haolin_components/window.glb";

const MODEL_URLS: Record<string, string> = {
  ww_bed: ww_bed_url,
  bed:    loft_bed_url,
  desk:   desk_url,
  chair:  desk_url,
  closet: closet_url,
  window: window_url,
};

// Invisible floor plane used for raycasting during drag
const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

interface DraggableFurnitureProps {
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  roomWidth: number;
  roomDepth: number;
}

function DraggableFurniture({
  modelType,
  initialPos,
  initialRotation,
  dimensions,
  roomWidth,
  roomDepth,
}: DraggableFurnitureProps) {
  const url = MODEL_URLS[modelType];
  const { scene } = useGLTF(url ?? "");
  const { camera, gl } = useThree();

  const [pos, setPos] = useState<[number, number, number]>(initialPos);
  const [rotY, setRotY] = useState(initialRotation);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Track whether the pointer actually moved (to distinguish click vs drag)
  const didMove = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());
  const hitPoint = useRef(new THREE.Vector3());

  if (!url) return null;

  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  const scaleX = dimensions.width  / (size.x || 1);
  const scaleY = dimensions.height / (size.y || 1);
  const scaleZ = dimensions.depth  / (size.z || 1);
  const offsetY = -box.min.y * scaleY;

  // Clamp position so furniture stays within room walls
  const clamp = useCallback(
    (x: number, z: number): [number, number] => {
      const hw = dimensions.width  / 2;
      const hd = dimensions.depth  / 2;
      return [
        Math.max(hw, Math.min(roomWidth  - hw, x)),
        Math.max(hd, Math.min(roomDepth  - hd, z)),
      ];
    },
    [dimensions.width, dimensions.depth, roomWidth, roomDepth]
  );

  const getFloorPoint = useCallback(
    (e: PointerEvent): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  *  2 - 1,
        ((e.clientY - rect.top)  / rect.height) * -2 + 1
      );
      raycaster.current.setFromCamera(ndc, camera);
      const target = new THREE.Vector3();
      const hit = raycaster.current.ray.intersectPlane(FLOOR_PLANE, target);
      return hit ? target : null;
    },
    [camera, gl]
  );

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      didMove.current = false;
      setDragging(true);

      const floor = getFloorPoint(e.nativeEvent);
      if (floor) {
        dragOffset.current.set(pos[0] - floor.x, 0, pos[2] - floor.z);
      }

      // Capture pointer so we get events outside the canvas
      gl.domElement.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        didMove.current = true;
        const floor = getFloorPoint(ev);
        if (!floor) return;
        const nx = floor.x + dragOffset.current.x;
        const nz = floor.z + dragOffset.current.z;
        const [cx, cz] = clamp(nx, nz);
        setPos([cx, initialPos[1], cz]);
      };

      const onUp = () => {
        setDragging(false);
        gl.domElement.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [pos, initialPos, clamp, getFloorPoint, gl]
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      // Only rotate if the pointer didn't move (i.e. it was a tap/click)
      if (!didMove.current) {
        setRotY((r) => r + 90);
      }
    },
    []
  );

  return (
    <group
      position={[pos[0], pos[1], pos[2]]}
      rotation={[0, (rotY * Math.PI) / 180, 0]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOver={() => { setHovered(true);  gl.domElement.style.cursor = dragging ? "grabbing" : "grab"; }}
      onPointerOut={() =>  { setHovered(false); gl.domElement.style.cursor = "auto"; }}
    >
      <primitive
        object={clone}
        position={[0, offsetY, 0]}
        scale={[scaleX, scaleY, scaleZ]}
      />

      {/* Highlight box on hover */}
      {hovered && !dragging && (
        <mesh position={[0, dimensions.height / 2 + offsetY, 0]}>
          <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
          <meshStandardMaterial
            color="#9B87F5"
            transparent
            opacity={0.12}
            wireframe={false}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Subtle shadow/footprint while dragging */}
      {dragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[dimensions.width, dimensions.depth]} />
          <meshStandardMaterial color="#9B87F5" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

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
      {/* Floor */}
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

      {/* Back wall */}
      <mesh position={[width / 2, height / 2, 0]}>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial color="#a8b4c8" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Left wall */}
      <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, height, 0.12]} />
        <meshStandardMaterial color="#a8b4c8" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Right wall */}
      <mesh position={[width, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[depth, height, 0.12]} />
        <meshStandardMaterial color="#a8b4c8" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Wall edges */}
      <lineSegments position={[width / 2, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>
      <lineSegments position={[0, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(depth, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>
      <lineSegments position={[width, height / 2, depth / 2]} rotation={[0, Math.PI / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(depth, height, 0.12)]} />
        <lineBasicMaterial color="#9B87F5" transparent opacity={0.6} />
      </lineSegments>
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

      {/* Draggable furniture */}
      {config.defaultFurniture.map((item) => (
        <DraggableFurniture
          key={item.id}
          modelType={item.modelType}
          initialPos={item.initialPos}
          initialRotation={item.initialRotation}
          dimensions={item.dimensions}
          roomWidth={width}
          roomDepth={depth}
        />
      ))}

      {/* Dimension arrows */}
      {showDimensions && (
        <group>
          <DimensionArrow start={[0, -0.5, -0.8]}    end={[width, -0.5, -0.8]}    label={`${width}'`}  color="#5DD4B0" />
          <DimensionArrow start={[-0.8, -0.5, 0]}    end={[-0.8, -0.5, depth]}    label={`${depth}'`}  color="#5DD4B0" />
          <DimensionArrow start={[-0.8, 0, -0.5]}    end={[-0.8, height, -0.5]}   label={`${height}'`} color="#5DD4B0" />
        </group>
      )}
    </group>
  );
}
