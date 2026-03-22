import React, { createContext, useContext, useRef, useCallback, useState } from "react";
import * as THREE from "three";

type BoundingBoxGetter = () => THREE.Box3 | null;

export interface DynamicFurnitureItem {
  id: string;
  modelType: string;
  initialPos: [number, number, number];
  initialRotation: number;
  dimensions: { width: number; height: number; depth: number };
  scaleFactor?: number;
}

export interface PlacementItem {
  item: Omit<DynamicFurnitureItem, 'id' | 'initialPos'>;
  mousePos: [number, number];
  rotation: number;
}

interface FurnitureContextValue {
  registerFurniture: (id: string, getBox: BoundingBoxGetter) => () => void;
  checkCollision: (id: string, testBox: THREE.Box3) => boolean;
  dynamicFurniture: DynamicFurnitureItem[];
  addFurniture: (item: DynamicFurnitureItem) => void;
  removeFurniture: (id: string) => void;
  placementItem: PlacementItem | null;
  startPlacement: (item: Omit<DynamicFurnitureItem, 'id' | 'initialPos'>) => void;
  updatePlacement: (mousePos: [number, number]) => void;
  rotatePlacement: () => void;
  confirmPlacement: () => void;
  cancelPlacement: () => void;
  removalMode: boolean;
  selectedForRemoval: string | null;
  startRemoval: () => void;
  selectForRemoval: (id: string) => void;
  confirmRemoval: () => void;
  cancelRemoval: () => void;
  resetFurniture: () => void;
}

const FurnitureContext = createContext<FurnitureContextValue | null>(null);

export function FurnitureProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef<Map<string, BoundingBoxGetter>>(new Map());
  const [dynamicFurniture, setDynamicFurniture] = useState<DynamicFurnitureItem[]>([]);
  const [placementItem, setPlacementItem] = useState<PlacementItem | null>(null);
  const [removalMode, setRemovalMode] = useState(false);
  const [selectedForRemoval, setSelectedForRemoval] = useState<string | null>(null);

  const registerFurniture = useCallback((id: string, getBox: BoundingBoxGetter) => {
    registry.current.set(id, getBox);
    return () => {
      registry.current.delete(id);
    };
  }, []);

  const checkCollision = useCallback((id: string, testBox: THREE.Box3): boolean => {
    for (const [otherId, getBox] of registry.current.entries()) {
      if (otherId === id) continue;
      const otherBox = getBox();
      if (otherBox && testBox.intersectsBox(otherBox)) {
        return true;
      }
    }
    return false;
  }, []);

  const addFurniture = useCallback((item: DynamicFurnitureItem) => {
    setDynamicFurniture((prev) => [...prev, item]);
  }, []);

  const removeFurniture = useCallback((id: string) => {
    setDynamicFurniture((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const startPlacement = useCallback((item: Omit<DynamicFurnitureItem, 'id' | 'initialPos'>) => {
    setPlacementItem({ item, mousePos: [0, 0], rotation: 0 });
  }, []);

  const updatePlacement = useCallback((mousePos: [number, number]) => {
    setPlacementItem((prev) => prev ? { ...prev, mousePos } : null);
  }, []);

  const rotatePlacement = useCallback(() => {
    setPlacementItem((prev) => prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null);
  }, []);

  const confirmPlacement = useCallback(() => {
    if (!placementItem) return;

    const newItem: DynamicFurnitureItem = {
      ...placementItem.item,
      id: `${placementItem.item.modelType}-${Date.now()}`,
      initialPos: [placementItem.mousePos[0], 0, placementItem.mousePos[1]],
      initialRotation: placementItem.rotation,
    };

    // Calculate rotated dimensions for collision detection
    const rotDeg = placementItem.rotation;
    const snap = ((Math.round(rotDeg / 90) % 4) + 4) % 4;
    const [width, depth] = snap % 2 === 0 
      ? [newItem.dimensions.width, newItem.dimensions.depth] 
      : [newItem.dimensions.depth, newItem.dimensions.width];

    // Check if placement is valid (no collisions)
    const testBox = new THREE.Box3(
      new THREE.Vector3(
        newItem.initialPos[0] - width / 2,
        0,
        newItem.initialPos[2] - depth / 2
      ),
      new THREE.Vector3(
        newItem.initialPos[0] + width / 2,
        newItem.dimensions.height,
        newItem.initialPos[2] + depth / 2
      )
    );

    if (!checkCollision('', testBox)) {
      addFurniture(newItem);
    }

    setPlacementItem(null);
  }, [placementItem, checkCollision, addFurniture]);

  const cancelPlacement = useCallback(() => {
    setPlacementItem(null);
  }, []);

  const startRemoval = useCallback(() => {
    setRemovalMode(true);
    setSelectedForRemoval(null);
  }, []);

  const selectForRemoval = useCallback((id: string) => {
    if (removalMode) {
      setSelectedForRemoval(id);
    }
  }, [removalMode]);

  const confirmRemoval = useCallback(() => {
    if (selectedForRemoval) {
      removeFurniture(selectedForRemoval);
      setSelectedForRemoval(null);
      setRemovalMode(false);
    }
  }, [selectedForRemoval, removeFurniture]);

  const cancelRemoval = useCallback(() => {
    setSelectedForRemoval(null);
    setRemovalMode(false);
  }, []);

  const resetFurniture = useCallback(() => {
    setDynamicFurniture([]);
    setPlacementItem(null);
    setRemovalMode(false);
    setSelectedForRemoval(null);
  }, []);

  return (
    <FurnitureContext.Provider value={{
      registerFurniture,
      checkCollision,
      dynamicFurniture,
      addFurniture,
      removeFurniture,
      placementItem,
      startPlacement,
      updatePlacement,
      rotatePlacement,
      confirmPlacement,
      cancelPlacement,
      removalMode,
      selectedForRemoval,
      startRemoval,
      selectForRemoval,
      confirmRemoval,
      cancelRemoval,
      resetFurniture,
    }}>
      {children}
    </FurnitureContext.Provider>
  );
}

export function useFurnitureCollision(): FurnitureContextValue {
  const ctx = useContext(FurnitureContext);
  if (!ctx) throw new Error("useFurnitureCollision must be used inside FurnitureProvider");
  return ctx;
}
