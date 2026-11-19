import {
  getSlotCount,
  type AspectRatioPreset,
  type PhotoSlot,
  type TemplateDocument,
  type TemplateLayer,
} from "@photostudio/shared-types";

const SLOT_FRAME_ID_RE = /^(frame-|frm-|neon-frame-|bday-frame-|d-f\d|f\d$|g\d$|pcard-)/i;

function computeBounds(slots: PhotoSlot[]) {
  const minX = Math.min(...slots.map((s) => s.x));
  const minY = Math.min(...slots.map((s) => s.y));
  const maxX = Math.max(...slots.map((s) => s.x + s.width));
  const maxY = Math.max(...slots.map((s) => s.y + s.height));
  return {
    x: minX,
    y: minY,
    width: Math.max(120, maxX - minX),
    height: Math.max(120, maxY - minY),
  };
}

function buildGridSlots(
  bounds: { x: number; y: number; width: number; height: number },
  cols: number,
  rows: number,
  total: number,
  baseSlot: PhotoSlot | undefined,
  idPrefix: string,
  gap = 18
): PhotoSlot[] {
  const cellW = Math.floor((bounds.width - gap * (cols - 1)) / cols);
  const cellH = Math.floor((bounds.height - gap * (rows - 1)) / rows);
  const out: PhotoSlot[] = [];

  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out.push({
      id: `${idPrefix}-${i + 1}`,
      index: i,
      x: Math.round(bounds.x + col * (cellW + gap)),
      y: Math.round(bounds.y + row * (cellH + gap)),
      width: cellW,
      height: cellH,
      borderRadius: baseSlot?.borderRadius ?? 8,
      filter: baseSlot?.filter,
    });
  }
  return out;
}

/**
 * Adapts any built-in TemplateDocument's photo slots (and matching negative-zIndex
 * frame border shapes) to a user-chosen shot count (2, 3, 4, 6, 8) while preserving
 * the template's background, stickers, typography, and locked watermark.
 */
export function adaptTemplateToGridSize(
  doc: TemplateDocument,
  targetShots: number | null
): TemplateDocument {
  if (
    !targetShots ||
    targetShots === getSlotCount(doc) ||
    doc.slots.length === 0 ||
    doc.canvas.overlayImage
  ) {
    return doc;
  }

  // Dynamic polaroid card adaptation for Polaroid Stiker 6-Cut (2, 3, 4, or 8 shots)
  if (doc.templateId === "polaroid-sticker-6cut") {
    const cw = doc.canvas.width;
    const ch = doc.canvas.height;
    const cols = targetShots <= 3 ? 1 : 2;
    const rows = Math.ceil(targetShots / cols);

    const padX = cols === 1 ? Math.round(cw * 0.19) : Math.round(cw * 0.055);
    const padY = Math.round(ch * 0.045);
    const availW = cw - padX * 2;
    const availH = ch - padY * 2 - 48;

    const gapX = cols > 1 ? Math.round(cw * 0.095) : 0;
    const cellW = Math.floor((availW - gapX * (cols - 1)) / cols);
    // Reserve ~28% bottom space per card for the polaroid chin + stickers
    const maxSlotH = Math.floor((availH / rows) * 0.72);
    const slotSize = Math.min(cellW, maxSlotH);
    const cardTotalH = Math.round(slotSize * 1.37);
    const rowStep = Math.floor((availH - cardTotalH) / Math.max(1, rows - 1));

    const adaptedSlots: PhotoSlot[] = [];
    const cardFrames: TemplateLayer[] = [];

    for (let i = 0; i < targetShots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const colCenter = padX + col * (cellW + gapX) + Math.floor(cellW / 2);
      const sx = Math.round(colCenter - slotSize / 2);
      const sy = rows === 1 ? Math.round((ch - cardTotalH) / 2) : padY + row * rowStep + Math.round(slotSize * 0.095);

      adaptedSlots.push({
        id: `slot-${i + 1}`,
        index: i,
        x: sx,
        y: sy,
        width: slotSize,
        height: slotSize,
        borderRadius: 4,
        filter: "natural",
      });

      // Exact hole-to-card ratio from polaroid-card-N.png (hole is at x=8.8%, y=7.3%, w=85%, h=72.8%)
      const cardW = Math.round(slotSize / 0.848);
      const cardH = Math.round(slotSize / 0.726);
      const cardX = Math.round(sx - cardW * 0.086);
      const cardY = Math.round(sy - cardH * 0.074);

      cardFrames.push({
        id: `polaroid-card-frame-${i + 1}`,
        type: "frame",
        assetId: `/templates/polaroid-card-${(i % 6) + 1}.png`,
        x: cardX,
        y: cardY,
        width: cardW,
        height: cardH,
        zIndex: 2,
        visible: true,
      });
    }

    return {
      ...doc,
      canvas: {
        ...doc.canvas,
        overlayImage: undefined,
      },
      slots: adaptedSlots,
      layers: [...doc.layers, ...cardFrames],
    };
  }

  if (doc.canvas.overlayImage) {
    return doc;
  }

  const baseSlot = doc.slots[0];
  const isDualStrip = doc.slots.length > getSlotCount(doc);

  let nextSlots: PhotoSlot[] = [];

  if (isDualStrip) {
    const midX = doc.canvas.width / 2;
    const leftSlots = doc.slots.filter((s) => s.x + s.width / 2 < midX);
    const rightSlots = doc.slots.filter((s) => s.x + s.width / 2 >= midX);

    if (leftSlots.length > 0 && rightSlots.length > 0) {
      const lBounds = computeBounds(leftSlots);
      const rBounds = computeBounds(rightSlots);
      const cols = targetShots >= 6 ? 2 : 1;
      const rows = Math.ceil(targetShots / cols);
      const lGrid = buildGridSlots(lBounds, cols, rows, targetShots, baseSlot, "slot-l", 14);
      const rGrid = buildGridSlots(rBounds, cols, rows, targetShots, baseSlot, "slot-r", 14);
      nextSlots = [...lGrid, ...rGrid];
    }
  }

  if (nextSlots.length === 0) {
    const bounds = computeBounds(doc.slots);
    const isLandscape = doc.canvas.width > doc.canvas.height;
    const isNarrowStrip = doc.canvas.width <= 680;

    let cols = 1;
    if (isLandscape) {
      cols = targetShots <= 3 ? targetShots : targetShots <= 4 ? 2 : targetShots <= 6 ? 3 : 4;
    } else if (isNarrowStrip) {
      cols = targetShots >= 6 ? 2 : 1;
    } else {
      cols = targetShots >= 4 ? 2 : 1;
    }
    const rows = Math.ceil(targetShots / cols);
    nextSlots = buildGridSlots(bounds, cols, rows, targetShots, baseSlot, "slot", 18);
  }

  // Find an existing slot frame stroke style so adapted slots keep matching borders
  const oldFrameLayer = doc.layers.find(
    (l) => l.type === "shape" && l.zIndex < 0 && SLOT_FRAME_ID_RE.test(l.id)
  );
  const frameStrokeColor =
    oldFrameLayer && "strokeColor" in oldFrameLayer ? oldFrameLayer.strokeColor : undefined;
  const frameStrokeWidth =
    oldFrameLayer && "strokeWidth" in oldFrameLayer ? oldFrameLayer.strokeWidth ?? 3 : 3;

  const keptLayers = doc.layers.filter(
    (l) => !(l.type === "shape" && l.zIndex < 0 && SLOT_FRAME_ID_RE.test(l.id))
  );

  const syncedFrames: TemplateLayer[] = frameStrokeColor
    ? nextSlots.map((s) => ({
        id: `frame-${s.id}`,
        type: "shape",
        shapeKind: "rect",
        x: s.x - frameStrokeWidth,
        y: s.y - frameStrokeWidth,
        width: s.width + frameStrokeWidth * 2,
        height: s.height + frameStrokeWidth * 2,
        visible: true,
        tintColor: "transparent",
        borderRadius: (s.borderRadius ?? 8) + frameStrokeWidth,
        strokeColor: frameStrokeColor,
        strokeWidth: frameStrokeWidth,
        zIndex: -1,
      }))
    : [];

  return {
    ...doc,
    slots: nextSlots,
    layers: [...syncedFrames, ...keptLayers],
  };
}

const RATIO_DIMENSIONS: Record<"1:1" | "4:5" | "9:16" | "16:9", { w: number; h: number }> = {
  "1:1": { w: 1080, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
  "9:16": { w: 1080, h: 1920 },
  "16:9": { w: 1920, h: 1080 },
};

/**
 * Resizes an existing template document proportionally to a target aspect ratio
 * by fitting the template's active content bounds (slots + foreground layers)
 * into the target canvas so repeated ratio switches (e.g. 16:9 -> 1:1) never shrink cumulatively.
 */
export function resizeTemplateToAspectRatio(
  doc: TemplateDocument,
  ratio: "1:1" | "4:5" | "9:16" | "16:9"
): TemplateDocument {
  const { w: targetW, h: targetH } = RATIO_DIMENSIONS[ratio];
  const srcW = doc.canvas.width;
  const srcH = doc.canvas.height;

  // When a full-canvas transparent PNG frame overlay is present, scale slots
  // proportionally to the canvas so photo cutouts stay 100% locked to the PNG holes.
  if (doc.canvas.overlayImage) {
    const sx = targetW / srcW;
    const sy = targetH / srcH;
    const sAvg = (sx + sy) / 2;
    return {
      ...doc,
      canvas: {
        ...doc.canvas,
        width: targetW,
        height: targetH,
        aspectRatio: ratio as AspectRatioPreset,
      },
      slots: doc.slots.map((s) => ({
        ...s,
        x: Math.round(s.x * sx),
        y: Math.round(s.y * sy),
        width: Math.round(s.width * sx),
        height: Math.round(s.height * sy),
        borderRadius: s.borderRadius !== undefined ? Math.round(s.borderRadius * sAvg) : undefined,
      })),
      layers: doc.layers.map((l) => {
        const geom = {
          x: Math.round(l.x * sx),
          y: Math.round(l.y * sy),
          width: Math.round(l.width * sx),
          height: Math.round(l.height * sy),
        };
        if (l.type === "text" || l.type === "date") {
          return { ...l, ...geom, fontSize: Math.max(12, Math.round(l.fontSize * sAvg)) };
        }
        return { ...l, ...geom };
      }),
    };
  }

  const isFullBackdrop = (l: TemplateLayer) =>
    l.zIndex <= -2 && l.width >= srcW * 0.9 && l.height >= srcH * 0.9;

  const contentItems = [
    ...doc.slots.map((s) => ({ x: s.x, y: s.y, width: s.width, height: s.height })),
    ...doc.layers
      .filter((l) => l.visible && !isFullBackdrop(l))
      .map((l) => ({ x: l.x, y: l.y, width: l.width, height: l.height })),
  ];

  const minX = contentItems.length > 0 ? Math.min(...contentItems.map((i) => i.x)) : 0;
  const minY = contentItems.length > 0 ? Math.min(...contentItems.map((i) => i.y)) : 0;
  const maxX = contentItems.length > 0 ? Math.max(...contentItems.map((i) => i.x + i.width)) : srcW;
  const maxY = contentItems.length > 0 ? Math.max(...contentItems.map((i) => i.y + i.height)) : srcH;

  const contentW = Math.max(100, maxX - minX);
  const contentH = Math.max(100, maxY - minY);
  const pad = 0.92;
  const scale = Math.min((targetW * pad) / contentW, (targetH * pad) / contentH);
  const offsetX = Math.round((targetW - contentW * scale) / 2 - minX * scale);
  const offsetY = Math.round((targetH - contentH * scale) / 2 - minY * scale);

  const scaledSlots: PhotoSlot[] = doc.slots.map((s) => ({
    ...s,
    x: Math.round(s.x * scale + offsetX),
    y: Math.round(s.y * scale + offsetY),
    width: Math.round(s.width * scale),
    height: Math.round(s.height * scale),
    borderRadius: s.borderRadius !== undefined ? Math.round(s.borderRadius * scale) : undefined,
  }));

  const scaledLayers: TemplateLayer[] = doc.layers.map((l) => {
    if (isFullBackdrop(l)) {
      return {
        ...l,
        x: 0,
        y: 0,
        width: targetW,
        height: targetH,
      };
    }
    const geom = {
      x: Math.round(l.x * scale + offsetX),
      y: Math.round(l.y * scale + offsetY),
      width: Math.round(l.width * scale),
      height: Math.round(l.height * scale),
    };
    if (l.type === "text" || l.type === "date") {
      return {
        ...l,
        ...geom,
        fontSize: Math.max(12, Math.round(l.fontSize * scale)),
      };
    }
    if (l.type === "sticker" || l.type === "frame" || l.type === "shape" || l.type === "drawing") {
      return {
        ...l,
        ...geom,
        borderRadius: l.borderRadius !== undefined ? Math.round(l.borderRadius * scale) : undefined,
        strokeWidth: l.strokeWidth !== undefined ? Math.max(1, Math.round(l.strokeWidth * scale)) : undefined,
      };
    }
    return { ...l, ...geom };
  });

  return {
    ...doc,
    canvas: {
      ...doc.canvas,
      width: targetW,
      height: targetH,
      aspectRatio: ratio as AspectRatioPreset,
    },
    slots: scaledSlots,
    layers: scaledLayers,
  };
}
