import type { FilterPreset } from "@photostudio/shared-types";

export interface FilterDefinition {
  id: FilterPreset;
  label_id: string;
  label_en: string;
  cssFilter: string;
}

export const FILTER_PRESETS: FilterDefinition[] = [
  {
    id: "natural",
    label_id: "Natural",
    label_en: "Natural",
    cssFilter: "none",
  },
  {
    id: "korean",
    label_id: "Korean Glow",
    label_en: "Korean Glow",
    cssFilter: "brightness(1.07) contrast(0.95) saturate(0.92) sepia(0.06)",
  },
  {
    id: "aesthetic",
    label_id: "Aesthetic Soft",
    label_en: "Aesthetic Soft",
    cssFilter: "brightness(1.05) contrast(0.92) saturate(0.88) hue-rotate(-4deg)",
  },
  {
    id: "vintage",
    label_id: "Vintage",
    label_en: "Vintage",
    cssFilter: "sepia(0.32) contrast(1.05) brightness(0.96) saturate(0.85)",
  },
  {
    id: "film",
    label_id: "35mm Film",
    label_en: "35mm Film",
    cssFilter: "contrast(1.12) saturate(1.08) sepia(0.14) brightness(0.97)",
  },
  {
    id: "bw",
    label_id: "Hitam Putih",
    label_en: "B&W",
    cssFilter: "grayscale(1) contrast(1.15) brightness(1.02)",
  },
  {
    id: "cinematic",
    label_id: "Sinematik",
    label_en: "Cinematic",
    cssFilter: "contrast(1.18) saturate(0.9) brightness(0.93) sepia(0.08)",
  },
  {
    id: "retro",
    label_id: "Retro",
    label_en: "Retro",
    cssFilter: "sepia(0.25) saturate(1.25) contrast(1.04) hue-rotate(-8deg)",
  },
];

export function getFilterCss(preset?: FilterPreset): string {
  if (!preset) return "none";
  return FILTER_PRESETS.find((f) => f.id === preset)?.cssFilter ?? "none";
}
