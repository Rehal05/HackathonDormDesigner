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
  {
    id: "kellogg",
    name: "Kellogg Hall",
    campus: "Central Grounds",
    description: "Kellogg Hall offers suite-style living for first-year students, located close to the dining hall and academic buildings on Central Grounds.",
    policy: "Quiet hours from 11 PM to 9 AM. No candles or open flames. Guests must be signed in at the front desk.",
  },
  {
    id: "cauthen",
    name: "Cauthen Hall",
    campus: "Central Grounds",
    description: "Cauthen Hall is a first-year residence hall featuring traditional double rooms with a strong sense of community and central campus access.",
    policy: "Quiet hours from 10 PM to 8 AM. No candles or open flames. Guests must be signed in at the front desk.",
  },
  {
    id: "lefevre",
    name: "Lefevre House",
    campus: "North Grounds",
    description: "Lefevre House is a smaller residential community on North Grounds, offering a quieter living environment close to the Law School and North Grounds facilities.",
    policy: "Quiet hours from 10 PM to 8 AM. No candles or open flames. All guests must be registered.",
  },
];

export const rooms: Room[] = [
  {
    id: "watson-webb",
    name: "Shared Double",
    building: "watson-webb",
    occupancy: "Double",
    dimensions: "16'×11'6\"",
    sqft: 184,
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

  {
    id: "cauthen",
    name: "Shared Double",
    building: "cauthen",
    occupancy: "Double",
    dimensions: "11'×15'",
    sqft: 165,
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

  {
    id: "kellogg",
    name: "Shared Double",
    building: "kellogg",
    occupancy: "Double",
    dimensions: "11'7\"×15'11\"",
    sqft: 185,
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
