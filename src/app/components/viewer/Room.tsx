/// <reference types="@react-three/fiber" />
import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// Returns effective [footprintWidth, footprintDepth] after accounting for rotation
function rotatedFootprint(nomW: number, nomD: number, rotDeg: number): [number, number] {
  const snap = ((Math.round(rotDeg / 90) % 4) + 4) % 4;
  return snap % 2 === 0 ? [nomW, nomD] : [nomD, nomW];
}

interface DraggableFurnitureProps {
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  roomWidth: number;
  roomDepth: number;
  orbitRef: React.RefObject<OrbitControlsImpl>;
}

function DraggableFurniture({
  modelType,
  initialPos,
  initialRotation,
  dimensions,
  roomWidth,
  roomDepth,
  orbitRef,
}: DraggableFurnitureProps) {
  const url = MODEL_URLS[modelType];
  const { scene } = useGLTF(url ?? "");
  const { camera, gl } = useThree();

  const [pos, setPos]         = useState<[number, number, number]>(initialPos);
  const [rotY, setRotY]       = useState(initialRotation);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  const didMove    = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster  = useRef(new THREE.Raycaster());
  // Keep a live copy of rotY accessible inside pointer-event closures
  const rotYRef    = useRef(initialRotation);

  if (!url) return null;

  const clone   = scene.clone(true);
  const bbox    = new THREE.Box3().setFromObject(clone);
  const size    = new THREE.Vector3();
  bbox.getSize(size);
  const scaleX  = dimensions.width  / (size.x || 1);
  const scaleY  = dimensions.height / (size.y || 1);
  const scaleZ  = dimensions.depth  / (size.z || 1);
  const offsetY = -bbox.min.y * scaleY;

  // Clamp position using the ROTATED footprint dimensions
  const clampPos = useCallback(
    (x: number, z: number, currentRotY: number): [number, number] => {
      const [fw, fd] = rotatedFootprint(dimensions.width, dimensions.depth, currentRotY);
      return [
        Math.max(fw / 2, Math.min(roomWidth  - fw / 2, x)),
        Math.max(fd / 2, Math.min(roomDepth  - fd / 2, z)),
      ];
    },
    [dimensions.width, dimensions.depth, roomWidth, roomDepth]
  );

  const getFloorPoint = useCallback(
    (e: PointerEvent): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc  = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width)  *  2 - 1,
        ((e.clientY - rect.top)  / rect.height) * -2 + 1
      );
      raycaster.current.setFromCamera(ndc, camera);
      const target = new THREE.Vector3();
      return raycaster.current.ray.intersectPlane(FLOOR_PLANE, target) ? target : null;
    },
    [camera, gl]
  );

  const onPointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      didMove.current = false;

      // Disable orbit so only the furniture moves
      if (orbitRef.current) orbitRef.current.enabled = false;
      setDragging(true);

      const floor = getFloorPoint(e.nativeEvent);
      if (floor) {
        dragOffset.current.set(pos[0] - floor.x, 0, pos[2] - floor.z);
      }

      gl.domElement.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        didMove.current = true;
        const floor = getFloorPoint(ev);
        if (!floor) return;
        const [cx, cz] = clampPos(
          floor.x + dragOffset.current.x,
          floor.z + dragOffset.current.z,
          rotYRef.current
        );
        setPos((p) => [cx, p[1], cz]);
      };

      const onUp = () => {
        setDragging(false);
        if (orbitRef.current) orbitRef.current.enabled = true;
        gl.domElement.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup",   onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
    },
    [pos, clampPos, getFloorPoint, gl, orbitRef]
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      // Only rotate if there was no drag movement
      if (!didMove.current) {
        setRotY((prev) => {
          const next = prev + 90;
          rotYRef.current = next;
          // Clamp with the new rotated footprint immediately
          setPos((p) => {
            const [cx, cz] = clampPos(p[0], p[2], next);
            return [cx, p[1], cz];
          });
          return next;
        });
      }
    },
    [clampPos]
  );

  return (
    <group
      position={pos}
      rotation={[0, (rotY * Math.PI) / 180, 0]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerOver={() => {
        setHovered(true);
        gl.domElement.style.cursor = dragging ? "grabbing" : "grab";
      }}
      onPointerOut={() => {
        setHovered(false);
        gl.domElement.style.cursor = "auto";
      }}
    >
      <primitive object={clone} position={[0, offsetY, 0]} scale={[scaleX, scaleY, scaleZ]} />

      {/* Hover highlight */}
      {hovered && !dragging && (
        <mesh position={[0, dimensions.height / 2 + offsetY, 0]}>
          <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
          <meshStandardMaterial color="#9B87F5" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}

      {/* Drag footprint */}
      {dragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[dimensions.width, dimensions.depth]} />
          <meshStandardMaterial color="#9B87F5" transparent opacity={0.22} depthWrite={false} />
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
  orbitRef: React.RefObject<OrbitControlsImpl>;
}

export default function Room({
  config,
  showDoor,
  showGrid,
  showDimensions = true,
  showElectrics = false,
  orbitRef,
}: RoomProps) {
  const { width, height, depth } = config.dimensions;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.8} metalness={0.0} />
      </mesh>

      {/*
        Grid: gridHelper is a square, so we create it at (width × width) with
        width-many divisions, then scale the Z axis by depth/width so the cells
        stretch exactly to the room edges — no leftover trim on any side.
      */}
      {showGrid && (
        <gridHelper
          args={[width, width, "#9B87F5", "#c0a882"]}
          position={[width / 2, 0.01, depth / 2]}
          scale={[1, 1, depth / width]}
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

      {/* Wall edge outlines */}
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
          orbitRef={orbitRef}
        />
      ))}

      {/* Dimension arrows */}
      {showDimensions && (
        <group>
          <DimensionArrow start={[0, -0.5, -0.8]}  end={[width, -0.5, -0.8]}  label={`${width}'`}  color="#5DD4B0" />
          <DimensionArrow start={[-0.8, -0.5, 0]}  end={[-0.8, -0.5, depth]}  label={`${depth}'`}  color="#5DD4B0" />
          <DimensionArrow start={[-0.8, 0, -0.5]}  end={[-0.8, height, -0.5]} label={`${height}'`} color="#5DD4B0" />
        </group>
      )}
    </group>
  );
}
