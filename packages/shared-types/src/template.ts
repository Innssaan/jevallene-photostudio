export const MANDATORY_WATERMARK_BRAND = "Jevallene" as const;

export type TemplateCategory =
  | "photobox"
  | "ig_story"
  | "tiktok_story"
  | "ig_feed"
  | "tiktok_feed"
  | "collage"
  | "polaroid"
  | "custom";

export type TemplateTheme =
  | "korean"
  | "minimal"
  | "vintage"
  | "aesthetic"
  | "cute"
  | "editorial"
  | "romantic"
  | "dark"
  | "birthday";

export type AspectRatioPreset =
  | "9:16"
  | "1:1"
  | "4:5"
  | "3:4"
  | "16:9"
  | "2:3"
  | "custom";

export type FilterPreset =
  | "natural"
  | "korean"
  | "vintage"
  | "film"
  | "bw"
  | "cinematic"
  | "retro"
  | "aesthetic";

export interface CanvasBackground {
  type: "solid" | "gradient" | "image";
  value: string;
  opacity?: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatioPreset;
  background: CanvasBackground;
  /** Optional transparent-cutout PNG frame drawn directly over photo slots */
  overlayImage?: string;
}

export interface PhotoSlot {
  id: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  borderRadius?: number;
  filter?: FilterPreset;
}

export type LayerType = "text" | "sticker" | "shape" | "frame" | "date" | "drawing";

export interface BaseLayer {
  id: string;
  type: LayerType;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  visible: boolean;
}

export interface TextLayer extends BaseLayer {
  type: "text" | "date";
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  letterSpacing?: number;
  shadow?: string;
  outline?: string;
  curvedRadius?: number;
}

export interface AssetLayer extends BaseLayer {
  type: "sticker" | "frame" | "shape" | "drawing";
  assetId?: string;
  assetUrl?: string;
  tintColor?: string;
  shapeKind?:
    | "rect"
    | "ticket"
    | "star"
    | "circle"
    | "sprocket"
    | "grid"
    | "barcode"
    | "heart"
    | "sparkle";
  borderRadius?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export type TemplateLayer = TextLayer | AssetLayer;

export type WatermarkPlacement =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left";

export type WatermarkStyle = "minimal" | "pill" | "stamp" | "italic";

export interface WatermarkRule {
  brand: typeof MANDATORY_WATERMARK_BRAND;
  locked: true;
  placement: WatermarkPlacement;
  contrastMode: "auto" | "light" | "dark";
  minScale: number;
  maxScale: number;
  fontFamily?: string;
  style?: WatermarkStyle;
}

export interface TemplateDocument {
  schemaVersion: "1.0";
  templateId: string;
  version: number;
  category: TemplateCategory;
  theme: TemplateTheme;
  canvas: CanvasConfig;
  slots: PhotoSlot[];
  layers: TemplateLayer[];
  watermark: WatermarkRule;
}

/**
 * Number of unique photos a template needs. Slots may share an index
 * (e.g. double-strip layouts that print the same shot twice).
 */
export function getSlotCount(doc: Pick<TemplateDocument, "slots">): number {
  if (doc.slots.length === 0) return 0;
  return Math.max(...doc.slots.map((s) => s.index)) + 1;
}

/** Returns one slot per unique index (first occurrence), sorted by index. */
export function getUniqueSlots(doc: Pick<TemplateDocument, "slots">): PhotoSlot[] {
  const seen = new Set<number>();
  return [...doc.slots]
    .sort((a, b) => a.index - b.index)
    .filter((s) => (seen.has(s.index) ? false : (seen.add(s.index), true)));
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a TemplateDocument and enforces mandatory Jevallene watermark rules.
 */
export function validateTemplateDocument(doc: unknown): ValidationResult {
  const errors: string[] = [];

  if (!doc || typeof doc !== "object") {
    return { valid: false, errors: ["Template document must be an object."] };
  }

  const d = doc as Partial<TemplateDocument>;

  if (d.schemaVersion !== "1.0") {
    errors.push("schemaVersion must be '1.0'.");
  }
  if (!d.templateId || typeof d.templateId !== "string") {
    errors.push("templateId is required.");
  }
  if (typeof d.version !== "number" || d.version < 1) {
    errors.push("version must be a positive number.");
  }
  if (!d.canvas || typeof d.canvas.width !== "number" || typeof d.canvas.height !== "number") {
    errors.push("canvas.width and canvas.height are required.");
  } else if (d.canvas.width <= 0 || d.canvas.height <= 0) {
    errors.push("canvas dimensions must be greater than 0.");
  }
  if (!Array.isArray(d.slots)) {
    errors.push("slots must be an array.");
  }
  if (!Array.isArray(d.layers)) {
    errors.push("layers must be an array.");
  }

  // Mandatory Jevallene watermark checks (PRD Section 11)
  if (!d.watermark) {
    errors.push("watermark configuration is mandatory.");
  } else {
    if (d.watermark.brand !== MANDATORY_WATERMARK_BRAND) {
      errors.push(`watermark.brand must be '${MANDATORY_WATERMARK_BRAND}'.`);
    }
    if (d.watermark.locked !== true) {
      errors.push("watermark.locked must be true and cannot be disabled.");
    }
    if (typeof d.watermark.minScale !== "number" || d.watermark.minScale <= 0) {
      errors.push("watermark.minScale must be greater than 0.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes any template input so the Jevallene watermark rule can never be stripped.
 */
export function enforceMandatoryWatermark(
  rule?: Partial<WatermarkRule>
): WatermarkRule {
  return {
    brand: MANDATORY_WATERMARK_BRAND,
    locked: true,
    placement: rule?.placement ?? "bottom-right",
    contrastMode: rule?.contrastMode ?? "auto",
    minScale: rule?.minScale && rule.minScale > 0 ? rule.minScale : 0.025,
    maxScale: rule?.maxScale && rule.maxScale >= (rule?.minScale ?? 0.025) ? rule.maxScale : 0.06,
    fontFamily: rule?.fontFamily,
    style: rule?.style,
  };
}
