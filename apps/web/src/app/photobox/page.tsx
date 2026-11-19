"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  Check,
  Download,
  FlipHorizontal2,
  ImagePlus,
  LayoutGrid,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Timer,
  Trash2,
  Upload,
} from "lucide-react";
import { CloudUsageBar } from "@/components/cloud/CloudUsageBar";
import { formatCameraLabel } from "@/lib/camera-label";
import {
  VIRTUAL_BG_PRESETS,
  compositeSourceWithVirtualBg,
  type VirtualBackgroundOption,
} from "@/lib/virtual-background";
import {
  BUILTIN_TEMPLATES,
  createDynamicPhotoboxTemplate,
  getBuiltinTemplateById,
  getSlotCount,
  getUniqueSlots,
  isTemplateLocked,
  type FilterPreset,
  type TemplateDocument,
} from "@photostudio/shared-types";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";
import { PhotoboxTemplateModal } from "@/components/photobox/PhotoboxTemplateModal";
import { ShareResultModal } from "@/components/share/ShareResultModal";
import { adaptTemplateToGridSize } from "@/lib/template-grid-adapter";
import { FILTER_PRESETS, getFilterCss } from "@/lib/filters";
import { useI18n } from "@/lib/i18n";
import { addLocalTimelineEntry, saveLocalProject } from "@/lib/local-store";
import { generateAnimatedStripGif } from "@/lib/animated-strip";
import { exportTemplateToDataUrl, type CameraEffects } from "@/lib/template-renderer";

function playShutterSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

function PhotoboxStudioContent() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Template state (prioritize photobox category by default)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => BUILTIN_TEMPLATES.find((tpl) => tpl.category === "photobox")?.id ?? BUILTIN_TEMPLATES[0].id
  );
  const [dynamicShotCount] = useState<number>(4);
  const [customGridShots, setCustomGridShots] = useState<number | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");

  // Camera & session settings
  const [timerSeconds, setTimerSeconds] = useState<number>(3);
  const [mirror, setMirror] = useState<boolean>(true);
  const [poseGuide] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("natural");
  const [cameraEffects, setCameraEffects] = useState<CameraEffects>({
    softGlow: false,
    filmGrain: false,
    dateStamp: false,
  });

  // Camera stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveBufferRef = useRef<string[]>([]);
  const slotBurstFramesRef = useRef<Record<number, string[]>>({});
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [virtualBg, setVirtualBg] = useState<VirtualBackgroundOption>(VIRTUAL_BG_PRESETS[0]);

  // Capture state
  const [slotImages, setSlotImages] = useState<(string | null)[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isAutoSession, setIsAutoSession] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);

  // Sync template from URL query param
  useEffect(() => {
    const param = searchParams.get("template");
    const preset = param ? getBuiltinTemplateById(param) : undefined;
    if (param && preset && !isTemplateLocked(preset)) {
      setSelectedTemplateId(param);
      setCustomGridShots(null);
    }
    const devParam = searchParams.get("deviceId");
    if (devParam) {
      setSelectedDeviceId(devParam);
    }
  }, [searchParams]);

  const handleSelectTemplate = useCallback((tplId: string) => {
    setSelectedTemplateId(tplId);
    setCustomGridShots(null);
    const preset = getBuiltinTemplateById(tplId);
    const defaultFilter = preset?.document.slots[0]?.filter;
    if (defaultFilter) {
      setActiveFilter(defaultFilter);
    }
  }, []);

  const selectedTemplateMeta = useMemo(
    () => getBuiltinTemplateById(selectedTemplateId) ?? BUILTIN_TEMPLATES[0],
    [selectedTemplateId]
  );

  const baseDocument: TemplateDocument = useMemo(() => {
    if (selectedTemplateId === "__dynamic__") {
      return createDynamicPhotoboxTemplate(customGridShots ?? dynamicShotCount, {
        caption: caption.trim() || undefined,
      });
    }
    return selectedTemplateMeta.document;
  }, [selectedTemplateId, selectedTemplateMeta, dynamicShotCount, customGridShots, caption]);

  const isGridAdaptable = useMemo(() => {
    if (selectedTemplateId === "__dynamic__") return true;
    return !baseDocument.canvas.overlayImage;
  }, [selectedTemplateId, baseDocument]);

  // If template changes to a non-adaptable template, ensure customGridShots is reset to null
  useEffect(() => {
    if (!isGridAdaptable && customGridShots !== null) {
      setCustomGridShots(null);
    }
  }, [isGridAdaptable, customGridShots]);

  const activeDocument: TemplateDocument = useMemo(
    () =>
      selectedTemplateId === "__dynamic__"
        ? baseDocument
        : adaptTemplateToGridSize(baseDocument, customGridShots),
    [baseDocument, selectedTemplateId, customGridShots]
  );

  const slotCount = getSlotCount(activeDocument);

  // Reset slot array when template slot count changes
  useEffect(() => {
    const count = slotCount;
    setSlotImages((prev) => {
      const next = Array.from({ length: count }, (_, i) => prev[i] ?? null);
      return next;
    });
    setActiveSlotIndex(0);
    setIsAutoSession(false);
    setCountdown(null);
  }, [activeDocument.templateId, slotCount]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(true);
      return;
    }
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // If user already switched tab or left /photobox while permission/stream was resolving, turn off immediately
      if (typeof document !== "undefined" && document.hidden) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setCameraError(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices.filter((d) => d.kind === "videoinput"));
    } catch {
      setCameraError(true);
    }
  }, [stopCamera]);

  useEffect(() => {
    let active = true;
    const syncCameraWithVisibility = () => {
      if (!active) return;
      if (document.hidden) {
        stopCamera();
      } else {
        void startCamera(selectedDeviceId || undefined);
      }
    };

    if (!document.hidden) {
      void startCamera(selectedDeviceId || undefined);
    }

    document.addEventListener("visibilitychange", syncCameraWithVisibility);
    window.addEventListener("pagehide", stopCamera);
    window.addEventListener("beforeunload", stopCamera);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", syncCameraWithVisibility);
      window.removeEventListener("pagehide", stopCamera);
      window.removeEventListener("beforeunload", stopCamera);
      stopCamera();
    };
  }, [startCamera, stopCamera, selectedDeviceId]);

  // Real-time Virtual Background compositing loop when virtualBg is active
  useEffect(() => {
    if (cameraError || virtualBg.mode === "none") return;
    let active = true;
    let busy = false;
    let rafId = 0;

    const tick = async () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = bgCanvasRef.current;
      if (video && canvas && video.readyState >= 2 && !busy) {
        busy = true;
        try {
          await compositeSourceWithVirtualBg(video, canvas, virtualBg, { mirror });
        } finally {
          busy = false;
        }
      }
      if (active) {
        rafId = requestAnimationFrame(() => {
          void tick();
        });
      }
    };

    rafId = requestAnimationFrame(() => {
      void tick();
    });

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [cameraError, virtualBg, mirror]);

  const captureFrameToSlot = useCallback(
    (targetIndex: number) => {
      let dataUrl = "";
      if (virtualBg.mode !== "none" && bgCanvasRef.current && bgCanvasRef.current.width > 0) {
        dataUrl = bgCanvasRef.current.toDataURL("image/jpeg", 0.92);
      } else {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.save();
        if (mirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      }

      playShutterSound();
      setFlash(true);
      setTimeout(() => setFlash(false), 180);

      setSlotImages((prev) => {
        const next = [...prev];
        next[targetIndex] = dataUrl;
        return next;
      });
      // Save burst frames for Boomerang GIF Strip
      slotBurstFramesRef.current[targetIndex] = [
        ...liveBufferRef.current.slice(-4),
        dataUrl,
      ];
      liveBufferRef.current = [];
    },
    [mirror, virtualBg.mode]
  );

  // Sample rolling burst frames while countdown is active (for Boomerang GIF Strip)
  useEffect(() => {
    if (countdown === null || cameraError) return;
    const sampleFrame = () => {
      let frameUrl = "";
      if (virtualBg.mode !== "none" && bgCanvasRef.current && bgCanvasRef.current.width > 0) {
        frameUrl = bgCanvasRef.current.toDataURL("image/jpeg", 0.68);
      } else {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;
        const c = document.createElement("canvas");
        const targetW = Math.min(480, video.videoWidth);
        const targetH = Math.round((video.videoHeight / video.videoWidth) * targetW);
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.save();
        if (mirror) {
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, c.width, c.height);
        ctx.restore();
        frameUrl = c.toDataURL("image/jpeg", 0.68);
      }
      if (frameUrl) {
        liveBufferRef.current = [...liveBufferRef.current.slice(-4), frameUrl];
      }
    };
    const interval = window.setInterval(sampleFrame, 190);
    return () => window.clearInterval(interval);
  }, [countdown, cameraError, mirror, virtualBg.mode]);

  // Countdown & auto-session loop
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const id = window.setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
      return () => window.clearTimeout(id);
    }

    // countdown === 0 -> capture current activeSlotIndex
    captureFrameToSlot(activeSlotIndex);

    const total = slotCount;
    if (isAutoSession && activeSlotIndex + 1 < total) {
      const nextIdx = activeSlotIndex + 1;
      setActiveSlotIndex(nextIdx);
      setCountdown(timerSeconds > 0 ? timerSeconds : 1);
    } else {
      setIsAutoSession(false);
      setCountdown(null);
      if (activeSlotIndex + 1 < total) {
        setActiveSlotIndex(activeSlotIndex + 1);
      }
      addLocalTimelineEntry({
        eventType: "session",
        title: `Photobox (${total} shots)`,
        templateId: activeDocument.templateId,
      });
    }
  }, [countdown, activeSlotIndex, slotCount, activeDocument.templateId, captureFrameToSlot, isAutoSession, timerSeconds]);

  const handleStartSession = () => {
    if (cameraError) return;
    const firstEmpty = slotImages.findIndex((img) => img === null);
    const startIdx = firstEmpty >= 0 ? firstEmpty : 0;
    setActiveSlotIndex(startIdx);
    setIsAutoSession(true);
    setCountdown(timerSeconds > 0 ? timerSeconds : 1);
  };

  const handleSingleCapture = () => {
    if (cameraError) return;
    setIsAutoSession(false);
    if (timerSeconds === 0) {
      captureFrameToSlot(activeSlotIndex);
      if (activeSlotIndex + 1 < slotCount) {
        setActiveSlotIndex(activeSlotIndex + 1);
      }
    } else {
      setCountdown(timerSeconds);
    }
  };

  const handleUploadForSlot = (index: number, file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSlotImages((prev) => {
          const next = [...prev];
          next[index] = reader.result as string;
          return next;
        });
        if (index + 1 < slotCount) {
          setActiveSlotIndex(index + 1);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (format: "png" | "jpeg" | "webp") => {
    setIsExporting(true);
    try {
      const dataUrl = await exportTemplateToDataUrl(activeDocument, {
        slotImages,
        overrideFilter: activeFilter,
        effects: cameraEffects,
        customCaption: caption.trim() || undefined,
        format,
      });
      const link = document.createElement("a");
      link.download = `jevallene-${activeDocument.templateId}-${Date.now()}.${format === "jpeg" ? "jpg" : format}`;
      link.href = dataUrl;
      link.click();

      addLocalTimelineEntry({
        eventType: "downloaded",
        title: `${activeDocument.templateId} (${format.toUpperCase()})`,
        templateId: activeDocument.templateId,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToGallery = async () => {
    const thumb = await exportTemplateToDataUrl(activeDocument, {
      slotImages,
      overrideFilter: activeFilter,
      effects: cameraEffects,
      customCaption: caption.trim() || undefined,
      scale: 0.4,
      format: "jpeg",
      quality: 0.8,
    });

    const now = new Date().toISOString();
    const ok = saveLocalProject({
      id: `proj-${Date.now()}`,
      title: caption.trim() || `Photobox ${activeDocument.templateId}`,
      templateId: activeDocument.templateId,
      document: activeDocument,
      slotImages,
      filter: activeFilter,
      caption: caption.trim(),
      thumbnailDataUrl: thumb,
      createdAt: now,
      updatedAt: now,
    });

    if (ok) {
      addLocalTimelineEntry({
        eventType: "created",
        title: caption.trim() || `Photobox ${activeDocument.templateId}`,
        templateId: activeDocument.templateId,
        thumbnailDataUrl: thumb,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3500);
    }
  };

  const handleOpenInEditor = async () => {
    const projectId = `proj-${Date.now()}`;
    const thumb = await exportTemplateToDataUrl(activeDocument, {
      slotImages,
      overrideFilter: activeFilter,
      customCaption: caption.trim() || undefined,
      scale: 0.4,
      format: "jpeg",
      quality: 0.8,
    });
    const now = new Date().toISOString();
    saveLocalProject({
      id: projectId,
      title: caption.trim() || `Photobox ${activeDocument.templateId}`,
      templateId: activeDocument.templateId,
      document: activeDocument,
      slotImages,
      filter: activeFilter,
      caption: caption.trim(),
      thumbnailDataUrl: thumb,
      createdAt: now,
      updatedAt: now,
    });
    router.push(`/editor?project=${encodeURIComponent(projectId)}`);
  };

  const capturedCount = slotImages.filter(Boolean).length;
  const totalSlots = slotCount;
  const posePrompt = t.photobox.posePrompts[activeSlotIndex % t.photobox.posePrompts.length];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-brand-accent mb-0.5 sm:mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Camera className="w-3.5 h-3.5" />
            <span>Photobox Studio • {capturedCount}/{totalSlots} {t.photobox.shotsProgress}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{t.pages.photoboxTitle}</h1>
          <p className="hidden sm:block text-sm text-brand-textMuted mt-0.5">{t.pages.photoboxDesc}</p>
        </div>
      </div>

      {/* Main Studio Grid (Mobile: 1. Camera at top -> 2. Settings below camera -> 3. Live Preview; Desktop: 1. Settings top -> 2. Camera left -> 3. Preview right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Clean 4-Dropdown Controls Bar: Template · Ukuran · Filter · Background (Opsional) */}
        <div className="order-2 lg:order-1 lg:col-span-12 rounded-2xl bg-brand-surface nb-box p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
              1. {t.photobox.templateLabel}
            </label>
            <button
              type="button"
              onClick={() => setTemplateModalOpen(true)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-brand-border bg-brand-bg hover:border-brand-accent flex items-center gap-2.5 text-left transition-colors"
            >
              <div className="w-8 h-10 rounded-lg bg-brand-surfaceMuted flex items-center justify-center overflow-hidden shrink-0">
                <TemplateCanvasPreview
                  document={activeDocument}
                  scale={0.07}
                  className="max-h-full max-w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-text truncate">
                  {selectedTemplateId === "__dynamic__"
                    ? t.photobox.customStrip
                    : locale === "id"
                      ? selectedTemplateMeta.title_id
                      : selectedTemplateMeta.title_en}
                </p>
                <p className="text-[10px] text-brand-textMuted">
                  {slotCount} {locale === "id" ? "foto" : "shots"} ·{" "}
                  <span className="text-brand-accent font-semibold">
                    {locale === "id" ? "Ganti" : "Browse"}
                  </span>
                </p>
              </div>
              <LayoutGrid className="w-4 h-4 text-brand-textMuted shrink-0" />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-brand-textMuted uppercase tracking-wider">
                2. {isGridAdaptable
                  ? (locale === "id" ? "Ukuran Grid" : "Grid Size")
                  : (locale === "id" ? "Ukuran Grid (Terkunci)" : "Grid Size (Locked)")}
              </label>
              {!isGridAdaptable && (
                <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  🔒 {locale === "id" ? "Sesuai Bingkai" : "Frame Locked"}
                </span>
              )}
            </div>
            <select
              value={isGridAdaptable ? (customGridShots ? String(customGridShots) : "template") : "template"}
              disabled={!isGridAdaptable}
              onChange={(e) => {
                if (!isGridAdaptable) return;
                const val = e.target.value;
                if (val === "template") {
                  setCustomGridShots(null);
                } else {
                  setCustomGridShots(parseInt(val, 10));
                }
              }}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                !isGridAdaptable
                  ? "border-brand-border bg-brand-bg/70 text-brand-textMuted cursor-not-allowed opacity-90"
                  : "border-brand-border bg-brand-bg text-brand-text hover:border-brand-accent/50 focus:border-brand-accent cursor-pointer"
              }`}
            >
              <option value="template">
                {locale === "id"
                  ? `Sesuai Template (${getSlotCount(baseDocument)} foto)${!isGridAdaptable ? " — Terkunci" : ""}`
                  : `Template (${getSlotCount(baseDocument)} shots)${!isGridAdaptable ? " — Locked" : ""}`}
              </option>
              {isGridAdaptable && (
                <>
                  <option value="2">1×2 ({locale === "id" ? "2 foto" : "2 shots"})</option>
                  <option value="3">1×3 ({locale === "id" ? "3 foto" : "3 shots"})</option>
                  <option value="4">1×4 / 2×2 ({locale === "id" ? "4 foto" : "4 shots"})</option>
                  <option value="6">2×3 ({locale === "id" ? "6 foto" : "6 shots"})</option>
                  <option value="8">2×4 ({locale === "id" ? "8 foto" : "8 shots"})</option>
                </>
              )}
            </select>
            <p className="text-[10px] text-brand-textMuted mt-1">
              {!isGridAdaptable
                ? (locale === "id"
                    ? "Template ini menggunakan artwork bingkai khusus, tata letak foto dikunci agar pas 1:1."
                    : "This template uses custom artwork overlay, photo slots are locked to match 1:1.")
                : (locale === "id"
                    ? "Bisa diubah: sesuaikan jumlah foto (2, 3, 4, 6, 8) sesuai kebutuhan."
                    : "Adaptable: customize shot count (2, 3, 4, 6, 8) to fit your needs.")}
            </p>
          </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
            3. {t.photobox.filterLabel}
          </label>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as FilterPreset)}
            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-xs font-semibold focus:outline-none focus:border-brand-accent"
          >
            {FILTER_PRESETS.map((f) => (
              <option key={f.id} value={f.id}>
                {locale === "id" ? f.label_id : f.label_en}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(
              [
                { key: "softGlow", label: "✨ Soft Glow" },
                { key: "filmGrain", label: "🎞️ Film Grain" },
                { key: "dateStamp", label: "📅 Date Stamp" },
              ] as const
            ).map((ef) => {
              const active = Boolean(cameraEffects[ef.key]);
              return (
                <button
                  key={ef.key}
                  type="button"
                  onClick={() =>
                    setCameraEffects((prev) => ({ ...prev, [ef.key]: !prev[ef.key] }))
                  }
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    active
                      ? "bg-[#D2F159] text-[#111827] ps-sticky-btn"
                      : "bg-brand-bg border border-brand-border text-brand-textMuted hover:text-brand-text"
                  }`}
                >
                  {ef.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-brand-textMuted uppercase tracking-wider mb-1.5">
            4. {locale === "id" ? "Background (Opsional)" : "Background (Optional)"}
          </label>
          <div className="flex items-center gap-1.5">
            <select
              value={virtualBg.id}
              onChange={(e) => {
                const found = VIRTUAL_BG_PRESETS.find((bg) => bg.id === e.target.value);
                if (found) setVirtualBg(found);
              }}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-xs font-semibold focus:outline-none focus:border-brand-accent"
            >
              {VIRTUAL_BG_PRESETS.map((bg) => (
                <option key={bg.id} value={bg.id}>
                  {locale === "id" ? bg.label_id : bg.label_en}
                </option>
              ))}
              {virtualBg.id === "custom-image" && (
                <option value="custom-image">
                  {locale === "id" ? "Gambar Kustom" : "Custom Image"}
                </option>
              )}
            </select>
            <label
              className="shrink-0 w-9 h-9 rounded-xl border border-brand-border bg-brand-bg flex items-center justify-center hover:border-brand-accent cursor-pointer"
              title={locale === "id" ? "Upload Background Gambar" : "Upload Background Image"}
            >
              <ImagePlus className="w-4 h-4 text-brand-text" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setVirtualBg({
                        id: "custom-image",
                        label_id: "Gambar Kustom",
                        label_en: "Custom Image",
                        mode: "image",
                        value: reader.result,
                      });
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
        </div>
        </div>

        {/* Visual Template Preview Strip */}
        <div className="pt-3 border-t border-brand-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-brand-textMuted uppercase tracking-wider">
              {locale === "id" ? "Pratinjau Template Cepat" : "Quick Template Previews"}
            </span>
            <button
              type="button"
              onClick={() => setTemplateModalOpen(true)}
              className="text-[11px] font-bold text-brand-accent hover:underline"
            >
              {locale === "id"
                ? `Lihat Semua (${BUILTIN_TEMPLATES.length})`
                : `Browse All (${BUILTIN_TEMPLATES.length})`}
            </button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {BUILTIN_TEMPLATES.filter((tpl) => tpl.category === "photobox")
              .slice(0, 18)
              .map((tpl) => {
              const title = locale === "id" ? tpl.title_id : tpl.title_en;
              const isSelected = tpl.id === selectedTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`shrink-0 w-24 rounded-xl border p-1.5 text-left transition-all ${
                    isSelected
                      ? "border-brand-accent bg-brand-accentSoft/40 ring-1 ring-brand-accent"
                      : "border-brand-border bg-brand-bg hover:border-brand-accent/60"
                  }`}
                >
                  <div className="w-full h-24 rounded-lg bg-brand-surfaceMuted/60 flex items-center justify-center overflow-hidden p-1">
                    <TemplateCanvasPreview
                      document={tpl.document}
                      scale={0.1}
                      className="max-h-full max-w-full"
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-brand-text truncate">{title}</p>
                </button>
              );
            })}
          </div>
        </div>
        </div>

        {/* Left: Live Camera & Slot Strip (First on Mobile so camera is at the very top!) */}
        <div className="order-1 lg:order-2 lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-brand-border bg-stone-950 flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-6 max-w-sm space-y-3">
                <Camera className="w-10 h-10 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-300 leading-relaxed">
                  {t.photobox.cameraUnavailable}
                </p>
                <button
                  type="button"
                  onClick={() => void startCamera(selectedDeviceId || undefined)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.photobox.retryCamera}</span>
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={virtualBg.mode === "none" ? "w-full h-full object-cover" : "hidden"}
                  style={{
                    transform: mirror ? "scaleX(-1)" : undefined,
                    filter: getFilterCss(activeFilter),
                  }}
                />
                {virtualBg.mode !== "none" && (
                  <canvas
                    ref={bgCanvasRef}
                    className="w-full h-full object-cover"
                    style={{ filter: getFilterCss(activeFilter) }}
                  />
                )}
              </>
            )}

            {/* Viewfinder Corner Brackets */}
            {!cameraError && (
              <div className="pointer-events-none absolute inset-4">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-white/60" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-white/60" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-white/60" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-white/60" />
              </div>
            )}

            {/* Pose Guide & Framing Grid */}
            {!cameraError && poseGuide && (
              <div className="pointer-events-none absolute inset-0">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <div key={idx} className="border border-white/15" />
                  ))}
                </div>
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-medium inline-flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-brand-accent shrink-0" />
                    <span className="truncate">#{activeSlotIndex + 1} · {posePrompt}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-[#111827] text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{locale === "id" ? "Kamera ON" : "Camera ON"}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-white/40 bg-brand-accent/90 text-brand-onAccent text-4xl font-serif font-semibold flex items-center justify-center shadow-lg">
                  {countdown}
                </div>
              </div>
            )}

            {/* Shutter Flash */}
            {flash && <div className="absolute inset-0 bg-white/90 pointer-events-none" />}
          </div>

          {/* Compact Camera Controls: Timer, Mirror, Camera & Reset */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                onClick={() => setTimerSeconds((s) => (s === 0 ? 3 : s === 3 ? 5 : 0))}
                className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-full bg-[#FFD166] text-[11px] font-bold text-[#111827] hover:bg-[#F7C348] ps-sticky-btn shrink-0"
                title={t.photobox.timerLabel}
                aria-label={`${t.photobox.timerLabel}: ${timerSeconds}s`}
              >
                <Timer className="w-3.5 h-3.5 shrink-0" />
                <span>{timerSeconds}s</span>
              </button>
              <button
                type="button"
                onClick={() => setMirror((m) => !m)}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ps-sticky-btn shrink-0 ${mirror
                  ? "bg-[#38D1BF] text-[#111827]"
                  : "bg-[#CBECE7] text-[#111827]"
                  }`}
                title={t.photobox.mirrorLabel}
                aria-label={t.photobox.mirrorLabel}
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" />
              </button>
              {devices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="h-8 px-2.5 rounded-full bg-[#A0B0E8] text-[11px] font-bold text-[#111827] focus:outline-none max-w-[140px] sm:max-w-[190px] truncate ps-sticky-btn cursor-pointer"
                  aria-label="Camera device"
                >
                  {devices.map((d, idx) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {formatCameraLabel(d.label, idx, locale === "id")}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSlotImages(Array.from({ length: totalSlots }, () => null));
                setActiveSlotIndex(0);
                setIsAutoSession(false);
                setCountdown(null);
              }}
              className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-full bg-[#FF9EB5] text-[11px] font-bold text-[#111827] hover:bg-[#F585A0] ps-sticky-btn shrink-0"
              title={t.photobox.resetSession}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Reset" : "Reset"}</span>
            </button>
          </div>

          {/* Primary Capture Buttons (Prioritized) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={cameraError || countdown !== null}
              onClick={handleStartSession}
              className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs sm:text-sm font-extrabold disabled:opacity-45 ps-sticky-btn"
            >
              <Timer className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {countdown !== null ? t.photobox.capturing : t.photobox.startSession}
              </span>
            </button>

            <button
              type="button"
              disabled={cameraError || countdown !== null}
              onClick={handleSingleCapture}
              className="min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 sm:px-4 rounded-xl bg-[#38D1BF] text-[#111827] text-xs font-bold hover:bg-[#2AC3B1] disabled:opacity-45 ps-sticky-btn shrink-0"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>{t.photobox.captureNow}</span>
            </button>
          </div>

          {/* Slot Thumbnails & Per-Shot Retake / Upload */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getUniqueSlots(activeDocument).map((slot, idx) => {
              const img = slotImages[idx];
              const isSelected = activeSlotIndex === idx;
              return (
                <div
                  key={slot.id}
                  onClick={() => setActiveSlotIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveSlotIndex(idx);
                  }}
                  className={`rounded-2xl border p-2 bg-brand-surface transition-all cursor-pointer ${isSelected ? "border-brand-accent ring-2 ring-brand-accent/20" : "border-brand-border"
                    }`}
                >
                  <div className="aspect-[4/3] rounded-xl bg-brand-surfaceMuted overflow-hidden flex items-center justify-center mb-2 relative">
                    {img ? (
                      <Image
                        src={img}
                        alt={`Shot ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        style={{ filter: getFilterCss(activeFilter) }}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-brand-textMuted">#{idx + 1}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      disabled={cameraError || countdown !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlotIndex(idx);
                        setIsAutoSession(false);
                        setCountdown(timerSeconds > 0 ? timerSeconds : 0);
                      }}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-brand-surfaceMuted text-[11px] font-medium hover:text-brand-accent disabled:opacity-40 truncate"
                    >
                      {img ? t.photobox.retakeSlot : `#${idx + 1}`}
                    </button>

                    {img && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlotImages((prev) => {
                            const next = [...prev];
                            next[idx] = null;
                            return next;
                          });
                          delete slotBurstFramesRef.current[idx];
                          setActiveSlotIndex(idx);
                        }}
                        className="p-1.5 rounded-lg border border-brand-border text-rose-500 hover:border-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                        title={locale === "id" ? "Hapus foto ini" : "Delete this photo"}
                        aria-label={locale === "id" ? `Hapus foto slot ${idx + 1}` : `Delete slot ${idx + 1} photo`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-brand-border hover:border-brand-accent cursor-pointer"
                      title={t.photobox.uploadSlot}
                    >
                      <Upload className="w-3 h-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadForSlot(idx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Composite Preview & Export */}
        <div className="order-3 lg:order-3 lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{t.photobox.livePreview}</h2>
              <span className="text-[11px] text-brand-textMuted">{t.watermarkNote}</span>
            </div>

            <div className="bg-brand-surfaceMuted/60 rounded-2xl p-4 flex items-center justify-center">
              <TemplateCanvasPreview
                document={activeDocument}
                slotImages={slotImages}
                overrideFilter={activeFilter}
                effects={cameraEffects}
                customCaption={caption.trim() || undefined}
                scale={0.45}
                className="max-h-[440px] w-auto"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-brand-textMuted mb-1">
                {t.photobox.captionLabel}
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="SEOUL MOMENT / PhotoStudio..."
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-xs focus:outline-none focus:border-brand-accent"
              />
            </div>

            {capturedCount === totalSlots && (
              <div className="rounded-xl bg-brand-accentSoft text-brand-accent px-3 py-2 text-xs font-medium">
                {t.photobox.sessionReady}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const dataUrl = await exportTemplateToDataUrl(activeDocument, {
                      slotImages,
                      overrideFilter: activeFilter,
                      effects: cameraEffects,
                      customCaption: caption.trim() || undefined,
                      format: "png",
                      scale: 1,
                    });
                    await handleSaveToGallery();
                    setShareDataUrl(dataUrl);
                    setShareModalOpen(true);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold disabled:opacity-50 ps-sticky-btn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{locale === "id" ? (isExporting ? "Menyiapkan..." : "Save Hasil") : (isExporting ? "Preparing..." : "Save Result")}</span>
              </button>

              <button
                type="button"
                onClick={() => void handleOpenInEditor()}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-full bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.photobox.openInEditor}</span>
              </button>
            </div>

            <div className="pt-1 border-t border-brand-border">
              <CloudUsageBar compact />
            </div>
          </div>
        </div>
      </div>

      <PhotoboxTemplateModal
        open={templateModalOpen}
        locale={locale}
        selectedTemplateId={selectedTemplateId}
        onSelect={handleSelectTemplate}
        onClose={() => setTemplateModalOpen(false)}
      />

      {savedNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#D2F159] text-[#111827] text-xs font-bold ps-sticky-btn">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            {locale === "id" ? "Disimpan ke Galeri & Linimasa!" : "Saved to Gallery & Timeline!"}
          </span>
          <Link
            href="/timeline"
            className="px-2.5 py-1 rounded-full bg-white text-[#111827] text-[11px] font-bold ps-sticky-btn"
          >
            {locale === "id" ? "Lihat Linimasa" : "View Timeline"}
          </Link>
        </div>
      )}

      <ShareResultModal
        open={shareModalOpen}
        locale={locale}
        title={caption.trim() || `Photobox ${activeDocument.templateId}`}
        source="photobox"
        previewDataUrl={shareDataUrl}
        onDownloadFormat={(fmt) => handleDownload(fmt)}
        onGenerateGif={
          Object.keys(slotBurstFramesRef.current).length > 0
            ? async () => {
                const { dataUrl } = await generateAnimatedStripGif(
                  activeDocument,
                  slotBurstFramesRef.current,
                  {
                    fallbackSlotImages: slotImages,
                    overrideFilter: activeFilter,
                    effects: cameraEffects,
                    customCaption: caption.trim() || undefined,
                  }
                );
                return dataUrl;
              }
            : undefined
        }
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

export default function PhotoboxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-brand-textMuted">Loading Photobox Studio...</div>}>
      <PhotoboxStudioContent />
    </Suspense>
  );
}
