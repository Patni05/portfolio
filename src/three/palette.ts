import type { Theme } from "@/lib/boot";

export type ScenePalette = {
  accent: string;
  accent2: string;
  accent3: string;
  particle: string;
  glyph: string;
  /** Multiplier applied to every opacity in the scene. */
  intensity: number;
};

/** The light theme gets a deliberately softer scene so text stays readable. */
export const scenePalette: Record<Theme, ScenePalette> = {
  dark: {
    accent: "#4F8DFF",
    accent2: "#22D3A6",
    accent3: "#A855F7",
    particle: "#8A8A95",
    glyph: "#4F8DFF",
    intensity: 1,
  },
  light: {
    accent: "#2563EB",
    accent2: "#0F9C78",
    accent3: "#7C3AED",
    particle: "#9AA0AC",
    glyph: "#2563EB",
    intensity: 0.55,
  },
};
