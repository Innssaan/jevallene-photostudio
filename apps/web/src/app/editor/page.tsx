"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Camera,
  Check,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  ImagePlus,
  LayoutGrid,
  Lock,
  Redo2,
  RotateCcw,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import { CloudUsageBar } from "@/components/cloud/CloudUsageBar";
import { LiveCameraVirtualBgModal } from "@/components/studio/LiveCameraVirtualBgModal";
import {
  VIRTUAL_BG_PRESETS,
  replaceImageBackground,
  type VirtualBackgroundOption,
} from "@/lib/virtual-background";
import {
  BUILTIN_TEMPLATES,
  enforceMandatoryWatermark,
  getBuiltinTemplateById,
  getSlotCount,
  getUniqueSlots,
  type AssetLayer,
  type AspectRatioPreset,
  type FilterPreset,
  type TemplateDocument,
  type TemplateLayer,
  type TextLayer,
} from "@photostudio/shared-types";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";
import { PhotoboxTemplateModal } from "@/components/photobox/PhotoboxTemplateModal";
import { ShareResultModal } from "@/components/share/ShareResultModal";
import { PhotoCropModal } from "@/components/studio/PhotoCropModal";
import { resizeTemplateToAspectRatio } from "@/lib/template-grid-adapter";
import { FILTER_PRESETS } from "@/lib/filters";
import { getLayerDisplayName, STICKER_PRESETS, type StickerCategory } from "@/lib/stickers";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { listCloudRenders } from "@/lib/cloud-storage";
import { clearEditorDraft, loadEditorDraft, saveEditorDraft } from "@/lib/draft-store";
import {
  addLocalTimelineEntry,
  getAllLocalProjectsAsync,
  getLocalProjectById,
  getLocalProjects,
  saveLocalProject,
  type LocalProject,
} from "@/lib/local-store";
import {
  DEFAULT_ADJUSTMENTS,
  exportTemplateToDataUrl,
  type CameraEffects,
  type ColorAdjustments,
} from "@/lib/template-renderer";

interface EditorSnapshot {
  document: TemplateDocument;
  slotImages: (string | null)[];
  filter: FilterPreset;
  adjustments: ColorAdjustments;
  effects?: CameraEffects;
}

const FONT_OPTIONS = [
  { label: "Jakarta Sans", value: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { label: "Dancing Script", value: "'Dancing Script', 'Caveat', cursive" },
  { label: "Pacifico", value: "'Pacifico', cursive" },
  { label: "Shrikhand", value: "'Shrikhand', cursive" },
  { label: "Playfair Serif", value: "'Playfair Display', Georgia, serif" },
  { label: "Caveat Script", value: "'Caveat', cursive" },
  { label: "Space Mono", value: "'Space Mono', monospace" },
  { label: "Bebas Display", value: "'Bebas Neue', Impact, sans-serif" },
  { label: "Georgia Serif", value: "Georgia, serif" },
];

function resolveFontOptionValue(fontFamily?: string): string {
  if (!fontFamily) return FONT_OPTIONS[0].value;
  const exact = FONT_OPTIONS.find((f) => f.value === fontFamily);
  if (exact) return exact.value;
  const lower = fontFamily.toLowerCase();
  const byName = FONT_OPTIONS.find((f) => {
    const primary = f.value.split(",")[0]?.replace(/['"]/g, "").trim().toLowerCase();
    return primary ? lower.includes(primary) : false;
  });
  return byName ? byName.value : FONT_OPTIONS[0].value;
}

function createFreeEditDocument(
  ratio: AspectRatioPreset = "4:5",
  isCloudRender = false
): TemplateDocument {
  const dims: Record<string, { w: number; h: number }> = {
    "1:1": { w: 1080, h: 1080 },
    "4:5": { w: 1080, h: 1350 },
    "9:16": { w: 1080, h: 1920 },
    "16:9": { w: 1920, h: 1080 },
  };
  const { w, h } = dims[ratio] ?? dims["4:5"];
  const pad = isCloudRender ? 0 : 48;

  return {
    schemaVersion: "1.0",
    templateId: isCloudRender ? "free-edit-cloud" : "free-edit",
    version: 1,
    category: "custom",
    theme: "minimal",
    canvas: {
      width: w,
      height: h,
      aspectRatio: ratio,
      background: { type: "solid", value: "#faf8f5" },
    },
    slots: [
      {
        id: "slot-1",
        index: 0,
        x: pad,
        y: pad,
        width: w - pad * 2,
        height: isCloudRender ? h : h - pad * 2 - 70,
        borderRadius: isCloudRender ? 0 : 16,
        filter: "natural",
      },
    ],
    layers: [],
    watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "auto" }),
  };
}

function EditorContent() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openedFromImportRef = useRef<boolean>(false);

  const [projectId, setProjectId] = useState<string>(() => `proj-${Date.now()}`);
  const [title, setTitle] = useState<string>("Untitled Studio");
  const [activeTab, setActiveTab] = useState<"canvas" | "layers" | "adjust">("canvas");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<{ slotIndex: number; imageSrc: string } | null>(null);
  const [stickerCategory, setStickerCategory] = useState<StickerCategory>("all");
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [cameraModalOpen, setCameraModalOpen] = useState<boolean>(false);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareDataUrl, setShareDataUrl] = useState<string | null>(null);
  const [bgSlotIndex, setBgSlotIndex] = useState<number>(0);
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [originalBgImages, setOriginalBgImages] = useState<Record<number, string>>({});
  const [galleryProjects, setGalleryProjects] = useState<LocalProject[]>([]);
  const [cloudCount, setCloudCount] = useState<number>(0);
  const [hasLoadedTarget, setHasLoadedTarget] = useState<boolean>(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [isEditDragMode, setIsEditDragMode] = useState<boolean>(false);
  const canvasStageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    layerId: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Undo/Redo history
  const [history, setHistory] = useState<EditorSnapshot[]>(() => [
    {
      document: BUILTIN_TEMPLATES[0].document,
      slotImages: Array.from({ length: getSlotCount(BUILTIN_TEMPLATES[0].document) }, () => null),
      filter: "natural",
      adjustments: { ...DEFAULT_ADJUSTMENTS },
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const current = history[historyIndex];

  const commitState = useCallback(
    (updater: (prev: EditorSnapshot) => EditorSnapshot) => {
      setHistory((prevHistory) => {
        const base = prevHistory[historyIndex];
        const nextSnap = updater(base);
        const sliced = prevHistory.slice(0, historyIndex + 1);
        return [...sliced, nextSnap].slice(-40);
      });
      setHistoryIndex((idx) => Math.min(idx + 1, 39));
    },
    [historyIndex]
  );

  const initializedSearchRef = useRef<string | null>(null);

  // Initialize from ?project=, ?template=, or ?import=1 (only once per URL query, never on locale toggle)
  useEffect(() => {
    const searchKey = searchParams.toString();
    if (initializedSearchRef.current === searchKey) return;
    initializedSearchRef.current = searchKey;

    const projects = getLocalProjects();
    setGalleryProjects(projects);
    void getAllLocalProjectsAsync().then((all) => setGalleryProjects(all));

    const projParam = searchParams.get("project");
    const tplParam = searchParams.get("template");
    const importParam = searchParams.get("import");
    const imageParam = searchParams.get("image");
    const titleParam = searchParams.get("title");

    if (projParam) {
      const applyProject = (found: LocalProject) => {
        setProjectId(found.id);
        setTitle(found.title);
        setHistory([
          {
            document: found.document,
            slotImages: found.slotImages,
            filter: found.filter,
            adjustments: found.adjustments ?? { ...DEFAULT_ADJUSTMENTS },
          },
        ]);
        setHistoryIndex(0);
        setHasLoadedTarget(true);
      };

      const found = getLocalProjectById(projParam);
      if (found) {
        applyProject(found);
        return;
      }

      let cancelledProj = false;
      void getAllLocalProjectsAsync().then((all) => {
        if (cancelledProj) return;
        const idbFound = all.find((p) => p.id === projParam);
        if (idbFound) {
          applyProject(idbFound);
        } else {
          setHasLoadedTarget(false);
        }
      });
      return () => {
        cancelledProj = true;
      };
    }

    if (tplParam) {
      const tpl = getBuiltinTemplateById(tplParam);
      if (tpl) {
        setTitle(locale === "id" ? tpl.title_id : tpl.title_en);
        setHistory([
          {
            document: tpl.document,
            slotImages: Array.from({ length: getSlotCount(tpl.document) }, () => null),
            filter: "natural",
            adjustments: { ...DEFAULT_ADJUSTMENTS },
          },
        ]);
        setHistoryIndex(0);
        setHasLoadedTarget(true);
        return;
      }
    }

    if (imageParam) {
      let cancelledImg = false;
      const probe = new window.Image();
      probe.crossOrigin = "anonymous";
      const applyWithRatio = (r: AspectRatioPreset) => {
        if (cancelledImg) return;
        const freeDoc = createFreeEditDocument(r, true);
        setProjectId(`proj-${Date.now()}`);
        setTitle(titleParam?.trim() || (locale === "id" ? "Edit dari Album" : "Edit from Album"));
        setHistory([
          {
            document: freeDoc,
            slotImages: [imageParam],
            filter: "natural",
            adjustments: { ...DEFAULT_ADJUSTMENTS },
          },
        ]);
        setHistoryIndex(0);
        setHasLoadedTarget(true);
      };
      probe.onload = () => {
        const hw = probe.naturalHeight / Math.max(1, probe.naturalWidth);
        const detected: AspectRatioPreset =
          hw > 1.45 ? "9:16" : hw > 1.1 ? "4:5" : hw >= 0.9 ? "1:1" : "16:9";
        applyWithRatio(detected);
      };
      probe.onerror = () => applyWithRatio("9:16");
      probe.src = imageParam;
      return () => {
        cancelledImg = true;
      };
    }

    if (importParam === "1") {
      const freeDoc = createFreeEditDocument("4:5");
      setTitle(t.editor.freeEditMode);
      setHistory([
        {
          document: freeDoc,
          slotImages: [null],
          filter: "natural",
          adjustments: { ...DEFAULT_ADJUSTMENTS },
        },
      ]);
      setHistoryIndex(0);
      setActiveTab("canvas");
      openedFromImportRef.current = true;
      setTemplateModalOpen(true);
      setHasLoadedTarget(true);
      return;
    }

    let cancelled = false;
    void loadEditorDraft<{
      projectId?: string;
      title?: string;
      state?: EditorSnapshot;
    }>().then((draft) => {
      if (cancelled) return;
      if (draft?.state?.document) {
        if (draft.projectId) setProjectId(draft.projectId);
        if (draft.title) setTitle(draft.title);
        setHistory([draft.state]);
        setHistoryIndex(0);
        setHasLoadedTarget(true);
      } else {
        setHasLoadedTarget(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams, locale, t.editor.freeEditMode]);

  useEffect(() => {
    if (!user) {
      setCloudCount(0);
      return;
    }
    void listCloudRenders().then((items) => setCloudCount(items.length));
  }, [user]);

  // Auto-persist in-progress editor work in IndexedDB so large photos & edits survive tab switches
  useEffect(() => {
    if (!hasLoadedTarget || !current) return;
    void saveEditorDraft({ projectId, title, state: current });
  }, [hasLoadedTarget, projectId, title, current]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) setHistoryIndex((i) => i - 1);
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) setHistoryIndex((i) => i + 1);
  }, [canRedo]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const updateAdjustment = (key: keyof ColorAdjustments, value: number) => {
    commitState((prev) => ({
      ...prev,
      adjustments: { ...prev.adjustments, [key]: value },
    }));
  };

  const handleAddTextLayer = (isDate: boolean) => {
    const id = `${isDate ? "date" : "text"}-${Date.now()}`;
    const textLayers = current.document.layers.filter(
      (l): l is TextLayer => l.type === "text" && l.visible
    );
    const refText =
      (isDate
        ? textLayers.find((l) => /sub|kicker|meta|date|foot/i.test(l.id))
        : textLayers[0]) ?? textLayers[0];
    const fallbackColor =
      current.document.watermark.contrastMode === "light" ? "#f8fafc" : "#18181b";
    const matchedFont =
      refText?.fontFamily ||
      current.document.watermark.fontFamily ||
      "Plus Jakarta Sans, system-ui, sans-serif";
    const matchedColor = refText?.color || fallbackColor;
    const canvasW = current.document.canvas.width;
    const defaultSize = isDate
      ? Math.max(18, Math.min(32, Math.round(canvasW * 0.032)))
      : Math.max(24, Math.min(44, Math.round(canvasW * 0.05)));

    const newLayer: TextLayer = {
      id,
      type: isDate ? "date" : "text",
      zIndex: current.document.layers.length + 20,
      x: Math.round(canvasW * 0.1),
      y: Math.round(current.document.canvas.height * 0.82),
      width: Math.round(canvasW * 0.8),
      height: Math.round(defaultSize * 1.6),
      visible: true,
      content: isDate
        ? new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "PhotoStudio",
      fontFamily: matchedFont,
      fontSize: defaultSize,
      color: matchedColor,
      align: "center",
      letterSpacing: isDate ? 1.5 : 2,
      opacity: 1,
      rotation: 0,
    };
    commitState((prev) => ({
      ...prev,
      document: {
        ...prev.document,
        layers: [...prev.document.layers, newLayer],
      },
    }));
    setSelectedLayerId(id);
  };

  const handleAddSticker = (emoji: string) => {
    const id = `sticker-${Date.now()}`;
    const newLayer: AssetLayer = {
      id,
      type: "sticker",
      zIndex: current.document.layers.length + 20,
      x: Math.round(current.document.canvas.width * 0.42),
      y: Math.round(current.document.canvas.height * 0.12),
      width: 96,
      height: 96,
      visible: true,
      assetId: emoji,
      opacity: 1,
      rotation: 0,
    };
    commitState((prev) => ({
      ...prev,
      document: {
        ...prev.document,
        layers: [...prev.document.layers, newLayer],
      },
    }));
    setSelectedLayerId(id);
  };

  const updateLayer = (id: string, patch: Partial<TemplateLayer>) => {
    commitState((prev) => ({
      ...prev,
      document: {
        ...prev.document,
        layers: prev.document.layers.map((l) =>
          l.id === id ? ({ ...l, ...patch } as TemplateLayer) : l
        ),
      },
    }));
  };

  const deleteLayer = (id: string) => {
    commitState((prev) => ({
      ...prev,
      document: {
        ...prev.document,
        layers: prev.document.layers.filter((l) => l.id !== id),
      },
    }));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleSlotUpload = (slotIdx: number, file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropTarget({ slotIndex: slotIdx, imageSrc: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchSlotUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const slots = getUniqueSlots(current.document);
    const maxCount = Math.max(1, slots.length);
    const files = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, maxCount);
    if (files.length === 0) return;

    const readDataUrl = (file: File) =>
      new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

    const loaded = await Promise.all(files.map(readDataUrl));
    commitState((prev) => {
      const nextImgs = Array.from({ length: maxCount }, (_, i) => prev.slotImages[i] ?? null);
      loaded.forEach((url, idx) => {
        if (url && idx < nextImgs.length) {
          nextImgs[idx] = url;
        }
      });
      return { ...prev, slotImages: nextImgs };
    });
    setOriginalBgImages((prev) => {
      const next = { ...prev };
      loaded.forEach((_, idx) => {
        delete next[idx];
      });
      return next;
    });
  };

  const handleReplacePhotoBg = async (bg: VirtualBackgroundOption) => {
    const currentSrc = current.slotImages[bgSlotIndex];
    if (!currentSrc) return;
    const baseSrc = originalBgImages[bgSlotIndex] ?? currentSrc;
    if (!originalBgImages[bgSlotIndex]) {
      setOriginalBgImages((prev) => ({ ...prev, [bgSlotIndex]: currentSrc }));
    }
    setIsSegmenting(true);
    try {
      const nextDataUrl = await replaceImageBackground(baseSrc, bg);
      commitState((prev) => {
        const nextImgs = [...prev.slotImages];
        nextImgs[bgSlotIndex] = nextDataUrl;
        return { ...prev, slotImages: nextImgs };
      });
    } finally {
      setIsSegmenting(false);
    }
  };

  const handleResetPhotoBg = () => {
    const orig = originalBgImages[bgSlotIndex];
    if (!orig) return;
    commitState((prev) => {
      const nextImgs = [...prev.slotImages];
      nextImgs[bgSlotIndex] = orig;
      return { ...prev, slotImages: nextImgs };
    });
    setOriginalBgImages((prev) => {
      const next = { ...prev };
      delete next[bgSlotIndex];
      return next;
    });
  };

  const handleExport = async (format: "png" | "jpeg" | "webp", scale = 1) => {
    setIsExporting(true);
    try {
      const dataUrl = await exportTemplateToDataUrl(current.document, {
        slotImages: current.slotImages,
        overrideFilter: current.filter,
        adjustments: current.adjustments,
        effects: current.effects,
        format,
        scale,
      });
      const link = document.createElement("a");
      const ext = format === "jpeg" ? "jpg" : format;
      link.download = `${title.toLowerCase().replace(/\s+/g, "-") || "photostudio"}-${Date.now()}.${ext}`;
      link.href = dataUrl;
      link.click();

      const thumb = await exportTemplateToDataUrl(current.document, {
        slotImages: current.slotImages,
        overrideFilter: current.filter,
        adjustments: current.adjustments,
        effects: current.effects,
        scale: 0.28,
        format: "jpeg",
        quality: 0.72,
      });
      const now = new Date().toISOString();
      saveLocalProject({
        id: projectId,
        title: title.trim() || "Untitled Studio",
        templateId: current.document.templateId,
        document: current.document,
        slotImages: current.slotImages,
        filter: current.filter,
        adjustments: current.adjustments,
        caption: title.trim(),
        thumbnailDataUrl: thumb,
        createdAt: now,
        updatedAt: now,
      });

      addLocalTimelineEntry({
        eventType: "downloaded",
        title: `${title} (${ext.toUpperCase()})`,
        templateId: current.document.templateId,
        thumbnailDataUrl: thumb,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = async () => {
    const thumb = await exportTemplateToDataUrl(current.document, {
      slotImages: current.slotImages,
      overrideFilter: current.filter,
      adjustments: current.adjustments,
      effects: current.effects,
      scale: 0.28,
      format: "jpeg",
      quality: 0.72,
    });
    const now = new Date().toISOString();
    saveLocalProject({
      id: projectId,
      title: title.trim() || "Untitled Studio",
      templateId: current.document.templateId,
      document: current.document,
      slotImages: current.slotImages,
      filter: current.filter,
      adjustments: current.adjustments,
      caption: title.trim(),
      thumbnailDataUrl: thumb,
      createdAt: now,
      updatedAt: now,
    });
    addLocalTimelineEntry({
      eventType: "created",
      title: title.trim() || "Untitled Studio",
      templateId: current.document.templateId,
      thumbnailDataUrl: thumb,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  const handleClearCurrentWork = async () => {
    setConfirmClearOpen(false);
    setHasLoadedTarget(false);
    setSelectedLayerId(null);
    setOriginalBgImages({});
    setShareDataUrl(null);
    await clearEditorDraft();
    setGalleryProjects(getLocalProjects());
    void getAllLocalProjectsAsync().then((all) => setGalleryProjects(all));
    if (searchParams.toString()) {
      initializedSearchRef.current = "";
      router.replace("/editor");
    }
  };

  const selectedLayer = current.document.layers.find((l) => l.id === selectedLayerId);

  const hasAlbumData = Boolean(user) && (galleryProjects.length > 0 || cloudCount > 0);

  if (!hasLoadedTarget) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">
            {locale === "id" ? "Photo Editor" : "Photo Editor"}
          </h1>
          <p className="text-sm text-brand-textMuted mt-1">
            {locale === "id"
              ? "Area kerja bersih. Mulai foto dari Photobox atau edit foto dari Album Anda."
              : "Clean workspace. Shoot in Photobox or edit photos from your Album."}
          </p>
        </div>

        <div className="rounded-3xl bg-brand-surface nb-box p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#CBECE7] text-[#111827] flex items-center justify-center mx-auto ps-sticky-tile">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-bold text-brand-text">
              {locale === "id" ? "Belum Ada Pekerjaan Aktif" : "No Active Work"}
            </h2>
            <p className="text-xs text-brand-textMuted leading-relaxed">
              {hasAlbumData
                ? locale === "id"
                  ? "Pilih untuk mulai berfoto di Photobox atau pilih foto yang sudah tersimpan di Album Anda untuk diedit."
                  : "Start a new session in Photobox or pick a saved photo from your Album to edit."
                : locale === "id"
                  ? "Mulai sesi foto di Photobox terlebih dahulu untuk mengedit hasil foto Anda di sini."
                  : "Start a photo session in Photobox first to edit your photos here."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/photobox"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs font-bold ps-sticky-btn"
            >
              <Camera className="w-4 h-4" />
              <span>{locale === "id" ? "Foto dari Photobox" : "Shoot from Photobox"}</span>
            </Link>
            {hasAlbumData && (
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold ps-sticky-btn"
              >
                <FolderOpen className="w-4 h-4" />
                <span>{locale === "id" ? "Edit dari Album" : "Edit from Album"}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CloudUsageBar compact />

      {/* Top Bar (Project Title + Quick Undo/Redo) */}
      <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl border border-brand-border bg-brand-surface p-2.5 sm:p-3.5">
        <div className="w-9 h-9 rounded-xl bg-brand-accentSoft text-brand-accent flex items-center justify-center shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.editor.projectTitlePlaceholder}
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold focus:outline-none border-b border-transparent focus:border-brand-accent py-1"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3 rounded-xl bg-[#E0E7FF] text-[#111827] text-xs font-bold disabled:opacity-40 hover:bg-[#C7D2FE] inline-flex items-center justify-center gap-1.5 ps-sticky-btn"
            title={`${t.editor.undo} (Ctrl+Z)`}
            aria-label={t.editor.undo}
          >
            <Undo2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.editor.undo}</span>
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="w-10 h-10 sm:w-auto sm:h-9 sm:px-3 rounded-xl bg-[#CBECE7] text-[#111827] text-xs font-bold disabled:opacity-40 hover:bg-[#B2E2DB] inline-flex items-center justify-center gap-1.5 ps-sticky-btn"
            title={`${t.editor.redo} (Ctrl+Y)`}
            aria-label={t.editor.redo}
          >
            <Redo2 className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.editor.redo}</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Canvas Preview with Drag & Drop Layers */}
        <div className="lg:col-span-7 rounded-3xl border border-brand-border bg-brand-surfaceMuted/50 p-3.5 sm:p-6 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[460px] gap-3">
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-brand-textMuted">
              {isEditDragMode
                ? locale === "id"
                  ? "Mode Edit aktif: geser stiker/teks/partikel."
                  : "Edit mode active: drag stickers/text/particles."
                : locale === "id"
                  ? "Mode Normal: halaman bisa di-scroll bebas."
                  : "Normal mode: page scrolls freely."}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsEditDragMode((v) => !v);
                dragRef.current = null;
              }}
              className={`h-8 px-3 rounded-full text-[11px] font-bold transition-all shrink-0 ps-sticky-btn ${
                isEditDragMode
                  ? "bg-brand-accent text-brand-onAccent"
                  : "bg-brand-surface text-brand-text hover:bg-brand-surfaceMuted"
              }`}
            >
              {isEditDragMode
                ? locale === "id"
                  ? "Selesai Geser"
                  : "Done Moving"
                : locale === "id"
                  ? "Mode Edit / Geser"
                  : "Edit / Move Mode"}
            </button>
          </div>
          <div
            ref={canvasStageRef}
            className={`relative inline-block max-h-[560px] select-none ${
              isEditDragMode ? "touch-none" : "touch-pan-y"
            }`}
            onPointerMove={(e) => {
              const drag = dragRef.current;
              const stage = canvasStageRef.current;
              if (!drag || !stage) return;
              const rect = stage.getBoundingClientRect();
              if (rect.width <= 0 || rect.height <= 0) return;
              const dx = ((e.clientX - drag.startClientX) / rect.width) * current.document.canvas.width;
              const dy = ((e.clientY - drag.startClientY) / rect.height) * current.document.canvas.height;
              const nextX = Math.round(drag.origX + dx);
              const nextY = Math.round(drag.origY + dy);
              setHistory((prev) =>
                prev.map((snap, idx) =>
                  idx !== historyIndex
                    ? snap
                    : {
                        ...snap,
                        document: {
                          ...snap.document,
                          layers: snap.document.layers.map((l) =>
                            l.id === drag.layerId ? ({ ...l, x: nextX, y: nextY } as TemplateLayer) : l
                          ),
                        },
                      }
                )
              );
            }}
            onPointerUp={() => {
              dragRef.current = null;
            }}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
          >
            <TemplateCanvasPreview
              document={current.document}
              slotImages={current.slotImages}
              overrideFilter={current.filter}
              adjustments={current.adjustments}
              effects={current.effects}
              scale={0.5}
              className="max-h-[560px] w-auto"
            />
            <div className="absolute inset-0">
              {current.document.layers
                .filter(
                  (l) =>
                    l.visible &&
                    (l.type === "text" || l.type === "date" || l.type === "sticker")
                )
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((layer) => {
                  const leftPct = (layer.x / current.document.canvas.width) * 100;
                  const topPct = (layer.y / current.document.canvas.height) * 100;
                  const widthPct = (Math.max(layer.width, 40) / current.document.canvas.width) * 100;
                  const heightPct = (Math.max(layer.height, 36) / current.document.canvas.height) * 100;
                  const isSel = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      role="button"
                      tabIndex={0}
                      aria-label={getLayerDisplayName(layer, locale)}
                      onPointerDown={(e) => {
                        setSelectedLayerId(layer.id);
                        setActiveTab("layers");
                        if (!isEditDragMode) return;
                        e.stopPropagation();
                        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                        dragRef.current = {
                          layerId: layer.id,
                          startClientX: e.clientX,
                          startClientY: e.clientY,
                          origX: layer.x,
                          origY: layer.y,
                        };
                      }}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                      }}
                      className={`absolute cursor-grab active:cursor-grabbing rounded transition-colors ${
                        isSel
                          ? "border-2 border-dashed border-brand-accent bg-brand-accent/10"
                          : "border border-transparent hover:border-brand-accent/60"
                      }`}
                    />
                  );
                })}
            </div>
          </div>
          <p className="text-[11px] text-brand-textMuted mt-3">
            {locale === "id"
              ? "Seret teks atau stiker langsung di kanvas untuk memindahkannya."
              : "Drag text or stickers directly on the canvas to move them."}
          </p>
          <p className="text-[11px] text-brand-textMuted mt-1">{t.watermarkNote}</p>
        </div>

        {/* Inspector Panel */}
        <div className="lg:col-span-5 rounded-3xl border border-brand-border bg-brand-surface p-4 sm:p-5 space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-brand-surfaceMuted p-1.5">
            {(
              [
                { id: "canvas", label: t.editor.tabCanvas },
                { id: "layers", label: t.editor.tabLayers },
                { id: "adjust", label: t.editor.tabAdjust },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[42px] py-2 px-2 rounded-xl text-xs font-medium transition-all ${activeTab === tab.id
                  ? "bg-[#D2F159] text-[#111827] font-bold ps-sticky-btn"
                  : "border-[1.5px] border-transparent text-brand-textMuted hover:text-brand-text"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Adjustments & Filters */}
          {activeTab === "adjust" && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium mb-2">{t.photobox.filterLabel}</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => commitState((prev) => ({ ...prev, filter: f.id }))}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${current.filter === f.id
                        ? "bg-[#38D1BF] text-[#111827] font-bold ps-sticky-btn"
                        : "border border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
                        }`}
                    >
                      {locale === "id" ? f.label_id : f.label_en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-brand-border">
                {(
                  [
                    { key: "brightness", label: t.editor.brightness, min: -50, max: 50 },
                    { key: "contrast", label: t.editor.contrast, min: -50, max: 50 },
                    { key: "saturation", label: t.editor.saturation, min: -50, max: 50 },
                    { key: "warmth", label: t.editor.warmth, min: 0, max: 50 },
                    { key: "vignette", label: t.editor.vignette, min: 0, max: 60 },
                  ] as const
                ).map((slider) => (
                  <div key={slider.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-textMuted">{slider.label}</span>
                      <span className="font-mono text-[11px]">
                        {current.adjustments[slider.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      value={current.adjustments[slider.key]}
                      onChange={(e) => updateAdjustment(slider.key, Number(e.target.value))}
                      className="w-full accent-brand-accent"
                    />
                  </div>
                ))}

                {/* Popular Camera Effects */}
                <div className="pt-2 border-t border-brand-border space-y-2">
                  <div className="text-xs font-semibold text-brand-text">
                    {locale === "id" ? "Efek Kamera Populer" : "Camera Effects"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { key: "softGlow", label: locale === "id" ? "✨ Soft Glow" : "✨ Soft Glow" },
                        { key: "filmGrain", label: locale === "id" ? "🎞️ Film Grain" : "🎞️ Film Grain" },
                        { key: "dateStamp", label: locale === "id" ? "📅 Date Stamp Retro" : "📅 Retro Date Stamp" },
                      ] as const
                    ).map((ef) => {
                      const active = Boolean(current.effects?.[ef.key]);
                      return (
                        <button
                          key={ef.key}
                          type="button"
                          onClick={() =>
                            commitState((prev) => ({
                              ...prev,
                              effects: {
                                ...prev.effects,
                                [ef.key]: !prev.effects?.[ef.key],
                              },
                            }))
                          }
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
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

                <button
                  type="button"
                  onClick={() =>
                    commitState((prev) => ({
                      ...prev,
                      filter: "natural",
                      adjustments: { ...DEFAULT_ADJUSTMENTS },
                      effects: { softGlow: false, filmGrain: false, dateStamp: false },
                    }))
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-brand-textMuted hover:text-brand-accent pt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.editor.resetAdjustments}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Layers & Text */}
          {activeTab === "layers" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddTextLayer(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D2F159] text-[#111827] text-xs font-bold ps-sticky-btn"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>{t.editor.addText}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddTextLayer(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFD166] text-[#111827] text-xs font-bold hover:bg-[#F7C348] ps-sticky-btn"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.editor.addDate}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-brand-textMuted flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-[#FA7B38]" />
                    <span>{t.editor.addSticker}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-brand-textMuted">
                    {STICKER_PRESETS.length}+ stiker
                  </span>
                </div>

                {/* Upload Custom Logo / Sticker PNG */}
                <label className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-brand-border bg-brand-bg text-[11px] font-semibold hover:border-brand-accent cursor-pointer transition-colors">
                  <ImagePlus className="w-3.5 h-3.5 text-[#38D1BF]" />
                  <span>{locale === "id" ? "Upload Logo / Stiker Bebas" : "Upload Custom Logo / Sticker"}</span>
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
                          handleAddSticker(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {/* Canva-style Category Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {(
                    [
                      { id: "all", label: locale === "id" ? "Semua" : "All" },
                      { id: "love", label: "Love" },
                      { id: "cute", label: locale === "id" ? "Lucu & Funny" : "Cute & Funny" },
                      { id: "badges", label: locale === "id" ? "Kata Lucu" : "Word Badges" },
                      { id: "editorial", label: "Editorial" },
                      { id: "studio", label: "Studio" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setStickerCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-colors ${
                        stickerCategory === cat.id
                          ? "bg-[#D2F159] text-[#111827] border-[#111827]"
                          : "border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {STICKER_PRESETS.filter(
                    (s) => stickerCategory === "all" || s.category === stickerCategory
                  ).map((s) =>
                    s.kind === "badge" ? (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleAddSticker(s.assetId)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold ps-sticky-btn"
                        style={{ backgroundColor: s.bg, color: s.fg }}
                        title={s.label}
                      >
                        {s.label}
                      </button>
                    ) : (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleAddSticker(s.assetId)}
                        className="w-10 h-10 rounded-xl border border-brand-border bg-brand-bg hover:border-brand-accent hover:scale-105 transition-transform flex items-center justify-center p-1.5"
                        title={s.label}
                      >
                        <Image
                          src={s.assetId}
                          alt={s.label}
                          width={28}
                          height={28}
                          unoptimized
                          className="w-full h-full object-contain"
                        />
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Layer Stack */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pt-2 border-t border-brand-border">
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-brand-surfaceMuted/60 text-[11px] text-brand-textMuted">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Lock className="w-3 h-3 text-brand-accent" />
                    {t.editor.lockedWatermark}
                  </span>
                </div>

                {[...current.document.layers]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedLayerId(layer.id);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl border text-xs cursor-pointer ${selectedLayerId === layer.id
                        ? "border-brand-accent bg-brand-accentSoft/40"
                        : "border-brand-border bg-brand-bg"
                        }`}
                    >
                      <span className="truncate font-medium">
                        {getLayerDisplayName(layer, locale)}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { zIndex: layer.zIndex + 1 });
                          }}
                          className="p-1 hover:text-brand-accent"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { zIndex: Math.max(1, layer.zIndex - 1) });
                          }}
                          className="p-1 hover:text-brand-accent"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                          className="p-1 hover:text-brand-accent"
                          aria-label="Toggle visibility"
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="p-1 hover:text-red-500"
                          aria-label="Delete layer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Selected Layer Properties */}
              {selectedLayer ? (
                <div className="space-y-2.5 pt-2 border-t border-brand-border text-xs">
                  {(selectedLayer.type === "text" || selectedLayer.type === "date") && (
                    <>
                      <div>
                        <label className="block text-[11px] text-brand-textMuted mb-1">
                          {t.editor.layerContent}
                        </label>
                        <input
                          type="text"
                          value={selectedLayer.content}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, { content: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-brand-bg text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-brand-textMuted mb-1">
                            Font
                          </label>
                          <select
                            value={resolveFontOptionValue(selectedLayer.fontFamily)}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, { fontFamily: e.target.value })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-brand-border bg-brand-bg text-xs"
                          >
                            {FONT_OPTIONS.map((f) => (
                              <option key={f.label} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-textMuted mb-1">
                            Align
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {(["left", "center", "right"] as const).map((al) => (
                              <button
                                key={al}
                                type="button"
                                onClick={() => updateLayer(selectedLayer.id, { align: al })}
                                className={`py-1.5 rounded-lg border text-[11px] font-medium capitalize ${
                                  selectedLayer.align === al
                                    ? "bg-[#38D1BF] text-[#111827] border-[#38D1BF] font-bold"
                                    : "border-brand-border bg-brand-bg"
                                }`}
                              >
                                {al[0].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-brand-textMuted mb-1">
                            {t.editor.layerSize}
                          </label>
                          <input
                            type="number"
                            min={8}
                            max={240}
                            value={selectedLayer.fontSize}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, {
                                fontSize: Number(e.target.value) || 24,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-brand-border bg-brand-bg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-textMuted mb-1">
                            {t.editor.layerColor}
                          </label>
                          <input
                            type="color"
                            value={selectedLayer.color}
                            onChange={(e) =>
                              updateLayer(selectedLayer.id, { color: e.target.value })
                            }
                            className="w-full h-8 rounded-lg border border-brand-border bg-brand-bg cursor-pointer"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Size (stickers/shapes only) & Rotation sliders */}
                  <div
                    className={`grid gap-2 ${
                      selectedLayer.type === "text" || selectedLayer.type === "date"
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}
                  >
                    {selectedLayer.type !== "text" && selectedLayer.type !== "date" && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-brand-textMuted mb-1">
                          <span>{locale === "id" ? "Ukuran" : "Size"}</span>
                          <span className="font-mono text-brand-text">{Math.round(selectedLayer.width)}px</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={600}
                          value={Math.round(selectedLayer.width)}
                          onChange={(e) => {
                            const v = Math.max(20, Number(e.target.value) || 96);
                            updateLayer(selectedLayer.id, { width: v, height: v });
                          }}
                          className="w-full accent-brand-accent"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-brand-textMuted mb-1">
                        <span>{locale === "id" ? "Rotasi" : "Rotation"}</span>
                        <span className="font-mono text-brand-text">{selectedLayer.rotation ?? 0}°</span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={selectedLayer.rotation ?? 0}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            rotation: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full accent-brand-accent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-brand-textMuted pt-2 border-t border-brand-border">
                  {t.editor.noLayerSelected}
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Canvas & Photos */}
          {activeTab === "canvas" && (
            <div className="space-y-4">
              {/* Choose Template before / while importing photos */}
              <button
                type="button"
                onClick={() => {
                  openedFromImportRef.current = false;
                  setTemplateModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-[#FF9EB5] text-[#111827] hover:bg-[#F787A3] text-xs font-bold transition-colors"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <LayoutGrid className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {locale === "id" ? "Pilih / Ganti Template" : "Choose / Switch Template"}
                  </span>
                </span>
                <span className="text-[11px] font-mono shrink-0">
                  {BUILTIN_TEMPLATES.length}+
                </span>
              </button>

              {/* Live Camera with Virtual Background */}
              <button
                type="button"
                onClick={() => setCameraModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#6366F1] text-white hover:bg-[#4F46E5] text-xs font-bold transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>
                  {locale === "id"
                    ? "Kamera Live + Ganti Background"
                    : "Live Camera + Virtual Background"}
                </span>
              </button>

              {(() => {
                const slots = getUniqueSlots(current.document);
                const filledCount = slots.filter((_, idx) => Boolean(current.slotImages[idx])).length;
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-brand-text">
                          {t.editor.importPhoto}
                        </div>
                        <p className="text-[11px] text-brand-textMuted mt-0.5">
                          {locale === "id"
                            ? "Klik slot untuk pilih foto, lalu atur posisi & zoom sebelum masuk."
                            : "Click a slot to pick a photo, then center & zoom before inserting."}
                        </p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-brand-surfaceMuted border border-brand-border text-[10px] font-bold text-brand-text">
                        {filledCount}/{slots.length} {locale === "id" ? "terisi" : "filled"}
                      </span>
                    </div>

                    {slots.length > 1 && (
                      <label className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs font-bold cursor-pointer ps-sticky-btn">
                        <ImagePlus className="w-4 h-4 shrink-0" />
                        <span>
                          {locale === "id"
                            ? `Pilih Semua Foto Sekaligus (maks. ${slots.length})`
                            : `Select Multiple Photos at Once (max ${slots.length})`}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            void handleBatchSlotUpload(files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {slots.map((slot, idx) => {
                        const imgUrl = current.slotImages[idx];
                        const isFilled = Boolean(imgUrl);
                        return (
                          <label
                            key={slot.id}
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file && file.type.startsWith("image/")) {
                                handleSlotUpload(idx, file);
                              }
                            }}
                            className={`group relative flex items-center gap-2.5 min-h-[64px] p-2.5 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${
                              isFilled
                                ? "border-emerald-500/40 bg-emerald-500/5 hover:border-brand-accent"
                                : "border-dashed border-brand-border bg-brand-bg/50 hover:border-brand-accent hover:bg-brand-accentSoft/30"
                            }`}
                          >
                            {/* Thumbnail or Empty Icon */}
                            <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-brand-border bg-brand-surfaceMuted flex items-center justify-center">
                              {isFilled && imgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={imgUrl}
                                  alt={`Slot ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImagePlus className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform" />
                              )}
                            </div>

                            {/* Label & Hint */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-brand-text">
                                  {locale === "id" ? `Foto #${idx + 1}` : `Photo #${idx + 1}`}
                                </span>
                                {isFilled ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">
                                    <Check className="w-2.5 h-2.5" />
                                    {locale === "id" ? "Siap" : "Ready"}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-brand-textMuted bg-brand-surfaceMuted px-1.5 py-0.5 rounded-full">
                                    {locale === "id" ? "Kosong" : "Empty"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-textMuted truncate mt-0.5">
                                {isFilled
                                  ? (locale === "id" ? "Klik untuk ganti foto" : "Click to replace")
                                  : (locale === "id" ? "Klik / seret foto ke sini" : "Click or drop photo")}
                              </p>
                            </div>

                            {/* Remove button if filled */}
                            {isFilled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  commitState((prev) => {
                                    const nextImgs = [...prev.slotImages];
                                    nextImgs[idx] = null;
                                    return { ...prev, slotImages: nextImgs };
                                  });
                                }}
                                className="p-1.5 rounded-lg text-brand-textMuted hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
                                title={locale === "id" ? "Hapus foto di slot ini" : "Remove photo"}
                                aria-label={locale === "id" ? `Hapus Foto #${idx + 1}` : `Remove Photo #${idx + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.currentTarget.value = "";
                                handleSlotUpload(idx, file);
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* AI Photo Background Replacement (Discord-style) */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {locale === "id"
                        ? "Ganti Background Foto (AI)"
                        : "Replace Photo Background (AI)"}
                    </span>
                  </span>
                  {getUniqueSlots(current.document).length > 1 && (
                    <select
                      value={bgSlotIndex}
                      onChange={(e) => setBgSlotIndex(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg border border-brand-border bg-brand-bg text-[11px]"
                    >
                      {getUniqueSlots(current.document).map((s, idx) => (
                        <option key={s.id} value={idx}>
                          Slot #{idx + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {current.slotImages[bgSlotIndex] ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {VIRTUAL_BG_PRESETS.filter((b) => b.mode !== "none").map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          disabled={isSegmenting}
                          onClick={() => void handleReplacePhotoBg(bg)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-brand-border bg-brand-bg text-[11px] font-medium hover:border-brand-accent disabled:opacity-50"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-brand-border shrink-0"
                            style={{
                              background:
                                bg.mode === "solid" || bg.mode === "gradient" || bg.mode === "curtain"
                                  ? bg.value
                                  : "radial-gradient(circle, #d4d4d8 0%, #52525b 100%)",
                            }}
                          />
                          <span className="truncate">
                            {locale === "id" ? bg.label_id : bg.label_en}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={!originalBgImages[bgSlotIndex] || isSegmenting}
                      onClick={handleResetPhotoBg}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface text-[11px] font-semibold text-brand-text hover:bg-brand-surfaceMuted disabled:opacity-45"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>
                        {locale === "id" ? "Reset Background Asli" : "Reset Original Background"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-brand-textMuted">
                    {locale === "id"
                      ? "Unggah atau ambil foto pada slot di atas untuk mengganti background-nya."
                      : "Upload or capture a photo in the slot above to replace its background."}
                  </p>
                )}
              </div>

              {(() => {
                const isFreeEditLocked = Boolean(current.document.canvas.overlayImage);
                return (
                  <div className="pt-2 border-t border-brand-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium inline-flex items-center gap-1.5">
                        <span>{t.editor.freeEditMode}</span>
                        {isFreeEditLocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{locale === "id" ? "Terkunci" : "Locked"}</span>
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        disabled={isFreeEditLocked}
                        onClick={() => {
                          if (isFreeEditLocked) return;
                          const doc = createFreeEditDocument("4:5");
                          commitState((prev) => ({
                            ...prev,
                            document: doc,
                            slotImages: [prev.slotImages[0] ?? null],
                          }));
                        }}
                        className="text-[11px] font-medium text-brand-textMuted hover:text-brand-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-brand-textMuted"
                      >
                        {locale === "id" ? "Kanvas Polos" : "Blank Canvas"}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["1:1", "4:5", "9:16", "16:9"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          disabled={isFreeEditLocked}
                          onClick={() => {
                            if (isFreeEditLocked) return;
                            commitState((prev) => {
                              const isBlank = prev.document.templateId.startsWith("free-edit");
                              if (isBlank) {
                                const isCloud = prev.document.templateId === "free-edit-cloud";
                                return {
                                  ...prev,
                                  document: createFreeEditDocument(ratio, isCloud),
                                  slotImages: [prev.slotImages[0] ?? null],
                                };
                              }
                              return {
                                ...prev,
                                document: resizeTemplateToAspectRatio(prev.document, ratio),
                              };
                            });
                          }}
                          className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            isFreeEditLocked
                              ? "border-brand-border bg-brand-bg/60 text-brand-textMuted opacity-50 cursor-not-allowed"
                              : current.document.canvas.aspectRatio === ratio
                                ? "border-brand-accent bg-brand-accentSoft text-brand-text"
                                : "border-brand-border hover:border-brand-accent"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                    {isFreeEditLocked && (
                      <p className="text-[10px] text-brand-textMuted">
                        {locale === "id"
                          ? "Template ini menggunakan grid terkunci, sehingga rasio & mode Free Edit dikunci agar desain tetap pas 1:1."
                          : "This template has a locked grid, so aspect ratio & Free Edit mode are locked to preserve 1:1 fit."}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Bottom Inspector Actions: Save Hasil, Hapus Pekerjaan Sekarang */}
          <div className="pt-4 border-t border-brand-border space-y-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={async () => {
                setIsExporting(true);
                try {
                  const dataUrl = await exportTemplateToDataUrl(current.document, {
                    slotImages: current.slotImages,
                    overrideFilter: current.filter,
                    adjustments: current.adjustments,
                    effects: current.effects,
                    format: "png",
                    scale: 1,
                  });
                  await handleSave();
                  setShareDataUrl(dataUrl);
                  setShareModalOpen(true);
                } finally {
                  setIsExporting(false);
                }
              }}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold disabled:opacity-50 ps-sticky-btn"
            >
              <Download className="w-4 h-4" />
              <span>{locale === "id" ? (isExporting ? "Menyiapkan..." : "Save Hasil") : (isExporting ? "Preparing..." : "Save Result")}</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EF4444] text-white hover:bg-[#DC2626] text-xs font-bold ps-sticky-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{locale === "id" ? "Hapus Pekerjaan Sekarang" : "Clear Current Work"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing Current Work */}
      {confirmClearOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmClearOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-brand-surface nb-box p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#EF4444] text-white flex items-center justify-center shrink-0 ps-sticky-tile">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-text">
                  {locale === "id"
                    ? "Hapus Pekerjaan Sekarang?"
                    : "Clear Current Work?"}
                </h3>
                <p className="text-xs text-brand-textMuted leading-relaxed">
                  {locale === "id"
                    ? "Apakah Anda yakin ingin menghapus pekerjaan yang sedang diedit sekarang di Editor? Perubahan yang belum disimpan ke Album akan dibersihkan."
                    : "Are you sure you want to clear the current work in the Editor? Unsaved changes will be discarded."}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-brand-surfaceMuted text-brand-text hover:bg-brand-border text-xs font-bold ps-sticky-btn"
              >
                {locale === "id" ? "Cancel" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => void handleClearCurrentWork()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EF4444] text-white hover:bg-[#DC2626] text-xs font-bold ps-sticky-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{locale === "id" ? "Oke" : "OK"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      <LiveCameraVirtualBgModal
        open={cameraModalOpen}
        locale={locale}
        slotCount={getSlotCount(current.document)}
        onClose={() => setCameraModalOpen(false)}
        onCaptureToSlot={(slotIdx, dataUrl) => {
          commitState((prev) => {
            const nextImgs = [...prev.slotImages];
            nextImgs[slotIdx] = dataUrl;
            return { ...prev, slotImages: nextImgs };
          });
        }}
      />

      <PhotoboxTemplateModal
        open={templateModalOpen}
        locale={locale}
        selectedTemplateId={current.document.templateId}
        defaultCategory="all"
        onSelect={(tplId) => {
          const tpl = getBuiltinTemplateById(tplId);
          if (!tpl) return;
          openedFromImportRef.current = false;
          setTitle(locale === "id" ? tpl.title_id : tpl.title_en);
          commitState((prev) => {
            const count = getSlotCount(tpl.document);
            const nextImgs = Array.from({ length: count }, (_, i) => prev.slotImages[i] ?? null);
            return {
              ...prev,
              document: tpl.document,
              slotImages: nextImgs,
            };
          });
          setSelectedLayerId(null);
          setActiveTab("canvas");
        }}
        onClose={() => {
          setTemplateModalOpen(false);
          if (openedFromImportRef.current) {
            openedFromImportRef.current = false;
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }
        }}
      />

      <ShareResultModal
        open={shareModalOpen}
        locale={locale}
        title={title || `Studio ${current.document.templateId}`}
        source="editor"
        previewDataUrl={shareDataUrl}
        onDownloadFormat={(fmt) => handleExport(fmt, 1.5)}
        onClose={() => setShareModalOpen(false)}
      />

      {(() => {
        const targetSlot = cropTarget
          ? getUniqueSlots(current.document)[cropTarget.slotIndex]
          : undefined;
        const aspect =
          targetSlot && targetSlot.height > 0
            ? targetSlot.width / targetSlot.height
            : 1;
        return (
          <PhotoCropModal
            open={Boolean(cropTarget)}
            imageSrc={cropTarget?.imageSrc ?? null}
            slotAspectRatio={aspect}
            targetWidth={targetSlot ? Math.max(800, targetSlot.width * 2) : 900}
            targetHeight={targetSlot ? Math.max(800, targetSlot.height * 2) : 900}
            slotLabel={cropTarget ? `Slot #${cropTarget.slotIndex + 1}` : undefined}
            locale={locale}
            onCancel={() => setCropTarget(null)}
            onConfirm={(croppedDataUrl) => {
              if (!cropTarget) return;
              const idx = cropTarget.slotIndex;
              commitState((prev) => {
                const nextImgs = [...prev.slotImages];
                nextImgs[idx] = croppedDataUrl;
                return { ...prev, slotImages: nextImgs };
              });
              setOriginalBgImages((prev) => {
                if (!prev[idx]) return prev;
                const next = { ...prev };
                delete next[idx];
                return next;
              });
              setCropTarget(null);
            }}
          />
        );
      })()}
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-brand-textMuted">Loading Photo Editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
