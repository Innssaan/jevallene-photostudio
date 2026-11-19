"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Cloud,
  Download,
  Image as ImageIcon,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { CloudUsageBar } from "@/components/cloud/CloudUsageBar";
import { LockedFeatureCard } from "@/components/auth/LockedFeatureCard";
import { useAuth } from "@/lib/auth";
import {
  CLOUD_UPDATED_EVENT,
  deleteCloudRender,
  formatCloudBytes,
  listCloudRenders,
  type CloudRenderItem,
} from "@/lib/cloud-storage";
import { useI18n } from "@/lib/i18n";
import {
  addLocalTimelineEntry,
  deleteLocalProjectAsync,
  getAllLocalProjectsAsync,
  getLocalProjects,
  type LocalProject,
} from "@/lib/local-store";
import { exportTemplateToDataUrl } from "@/lib/template-renderer";

export default function GalleryPage() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [cloudRenders, setCloudRenders] = useState<CloudRenderItem[]>([]);
  const [selected, setSelected] = useState<LocalProject | null>(null);

  useEffect(() => {
    setProjects(getLocalProjects());
    void getAllLocalProjectsAsync().then((all) => setProjects(all));
  }, []);

  useEffect(() => {
    const loadCloud = async () => {
      if (!user) {
        setCloudRenders([]);
        return;
      }
      setCloudRenders(await listCloudRenders());
    };
    void loadCloud();
    const handler = () => void loadCloud();
    window.addEventListener(CLOUD_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CLOUD_UPDATED_EVENT, handler);
  }, [user]);

  const handleDeleteCloud = async (item: CloudRenderItem) => {
    await deleteCloudRender(item);
    setCloudRenders(await listCloudRenders());
  };

  const handleDelete = (id: string) => {
    void deleteLocalProjectAsync(id).then((all) => setProjects(all));
    if (selected?.id === id) setSelected(null);
  };

  const handleDownload = async (proj: LocalProject, format: "png" | "jpeg") => {
    const dataUrl = await exportTemplateToDataUrl(proj.document, {
      slotImages: proj.slotImages,
      overrideFilter: proj.filter,
      adjustments: proj.adjustments,
      customCaption: proj.caption || undefined,
      format,
    });
    const link = document.createElement("a");
    link.download = `${proj.title.toLowerCase().replace(/\s+/g, "-") || "photostudio"}.${format === "jpeg" ? "jpg" : "png"}`;
    link.href = dataUrl;
    link.click();
    addLocalTimelineEntry({
      eventType: "downloaded",
      title: `${proj.title} (${format.toUpperCase()})`,
      templateId: proj.templateId,
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">{t.pages.galleryTitle}</h1>
        <p className="text-sm text-brand-textMuted mt-1">{t.pages.galleryDesc}</p>
      </div>

      {!user ? (
        <LockedFeatureCard title={t.pages.galleryTitle} />
      ) : (
        <>
          <CloudUsageBar />

      {user && cloudRenders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#38D1BF]" />
            <h2 className="text-[15px] font-bold text-brand-text">
              {locale === "id" ? "Tersimpan di Cloud" : "Saved in Cloud"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cloudRenders.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-brand-surface nb-box overflow-hidden flex flex-col"
              >
                <div className="aspect-[3/4] bg-brand-surfaceMuted/60 p-3 flex items-center justify-center relative">
                  <Image
                    src={item.public_url}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-contain p-3"
                  />
                </div>
                <div className="p-3.5 space-y-2.5 border-t border-brand-border">
                  <div>
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                    <div className="text-[11px] text-brand-textMuted">
                      {item.source.toUpperCase()} · {formatCloudBytes(item.bytes)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const matchedLocal = projects.find(
                        (p) => p.title.toLowerCase() === item.title.toLowerCase()
                      );
                      const editHref = matchedLocal
                        ? `/editor?project=${encodeURIComponent(matchedLocal.id)}`
                        : `/editor?image=${encodeURIComponent(item.public_url)}&title=${encodeURIComponent(item.title)}`;
                      return (
                        <Link
                          href={editHref}
                          className="flex-1 inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-full bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>{t.gallery.openEditor}</span>
                        </Link>
                      );
                    })()}
                    <a
                      href={item.public_url}
                      target="_blank"
                      rel="noreferrer"
                      download={`${item.title}.png`}
                      aria-label={locale === "id" ? "Unduh" : "Download"}
                      title={locale === "id" ? "Unduh" : "Download"}
                      className="p-1.5 rounded-lg bg-[#D2F159] text-[#111827] flex items-center justify-center ps-sticky-btn"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleDeleteCloud(item)}
                      className="p-1.5 rounded-lg bg-brand-surface text-brand-textMuted hover:text-red-500 ps-sticky-btn"
                      aria-label={t.gallery.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-border bg-brand-surface/50 p-12 text-center space-y-4">
          <ImageIcon className="w-10 h-10 text-brand-textMuted mx-auto" />
          <p className="text-sm text-brand-textMuted max-w-md mx-auto">{t.gallery.empty}</p>
          <Link
            href="/photobox"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold ps-sticky-btn"
          >
            <Camera className="w-4 h-4" />
            <span>{t.gallery.openPhotobox}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelected(proj)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(proj);
              }}
              className="group cursor-pointer rounded-2xl border border-brand-border bg-brand-surface overflow-hidden hover:border-brand-accent transition-all flex flex-col"
            >
              <div className="aspect-[3/4] bg-brand-surfaceMuted/60 p-3 flex items-center justify-center relative">
                <Image
                  src={proj.thumbnailDataUrl}
                  alt={proj.title}
                  fill
                  unoptimized
                  className="object-contain p-3"
                />
              </div>
              <div className="p-3.5 space-y-2.5">
                <div>
                  <div className="text-sm font-medium truncate">{proj.title}</div>
                  <div className="text-xs text-brand-textMuted">
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/editor?project=${encodeURIComponent(proj.id)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 inline-flex items-center justify-center gap-1 h-9 px-3 rounded-full bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>{t.gallery.openEditor}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(proj.id);
                    }}
                    className="p-1.5 rounded-lg bg-brand-surface text-brand-textMuted hover:text-red-500 ps-sticky-btn"
                    aria-label={t.gallery.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-brand-surface border border-brand-border rounded-3xl max-w-lg w-full p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-brand-surface hover:bg-brand-surfaceMuted ps-sticky-btn"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-semibold pr-8">{selected.title}</h2>
            <div className="bg-brand-surfaceMuted/60 rounded-2xl p-4 flex items-center justify-center relative h-[360px]">
              <Image
                src={selected.thumbnailDataUrl}
                alt={selected.title}
                fill
                unoptimized
                className="object-contain p-4"
              />
            </div>

            <div className="space-y-2.5">
              <Link
                href={`/editor?project=${encodeURIComponent(selected.id)}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{t.gallery.openEditor}</span>
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleDownload(selected, "png")}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FFD166] text-[#111827] hover:bg-[#F7C348] text-xs font-bold ps-sticky-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.gallery.downloadPng}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDownload(selected, "jpeg")}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-surface text-xs font-semibold ps-sticky-btn"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.gallery.downloadJpg}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
