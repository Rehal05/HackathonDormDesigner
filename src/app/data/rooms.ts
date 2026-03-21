export interface Room {
  id: string;
  name: string;
  building: string;
  occupancy: "Single" | "Double";
  dimensions: string;
  sqft: number;
  doorNote: string;
  imageUrl: string;
  estimatedCost: number;
  costBreakdown: {
    item: string;
    amount: number;
  }[];
}

export interface Building {
  id: string;
  name: string;
  campus: string;
  description: string;
  policy: string;
}

export const buildings: Building[] = [
  {
    id: "watson-webb",
    name: "Watson-Webb Hall",
    campus: "Central Grounds",
    description: "Watson-Webb Hall is a traditional residence hall offering standard single occupancy rooms with easy access to dining and academic buildings.",
    policy: "Quiet hours from 10 PM to 8 AM. No candles or open flames. Guests must be signed in at the front desk.",
  },
];

export const rooms: Room[] = [
  {
    id: "watson-webb",
    name: "Standard Single",
    building: "watson-webb",
    occupancy: "Single",
    dimensions: "12×15ft",
    sqft: 180,
    doorNote: "Door opens inward, right wall",
    imageUrl: "",
    estimatedCost: 3250,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 450 },
      { item: "Desk & Chair", amount: 380 },
      { item: "Dresser", amount: 320 },
      { item: "Shelving Unit", amount: 180 },
      { item: "Bedding & Decor", amount: 520 },
      { item: "Storage Solutions", amount: 240 },
      { item: "Lighting", amount: 160 },
      { item: "Miscellaneous", amount: 1000 },
    ],
  },
];

export function getRoomsByBuilding(buildingId: string): Room[] {
  return rooms.filter(room => room.building === buildingId);
}

export function getRoomById(roomId: string): Room | undefined {
  return rooms.find(room => room.id === roomId);
}

export function getBuildingById(buildingId: string): Building | undefined {
  return buildings.find(building => building.id === buildingId);
}
