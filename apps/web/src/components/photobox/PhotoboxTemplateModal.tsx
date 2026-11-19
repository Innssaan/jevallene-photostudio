"use client";

import React, { useMemo, useState } from "react";
import { Check, LayoutGrid, Lock, Search, X } from "lucide-react";
import {
  BUILTIN_TEMPLATES,
  getSlotCount,
  isTemplateLocked,
  type TemplateCategory,
} from "@photostudio/shared-types";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";

interface PhotoboxTemplateModalProps {
  open: boolean;
  locale: string;
  selectedTemplateId: string;
  defaultCategory?: "all" | TemplateCategory;
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

const MODAL_CATEGORIES: { id: "all" | TemplateCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "photobox", label: "Photobox" },
  { id: "polaroid", label: "Polaroid" },
  { id: "ig_story", label: "IG Story" },
  { id: "ig_feed", label: "IG Feed" },
  { id: "tiktok_story", label: "TikTok Story" },
  { id: "tiktok_feed", label: "TikTok Feed" },
  { id: "collage", label: "Collage" },
];

export function PhotoboxTemplateModal({
  open,
  locale,
  selectedTemplateId,
  defaultCategory = "photobox",
  onSelect,
  onClose,
}: PhotoboxTemplateModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | TemplateCategory>(defaultCategory);
  const [visibleLimit, setVisibleLimit] = useState(24);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BUILTIN_TEMPLATES.filter((tpl) => {
      if (category === "all" && !q && tpl.category === "birthday_special") return false;
      if (category !== "all" && tpl.category !== category) return false;
      if (!q) return true;
      const title = (locale === "id" ? tpl.title_id : tpl.title_en).toLowerCase();
      return (
        title.includes(q) ||
        tpl.theme.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
      );
    });
  }, [query, category, locale]);

  if (!open) return null;

  const shown = filtered.slice(0, visibleLimit);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl border border-brand-border bg-brand-surface flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-brand-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-brand-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <LayoutGrid className="w-5 h-5 text-brand-accent shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold truncate">
                {locale === "id" ? "Pilih Template Photobox" : "Choose Photobox Template"}
              </h2>
              <p className="text-[11px] sm:text-xs text-brand-textMuted truncate">
                {locale === "id"
                  ? `${filtered.length} template tersedia — ketuk untuk memakai`
                  : `${filtered.length} templates available — tap to apply`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-xl border border-brand-border hover:bg-brand-surfaceMuted flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="px-4 sm:px-5 py-3 border-b border-brand-border space-y-2.5 bg-brand-surfaceMuted/40">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleLimit(24);
              }}
              placeholder={
                locale === "id"
                  ? "Cari nama template atau tema (misal: doodle, wedding, polaroid)..."
                  : "Search template name or theme (e.g. doodle, wedding, polaroid)..."
              }
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm sm:text-xs focus:outline-none focus:border-brand-accent"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:flex-wrap">
            {MODAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setVisibleLimit(24);
                }}
                className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  category === cat.id
                    ? "bg-[#38D1BF] text-[#111827] font-bold"
                    : "bg-brand-bg border border-brand-border text-brand-textMuted hover:text-brand-text"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Visual Previews + Names */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {shown.map((tpl) => {
              const title = locale === "id" ? tpl.title_id : tpl.title_en;
              const shots = getSlotCount(tpl.document);
              const isSelected = tpl.id === selectedTemplateId;
              const locked = isTemplateLocked(tpl);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    onSelect(tpl.id);
                    onClose();
                  }}
                  className={`group text-left rounded-2xl border p-2 sm:p-2.5 transition-all flex flex-col gap-2 ${
                    locked
                      ? "border-brand-border bg-brand-bg/70 opacity-80 cursor-not-allowed"
                      : isSelected
                        ? "border-brand-accent bg-brand-accentSoft/40 ring-2 ring-brand-accent active:scale-[0.98]"
                        : "border-brand-border bg-brand-bg hover:border-brand-accent/70 active:scale-[0.98]"
                  }`}
                >
                  <div className="relative w-full aspect-[3/4] rounded-xl bg-brand-surfaceMuted/60 flex items-center justify-center overflow-hidden p-2">
                    <TemplateCanvasPreview
                      document={tpl.document}
                      scale={0.18}
                      className={`max-h-full max-w-full shadow-sm ${locked ? "blur-[2px] brightness-75" : ""}`}
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-1 p-2 text-center">
                        <Lock className="w-5 h-5 text-white" />
                        <span className="px-2 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-bold">
                          {locale === "id" ? "Terbuka 21 Nov" : "Unlocks Nov 21"}
                        </span>
                      </div>
                    )}
                    {isSelected && !locked && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-brand-accent text-brand-onAccent flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/65 text-white text-[10px] font-semibold backdrop-blur-xs">
                      {shots} {locale === "id" ? "foto" : "shots"}
                    </span>
                  </div>
                  <div className="px-0.5">
                    <p className="text-xs font-bold text-brand-text line-clamp-1 group-hover:text-brand-accent">
                      {title}
                    </p>
                    <p className="text-[10px] text-brand-textMuted capitalize">
                      {tpl.category.replace("_", " ")} · {tpl.theme}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length > shown.length && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((v) => v + 24)}
                className="px-5 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-xs font-semibold hover:border-brand-accent"
              >
                {locale === "id"
                  ? `Muat Lebih Banyak (${filtered.length - shown.length} tersisa)`
                  : `Load More (${filtered.length - shown.length} remaining)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
