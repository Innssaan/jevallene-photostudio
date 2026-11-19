"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, FlipHorizontal2, ImagePlus, RefreshCw, Sparkles, X } from "lucide-react";
import { FILTER_PRESETS, getFilterCss } from "@/lib/filters";
import {
  VIRTUAL_BG_PRESETS,
  compositeSourceWithVirtualBg,
  type VirtualBackgroundOption,
} from "@/lib/virtual-background";
import type { FilterPreset } from "@photostudio/shared-types";

interface LiveCameraVirtualBgModalProps {
  open: boolean;
  locale: "id" | "en";
  slotCount: number;
  onClose: () => void;
  onCaptureToSlot: (slotIndex: number, dataUrl: string) => void;
}

export function LiveCameraVirtualBgModal({
  open,
  locale,
  slotCount,
  onClose,
  onCaptureToSlot,
}: LiveCameraVirtualBgModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraError, setCameraError] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [targetSlot, setTargetSlot] = useState(0);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("natural");
  const [selectedBg, setSelectedBg] = useState<VirtualBackgroundOption>(VIRTUAL_BG_PRESETS[1]); // Default Studio Blur
  const [customBgUrl, setCustomBgUrl] = useState<string>("");

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraError(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }
    void startCamera();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, startCamera]);

  // Real-time segmentation & compositing loop
  useEffect(() => {
    if (!open || cameraError) return;
    let active = true;
    let busy = false;

    const renderFrame = async () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2 && !busy) {
        busy = true;
        try {
          await compositeSourceWithVirtualBg(video, canvas, selectedBg, {
            mirror,
            filterCss: getFilterCss(activeFilter),
          });
        } finally {
          busy = false;
        }
      }
      if (active) {
        rafRef.current = requestAnimationFrame(() => {
          void renderFrame();
        });
      }
    };

    rafRef.current = requestAnimationFrame(() => {
      void renderFrame();
    });

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [open, cameraError, selectedBg, mirror, activeFilter]);

  if (!open) return null;

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const dataUrl = canvas.toDataURL("image/png");
    onCaptureToSlot(targetSlot, dataUrl);
    onClose();
  };

  const handleCustomBgUpload = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomBgUrl(reader.result);
        setSelectedBg({
          id: "custom-image",
          label_id: "Gambar Sendiri",
          label_en: "Custom Image",
          mode: "image",
          value: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-border rounded-2xl max-w-4xl w-full p-5 sm:p-6 space-y-4 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {locale === "id"
                  ? "Kamera Live · Background Virtual"
                  : "Live Camera · Virtual Background"}
              </span>
            </h2>
            <p className="text-xs text-brand-textMuted mt-0.5">
              {locale === "id"
                ? "Ganti background kamera langsung (Blur, Warna, Gradien, atau Gambar) sebelum masuk ke kanvas."
                : "Replace your live camera background (Blur, Color, Gradient, or Image) before capturing."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-surfaceMuted text-brand-textMuted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Live Canvas Preview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-brand-border bg-[#0F0F0E] flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="hidden" />
              {cameraError ? (
                <div className="text-center p-6 space-y-3">
                  <Camera className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-xs text-neutral-300">
                    {locale === "id"
                      ? "Kamera tidak tersedia atau izin ditolak."
                      : "Camera unavailable or permission denied."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-[#111111] text-xs font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{locale === "id" ? "Coba Lagi" : "Retry"}</span>
                  </button>
                </div>
              ) : (
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMirror((m) => !m)}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-medium ${
                  mirror
                    ? "bg-brand-accent text-brand-onAccent border-brand-accent"
                    : "border-brand-border bg-brand-bg text-brand-textMuted"
                }`}
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" />
                <span>Mirror</span>
              </button>

              {slotCount > 1 && (
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(Number(e.target.value))}
                  className="h-9 px-3 rounded-full border border-brand-border bg-brand-bg text-xs font-medium"
                >
                  {Array.from({ length: slotCount }, (_, i) => (
                    <option key={i} value={i}>
                      Slot #{i + 1}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                disabled={cameraError}
                onClick={handleCapture}
                className="ml-auto inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs font-bold disabled:opacity-45 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>{locale === "id" ? "Ambil Foto ke Editor" : "Capture to Editor"}</span>
              </button>
            </div>
          </div>

          {/* Background & Filter Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold">
                {locale === "id" ? "Pilih Background Kamera" : "Camera Background"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {VIRTUAL_BG_PRESETS.map((bg) => {
                  const active = selectedBg.id === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSelectedBg(bg)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-colors ${
                        active
                          ? "border-brand-accent bg-brand-accentSoft text-brand-text"
                          : "border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-brand-border shrink-0"
                        style={{
                          background:
                            bg.mode === "solid" || bg.mode === "gradient" || bg.mode === "curtain"
                              ? bg.value
                              : bg.mode === "blur"
                                ? "radial-gradient(circle, #d4d4d8 0%, #52525b 100%)"
                                : bg.mode === "transparent"
                                  ? "repeating-conic-gradient(#d4d4d8 0% 25%, #ffffff 0% 50%) 50% / 8px 8px"
                                  : bg.mode === "image" && bg.value
                                    ? `url("${bg.value}") center/cover`
                                    : "transparent",
                        }}
                      />
                      <span className="truncate">
                        {locale === "id" ? bg.label_id : bg.label_en}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-dashed border-brand-border hover:border-brand-accent cursor-pointer text-xs font-medium mt-2">
                <ImagePlus className="w-4 h-4" />
                <span>
                  {customBgUrl
                    ? locale === "id"
                      ? "Ganti Gambar Background"
                      : "Change Custom Background"
                    : locale === "id"
                      ? "Unggah Gambar Background"
                      : "Upload Background Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCustomBgUpload(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="pt-3 border-t border-brand-border space-y-2">
              <div className="text-xs font-semibold">
                {locale === "id" ? "Filter Warna Live" : "Live Color Filter"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${
                      activeFilter === f.id
                        ? "bg-brand-accent text-brand-onAccent border-brand-accent"
                        : "border-brand-border bg-brand-bg text-brand-textMuted"
                    }`}
                  >
                    {locale === "id" ? f.label_id : f.label_en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
