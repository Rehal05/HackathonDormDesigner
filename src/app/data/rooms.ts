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
    id: "lile",
    name: "Lile Hall",
    campus: "North Campus",
    description: "Lile Hall is a traditional residence hall offering both single and double occupancy rooms. Located in the heart of North Campus, it provides easy access to dining facilities and academic buildings.",
    policy: "Quiet hours from 10 PM to 8 AM. No candles or open flames. Guests must be signed in at the front desk.",
  },
  {
    id: "porter",
    name: "Porter House",
    campus: "South Campus",
    description: "Porter House features suite-style living with shared common areas. Each floor has a communal kitchen and lounge space for residents to gather and study.",
    policy: "24-hour quiet study lounge on first floor. Kitchen access requires completion of safety orientation.",
  },
  {
    id: "greenway",
    name: "Greenway Tower",
    campus: "East Campus",
    description: "The newest addition to campus housing, Greenway Tower offers modern amenities including in-room climate control and high-speed internet connections.",
    policy: "Energy-efficient building with sustainability initiatives. Recycling program mandatory for all residents.",
  },
];

export const rooms: Room[] = [
  // Lile Hall
  {
    id: "lile-201",
    name: "Room 201",
    building: "lile",
    occupancy: "Single",
    dimensions: "12×15ft",
    sqft: 180,
    doorNote: "Door opens inward, left wall mount",
    imageUrl: "", // Will be set with Unsplash
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
    id: "lile-203",
    name: "Room 203",
    building: "lile",
    occupancy: "Double",
    dimensions: "14×18ft",
    sqft: 252,
    doorNote: "Door opens outward, centered",
    imageUrl: "",
    estimatedCost: 5840,
    costBreakdown: [
      { item: "Beds & Mattresses (×2)", amount: 900 },
      { item: "Desks & Chairs (×2)", amount: 760 },
      { item: "Dressers (×2)", amount: 640 },
      { item: "Shelving Units", amount: 280 },
      { item: "Bedding & Decor", amount: 940 },
      { item: "Storage Solutions", amount: 420 },
      { item: "Lighting", amount: 240 },
      { item: "Miscellaneous", amount: 1660 },
    ],
  },
  {
    id: "lile-305",
    name: "Room 305",
    building: "lile",
    occupancy: "Single",
    dimensions: "11×14ft",
    sqft: 154,
    doorNote: "Door opens inward, right wall mount",
    imageUrl: "",
    estimatedCost: 2980,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 450 },
      { item: "Desk & Chair", amount: 350 },
      { item: "Dresser", amount: 300 },
      { item: "Shelving Unit", amount: 160 },
      { item: "Bedding & Decor", amount: 480 },
      { item: "Storage Solutions", amount: 220 },
      { item: "Lighting", amount: 140 },
      { item: "Miscellaneous", amount: 880 },
    ],
  },
  {
    id: "lile-402",
    name: "Room 402",
    building: "lile",
    occupancy: "Double",
    dimensions: "15×20ft",
    sqft: 300,
    doorNote: "Door opens inward, left wall mount",
    imageUrl: "",
    estimatedCost: 6420,
    costBreakdown: [
      { item: "Beds & Mattresses (×2)", amount: 900 },
      { item: "Desks & Chairs (×2)", amount: 820 },
      { item: "Dressers (×2)", amount: 680 },
      { item: "Shelving Units", amount: 320 },
      { item: "Bedding & Decor", amount: 1040 },
      { item: "Storage Solutions", amount: 480 },
      { item: "Lighting", amount: 280 },
      { item: "Miscellaneous", amount: 1900 },
    ],
  },
  
  // Porter House
  {
    id: "porter-101",
    name: "Room 101",
    building: "porter",
    occupancy: "Single",
    dimensions: "13×16ft",
    sqft: 208,
    doorNote: "Suite entrance, private door on right",
    imageUrl: "",
    estimatedCost: 3580,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 480 },
      { item: "Desk & Chair", amount: 420 },
      { item: "Dresser", amount: 360 },
      { item: "Shelving Unit", amount: 200 },
      { item: "Bedding & Decor", amount: 580 },
      { item: "Storage Solutions", amount: 280 },
      { item: "Lighting", amount: 180 },
      { item: "Miscellaneous", amount: 1080 },
    ],
  },
  {
    id: "porter-205",
    name: "Room 205",
    building: "porter",
    occupancy: "Double",
    dimensions: "16×19ft",
    sqft: 304,
    doorNote: "Shared suite common area access",
    imageUrl: "",
    estimatedCost: 6680,
    costBreakdown: [
      { item: "Beds & Mattresses (×2)", amount: 960 },
      { item: "Desks & Chairs (×2)", amount: 840 },
      { item: "Dressers (×2)", amount: 720 },
      { item: "Shelving Units", amount: 340 },
      { item: "Bedding & Decor", amount: 1100 },
      { item: "Storage Solutions", amount: 520 },
      { item: "Lighting", amount: 300 },
      { item: "Miscellaneous", amount: 1900 },
    ],
  },
  {
    id: "porter-308",
    name: "Room 308",
    building: "porter",
    occupancy: "Single",
    dimensions: "12×15ft",
    sqft: 180,
    doorNote: "Corner suite, extra window",
    imageUrl: "",
    estimatedCost: 3380,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 450 },
      { item: "Desk & Chair", amount: 400 },
      { item: "Dresser", amount: 340 },
      { item: "Shelving Unit", amount: 190 },
      { item: "Bedding & Decor", amount: 540 },
      { item: "Storage Solutions", amount: 260 },
      { item: "Lighting", amount: 170 },
      { item: "Miscellaneous", amount: 1030 },
    ],
  },
  
  // Greenway Tower
  {
    id: "greenway-501",
    name: "Room 501",
    building: "greenway",
    occupancy: "Single",
    dimensions: "13×17ft",
    sqft: 221,
    doorNote: "Electronic keycard access, door left",
    imageUrl: "",
    estimatedCost: 3880,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 520 },
      { item: "Desk & Chair", amount: 450 },
      { item: "Dresser", amount: 380 },
      { item: "Shelving Unit", amount: 220 },
      { item: "Bedding & Decor", amount: 620 },
      { item: "Storage Solutions", amount: 300 },
      { item: "Lighting", amount: 190 },
      { item: "Miscellaneous", amount: 1200 },
    ],
  },
  {
    id: "greenway-604",
    name: "Room 604",
    building: "greenway",
    occupancy: "Double",
    dimensions: "17×21ft",
    sqft: 357,
    doorNote: "Premium floor, automated climate control",
    imageUrl: "",
    estimatedCost: 7240,
    costBreakdown: [
      { item: "Beds & Mattresses (×2)", amount: 1040 },
      { item: "Desks & Chairs (×2)", amount: 900 },
      { item: "Dressers (×2)", amount: 760 },
      { item: "Shelving Units", amount: 380 },
      { item: "Bedding & Decor", amount: 1200 },
      { item: "Storage Solutions", amount: 560 },
      { item: "Lighting", amount: 320 },
      { item: "Miscellaneous", amount: 2080 },
    ],
  },
  {
    id: "greenway-702",
    name: "Room 702",
    building: "greenway",
    occupancy: "Single",
    dimensions: "14×18ft",
    sqft: 252,
    doorNote: "Top floor, skylight feature",
    imageUrl: "",
    estimatedCost: 4180,
    costBreakdown: [
      { item: "Bed & Mattress", amount: 540 },
      { item: "Desk & Chair", amount: 480 },
      { item: "Dresser", amount: 400 },
      { item: "Shelving Unit", amount: 240 },
      { item: "Bedding & Decor", amount: 660 },
      { item: "Storage Solutions", amount: 320 },
      { item: "Lighting", amount: 200 },
      { item: "Miscellaneous", amount: 1340 },
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
