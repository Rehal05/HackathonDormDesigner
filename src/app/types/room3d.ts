export interface RoomConfig {
  id: string;
  name: string;
  building: string;

  dimensions: {
    width: number;
    height: number;
    depth: number;
  };

  door: {
    hingePosition: [number, number, number];
    width: number;
    swingRotation: number;
  };

  outlets: {
    id: string;
    position: [number, number, number];
  }[];

  staticElements: {
    id: string;
    type: string;
    position: [number, number, number];
    rotation?: [number, number, number];
    dimensions: { width: number; height: number; depth: number };
  }[];

  defaultFurniture: {
    id: string;
    modelType: string;
    initialPos: [number, number, number];
    initialRotation: number;
    dimensions: { width: number; height: number; depth: number };
  }[];

  lighting: {
    ambientIntensity: number;
    pointLights: {
      position: [number, number, number];
      intensity: number;
      color: string;
    }[];
  };
}
