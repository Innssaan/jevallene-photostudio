"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import type { FilterPreset, TemplateDocument } from "@photostudio/shared-types";
import { renderTemplateToCanvas, type CameraEffects, type ColorAdjustments } from "@/lib/template-renderer";

interface TemplateCanvasPreviewProps {
  document: TemplateDocument;
  slotImages?: (string | null)[];
  overrideFilter?: FilterPreset;
  adjustments?: ColorAdjustments;
  effects?: CameraEffects;
  customCaption?: string;
  scale?: number;
  className?: string;
}

export const TemplateCanvasPreview = memo(function TemplateCanvasPreview({
  document: doc,
  slotImages,
  overrideFilter,
  adjustments,
  effects,
  customCaption,
  scale = 0.45,
  className = "",
}: TemplateCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "260px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    void renderTemplateToCanvas(canvas, doc, {
      slotImages,
      overrideFilter,
      adjustments,
      effects,
      customCaption,
      scale,
    }).then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [inView, doc, slotImages, overrideFilter, adjustments, effects, customCaption, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={Math.round(doc.canvas.width * scale)}
      height={Math.round(doc.canvas.height * scale)}
      className={`block max-w-full max-h-full w-auto h-auto rounded-lg border-2 border-brand-border ${className}`}
    />
  );
});
