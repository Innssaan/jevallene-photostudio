"use client";

import React, { Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Heart,
  Lock,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import {
  BUILTIN_TEMPLATES,
  getSlotCount,
  getTemplateAddedTimestamp,
  isTemplateLocked,
  isTemplateNew,
  type FilterPreset,
  type TemplateCategory,
  type TemplatePreset,
} from "@photostudio/shared-types";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";
import { FILTER_PRESETS } from "@/lib/filters";
import { openAuthModal, useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  addLocalTimelineEntry,
  getFavoriteTemplateIds,
  toggleFavoriteTemplateId,
} from "@/lib/local-store";
import { getSampleSlotImages } from "@/lib/sample-photos";

type SortMode = "featured" | "popular" | "newest";

const CATEGORIES: { id: "all" | TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photobox", label: "Photobox" },
  { id: "polaroid", label: "Polaroid" },
  { id: "ig_story", label: "IG Story" },
  { id: "ig_feed", label: "IG Feed" },
  { id: "tiktok_story", label: "TikTok Story" },
  { id: "tiktok_feed", label: "TikTok Feed" },
  { id: "collage", label: "Collage" },
  { id: "birthday_special", label: "Innssaan Birthday 🎂" },
];

function TemplatesLibraryContent() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState<"all" | TemplateCategory>("all");
  const [sortBy, setSortBy] = useState<SortMode>("featured");
  const [visibleLimit, setVisibleLimit] = useState(24);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [poppingFavId, setPoppingFavId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Detailed Preview Modal state
  const [showSamplePhotos, setShowSamplePhotos] = useState<boolean>(true);
  const [previewFilter, setPreviewFilter] = useState<FilterPreset | undefined>(undefined);

  useEffect(() => {
    setFavorites(getFavoriteTemplateIds());
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    const qParam = searchParams.get("q");
    const filterParam = searchParams.get("filter")?.toLowerCase();
    const idParam = searchParams.get("id");

    if (qParam !== null) {
      setQuery(qParam);
    }

    if (filterParam) {
      const catMatch = CATEGORIES.find(
        (c) => c.id !== "all" && (c.id === filterParam || c.label.toLowerCase() === filterParam)
      );
      if (catMatch) setCategory(catMatch.id);
    }

    if (idParam) {
      const found = BUILTIN_TEMPLATES.find((tpl) => tpl.id === idParam || tpl.slug === idParam);
      if (found) openTemplateModal(found);
    }
  }, [searchParams]);

  const openTemplateModal = (tpl: TemplatePreset) => {
    if (isTemplateLocked(tpl, nowMs)) return;
    setSelectedTemplate(tpl);
    setShowSamplePhotos(true);
    setPreviewFilter(undefined);
  };

  const filteredTemplates = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const list = BUILTIN_TEMPLATES.filter((tpl) => {
      if (category === "all" && !q && tpl.category === "birthday_special") return false;
      if (category !== "all" && tpl.category !== category) return false;
      if (q) {
        const title = (locale === "id" ? tpl.title_id : tpl.title_en).toLowerCase();
        const desc = (locale === "id" ? tpl.description_id : tpl.description_en).toLowerCase();
        if (
          !title.includes(q) &&
          !desc.includes(q) &&
          !tpl.theme.includes(q) &&
          !tpl.category.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const lockDiff = Number(isTemplateLocked(a, nowMs)) - Number(isTemplateLocked(b, nowMs));
      if (lockDiff !== 0) return lockDiff;
      if (sortBy === "popular") return b.popularity_score - a.popularity_score;
      const newDiff = Number(isTemplateNew(b, nowMs)) - Number(isTemplateNew(a, nowMs));
      const addedDiff = getTemplateAddedTimestamp(b) - getTemplateAddedTimestamp(a);
      if (sortBy === "newest") return newDiff || addedDiff || b.popularity_score - a.popularity_score;
      return (
        newDiff ||
        addedDiff ||
        Number(b.is_featured) - Number(a.is_featured) ||
        b.popularity_score - a.popularity_score
      );
    });
  }, [category, deferredQuery, sortBy, locale, nowMs]);

  useEffect(() => {
    setVisibleLimit(24);
  }, [category, deferredQuery, sortBy]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || visibleLimit >= filteredTemplates.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleLimit((v) => Math.min(filteredTemplates.length, v + 24));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleLimit, filteredTemplates.length]);

  const visibleTemplates = useMemo(
    () => filteredTemplates.slice(0, visibleLimit),
    [filteredTemplates, visibleLimit]
  );

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    setFavorites(toggleFavoriteTemplateId(id));
    setPoppingFavId(id);
    window.setTimeout(() => {
      setPoppingFavId((cur) => (cur === id ? null : cur));
    }, 380);
  };

  const modalDocument = useMemo(() => {
    if (!selectedTemplate) return null;
    return selectedTemplate.document;
  }, [selectedTemplate]);

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">{t.pages.templatesTitle}</h1>
          <p className="text-sm text-brand-textMuted mt-1">{t.pages.templatesDesc}</p>
        </div>

        {/* Sort */}
        <div className="inline-flex max-w-full overflow-x-auto no-scrollbar rounded-full border border-brand-border bg-brand-surface p-1 self-start">
          {(
            [
              { id: "featured", label: t.templates.sortFeatured },
              { id: "popular", label: t.templates.sortPopular },
              { id: "newest", label: t.templates.sortNewest },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSortBy(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium ${
                sortBy === tab.id
                  ? "bg-[#D2F159] text-[#111827] font-bold ps-sticky-btn"
                  : "border-[1.5px] border-transparent text-brand-textMuted hover:text-brand-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.templates.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm focus:outline-none focus:border-brand-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat.id
                  ? "bg-[#38D1BF] text-[#111827] font-bold ps-sticky-btn"
                  : "bg-brand-surfaceMuted/50 border border-brand-border text-brand-textMuted hover:text-brand-text"
              }`}
            >
              {cat.id === "all" ? t.templates.allCategories : cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface/50 p-12 text-center text-sm text-brand-textMuted">
          {t.templates.empty}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visibleTemplates.map((tpl) => {
            const isFav = favorites.includes(tpl.id);
            const title = locale === "id" ? tpl.title_id : tpl.title_en;
            const shotCount = getSlotCount(tpl.document);
            const locked = isTemplateLocked(tpl, nowMs);

            return (
              <div
                key={tpl.id}
                onClick={() => {
                  if (!locked) openTemplateModal(tpl);
                }}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-disabled={locked}
                onKeyDown={(e) => {
                  if (!locked && (e.key === "Enter" || e.key === " ")) openTemplateModal(tpl);
                }}
                className={`group rounded-2xl bg-brand-surface nb-box overflow-hidden flex flex-col ${
                  locked ? "cursor-not-allowed opacity-90" : "cursor-pointer nb-box-interactive"
                }`}
              >
                <div className="bg-brand-surfaceMuted p-4 flex items-center justify-center relative h-[260px]">
                  <TemplateCanvasPreview
                    document={tpl.document}
                    slotImages={getSampleSlotImages(shotCount)}
                    scale={0.28}
                    className={`max-h-[220px] max-w-full w-auto h-auto object-contain transition-transform ${
                      locked ? "blur-[2px] brightness-75" : "group-hover:scale-[1.03]"
                    }`}
                  />

                  {locked && (
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                      <span className="w-10 h-10 rounded-full bg-white/95 text-[#111827] flex items-center justify-center shadow-md">
                        <Lock className="w-5 h-5" strokeWidth={2.25} />
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#111827]/90 text-white text-[11px] font-bold tracking-wide">
                        {locale === "id" ? "Terbuka 21 Nov" : "Unlocks Nov 21"}
                      </span>
                    </div>
                  )}

                  {!locked && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, tpl.id)}
                      aria-label={t.templates.favorite}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center ps-sticky-btn transition-transform duration-150 hover:scale-105 active:scale-90"
                    >
                      {poppingFavId === tpl.id && (
                        <span className="absolute inset-0 rounded-full bg-rose-400/50 animate-ping pointer-events-none" />
                      )}
                      <Heart
                        className={`relative w-4 h-4 transition-transform duration-300 ${
                          poppingFavId === tpl.id ? "scale-125" : "scale-100"
                        } ${isFav ? "text-[#EF4444] fill-[#EF4444]" : "text-[#111827]"}`}
                        strokeWidth={2.25}
                      />
                    </button>
                  )}

                  {isTemplateNew(tpl, nowMs) && (
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EF4444] text-white border border-[#991B1B] text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                      {t.templates.newBadge}
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between gap-2.5 border-t border-brand-border">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[13px] text-brand-text truncate">
                      {title}
                    </h3>
                    <p className="text-[11px] text-brand-textMuted mt-0.5 truncate">
                      {shotCount} {t.templates.slots} · {tpl.document.canvas.aspectRatio}
                    </p>
                  </div>

                  {locked ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 w-full h-8 px-3 rounded-full bg-brand-surfaceMuted text-brand-textMuted border border-brand-border text-[11px] font-bold whitespace-nowrap cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3 shrink-0" strokeWidth={2.25} />
                      <span className="truncate">
                        {locale === "id" ? "Terkunci · 21 Nov" : "Locked · Nov 21"}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={`/photobox?template=${tpl.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addLocalTimelineEntry({
                          eventType: "template_used",
                          title,
                          templateId: tpl.id,
                        });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 w-full h-8 px-3 rounded-full bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-[11px] font-bold whitespace-nowrap ps-sticky-btn"
                    >
                      <Camera className="w-3 h-3 shrink-0" strokeWidth={2.25} />
                      <span className="truncate">{t.templates.useInPhotobox}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {visibleLimit < filteredTemplates.length && (
          <div ref={loadMoreRef} className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => setVisibleLimit((v) => Math.min(filteredTemplates.length, v + 24))}
              className="px-5 py-2.5 rounded-full border border-brand-border bg-brand-surface text-xs font-bold text-brand-text hover:border-brand-accent"
            >
              {locale === "id"
                ? `Muat Lebih Banyak (${filteredTemplates.length - visibleLimit} tersisa)`
                : `Load More (${filteredTemplates.length - visibleLimit} remaining)`}
            </button>
          </div>
        )}
        </>
      )}

      {/* Detailed Template Inspector Modal */}
      {selectedTemplate && modalDocument && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-2xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-brand-surface hover:bg-brand-surfaceMuted text-brand-text ps-sticky-btn"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left: Interactive High-Res Preview */}
            <div className="md:col-span-6 bg-brand-surfaceMuted/70 rounded-xl p-4 flex flex-col items-center justify-between gap-3 border border-brand-border/60">
              <div className="flex flex-wrap items-center gap-1.5 self-start bg-brand-surface p-1 rounded-lg border border-brand-border mr-10 md:mr-0">
                <button
                  type="button"
                  onClick={() => setShowSamplePhotos(true)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    showSamplePhotos
                      ? "bg-[#D2F159] text-[#111827] font-bold ps-sticky-btn"
                      : "text-brand-textMuted hover:text-brand-text"
                  }`}
                >
                  {locale === "id" ? "Dengan Foto Contoh" : "Sample Photos"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSamplePhotos(false)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    !showSamplePhotos
                      ? "bg-[#D2F159] text-[#111827] font-bold ps-sticky-btn"
                      : "text-brand-textMuted hover:text-brand-text"
                  }`}
                >
                  {locale === "id" ? "Blueprint Slot" : "Layout Blueprint"}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center py-2">
                <TemplateCanvasPreview
                  document={modalDocument}
                  slotImages={
                    showSamplePhotos
                      ? getSampleSlotImages(getSlotCount(modalDocument))
                      : undefined
                  }
                  overrideFilter={previewFilter}
                  scale={0.42}
                  className="max-h-[430px] w-auto shadow-lg"
                />
              </div>
            </div>

            {/* Right: Detailed Specs & Live Preview Controls */}
            <div className="md:col-span-6 flex flex-col justify-between gap-5 py-1">
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-brand-accent uppercase tracking-[0.15em]">
                    {selectedTemplate.category} · {selectedTemplate.theme}
                  </div>
                  <h2 className="text-2xl font-bold mt-1">
                    {locale === "id" ? selectedTemplate.title_id : selectedTemplate.title_en}
                  </h2>
                  <p className="text-sm text-brand-textMuted mt-1.5 leading-relaxed">
                    {locale === "id"
                      ? selectedTemplate.description_id
                      : selectedTemplate.description_en}
                  </p>
                </div>

                {/* Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="rounded-xl bg-brand-surfaceMuted/80 border border-brand-border/60 p-2.5">
                    <div className="text-[10px] uppercase text-brand-textMuted">Shots</div>
                    <div className="font-semibold mt-0.5">
                      {getSlotCount(modalDocument)} foto
                      {modalDocument.slots.length > getSlotCount(modalDocument)
                        ? ` (${modalDocument.slots.length}× print)`
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-xl bg-brand-surfaceMuted/80 border border-brand-border/60 p-2.5">
                    <div className="text-[10px] uppercase text-brand-textMuted">Canvas</div>
                    <div className="font-semibold mt-0.5">
                      {modalDocument.canvas.width}×{modalDocument.canvas.height}
                    </div>
                  </div>
                  <div className="rounded-xl bg-brand-surfaceMuted/80 border border-brand-border/60 p-2.5">
                    <div className="text-[10px] uppercase text-brand-textMuted">Ratio</div>
                    <div className="font-semibold mt-0.5">{modalDocument.canvas.aspectRatio}</div>
                  </div>
                  <div className="rounded-xl bg-brand-surfaceMuted/80 border border-brand-border/60 p-2.5">
                    <div className="text-[10px] uppercase text-brand-textMuted">Watermark</div>
                    <div className="font-semibold mt-0.5 truncate">
                      {modalDocument.watermark.style ?? "minimal"}
                    </div>
                  </div>
                </div>

                {/* Live Filter Preview */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-brand-textMuted">
                    {locale === "id" ? "Pratinjau Filter Warna" : "Live Color Filter Preview"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPreviewFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          previewFilter === f.id
                            ? "bg-[#38D1BF] text-[#111827] font-bold ps-sticky-btn"
                            : "border border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
                        }`}
                      >
                        {locale === "id" ? f.label_id : f.label_en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Locked Watermark Info */}
                <div className="rounded-xl border border-brand-border bg-brand-surfaceMuted/40 p-3 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-semibold">Watermark: Jevallene</div>
                    <div className="text-[11px] text-brand-textMuted">
                      {modalDocument.watermark.placement} · {modalDocument.watermark.style ?? "minimal"}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface text-xs font-semibold text-brand-textMuted shrink-0">
                    <Lock className="w-3.5 h-3.5 text-brand-accent" />
                    <span>{locale === "id" ? "Terkunci" : "Locked"}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-brand-border">
                <Link
                  href={`/photobox?template=${selectedTemplate.id}`}
                  onClick={() => {
                    addLocalTimelineEntry({
                      eventType: "template_used",
                      title:
                        locale === "id" ? selectedTemplate.title_id : selectedTemplate.title_en,
                      templateId: selectedTemplate.id,
                    });
                  }}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#FFD166] text-[#111827] hover:bg-[#F7C348] text-sm font-bold ps-sticky-btn"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.templates.useInPhotobox}</span>
                </Link>
                <Link
                  href={`/editor?template=${selectedTemplate.id}`}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-brand-surface text-sm font-medium hover:bg-brand-surfaceMuted ps-sticky-btn"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t.gallery.openEditor}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-brand-textMuted">Loading templates...</div>}>
      <TemplatesLibraryContent />
    </Suspense>
  );
}
