export interface FurnitureItem {
  id: string;
  name: string;
  modelType: string;
  category: "bed" | "desk" | "closet" | "storage";
  price: number;
  imageUrl: string;
  defaultDimensions: { width: number; height: number; depth: number };
}

export const furnitureCategories = [
  { id: "bed", label: "Beds" },
  { id: "desk", label: "Desks" },
  { id: "closet", label: "Closets" },
  { id: "storage", label: "Storage" },
] as const;

export const furniture: FurnitureItem[] = [
  // Haolin Components - All Available GLB Models (except window)
  { id: "ww_bed", name: "Watson Webb Bed", modelType: "ww_bed", category: "bed", price: 289, imageUrl: "", defaultDimensions: { width: 7, height: 3, depth: 3 } },
  { id: "loft_bed", name: "Loft Bed", modelType: "bed", category: "bed", price: 259, imageUrl: "", defaultDimensions: { width: 4, height: 5, depth: 2.5 } },
  { id: "loft_bed_2", name: "Loft Bed 2", modelType: "loft_bed_2", category: "bed", price: 279, imageUrl: "", defaultDimensions: { width: 4, height: 5.5, depth: 2.5 } },
  { id: "loft_bed_3", name: "Loft Bed 3", modelType: "loft_bed_3", category: "bed", price: 299, imageUrl: "", defaultDimensions: { width: 4.5, height: 6, depth: 3 } },
  { id: "loft_bed_4", name: "Loft Bed 4", modelType: "loft_bed_4", category: "bed", price: 319, imageUrl: "", defaultDimensions: { width: 4.5, height: 6.5, depth: 3 } },
  { id: "loft_bed_combo", name: "Loft Bed Combo", modelType: "loft_bed_combo", category: "bed", price: 399, imageUrl: "", defaultDimensions: { width: 5, height: 7, depth: 3.5 } },
  { id: "desk_item", name: "Desk with Drawer & Chair", modelType: "desk", category: "desk", price: 329, imageUrl: "", defaultDimensions: { width: 3.5, height: 3.5, depth: 2.5 } },
  { id: "closet_item", name: "Closet", modelType: "closet", category: "closet", price: 149, imageUrl: "", defaultDimensions: { width: 3, height: 6, depth: 2 } },
  { id: "bed_drawer", name: "Bed Drawer", modelType: "bed_drawer", category: "storage", price: 89, imageUrl: "", defaultDimensions: { width: 7, height: 3, depth: 3  } },
  { id: "ww_drawer", name: "WW Drawer", modelType: "ww_drawer", category: "storage", price: 79, imageUrl: "", defaultDimensions: { width: 2.5, height: 2, depth: 2 } },
  { id: "bean_bag", name: "Bean Bag Chair", modelType: "bean_bag", category: "storage", price: 99, imageUrl: "", defaultDimensions: { width: 2, height: 1.5, depth: 2 } },
  { id: "shoerack", name: "Shoe Rack", modelType: "shoerack", category: "storage", price: 49, imageUrl: "", defaultDimensions: { width: 2, height: 4, depth: 0.5 } },
  { id: "fan", name: "Fan", modelType: "fan", category: "storage", price: 199, imageUrl: "", defaultDimensions: { width: 2.5, height: 4, depth: 2.5 } },
  { id: "lamp", name: "Floor Lamp", modelType: "lamp", category: "storage", price: 79, imageUrl: "", defaultDimensions: { width: 2, height: 5, depth: 2 } },
  //{ id: "laundry_basket", name: "Laundry Basket", modelType: "laundry_basket", category: "storage", price: 29, imageUrl: "", defaultDimensions: { width: 2, height: 2, depth: 2 } },
  //{ id: "mini_fridge", name: "Mini Fridge", modelType: "mini_fridge", category: "storage", price: 149, imageUrl: "", defaultDimensions: { width: 2, height: 3, depth: 2} },
  { id: "small_cart", name: "Small Cart", modelType: "small_cart", category: "storage", price: 59, imageUrl: "", defaultDimensions: { width: 2, height: 3, depth: 1 } },
  { id: "welcome_mat", name: "Welcome Mat", modelType: "welcome_mat", category: "storage", price: 19, imageUrl: "", defaultDimensions: { width: 4, height: 0.5, depth: 2.5 } },
  { id: "gaming_chair", name: "Gaming Chair", modelType: "gaming_chair", category: "storage", price: 199, imageUrl: "", defaultDimensions: { width: 2, height: 4, depth: 2 } },
  { id: "potted_plant", name: "Potted Plant", modelType: "potted_plant", category: "storage", price: 29, imageUrl: "", defaultDimensions: { width: 2, height: 2, depth: 2 } },
];
