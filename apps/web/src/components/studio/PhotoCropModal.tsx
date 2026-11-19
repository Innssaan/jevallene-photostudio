"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Move, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

interface PhotoCropModalProps {
  open: boolean;
  imageSrc: string | null;
  slotAspectRatio: number;
  targetWidth?: number;
  targetHeight?: number;
  slotLabel?: string;
  locale: "id" | "en";
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export function PhotoCropModal({
  open,
  imageSrc,
  slotAspectRatio,
  targetWidth = 900,
  targetHeight = 900,
  slotLabel,
  locale,
  onCancel,
  onConfirm,
}: PhotoCropModalProps) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Compute responsive viewport box inside modal matching slotAspectRatio
  const viewport = useMemo(() => {
    const maxBox = 320;
    const safeAspect = Number.isFinite(slotAspectRatio) && slotAspectRatio > 0 ? slotAspectRatio : 1;
    if (safeAspect >= 1) {
      const w = maxBox;
      const h = Math.round(maxBox / safeAspect);
      return { w, h: Math.max(120, h) };
    } else {
      const h = maxBox;
      const w = Math.round(maxBox * safeAspect);
      return { w: Math.max(120, w), h };
    }
  }, [slotAspectRatio]);

  // Load image dimensions when imageSrc changes
  useEffect(() => {
    if (!open || !imageSrc) {
      setImgSize(null);
      return;
    }
    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    };
    img.src = imageSrc;
  }, [open, imageSrc]);

  const baseScale = useMemo(() => {
    if (!imgSize) return 1;
    return Math.max(viewport.w / imgSize.w, viewport.h / imgSize.h);
  }, [imgSize, viewport]);

  const drawnSize = useMemo(() => {
    if (!imgSize) return { w: viewport.w, h: viewport.h };
    const totalScale = baseScale * zoom;
    return {
      w: imgSize.w * totalScale,
      h: imgSize.h * totalScale,
    };
  }, [imgSize, baseScale, zoom, viewport]);

  const clampOffset = useCallback(
    (nextX: number, nextY: number, dSize = drawnSize) => {
      const maxX = Math.max(0, (dSize.w - viewport.w) / 2);
      const maxY = Math.max(0, (dSize.h - viewport.h) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, nextX)),
        y: Math.min(maxY, Math.max(-maxY, nextY)),
      };
    },
    [drawnSize, viewport]
  );

  const handleZoomChange = useCallback(
    (nextZoom: number) => {
      const clampedZoom = Math.min(3, Math.max(1, nextZoom));
      setZoom(clampedZoom);
      if (imgSize) {
        const totalScale = baseScale * clampedZoom;
        const nextDrawn = {
          w: imgSize.w * totalScale,
          h: imgSize.h * totalScale,
        };
        setOffset((prev) => clampOffset(prev.x, prev.y, nextDrawn));
      }
    },
    [imgSize, baseScale, clampOffset]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startX: offset.x,
      startY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;
    setOffset(clampOffset(dragStartRef.current.startX + dx, dragStartRef.current.startY + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    handleZoomChange(zoom + delta);
  };

  const handleApply = () => {
    if (!imgRef.current || !imgSize) return;
    const img = imgRef.current;

    // Render high-res cropped canvas matching the slot aspect ratio
    const outW = Math.max(600, Math.round(targetWidth));
    const outH = Math.max(600, Math.round(targetHeight));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Map viewport coordinates back to natural image coordinates
    const totalScale = baseScale * zoom;
    const imgLeftInViewport = viewport.w / 2 - drawnSize.w / 2 + offset.x;
    const imgTopInViewport = viewport.h / 2 - drawnSize.h / 2 + offset.y;

    const srcX = Math.max(0, -imgLeftInViewport / totalScale);
    const srcY = Math.max(0, -imgTopInViewport / totalScale);
    const srcW = Math.min(imgSize.w - srcX, viewport.w / totalScale);
    const srcH = Math.min(imgSize.h - srcY, viewport.h / totalScale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.94);
    onConfirm(croppedDataUrl);
  };

  if (!open || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
          <div>
            <h3 className="font-display text-sm font-bold text-brand-text">
              {locale === "id" ? "Atur Posisi & Zoom Foto" : "Edit & Center Photo"}
              {slotLabel ? ` · ${slotLabel}` : ""}
            </h3>
            <p className="text-[11px] text-brand-textMuted">
              {locale === "id"
                ? "Geser foto atau zoom agar posisi subjek pas di tengah sebelum dimasukkan."
                : "Drag or zoom the photo to center your subject before inserting."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-brand-textMuted hover:text-brand-text hover:bg-brand-surfaceMuted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discord-style Crop Area */}
        <div className="bg-[#18191C] py-6 px-4 flex flex-col items-center justify-center select-none">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            style={{
              width: viewport.w,
              height: viewport.h,
            }}
            className={`relative overflow-hidden rounded-xl border-2 border-[#D2F159] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] touch-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          >
            {imgSize && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: drawnSize.w,
                  height: drawnSize.h,
                  maxWidth: "none",
                  maxHeight: "none",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Center alignment crosshair/rule-of-thirds subtle guide */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-r border-b border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-white/60" />
              <div className="border-r border-white/60" />
              <div />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Move className="w-3.5 h-3.5" />
            <span>
              {locale === "id" ? "Seret untuk menggeser posisi foto" : "Drag to reposition photo"}
            </span>
          </div>
        </div>

        {/* Controls: Zoom & Center */}
        <div className="px-5 py-4 space-y-4 bg-brand-surface">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.15)}
              className="p-1.5 rounded-lg border border-brand-border text-brand-textMuted hover:text-brand-text"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="flex-1 accent-brand-accent"
            />
            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.15)}
              className="p-1.5 rounded-lg border border-brand-border text-brand-textMuted hover:text-brand-text"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-border text-[11px] font-medium text-brand-text hover:bg-brand-surfaceMuted"
              title={locale === "id" ? "Pusatkan ulang" : "Center & reset"}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{locale === "id" ? "Pusatkan" : "Center"}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-brand-border text-xs font-semibold text-brand-text hover:bg-brand-surfaceMuted"
            >
              {locale === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!imgSize}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#D2F159] text-[#111827] hover:bg-[#c5e646] text-xs font-bold disabled:opacity-50 ps-sticky-btn"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Masukkan Foto" : "Apply Photo"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
