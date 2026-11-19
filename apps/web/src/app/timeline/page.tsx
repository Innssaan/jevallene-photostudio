"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Clock, Download, Save, Trash2 } from "lucide-react";
import { LockedFeatureCard } from "@/components/auth/LockedFeatureCard";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  clearLocalTimeline,
  getAllLocalProjectsAsync,
  getLocalProjects,
  getLocalTimeline,
  type LocalProject,
  type LocalTimelineEntry,
} from "@/lib/local-store";

export default function TimelinePage() {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const isId = locale === "id";
  const [entries, setEntries] = useState<LocalTimelineEntry[]>([]);
  const [projects, setProjects] = useState<LocalProject[]>([]);

  useEffect(() => {
    // Only show real user results/activities (exclude template_used noise)
    setEntries(getLocalTimeline().filter((item) => item.eventType !== "template_used"));
    setProjects(getLocalProjects());
    void getAllLocalProjectsAsync().then((all) => setProjects(all));
  }, []);

  const iconForEvent = (type: LocalTimelineEntry["eventType"]) => {
    switch (type) {
      case "session":
        return Camera;
      case "downloaded":
        return Download;
      default:
        return Save;
    }
  };

  const badgeColorForEvent = (type: LocalTimelineEntry["eventType"]) => {
    switch (type) {
      case "session":
        return "bg-[#38D1BF]";
      case "downloaded":
        return "bg-[#FFD166]";
      default:
        return "bg-[#FF9EB5]";
    }
  };

  const groupedByDate = useMemo(() => {
    const groups: { dateKey: string; dateLabel: string; items: LocalTimelineEntry[] }[] = [];
    const map = new Map<string, LocalTimelineEntry[]>();

    for (const entry of entries) {
      const d = new Date(entry.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const list = map.get(dateKey) ?? [];
      list.push(entry);
      map.set(dateKey, list);
    }

    for (const [dateKey, items] of map.entries()) {
      const d = new Date(items[0].createdAt);
      const dateLabel = d.toLocaleDateString(isId ? "id-ID" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      groups.push({ dateKey, dateLabel, items });
    }
    return groups;
  }, [entries, isId]);

  const findPreviewForEntry = (item: LocalTimelineEntry) => {
    if (item.thumbnailDataUrl) {
      const matched = projects.find((p) => p.title.toLowerCase() === item.title.toLowerCase());
      return { src: item.thumbnailDataUrl, projectId: matched?.id };
    }
    const matchedProject = projects.find(
      (p) =>
        p.title.toLowerCase() === item.title.toLowerCase() ||
        (item.templateId && p.templateId === item.templateId)
    );
    if (matchedProject?.thumbnailDataUrl) {
      return { src: matchedProject.thumbnailDataUrl, projectId: matchedProject.id };
    }
    return null;
  };

  return (
    <div className="space-y-6 pt-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.01em]">{t.pages.timelineTitle}</h1>
          <p className="text-sm text-brand-textMuted mt-1">{t.pages.timelineDesc}</p>
        </div>

        {user && entries.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearLocalTimeline();
              setEntries([]);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#FF9EB5] text-[#111827] hover:bg-[#F585A0] text-xs font-bold self-start ps-sticky-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.timeline.clearHistory}</span>
          </button>
        )}
      </div>

      {!user ? (
        <LockedFeatureCard title={t.pages.timelineTitle} />
      ) : entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-border bg-brand-surface/50 p-12 text-center space-y-2">
          <Clock className="w-9 h-9 text-brand-textMuted mx-auto" />
          <p className="text-sm text-brand-textMuted">{t.timeline.empty}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByDate.map((group) => (
            <section key={group.dateKey} className="space-y-4">
              {/* Top Horizontal Line + Date Pill: --------- 17 November 2026 */}
              <div className="flex items-center gap-3">
                <div className="h-[2px] flex-1 bg-brand-border rounded-full" />
                <span className="px-3.5 py-1 rounded-full bg-[#D2F159] text-[#111827] text-xs font-bold shrink-0 ps-sticky-btn">
                  {group.dateLabel}
                </span>
              </div>

              {/* 2-Column Split: Foto (Left) | Center Spine | Judul (Right) */}
              <div className="space-y-5">
                {group.items.map((item) => {
                  const Icon = iconForEvent(item.eventType);
                  const preview = findPreviewForEntry(item);
                  const timeStr = new Date(item.createdAt).toLocaleTimeString(
                    isId ? "id-ID" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[112px_20px_1fr] sm:grid-cols-[200px_28px_1fr] items-stretch gap-2 sm:gap-4"
                    >
                      {/* Left Column: Foto / User Result Only */}
                      <div className="flex items-center justify-end">
                        {preview ? (
                          <div className="w-full max-w-[180px] aspect-[3/4] rounded-2xl bg-brand-surface p-1.5 nb-box overflow-hidden relative">
                            <Image
                              src={preview.src}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-contain p-1.5 rounded-xl"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-[#111827] ps-sticky-tile ps-scratch-surface ${badgeColorForEvent(
                              item.eventType
                            )}`}
                          >
                            <Icon className="w-7 h-7" strokeWidth={2.1} />
                          </div>
                        )}
                      </div>

                      {/* Center Vertical Line (|) with Node */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-[2px] flex-1 bg-brand-border" />
                        <span
                          className={`absolute top-5 w-3.5 h-3.5 rounded-full border-2 border-[#111827] ${badgeColorForEvent(
                            item.eventType
                          )}`}
                        />
                      </div>

                      {/* Right Column: Judul & Detail */}
                      <div className="flex flex-col justify-center py-2 space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#111827] ps-sticky-btn ${badgeColorForEvent(
                              item.eventType
                            )}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{t.timeline.events[item.eventType]}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-brand-textMuted">
                            {timeStr}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-brand-text leading-snug break-words">
                          {item.title}
                        </h3>

                        {preview?.projectId && (
                          <div>
                            <Link
                              href={`/editor?project=${encodeURIComponent(preview.projectId)}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface text-[11px] font-bold text-brand-text hover:bg-brand-surfaceMuted ps-sticky-btn"
                            >
                              <span>{isId ? "Buka di Editor" : "Open in Editor"}</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
