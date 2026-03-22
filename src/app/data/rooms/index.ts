import type { RoomConfig } from "../../types/room3d";
import watsonWebb from "./watson-webb.json";
import kellogg from "./kellogg.json";
import cauthen from "./cauthen.json";

const roomRegistry: Record<string, RoomConfig> = {
  "watson-webb": watsonWebb as unknown as RoomConfig,
  "kellogg": kellogg as unknown as RoomConfig,
};

export function getRoomConfig(roomId: string): RoomConfig | null {
    return roomRegistry[roomId] ?? null;
}
