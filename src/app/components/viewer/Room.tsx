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

// ─── Footprint helpers ────────────────────────────────────────────────────────

/** Returns [footprintW, footprintD] swapped when rotation is 90°/270° */
function rotatedFootprint(nomW: number, nomD: number, rotDeg: number): [number, number] {
  const snap = ((Math.round(rotDeg / 90) % 4) + 4) % 4;
  return snap % 2 === 0 ? [nomW, nomD] : [nomD, nomW];
}

/** AABB on the XZ plane for a piece at (cx, cz) with given footprint */
function aabb(cx: number, cz: number, fw: number, fd: number) {
  return {
    minX: cx - fw / 2,
    maxX: cx + fw / 2,
    minZ: cz - fd / 2,
    maxZ: cz + fd / 2,
  };
}

/** True if two AABBs overlap (with a small epsilon to avoid float jitter) */
function overlaps(
  a: ReturnType<typeof aabb>,
  b: ReturnType<typeof aabb>,
  eps = 0.02
): boolean {
  return (
    a.maxX - eps > b.minX &&
    a.minX + eps < b.maxX &&
    a.maxZ - eps > b.minZ &&
    a.minZ + eps < b.maxZ
  );
}

// ─── Shared registry ──────────────────────────────────────────────────────────

/** One entry per furniture piece, kept current via refs so no re-renders */
interface PieceState {
  x: number;
  z: number;
  rotY: number;
  dims: { width: number; depth: number };
}

type Registry = React.MutableRefObject<Map<string, PieceState>>;

function checkCollision(
  registry: Registry,
  selfId: string,
  cx: number,
  cz: number,
  rotY: number,
  dims: { width: number; depth: number }
): boolean {
  const [fw, fd] = rotatedFootprint(dims.width, dims.depth, rotY);
  const selfBox  = aabb(cx, cz, fw, fd);

  for (const [id, piece] of registry.current.entries()) {
    if (id === selfId) continue;
    const [ofw, ofd] = rotatedFootprint(piece.dims.width, piece.dims.depth, piece.rotY);
    const otherBox   = aabb(piece.x, piece.z, ofw, ofd);
    if (overlaps(selfBox, otherBox)) return true;
  }
  return false;
}

// ─── DraggableFurniture ───────────────────────────────────────────────────────

interface DraggableFurnitureProps {
  id: string;
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  roomWidth: number;
  roomDepth: number;
  orbitRef: React.RefObject<OrbitControlsImpl>;
  registry: Registry;
}

function DraggableFurniture({
  id,
  modelType,
  initialPos,
  initialRotation,
  dimensions,
  roomWidth,
  roomDepth,
  orbitRef,
  registry,
}: DraggableFurnitureProps) {
  const url = MODEL_URLS[modelType];
  const { scene } = useGLTF(url ?? "");
  const { camera, gl } = useThree();

  const [pos, setPos]           = useState<[number, number, number]>(initialPos);
  const [rotY, setRotY]         = useState(initialRotation);
  const [hovered, setHovered]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const [blocked, setBlocked]   = useState(false); // red flash when can't move

  const didMove    = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster  = useRef(new THREE.Raycaster());
  const rotYRef    = useRef(initialRotation);
  const posRef     = useRef<[number, number, number]>(initialPos);

  if (!url) return null;

  const clone   = scene.clone(true);
  const bbox    = new THREE.Box3().setFromObject(clone);
  const size    = new THREE.Vector3();
  bbox.getSize(size);
  const scaleX  = dimensions.width  / (size.x || 1);
  const scaleY  = dimensions.height / (size.y || 1);
  const scaleZ  = dimensions.depth  / (size.z || 1);
  const offsetY = -bbox.min.y * scaleY;

  /** Wall clamp using rotated footprint */
  const clampToWalls = useCallback(
    (x: number, z: number, rot: number): [number, number] => {
      const [fw, fd] = rotatedFootprint(dimensions.width, dimensions.depth, rot);
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

      if (orbitRef.current) orbitRef.current.enabled = false;
      setDragging(true);

      const floor = getFloorPoint(e.nativeEvent);
      if (floor) {
        dragOffset.current.set(posRef.current[0] - floor.x, 0, posRef.current[2] - floor.z);
      }

      gl.domElement.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        didMove.current = true;
        const floor = getFloorPoint(ev);
        if (!floor) return;

        // 1. Wall clamp
        const [wx, wz] = clampToWalls(
          floor.x + dragOffset.current.x,
          floor.z + dragOffset.current.z,
          rotYRef.current
        );

        // 2. Collision check — if blocked, keep last valid position
        const hit = checkCollision(registry, id, wx, wz, rotYRef.current, dimensions);
        setBlocked(hit);

        if (!hit) {
          posRef.current = [wx, posRef.current[1], wz];
          // Update registry immediately so other pieces see us move
          registry.current.set(id, {
            x: wx, z: wz,
            rotY: rotYRef.current,
            dims: { width: dimensions.width, depth: dimensions.depth },
          });
          setPos([wx, posRef.current[1], wz]);
        }
      };

      const onUp = () => {
        setDragging(false);
        setBlocked(false);
        if (orbitRef.current) orbitRef.current.enabled = true;
        gl.domElement.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup",   onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup",   onUp);
    },
    [id, clampToWalls, getFloorPoint, gl, orbitRef, registry, dimensions]
  );

  const onPointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!didMove.current) {
        // Rotate 90°, then clamp walls, then check collision
        setRotY((prev) => {
          const next = prev + 90;
          rotYRef.current = next;

          setPos((p) => {
            const [wx, wz] = clampToWalls(p[0], p[2], next);

            // If rotating causes a collision, undo — keep previous rotation
            const hit = checkCollision(registry, id, wx, wz, next, dimensions);
            if (hit) {
              rotYRef.current = prev;
              // Update registry with reverted rotation
              registry.current.set(id, {
                x: p[0], z: p[2],
                rotY: prev,
                dims: { width: dimensions.width, depth: dimensions.depth },
              });
              return p; // position unchanged
            }

            posRef.current = [wx, p[1], wz];
            registry.current.set(id, {
              x: wx, z: wz,
              rotY: next,
              dims: { width: dimensions.width, depth: dimensions.depth },
            });
            return [wx, p[1], wz];
          });

          // Return next optimistically; if collision was hit we'll correct below
          return next;
        });

        // Correct rotY state if we had to undo (reads rotYRef after setRotY flush)
        setTimeout(() => setRotY(rotYRef.current), 0);
      }
    },
    [id, clampToWalls, registry, dimensions]
  );

  // Footprint color: red when blocked, purple when dragging normally
  const footprintColor = blocked ? "#FF6B6B" : "#9B87F5";

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

      {/* Drag footprint — turns red when blocked by another piece */}
      {dragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[dimensions.width, dimensions.depth]} />
          <meshStandardMaterial color={footprintColor} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── Room ─────────────────────────────────────────────────────────────────────

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

  // Single registry ref shared across all DraggableFurniture instances
  const registry = useRef<Map<string, PieceState>>(
    new Map(
      config.defaultFurniture.map((item) => [
        item.id,
        {
          x: item.initialPos[0],
          z: item.initialPos[2],
          rotY: item.initialRotation,
          dims: { width: item.dimensions.width, depth: item.dimensions.depth },
        },
      ])
    )
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Grid — sized exactly to floor, no overflow */}
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

      {/* Draggable furniture — all share the same registry */}
      {config.defaultFurniture.map((item) => (
        <DraggableFurniture
          key={item.id}
          id={item.id}
          modelType={item.modelType}
          initialPos={item.initialPos}
          initialRotation={item.initialRotation}
          dimensions={item.dimensions}
          roomWidth={width}
          roomDepth={depth}
          orbitRef={orbitRef}
          registry={registry}
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
