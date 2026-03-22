import { PLACES_CATEGORY_LABEL_RU } from "@/lib/seo/places";

/** Hex colors for map markers by DB category key */
export const PLACE_CATEGORY_MARKER_COLORS: Record<string, string> = {
  nature: "#2d8659",
  history: "#8b4513",
  castles: "#6b4c9a",
  museums: "#1565c0",
  gastro: "#e65100",
  activity: "#c62828",
  kids: "#f9a825",
};

export function markerColorForCategory(category: string): string {
  return PLACE_CATEGORY_MARKER_COLORS[category] ?? "#181818";
}

export function categoryLabelRu(category: string): string {
  return PLACES_CATEGORY_LABEL_RU[category] ?? category;
}
