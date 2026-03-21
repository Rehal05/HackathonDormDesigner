export interface FurnitureItem {
  id: string;
  name: string;
  category: "bed" | "desk" | "storage" | "seating" | "lighting" | "decor";
  price: number;
  imageUrl: string;
}

export const furnitureCategories = [
  { id: "bed", label: "Beds" },
  { id: "desk", label: "Desks" },
  { id: "storage", label: "Storage" },
  { id: "seating", label: "Seating" },
  { id: "lighting", label: "Lighting" },
  { id: "decor", label: "Decor" },
] as const;

export const furniture: FurnitureItem[] = [
  // Beds
  { id: "bed-1", name: "Twin XL Loft Bed", category: "bed", price: 289, imageUrl: "" },
  { id: "bed-2", name: "Standard Twin Bed", category: "bed", price: 159, imageUrl: "" },
  { id: "bed-3", name: "Platform Bed Frame", category: "bed", price: 199, imageUrl: "" },
  { id: "bed-4", name: "Bunk Bed Set", category: "bed", price: 349, imageUrl: "" },
  
  // Desks
  { id: "desk-1", name: "Corner Study Desk", category: "desk", price: 179, imageUrl: "" },
  { id: "desk-2", name: "Compact Writing Desk", category: "desk", price: 129, imageUrl: "" },
  { id: "desk-3", name: "L-Shape Workstation", category: "desk", price: 249, imageUrl: "" },
  { id: "desk-4", name: "Adjustable Standing Desk", category: "desk", price: 329, imageUrl: "" },
  { id: "desk-5", name: "Wall-Mounted Desk", category: "desk", price: 89, imageUrl: "" },
  
  // Storage
  { id: "storage-1", name: "5-Drawer Dresser", category: "storage", price: 189, imageUrl: "" },
  { id: "storage-2", name: "Cube Organizer 9-Box", category: "storage", price: 79, imageUrl: "" },
  { id: "storage-3", name: "Under-Bed Storage", category: "storage", price: 45, imageUrl: "" },
  { id: "storage-4", name: "Hanging Closet Organizer", category: "storage", price: 29, imageUrl: "" },
  { id: "storage-5", name: "Bookshelf 5-Tier", category: "storage", price: 119, imageUrl: "" },
  { id: "storage-6", name: "Storage Ottoman", category: "storage", price: 69, imageUrl: "" },
  
  // Seating
  { id: "seating-1", name: "Ergonomic Desk Chair", category: "seating", price: 149, imageUrl: "" },
  { id: "seating-2", name: "Bean Bag Chair", category: "seating", price: 59, imageUrl: "" },
  { id: "seating-3", name: "Folding Lounge Chair", category: "seating", price: 79, imageUrl: "" },
  { id: "seating-4", name: "Floor Cushion Set", category: "seating", price: 39, imageUrl: "" },
  
  // Lighting
  { id: "lighting-1", name: "LED Desk Lamp", category: "lighting", price: 35, imageUrl: "" },
  { id: "lighting-2", name: "Floor Lamp", category: "lighting", price: 59, imageUrl: "" },
  { id: "lighting-3", name: "String Lights", category: "lighting", price: 18, imageUrl: "" },
  { id: "lighting-4", name: "Smart LED Bulbs (4-pack)", category: "lighting", price: 45, imageUrl: "" },
  { id: "lighting-5", name: "Clip-On Reading Light", category: "lighting", price: 22, imageUrl: "" },
  
  // Decor
  { id: "decor-1", name: "Wall Tapestry", category: "decor", price: 28, imageUrl: "" },
  { id: "decor-2", name: "Photo Display Clips", category: "decor", price: 15, imageUrl: "" },
  { id: "decor-3", name: "Area Rug 5×7", category: "decor", price: 89, imageUrl: "" },
  { id: "decor-4", name: "Wall Mirror", category: "decor", price: 42, imageUrl: "" },
  { id: "decor-5", name: "Plant Set (3 pots)", category: "decor", price: 35, imageUrl: "" },
  { id: "decor-6", name: "Bulletin Board", category: "decor", price: 24, imageUrl: "" },
];
