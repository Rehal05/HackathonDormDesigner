/// <reference types="@react-three/fiber" />
import React, { useRef, useState, useCallback, Suspense } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { RoomConfig } from "../../types/room3d";
import type { DynamicFurnitureItem, PlacementItem } from "../../context/FurnitureContext";
import { useFurnitureCollision } from "../../context/FurnitureContext";
import DimensionArrow from "./DimensionArrow";
import DoorSwing from "./DoorSwing";

import ww_bed_url         from "../../../haolin_components/ww_bed.glb";
import loft_bed_url       from "../../../haolin_components/loft_bed.glb";
import loft_bed_2_url     from "../../../haolin_components/loft_bed_2.glb";
import loft_bed_3_url     from "../../../haolin_components/loft_bed_3.glb";
import loft_bed_4_url     from "../../../haolin_components/loft_bed_4.glb";
import loft_bed_combo_url from "../../../haolin_components/loft_bed_combo.glb";
import desk_url           from "../../../haolin_components/desk_drawer_chair.glb";
import closet_url         from "../../../haolin_components/closet.glb";
import bed_drawer_url     from "../../../haolin_components/bed_drawer.glb";
import ww_drawer_url      from "../../../haolin_components/ww_drawer.glb";
import room_furniture_url from "../../../haolin_components/room_furniture.glb";
import window_url          from "../../../haolin_components/window.glb";
import bean_bag_url        from "../../../furnitureLibrary/bean_bag.glb";
import shoerack_url        from "../../../furnitureLibrary/shoerack.glb";
import fan_url             from "../../../furnitureLibrary/fan.glb";
import lamp_url             from "../../../furnitureLibrary/lamp.glb";
import laundry_basket_url       from "../../../furnitureLibrary/laundry_basket.glb";
//import miniFridge_url       from "../../../furnitureLibrary/mini_Fridge.glb";
import small_cart_url         from "../../../furnitureLibrary/small_cart.glb";
import welcome_mat_url       from "../../../furnitureLibrary/welcome_mat.glb";
import gaming_chair_url       from "../../../furnitureLibrary/gaming_chair.glb";
import potted_plant_url       from "../../../furnitureLibrary/potted_plant_01.glb";


const MODEL_URLS: Record<string, string> = {
  ww_bed: ww_bed_url,
  bed:    loft_bed_url,
  loft_bed_2: loft_bed_2_url,
  loft_bed_3: loft_bed_3_url,
  loft_bed_4: loft_bed_4_url,
  loft_bed_combo: loft_bed_combo_url,
  combo: loft_bed_combo_url, // Kellogg room uses modelType 'combo'
  desk:   desk_url,
  chair:  desk_url,
  closet: closet_url,
  bed_drawer: bed_drawer_url,
  ww_drawer: ww_drawer_url,
  room_furniture: room_furniture_url,
  window: window_url,
  bean_bag: bean_bag_url,
  shoerack: shoerack_url,
  fan: fan_url,
  lamp: lamp_url,
  //laundry_basket: laundry_basket_url,
  small_cart: small_cart_url,
  welcome_mat: welcome_mat_url,
  gaming_chair: gaming_chair_url,
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

// ─── Fallback box (task 6) ────────────────────────────────────────────────────
// Renders when a GLB URL is missing or fails to load.
// Simple grey wireframe box sized to the furniture dimensions.

function FallbackBox({ dimensions }: { dimensions: { width: number; height: number; depth: number } }) {
  const { width, height, depth } = dimensions;
  return (
    <group>
      {/* Solid grey fill */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#aaaaaa" transparent opacity={0.5} />
      </mesh>
      {/* Wireframe outline so it's clearly a placeholder */}
      <lineSegments position={[0, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#777777" />
      </lineSegments>
    </group>
  );
}

// ─── GLB loader with error boundary (task 6) ─────────────────────────────────
// Separated so useGLTF is only called when url is valid,
// and errors are caught without crashing the whole scene.

interface GLBModelProps {
  url: string;
  dimensions: { width: number; height: number; depth: number };
  scaleFactor: number;
  onBounds?: (dimensions: { width: number; height: number; depth: number }) => void;
}

function GLBModel({ url, dimensions, scaleFactor, onBounds }: GLBModelProps) {
  const { scene } = useGLTF(url);

  const clone  = scene.clone(true);
  const bbox   = new THREE.Box3().setFromObject(clone);
  const size   = new THREE.Vector3();
  bbox.getSize(size);

  // Bounds-based scale to fit dimensions, then multiply by scaleFactor (task 5)
  const scaleX  = (dimensions.width  / (size.x || 1)) * scaleFactor;
  const scaleY  = (dimensions.height / (size.y || 1)) * scaleFactor;
  const scaleZ  = (dimensions.depth  / (size.z || 1)) * scaleFactor;
  const offsetY = -bbox.min.y * scaleY;

  // Offer real model bounds to collision engine when loaded
  const computedDimensions = {
    width: size.x * scaleX,
    height: size.y * scaleY,
    depth: size.z * scaleZ,
  };

  React.useEffect(() => {
    onBounds?.(computedDimensions);
  }, [onBounds, computedDimensions.width, computedDimensions.height, computedDimensions.depth]);

  // Center in XZ by geometry center, while keeping base at floor
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  const adjustedPosition: [number, number, number] = [
    -center.x * scaleX,
    offsetY,
    -center.z * scaleZ,
  ];

  return (
    <group position={adjustedPosition}>
      <primitive object={clone} scale={[scaleX, scaleY, scaleZ]} />
    </group>
  );
}

// ─── FurnitureModel: routes to GLB or fallback (tasks 5 + 6) ─────────────────

interface FurnitureModelProps {
  modelType: string;
  dimensions: { width: number; height: number; depth: number };
  scaleFactor: number;
  onBounds?: (dimensions: { width: number; height: number; depth: number }) => void;
}

function FurnitureModel({ modelType, dimensions, scaleFactor, onBounds }: FurnitureModelProps) {
  const url = MODEL_URLS[modelType];
  const [failed, setFailed] = useState(false);

  // No URL registered for this modelType → show fallback immediately
  if (!url || failed) {
    return <FallbackBox dimensions={dimensions} />;
  }

  return (
    <Suspense fallback={<FallbackBox dimensions={dimensions} />}>
      <GLBModelWithCatch
        url={url}
        dimensions={dimensions}
        scaleFactor={scaleFactor}
        onError={() => setFailed(true)}
        onBounds={onBounds}
      />
    </Suspense>
  );
}

// Thin wrapper that catches useGLTF errors via an error boundary pattern
function GLBModelWithCatch({
  url,
  dimensions,
  scaleFactor,
  onError,
  onBounds,
}: GLBModelProps & { onError: () => void }) {
  try {
    return <GLBModel url={url} dimensions={dimensions} scaleFactor={scaleFactor} onBounds={onBounds} />;
  } catch {
    // useGLTF throws a Promise (Suspense) or an Error
    // If it's an actual error (not a Promise), trigger fallback
    onError();
    return null;
  }
}

// ─── DraggableFurniture ───────────────────────────────────────────────────────

// ─── DraggableFurniture ───────────────────────────────────────────────────────

interface DraggableFurnitureProps {
  id: string;
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  scaleFactor?: number;   // task 5: optional multiplier, defaults to 1.0
  roomWidth: number;
  roomDepth: number;
  orbitRef: React.RefObject<OrbitControlsImpl>;
  registry: Registry;
}

function StaticFurniture({
  modelType,
  initialPos,
  initialRotation,
  dimensions,
  scaleFactor = 1.0,
}: {
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  scaleFactor?: number;
}) {
  return (
    <group
      position={initialPos}
      rotation={[0, (initialRotation * Math.PI) / 180, 0]}
    >
      <FurnitureModel
        modelType={modelType}
        dimensions={dimensions}
        scaleFactor={scaleFactor}
      />
    </group>
  );
}

function DraggableFurniture({
  id,
  modelType,
  initialPos,
  initialRotation,
  dimensions,
  scaleFactor = 1.0,
  roomWidth,
  roomDepth,
  orbitRef,
  registry,
}: DraggableFurnitureProps) {
  const { camera, gl } = useThree();
  const { registerFurniture, removalMode, selectedForRemoval, selectForRemoval } = useFurnitureCollision();

  const [pos, setPos]           = useState<[number, number, number]>(initialPos);
  const [rotY, setRotY]         = useState(initialRotation);
  const [hovered, setHovered]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const [blocked, setBlocked]   = useState(false);

  const [actualDimensions, setActualDimensions] = useState(dimensions);
  const effectiveDimensions = actualDimensions || dimensions;

  const didMove    = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const raycaster  = useRef(new THREE.Raycaster());
  const rotYRef    = useRef(initialRotation);
  const posRef     = useRef<[number, number, number]>(initialPos);

  // Register this furniture with the context for collision detection
  const getBoundingBox = useCallback(() => {
    const [fw, fd] = rotatedFootprint(effectiveDimensions.width, effectiveDimensions.depth, rotYRef.current);
    return new THREE.Box3(
      new THREE.Vector3(posRef.current[0] - fw / 2, 0, posRef.current[2] - fd / 2),
      new THREE.Vector3(posRef.current[0] + fw / 2, effectiveDimensions.height, posRef.current[2] + fd / 2)
    );
  }, [effectiveDimensions]);

  React.useEffect(() => {
    return registerFurniture(id, getBoundingBox);
  }, [id, registerFurniture, getBoundingBox]);

  const clampToWalls = useCallback(
    (x: number, z: number, rot: number): [number, number] => {
      const [fw, fd] = rotatedFootprint(effectiveDimensions.width, effectiveDimensions.depth, rot);
      return [
        Math.max(fw / 2, Math.min(roomWidth  - fw / 2, x)),
        Math.max(fd / 2, Math.min(roomDepth  - fd / 2, z)),
      ];
    },
    [effectiveDimensions.width, effectiveDimensions.depth, roomWidth, roomDepth]
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

        const [wx, wz] = clampToWalls(
          floor.x + dragOffset.current.x,
          floor.z + dragOffset.current.z,
          rotYRef.current
        );

        const hit = checkCollision(registry, id, wx, wz, rotYRef.current, dimensions);
        setBlocked(hit);

        if (!hit) {
          posRef.current = [wx, posRef.current[1], wz];
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
        if (removalMode) {
          // In removal mode, select this furniture for removal
          selectForRemoval(id);
        } else {
          // Normal mode: rotate the furniture
          setRotY((prev) => {
            const next = prev + 90;
            rotYRef.current = next;

            setPos((p) => {
              const [wx, wz] = clampToWalls(p[0], p[2], next);
              const hit = checkCollision(registry, id, wx, wz, next, dimensions);
              if (hit) {
                rotYRef.current = prev;
                registry.current.set(id, {
                  x: p[0], z: p[2],
                  rotY: prev,
                  dims: { width: dimensions.width, depth: dimensions.depth },
                });
                return p;
              }

              posRef.current = [wx, p[1], wz];
              registry.current.set(id, {
                x: wx, z: wz,
                rotY: next,
                dims: { width: dimensions.width, depth: dimensions.depth },
              });
              return [wx, p[1], wz];
            });

            return next;
          });

          setTimeout(() => setRotY(rotYRef.current), 0);
        }
      }
    },
    [id, clampToWalls, registry, dimensions, removalMode, selectForRemoval]
  );

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
      {/* Task 5 + 6: FurnitureModel handles scaleFactor and fallback */}
      <FurnitureModel
        modelType={modelType}
        dimensions={dimensions}
        scaleFactor={scaleFactor}
        onBounds={(bounds) => {
          // keep user-specified dimensions minimum but prefer real loaded model dimensions for collisions
          if (
            Math.abs(bounds.width - effectiveDimensions.width) > 0.1 ||
            Math.abs(bounds.depth - effectiveDimensions.depth) > 0.1 ||
            Math.abs(bounds.height - effectiveDimensions.height) > 0.1
          ) {
            setActualDimensions(bounds);
          }
        }}
      />

      {/* Hover highlight */}
      {hovered && !dragging && (
        <mesh position={[0, effectiveDimensions.height / 2, 0]}>
          <boxGeometry args={[effectiveDimensions.width, effectiveDimensions.height, effectiveDimensions.depth]} />
          <meshStandardMaterial color="#9B87F5" transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}

      {/* Removal selection highlight */}
      {selectedForRemoval === id && (
        <mesh position={[0, effectiveDimensions.height / 2, 0]}>
          <boxGeometry args={[effectiveDimensions.width, effectiveDimensions.height, effectiveDimensions.depth]} />
          <meshStandardMaterial color="#FF6B6B" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}

      {/* Drag footprint */}
      {dragging && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[effectiveDimensions.width, effectiveDimensions.depth]} />
          <meshStandardMaterial color={footprintColor} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── PlacementPreview ─────────────────────────────────────────────────────────

interface PlacementPreviewProps {
  item: DynamicFurnitureItem;
  position: [number, number, number];
  rotation: number;
  registry: Registry;
}

function PlacementPreview({ item, position, rotation, registry }: PlacementPreviewProps) {
  const { width, height, depth } = item.dimensions;
  const cx = position[0];
  const cz = position[2];

  const hasCollision = checkCollision(registry, "", cx, cz, rotation, item.dimensions);

  return (
    <group position={position} rotation={[0, (rotation * Math.PI) / 180, 0]}>
      {/* Semi-transparent furniture model */}
      <FurnitureModel
        modelType={item.modelType}
        dimensions={item.dimensions}
        scaleFactor={item.scaleFactor ?? 1.0}
      />

      {/* Placement footprint with collision feedback */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={hasCollision ? "#FF6B6B" : "#4ADE80"}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>
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
  dynamicFurniture?: DynamicFurnitureItem[];
  placementItem?: PlacementItem | null;
}

export default function Room({
  config,
  showDoor,
  showGrid,
  showDimensions = true,
  showElectrics = false,
  orbitRef,
  dynamicFurniture = [],
  placementItem = null,
}: RoomProps) {
  const { width, height, depth } = config.dimensions;

  const registry = useRef<Map<string, PieceState>>(
    new Map(
      [
        ...config.defaultFurniture.map((item) => [
          item.id,
          {
            x: item.initialPos[0],
            z: item.initialPos[2],
            rotY: item.initialRotation,
            dims: { width: item.dimensions.width, depth: item.dimensions.depth },
          },
        ] as const),
        ...dynamicFurniture.map((item) => [
          item.id,
          {
            x: item.initialPos[0],
            z: item.initialPos[2],
            rotY: item.initialRotation,
            dims: { width: item.dimensions.width, depth: item.dimensions.depth },
          },
        ] as const),
      ]
    )
  );

  // Update registry when dynamicFurniture changes
  React.useEffect(() => {
    // Remove old dynamic furniture not in current list
    for (const [id] of registry.current) {
      if (!config.defaultFurniture.some(d => d.id === id) && !dynamicFurniture.some(d => d.id === id)) {
        registry.current.delete(id);
      }
    }
    // Add/update current dynamic furniture
    dynamicFurniture.forEach(item => {
      registry.current.set(item.id, {
        x: item.initialPos[0],
        z: item.initialPos[2],
        rotY: item.initialRotation,
        dims: { width: item.dimensions.width, depth: item.dimensions.depth },
      });
    });
  }, [dynamicFurniture, config.defaultFurniture]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, depth / 2]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#c8b89a" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Grid */}
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

      {/* Default furniture — static items fixed, others draggable */}
      {config.defaultFurniture.map((item) =>
        item.modelType === "window" ? (
          <StaticFurniture
            key={item.id}
            modelType={item.modelType}
            initialPos={item.initialPos}
            initialRotation={item.initialRotation}
            dimensions={item.dimensions}
            scaleFactor={item.scaleFactor ?? 1.0}
          />
        ) : (
          <DraggableFurniture
            key={item.id}
            id={item.id}
            modelType={item.modelType}
            initialPos={item.initialPos}
            initialRotation={item.initialRotation}
            dimensions={item.dimensions}
            scaleFactor={item.scaleFactor ?? 1.0}
            roomWidth={width}
            roomDepth={depth}
            orbitRef={orbitRef}
            registry={registry}
          />
        )
      )}

      {/* Dynamic furniture added from palette */}
      {dynamicFurniture.map((item) => (
        <DraggableFurniture
          key={item.id}
          id={item.id}
          modelType={item.modelType}
          initialPos={item.initialPos}
          initialRotation={item.initialRotation}
          dimensions={item.dimensions}
          scaleFactor={item.scaleFactor ?? 1.0}
          roomWidth={width}
          roomDepth={depth}
          orbitRef={orbitRef}
          registry={registry}
        />
      ))}

      {/* Placement preview */}
      {placementItem && (
        <PlacementPreview
          item={placementItem.item}
          position={[placementItem.mousePos[0], 0, placementItem.mousePos[1]]}
          rotation={placementItem.rotation}
          registry={registry}
        />
      )}

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
