import { GIFEncoder, quantize, applyPalette } from "gifenc";
import type { FilterPreset, TemplateDocument } from "@photostudio/shared-types";
import {
  renderTemplateToCanvas,
  type CameraEffects,
  type ColorAdjustments,
} from "@/lib/template-renderer";

export interface AnimatedStripOptions {
  fallbackSlotImages: (string | null)[];
  overrideFilter?: FilterPreset;
  adjustments?: ColorAdjustments;
  effects?: CameraEffects;
  customCaption?: string;
}

/**
 * Renders a smooth boomerang Animated GIF of the entire photobox strip
 * using captured burst frames for each photo slot.
 */
export async function generateAnimatedStripGif(
  doc: TemplateDocument,
  slotBurstFrames: Record<number, string[]>,
  options: AnimatedStripOptions
): Promise<{ blob: Blob; dataUrl: string }> {
  const maxFrames = Math.max(
    1,
    ...Object.values(slotBurstFrames).map((arr) => arr?.length ?? 0)
  );

  // Build boomerang sequence: 0, 1, 2, ..., n-1, n-2, ..., 1
  const sequence: number[] = [];
  for (let i = 0; i < maxFrames; i++) sequence.push(i);
  for (let i = maxFrames - 2; i >= 1; i--) sequence.push(i);
  if (sequence.length === 0) sequence.push(0);

  const scale = Math.min(0.42, 480 / Math.max(1, doc.canvas.width));
  const width = Math.max(160, Math.round(doc.canvas.width * scale));
  const height = Math.max(160, Math.round(doc.canvas.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable");
  }

  const gif = GIFEncoder();
  const totalSlots = options.fallbackSlotImages.length;

  for (const frameIdx of sequence) {
    const frameSlotImages: (string | null)[] = Array.from(
      { length: totalSlots },
      (_, slotIdx) => {
        const burst = slotBurstFrames[slotIdx];
        if (burst && burst.length > 0) {
          return burst[frameIdx % burst.length];
        }
        return options.fallbackSlotImages[slotIdx] ?? null;
      }
    );

    await renderTemplateToCanvas(canvas, doc, {
      slotImages: frameSlotImages,
      overrideFilter: options.overrideFilter,
      adjustments: options.adjustments,
      effects: options.effects,
      customCaption: options.customCaption,
      scale,
    });

    const imgData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imgData.data, 256);
    const index = applyPalette(imgData.data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay: 115,
      repeat: 0,
    });
  }

  gif.finish();
  const bytes = gif.bytes();
  const blob = new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read GIF blob"));
    reader.readAsDataURL(blob);
  });

  return { blob, dataUrl };
}
