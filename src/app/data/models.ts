// Central registry mapping modelKey → GLB path
// Add every haolin_components GLB here

export const MODEL_URLS: Record<string, string> = {
  "ww_bed":               "/src/haolin_components/ww_bed.glb",
  "bed":                  "/src/haolin_components/loft_bed.glb",
  "loft_bed_2":           "/src/haolin_components/loft_bed_2.glb",
  "loft_bed_3":           "/src/haolin_components/loft_bed_3.glb",
  "loft_bed_4":           "/src/haolin_components/loft_bed_4.glb",
  "loft_bed_combo":       "/src/haolin_components/loft_bed_combo.glb",
  "desk":                 "/src/haolin_components/desk_drawer_chair.glb",
  "chair":                "/src/haolin_components/desk_drawer_chair.glb",
  "closet":               "/src/haolin_components/closet.glb",
  "bed_drawer":           "/src/haolin_components/bed_drawer.glb",
  "ww_drawer":            "/src/haolin_components/ww_drawer.glb",
  "room_furniture":       "/src/haolin_components/room_furniture.glb",
  "bean_bag":             "/src/haolin_components/bean_bag.glb",
  "shoerack":             "/src/haolin_components/shoerack.glb",
  // add more here as you drop new GLBs in
};

// Maps furniture catalog id → model key
// If a furniture item has no model, it gets a placeholder box
export const FURNITURE_MODEL_MAP: Record<string, string> = {
  "ww_bed":         "ww_bed",
  "loft_bed":       "bed",
  "loft_bed_2":     "loft_bed_2",
  "loft_bed_3":     "loft_bed_3",
  "loft_bed_4":     "loft_bed_4",
  "loft_bed_combo": "loft_bed_combo",
  "desk_item":      "desk",
  "closet_item":    "closet",
  "bed_drawer":     "bed_drawer",
  "ww_drawer":      "ww_drawer",
  "room_furniture": "room_furniture",
  "bean_bag":       "bean_bag",
  "shoerack":       "shoerack",
  // extend as needed
};

export function getModelUrl(furnitureId: string): string | null {
  const key = FURNITURE_MODEL_MAP[furnitureId];
  return key ? MODEL_URLS[key] ?? null : null;
}