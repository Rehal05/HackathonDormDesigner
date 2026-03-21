import React, { createContext, useContext, useRef, useCallback } from "react";
import * as THREE from "three";

type BoundingBoxGetter = () => THREE.Box3 | null;

interface FurnitureContextValue {
  registerFurniture: (id: string, getBox: BoundingBoxGetter) => () => void;
  checkCollision: (id: string, testBox: THREE.Box3) => boolean;
}

const FurnitureContext = createContext<FurnitureContextValue | null>(null);

export function FurnitureProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef<Map<string, BoundingBoxGetter>>(new Map());

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

  return (
    <FurnitureContext.Provider value={{ registerFurniture, checkCollision }}>
      {children}
    </FurnitureContext.Provider>
  );
}

export function useFurnitureCollision(): FurnitureContextValue {
  const ctx = useContext(FurnitureContext);
  if (!ctx) throw new Error("useFurnitureCollision must be used inside FurnitureProvider");
  return ctx;
}
