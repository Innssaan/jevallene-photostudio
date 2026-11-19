"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Heart, LayoutGrid } from "lucide-react";
import { BUILTIN_TEMPLATES, getSlotCount } from "@photostudio/shared-types";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";
import { LockedFeatureCard } from "@/components/auth/LockedFeatureCard";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { getFavoriteTemplateIds, toggleFavoriteTemplateId } from "@/lib/local-store";
import { getSampleSlotImages } from "@/lib/sample-photos";

export default function FavoritesPage() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteTemplateIds());
  }, []);

  const favoriteTemplates = BUILTIN_TEMPLATES.filter((tpl) => favoriteIds.includes(tpl.id));

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">{t.pages.favoritesTitle}</h1>
        <p className="text-sm text-brand-textMuted mt-1">{t.pages.favoritesDesc}</p>
      </div>

      {!user ? (
        <LockedFeatureCard title={t.pages.favoritesTitle} />
      ) : favoriteTemplates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-border bg-brand-surface/50 p-12 text-center space-y-4">
          <Heart className="w-9 h-9 text-brand-textMuted mx-auto" />
          <p className="text-sm text-brand-textMuted max-w-md mx-auto">{t.favorites.empty}</p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF9EB5] text-[#111827] hover:bg-[#F787A3] text-xs font-bold transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t.favorites.browseTemplates}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {favoriteTemplates.map((tpl) => {
            const title = locale === "id" ? tpl.title_id : tpl.title_en;
            return (
              <div
                key={tpl.id}
                className="rounded-2xl border border-brand-border bg-brand-surface overflow-hidden flex flex-col"
              >
                <div className="bg-brand-surfaceMuted/60 p-4 flex items-center justify-center relative min-h-[220px]">
                  <TemplateCanvasPreview
                    document={tpl.document}
                    slotImages={getSampleSlotImages(getSlotCount(tpl.document))}
                    scale={0.26}
                    className="max-h-[200px] w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setFavoriteIds(toggleFavoriteTemplateId(tpl.id))}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FF6B35] text-white shadow-sm flex items-center justify-center"
                    aria-label={t.templates.favorite}
                  >
                    <Heart className="w-4 h-4 fill-white" strokeWidth={2.25} />
                  </button>
                </div>
                <div className="p-4 space-y-2.5 border-t border-brand-border">
                  <div className="text-sm font-semibold">{title}</div>
                  <Link
                    href={`/photobox?template=${tpl.id}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" strokeWidth={2.25} />
                    <span>{t.templates.useInPhotobox}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
