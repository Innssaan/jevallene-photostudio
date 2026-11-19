import {
  MANDATORY_WATERMARK_BRAND,
  enforceMandatoryWatermark,
  type FilterPreset,
  type TemplateDocument,
  type TemplateLayer,
  type TextLayer,
  type WatermarkRule,
} from "@photostudio/shared-types";
import { getFilterCss } from "./filters";

export interface ColorAdjustments {
  brightness: number; // -50 to 50 (0 = default)
  contrast: number; // -50 to 50 (0 = default)
  saturation: number; // -50 to 50 (0 = default)
  warmth: number; // 0 to 50 (0 = default)
  vignette: number; // 0 to 60 (0 = default)
}

export const DEFAULT_ADJUSTMENTS: ColorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  vignette: 0,
};

export interface CameraEffects {
  softGlow?: boolean;
  filmGrain?: boolean;
  dateStamp?: boolean;
}

export interface RenderTemplateOptions {
  slotImages?: (string | null)[];
  overrideFilter?: FilterPreset;
  adjustments?: ColorAdjustments;
  effects?: CameraEffects;
  customCaption?: string;
  dateText?: string;
  scale?: number;
}

let cachedGrainCanvas: HTMLCanvasElement | null = null;
function getFilmGrainCanvas(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  if (cachedGrainCanvas) return cachedGrainCanvas;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const gctx = c.getContext("2d");
  if (!gctx) return null;
  const imgData = gctx.createImageData(128, 128);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.floor(Math.random() * 256);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  gctx.putImageData(imgData, 0, 0);
  cachedGrainCanvas = c;
  return c;
}

const imagePromiseCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imagePromiseCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      imagePromiseCache.delete(src);
      reject(err);
    };
    img.src = src;
  });

  if (!src.startsWith("data:")) {
    imagePromiseCache.set(src, promise);
  }
  return promise;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function parseLinearGradient(
  ctx: CanvasRenderingContext2D,
  value: string,
  width: number,
  height: number
): CanvasGradient | null {
  const match = value.match(/linear-gradient\(([^)]+)\)/i);
  if (!match) return null;

  const parts = match[1].split(",").map((s) => s.trim());
  let angleDeg = 180;
  let startIdx = 0;

  if (parts[0]?.endsWith("deg")) {
    angleDeg = parseFloat(parts[0]);
    startIdx = 1;
  }

  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const len = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
  const x0 = cx - (Math.cos(rad) * len) / 2;
  const y0 = cy - (Math.sin(rad) * len) / 2;
  const x1 = cx + (Math.cos(rad) * len) / 2;
  const y1 = cy + (Math.sin(rad) * len) / 2;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  const stops = parts.slice(startIdx);
  stops.forEach((stop, idx) => {
    const tokens = stop.split(/\s+/);
    const color = tokens[0];
    const pct =
      tokens[1] && tokens[1].endsWith("%")
        ? parseFloat(tokens[1]) / 100
        : stops.length === 1
          ? 0
          : idx / (stops.length - 1);
    grad.addColorStop(Math.max(0, Math.min(1, pct)), color);
  });

  return grad;
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  doc: TemplateDocument
) {
  const { width, height, background } = doc.canvas;
  ctx.save();
  if (typeof background.opacity === "number") {
    ctx.globalAlpha = background.opacity;
  }

  if (background.type === "gradient") {
    const grad = parseLinearGradient(ctx, background.value, width, height);
    ctx.fillStyle = grad ?? "#faf8f5";
    ctx.fillRect(0, 0, width, height);
  } else if (background.type === "image" && background.value) {
    try {
      const img = await loadImage(background.value);
      drawCoverImage(ctx, img, 0, 0, width, height);
    } catch {
      ctx.fillStyle = "#faf8f5";
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = background.value || "#faf8f5";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawContainImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const scale = Math.min(dw / img.naturalWidth, dh / img.naturalHeight);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const x = Math.round(dx + (dw - w) / 2);
  const y = Math.round(dy + (dh - h) / 2);
  ctx.drawImage(img, x, y, w, h);
}

function isHeaderTitleLayer(layer: TemplateLayer): boolean {
  if (layer.type !== "text" || !layer.visible) return false;
  const id = layer.id;
  return (
    id === "title" ||
    id.startsWith("title") ||
    id.endsWith("-title") ||
    id.endsWith("-top") ||
    id.endsWith("-head") ||
    id.endsWith("-t")
  );
}

function getThemeHeaderTypography(doc: TemplateDocument): { fontFamily: string; color: string } {
  const isLightText = doc.watermark.contrastMode === "light";
  const color = isLightText ? "#f8fafc" : "#18181b";
  switch (doc.theme) {
    case "romantic":
      return { fontFamily: "Dancing Script", color };
    case "cute":
    case "birthday":
      return { fontFamily: "Pacifico", color };
    case "vintage":
    case "aesthetic":
      return { fontFamily: "Shrikhand", color };
    case "dark":
      return { fontFamily: "Bebas Neue", color };
    case "editorial":
      return { fontFamily: "Playfair Display", color };
    default:
      return { fontFamily: "Plus Jakarta Sans", color };
  }
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  dateText: string,
  customCaption?: string
) {
  if (!layer.visible) return;

  let text = layer.content;
  if (layer.type === "date" || text.includes("{{date}}")) {
    text = text.replace(/\{\{date\}\}/g, dateText);
  } else if (customCaption !== undefined && isHeaderTitleLayer(layer)) {
    text = customCaption;
  }

  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;

  if (layer.rotation) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  ctx.font = `600 ${layer.fontSize}px ${layer.fontFamily || "sans-serif"}`;
  ctx.fillStyle = layer.color || "#1c1917";
  ctx.textAlign = layer.align || "center";
  ctx.textBaseline = "middle";

  const anchorX =
    layer.align === "left"
      ? layer.x
      : layer.align === "right"
        ? layer.x + layer.width
        : layer.x + layer.width / 2;
  const anchorY = layer.y + layer.height / 2;

  if (layer.letterSpacing && "letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${layer.letterSpacing}px`;
  }

  const rawLines = text.split("\n");
  const lines: string[] = [];
  for (const raw of rawLines) {
    const words = raw.split(" ");
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > layer.width && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    lines.push(current);
  }

  const lineHeight = layer.fontSize * 1.2;
  const totalH = (lines.length - 1) * lineHeight;
  const startY = anchorY - totalH / 2;

  if (layer.shadow) {
    const m = layer.shadow.trim().match(/^(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px\s+(.+)$/i);
    if (m) {
      ctx.shadowOffsetX = Number(m[1]);
      ctx.shadowOffsetY = Number(m[2]);
      ctx.shadowBlur = Number(m[3]);
      ctx.shadowColor = m[4];
    } else {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 0;
      ctx.shadowColor = layer.shadow;
    }
  }

  let outlineWidth = 0;
  let outlineColor = "";
  if (layer.outline) {
    const om = layer.outline.trim().match(/^(\d+(?:\.\d+)?)px\s+(.+)$/i);
    if (om) {
      outlineWidth = Number(om[1]);
      outlineColor = om[2];
    } else {
      outlineWidth = Math.max(4, Math.round(layer.fontSize * 0.14));
      outlineColor = layer.outline.trim();
    }
  }

  lines.forEach((line, idx) => {
    const ly = startY + idx * lineHeight;
    if (outlineWidth > 0 && outlineColor) {
      ctx.save();
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.lineWidth = outlineWidth;
      ctx.strokeStyle = outlineColor;
      ctx.strokeText(line, anchorX, ly, layer.width);
      ctx.restore();
    }
    ctx.fillText(line, anchorX, ly, layer.width);
  });
  ctx.restore();
}

function drawMandatoryWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ruleInput?: Partial<WatermarkRule>,
  bgValue?: string,
  templateId?: string,
  hasFullOverlay?: boolean
) {
  const rule = enforceMandatoryWatermark(ruleInput);
  const fontSize = Math.max(14, Math.min(28, Math.round(width * rule.minScale)));
  const padX = Math.max(18, Math.round(width * 0.03));
  const padY = Math.max(16, Math.round(height * 0.022));

  let isLightText = rule.contrastMode === "light";
  if (rule.contrastMode === "auto" && bgValue) {
    const lower = bgValue.toLowerCase();
    isLightText = lower.includes("#1") || lower.includes("#0") || lower.includes("#2");
  }

  ctx.save();
  const fontFamily = rule.fontFamily || '"Plus Jakarta Sans", system-ui, sans-serif';
  const style = rule.style ?? "minimal";
  const italicPrefix = style === "italic" ? "italic " : "";
  ctx.font = `${italicPrefix}600 ${fontSize}px ${fontFamily}`;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      style === "italic" ? "1px" : "2px";
  }

  const label =
    style === "italic" ? MANDATORY_WATERMARK_BRAND : MANDATORY_WATERMARK_BRAND.toUpperCase();
  const fgColor = isLightText ? "rgba(255, 255, 255, 0.94)" : "rgba(24, 24, 27, 0.88)";
  const outlineColor = isLightText ? "rgba(15, 23, 42, 0.68)" : "rgba(255, 255, 255, 0.78)";
  const outlineWidth = Math.max(2.5, Math.round(fontSize * 0.16));

  let x = width - padX;
  let y = height - padY;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  switch (rule.placement) {
    case "bottom-left":
      x = padX;
      ctx.textAlign = "left";
      break;
    case "bottom-center":
      x = width / 2;
      ctx.textAlign = "center";
      break;
    case "top-left":
      x = padX;
      y = padY;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      break;
    case "top-right":
      y = padY;
      ctx.textBaseline = "top";
      break;
    default:
      break;
  }

  if (templateId === "polaroid-sticker-6cut" && hasFullOverlay) {
    // Sit flat inside the bottom-right polaroid card's white chin (left of the yellow star)
    x = Math.round(width * 0.69);
    y = Math.round(height * 0.964);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(30, 30, 34, 0.72)";
    ctx.shadowBlur = 0;
    ctx.fillText(label, x, y);
    ctx.restore();
    return;
  }

  if (templateId === "blue-pink-kodak-4cut" && hasFullOverlay) {
    // Sit cleanly inside the white bottom chin of the Kodak film strip above the pink ribbon
    x = Math.round(width * 0.5);
    y = Math.round(height * 0.923);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(30, 30, 34, 0.68)";
    ctx.shadowBlur = 0;
    ctx.fillText(label, x, y);
    ctx.restore();
    return;
  }

  if (templateId === "hero-couples-love-you-3cut" && hasFullOverlay) {
    // Sit cleanly in the empty dark-brown top margin of the first polaroid frame
    x = Math.round(width * 0.27);
    y = Math.round(height * 0.058);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(250, 250, 250, 0.75)";
    ctx.shadowBlur = 0;
    ctx.fillText(label, x, y);
    ctx.restore();
    return;
  }

  if (templateId === "spiderman-peter-parker-4cut" && hasFullOverlay) {
    // Sit cleanly in the open blue blueprint grid at top-center
    x = Math.round(width * 0.51);
    y = Math.round(height * 0.042);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(250, 250, 250, 0.82)";
    ctx.shadowBlur = 3;
    ctx.fillText(label, x, y);
    ctx.restore();
    return;
  }

  if (templateId === "spiderman-brand-new-day-6cut" && hasFullOverlay) {
    // Sit cleanly in the dark navy bottom margin of the right strip
    x = Math.round(width * 0.74);
    y = Math.round(height * 0.988);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(250, 250, 250, 0.82)";
    ctx.shadowBlur = 3;
    ctx.fillText(label, x, y);
    ctx.restore();
    return;
  }

  ctx.fillStyle = fgColor;
  ctx.shadowColor = isLightText ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.5)";
  ctx.shadowBlur = 4;
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.lineWidth = outlineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(label, x, y);
  ctx.fillText(label, x, y);
  ctx.restore();
}

export async function renderTemplateToCanvas(
  canvas: HTMLCanvasElement,
  doc: TemplateDocument,
  options: RenderTemplateOptions = {}
): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      // Explicitly load every font family used by the template's text layers
      const families = new Set<string>();
      for (const l of doc.layers) {
        if ((l.type === "text" || l.type === "date") && l.fontFamily) {
          const first = l.fontFamily.split(",")[0]?.trim();
          if (first) families.add(first);
        }
      }
      await Promise.all(
        [...families].map((f) => document.fonts.load(`600 24px ${f}`).catch(() => []))
      );
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }
  const scale = options.scale ?? 1;
  const { width, height } = doc.canvas;
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  // Render onto a fresh offscreen canvas to prevent React StrictMode async race conditions
  const offscreen = document.createElement("canvas");
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Background
  await drawBackground(ctx, doc);

  const dateText =
    options.dateText ??
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  const sortedLayers = [...doc.layers].sort((a, b) => a.zIndex - b.zIndex);

  // 1b. Underlay Layers (zIndex < 0, e.g. rotated paper cards behind photo slots)
  for (const layer of sortedLayers as TemplateLayer[]) {
    if (!layer.visible || layer.zIndex >= 0) continue;
    await drawTemplateLayer(ctx, layer, dateText, options.customCaption);
  }

  // 2. Photo Slots (preserve doc.slots array order for z-ordering while using slot.index for photo mapping)
  const slotImages = options.slotImages ?? [];
  const sortedSlots = doc.slots;

  for (const slot of sortedSlots) {
    const src = slotImages[slot.index] ?? null;
    ctx.save();

    if (slot.rotation) {
      const cx = slot.x + slot.width / 2;
      const cy = slot.y + slot.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((slot.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    drawRoundedRectPath(ctx, slot.x, slot.y, slot.width, slot.height, slot.borderRadius ?? 0);
    ctx.clip();

    if (src) {
      try {
        const img = await loadImage(src);
        const filterPreset = options.overrideFilter ?? slot.filter;
        const baseFilter = getFilterCss(filterPreset);
        const adj = options.adjustments;
        const adjFilters: string[] = [];
        if (adj) {
          if (adj.brightness !== 0) adjFilters.push(`brightness(${1 + adj.brightness / 100})`);
          if (adj.contrast !== 0) adjFilters.push(`contrast(${1 + adj.contrast / 100})`);
          if (adj.saturation !== 0) adjFilters.push(`saturate(${1 + adj.saturation / 100})`);
          if (adj.warmth > 0) adjFilters.push(`sepia(${adj.warmth / 100})`);
        }
        const combinedFilter = [baseFilter !== "none" ? baseFilter : "", ...adjFilters]
          .filter(Boolean)
          .join(" ");
        ctx.filter = combinedFilter || "none";
        if (doc.templateId === "free-edit-cloud") {
          drawContainImage(ctx, img, slot.x, slot.y, slot.width, slot.height);
        } else {
          drawCoverImage(ctx, img, slot.x, slot.y, slot.width, slot.height);
        }
        ctx.filter = "none";

        if (options.effects?.softGlow) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = 0.28;
          ctx.filter = "blur(10px) brightness(1.08)";
          if (doc.templateId === "free-edit-cloud") {
            drawContainImage(ctx, img, slot.x, slot.y, slot.width, slot.height);
          } else {
            drawCoverImage(ctx, img, slot.x, slot.y, slot.width, slot.height);
          }
          ctx.restore();
        }

        if (options.effects?.filmGrain) {
          const grainCanvas = getFilmGrainCanvas();
          if (grainCanvas) {
            const pattern = ctx.createPattern(grainCanvas, "repeat");
            if (pattern) {
              ctx.save();
              ctx.globalCompositeOperation = "overlay";
              ctx.globalAlpha = 0.18;
              ctx.fillStyle = pattern;
              ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
              ctx.restore();
            }
          }
        }

        if (adj && adj.vignette > 0) {
          const cx = slot.x + slot.width / 2;
          const cy = slot.y + slot.height / 2;
          const r = Math.max(slot.width, slot.height) * 0.72;
          const vig = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, `rgba(0,0,0,${Math.min(0.75, adj.vignette / 100)})`);
          ctx.fillStyle = vig;
          ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
        }

        if (options.effects?.dateStamp) {
          const now = new Date();
          const yy = String(now.getFullYear()).slice(-2);
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dd = String(now.getDate()).padStart(2, "0");
          const stamp = `'${yy} ${mm} ${dd}`;
          const fontSize = Math.max(12, Math.round(Math.min(slot.width, slot.height) * 0.065));
          const pad = Math.max(10, Math.round(fontSize * 0.8));
          ctx.save();
          ctx.font = `700 ${fontSize}px "Space Mono", "Courier New", monospace`;
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.shadowColor = "rgba(255, 72, 0, 0.85)";
          ctx.shadowBlur = 5;
          ctx.fillStyle = "#FF7A1A";
          ctx.fillText(stamp, slot.x + slot.width - pad, slot.y + slot.height - pad);
          ctx.restore();
        }
      } catch {
        ctx.fillStyle = "rgba(120, 113, 108, 0.16)";
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      }
    } else {
      const grad = ctx.createLinearGradient(slot.x, slot.y, slot.x + slot.width, slot.y + slot.height);
      grad.addColorStop(0, "rgba(128, 128, 140, 0.16)");
      grad.addColorStop(1, "rgba(128, 128, 140, 0.08)");
      ctx.fillStyle = grad;
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
      ctx.strokeStyle = "rgba(128, 128, 140, 0.28)";
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x + 1, slot.y + 1, slot.width - 2, slot.height - 2);

      const cx = slot.x + slot.width / 2;
      const cy = slot.y + slot.height / 2;
      ctx.strokeStyle = "rgba(128, 128, 140, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();

      ctx.fillStyle = "rgba(128, 128, 140, 0.65)";
      ctx.font = '600 16px "Space Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`0${slot.index + 1}`, cx, cy + 20);
    }

    ctx.restore();
  }

  // 2b. Optional Transparent PNG Frame Overlay (e.g. Pinterest/Canva cutout frame)
  if (doc.canvas.overlayImage) {
    try {
      const overlayImg = await loadImage(doc.canvas.overlayImage);
      ctx.drawImage(overlayImg, 0, 0, width, height);
    } catch {
      // Ignore failed overlay frame image
    }
  }

  // 3. Overlay Layers (zIndex >= 0)
  for (const layer of sortedLayers as TemplateLayer[]) {
    if (!layer.visible || layer.zIndex < 0) continue;
    await drawTemplateLayer(ctx, layer, dateText, options.customCaption);
  }

  // 3b. Global custom header fallback if template has no header title layer
  if (options.customCaption && !sortedLayers.some((l) => isHeaderTitleLayer(l))) {
    const minSlotY =
      doc.slots.length > 0 ? Math.min(...doc.slots.map((s) => s.y)) : Math.round(height * 0.14);
    const { fontFamily, color } = getThemeHeaderTypography(doc);
    const headerH = Math.max(48, Math.min(96, Math.round(minSlotY * 0.6)));
    const headerY = minSlotY >= 80 ? Math.max(16, Math.round((minSlotY - headerH) / 2)) : 24;
    const fontSize = Math.max(24, Math.min(54, Math.round(width * 0.062)));
    drawTextLayer(ctx, {
      id: "auto-header-title",
      type: "text",
      x: Math.round(width * 0.08),
      y: headerY,
      width: Math.round(width * 0.84),
      height: headerH,
      visible: true,
      content: options.customCaption,
      fontFamily,
      fontSize,
      color,
      align: "center",
      zIndex: 10,
    }, dateText);
  }

  // 4. Mandatory Jevallene Watermark (skip duplicate if re-editing an already-watermarked Cloud Render)
  if (doc.templateId !== "free-edit-cloud") {
    drawMandatoryWatermark(
      ctx,
      width,
      height,
      doc.watermark,
      doc.canvas.background.value,
      doc.templateId,
      Boolean(doc.canvas.overlayImage)
    );
  }

  ctx.restore();

  // Blit atomically to target canvas
  canvas.width = targetW;
  canvas.height = targetH;
  const targetCtx = canvas.getContext("2d");
  if (targetCtx) {
    targetCtx.clearRect(0, 0, targetW, targetH);
    targetCtx.drawImage(offscreen, 0, 0);
  }
}

async function drawTemplateLayer(
  ctx: CanvasRenderingContext2D,
  layer: TemplateLayer,
  dateText: string,
  customCaption?: string
) {
  if (layer.type === "text" || layer.type === "date") {
    drawTextLayer(ctx, layer, dateText, customCaption);
    return;
  }

  if (layer.type === "frame" && layer.assetId) {
    try {
      const img = await loadImage(layer.assetId);
      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      ctx.restore();
    } catch {
      // ignore failed frame asset
    }
    return;
  }

  if (layer.type === "sticker") {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    if (layer.rotation) {
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    if (layer.assetId) {
      if (layer.assetId.startsWith("data:image/") || layer.assetId.startsWith("http") || layer.assetId.startsWith("/")) {
        try {
          const img = await loadImage(layer.assetId);
          const ratio = Math.min(layer.width / img.width, layer.height / img.height);
          const dw = img.width * ratio;
          const dh = img.height * ratio;
          ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
        } catch {
          // Skip failed custom sticker image gracefully
        }
      } else if (layer.assetId.startsWith("badge:")) {
        const parts = layer.assetId.slice("badge:".length).split("|");
        const badgeLabel = parts[0] || "STUDIO";
        const badgeBg = parts[1] || "#FF6B8B";
        const badgeFg = parts[2] || "#FFFFFF";

        const bw = Math.max(layer.width * 1.45, 160);
        const bh = Math.max(layer.height * 0.56, 56);
        const bx = cx - bw / 2;
        const by = cy - bh / 2;
        const radius = bh / 2;

        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.roundRect(bx + 5, by + 5, bw, bh, radius);
        ctx.fill();

        ctx.fillStyle = badgeBg;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, radius);
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#111827";
        ctx.stroke();

        ctx.fillStyle = badgeFg;
        ctx.font = `800 ${Math.round(bh * 0.44)}px "Plus Jakarta Sans", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeLabel, cx, cy + 1);
      } else {
        ctx.font = `${Math.round(Math.min(layer.width, layer.height) * 0.85)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(layer.assetId, cx, cy);
      }
    }
    ctx.restore();
    return;
  }

  if (layer.type === "shape") {
    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    if (layer.rotation) {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    const fill = layer.tintColor ?? "rgba(194, 120, 126, 0.25)";

    if (layer.shapeKind === "ticket") {
      const { x, y, width: w, height: h } = layer;
      const notchR = 10;
      const step = 32;
      ctx.beginPath();
      ctx.moveTo(x + 20, y);
      ctx.lineTo(x + w - 20, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + 20);
      for (let py = y + 36; py < y + h - 30; py += step) {
        ctx.lineTo(x + w, py - notchR);
        ctx.arc(x + w, py, notchR, -Math.PI / 2, Math.PI / 2, true);
      }
      ctx.lineTo(x + w, y + h - 20);
      ctx.quadraticCurveTo(x + w, y + h, x + w - 20, y + h);
      ctx.lineTo(x + 20, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - 20);
      for (let py = y + h - 36; py > y + 30; py -= step) {
        ctx.lineTo(x, py + notchR);
        ctx.arc(x, py, notchR, Math.PI / 2, -Math.PI / 2, true);
      }
      ctx.lineTo(x, y + 20);
      ctx.quadraticCurveTo(x, y, x + 20, y);
      ctx.closePath();
    } else if (layer.shapeKind === "star") {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const outerR = Math.min(layer.width, layer.height) / 2;
      const innerR = outerR * 0.42;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if (layer.shapeKind === "circle") {
      ctx.beginPath();
      ctx.arc(
        layer.x + layer.width / 2,
        layer.y + layer.height / 2,
        Math.min(layer.width, layer.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
    } else if (layer.shapeKind === "heart") {
      const cx = layer.x + layer.width / 2;
      const topY = layer.y + layer.height * 0.3;
      const w = layer.width;
      const h = layer.height;
      ctx.beginPath();
      ctx.moveTo(cx, layer.y + h * 0.9);
      ctx.bezierCurveTo(layer.x, layer.y + h * 0.6, layer.x, layer.y + h * 0.12, cx, topY);
      ctx.bezierCurveTo(layer.x + w, layer.y + h * 0.12, layer.x + w, layer.y + h * 0.6, cx, layer.y + h * 0.9);
      ctx.closePath();
    } else if (layer.shapeKind === "sparkle") {
      const cx = layer.x + layer.width / 2;
      const cy = layer.y + layer.height / 2;
      const rx = layer.width / 2;
      const ry = layer.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ry);
      ctx.quadraticCurveTo(cx, cy, cx + rx, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + ry);
      ctx.quadraticCurveTo(cx, cy, cx - rx, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - ry);
      ctx.closePath();
    } else if (layer.shapeKind === "sprocket") {
      ctx.fillStyle = fill;
      const holeW = Math.min(18, layer.width * 0.6);
      const holeH = 26;
      const gap = 46;
      for (let py = layer.y; py < layer.y + layer.height - holeH; py += gap) {
        drawRoundedRectPath(ctx, layer.x, py, holeW, holeH, 4);
        ctx.fill();
      }
      ctx.restore();
      return;
    } else if (layer.shapeKind === "grid") {
      ctx.strokeStyle = fill;
      ctx.lineWidth = layer.strokeWidth ?? 1;
      const step = 48;
      for (let gx = layer.x; gx <= layer.x + layer.width; gx += step) {
        ctx.beginPath();
        ctx.moveTo(gx, layer.y);
        ctx.lineTo(gx, layer.y + layer.height);
        ctx.stroke();
      }
      for (let gy = layer.y; gy <= layer.y + layer.height; gy += step) {
        ctx.beginPath();
        ctx.moveTo(layer.x, gy);
        ctx.lineTo(layer.x + layer.width, gy);
        ctx.stroke();
      }
      ctx.restore();
      return;
    } else if (layer.shapeKind === "barcode") {
      ctx.fillStyle = fill;
      const pattern = [3, 2, 5, 1, 2, 4, 2, 1, 3, 5, 2, 2, 4, 1, 3, 2, 5, 1, 3, 2, 4, 2];
      let bx = layer.x;
      let idx = 0;
      while (bx < layer.x + layer.width - 4) {
        const barW = pattern[idx % pattern.length];
        if (idx % 2 === 0) {
          ctx.fillRect(bx, layer.y, barW, layer.height);
        }
        bx += barW + 2;
        idx++;
      }
      ctx.restore();
      return;
    } else {
      drawRoundedRectPath(ctx, layer.x, layer.y, layer.width, layer.height, layer.borderRadius ?? 0);
    }

    if (fill !== "transparent") {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (layer.strokeColor && layer.strokeWidth) {
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
  }
}

export async function exportTemplateToDataUrl(
  doc: TemplateDocument,
  options: RenderTemplateOptions & { format?: "png" | "jpeg" | "webp"; quality?: number } = {}
): Promise<string> {
  const canvas = document.createElement("canvas");
  await renderTemplateToCanvas(canvas, doc, options);
  const mime =
    options.format === "jpeg"
      ? "image/jpeg"
      : options.format === "webp"
        ? "image/webp"
        : "image/png";
  return canvas.toDataURL(mime, options.quality ?? 0.92);
}
