"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Check, Cloud, Film, FolderOpen, Heart, ImagePlus, Layers, Lock, Pencil, QrCode, Search, Sparkles } from "lucide-react";
import { BUILTIN_TEMPLATES, getSlotCount, isTemplateLocked } from "@photostudio/shared-types";
import {
  EditorSparkleIcon,
  GalleryFanIcon,
  Insta360LensIcon,
  PhotoboothFlashIcon,
  TemplatesStackIcon,
  TimelineClockIcon,
} from "@/components/icons/AnimatedStudioIcons";
import { TemplateCanvasPreview } from "@/components/templates/TemplateCanvasPreview";
import { InstallAppButton } from "@/components/layout/InstallAppButton";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useIsNativeApp } from "@/lib/native-app";
import { getLocalProjects, type LocalProject } from "@/lib/local-store";
import { getSampleSlotImages } from "@/lib/sample-photos";

type HomeTab = "photobox" | "studio" | "galeri" | "birthday";

export default function HomePage() {
  const { locale, t } = useI18n();
  const { user, localProfile } = useAuth();
  const router = useRouter();
  const isNativeApp = useIsNativeApp();
  const [recentProjects, setRecentProjects] = useState<LocalProject[]>([]);
  const [quickQuery, setQuickQuery] = useState("");
  const [activeTab, setActiveTab] = useState<HomeTab>("photobox");
  const [guestName, setGuestName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    setRecentProjects(getLocalProjects().slice(0, 8));
    try {
      const saved = localStorage.getItem("jevallene_guest_name");
      if (saved) setGuestName(saved);
    } catch {
      // ignore storage errors
    }
  }, []);

  const featuredTemplates = BUILTIN_TEMPLATES.filter((tpl) => tpl.is_featured && !isTemplateLocked(tpl)).slice(0, 4);
  const photoboxTemplates = BUILTIN_TEMPLATES.filter(
    (tpl) => !isTemplateLocked(tpl) && (tpl.category === "photobox" || Boolean(tpl.document.canvas.overlayImage))
  ).slice(0, 4);
  const innssaanBirthdayTemplates = BUILTIN_TEMPLATES.filter(
    (tpl) => tpl.category === "birthday_special"
  );

  const quickMenu = [
    {
      href: "/templates",
      icon: TemplatesStackIcon,
      isCustom: true,
      title: t.nav.templates,
      bg: "var(--ps-tile-templates)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/editor",
      icon: EditorSparkleIcon,
      isCustom: true,
      title: t.nav.editor,
      bg: "var(--ps-tile-editor)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/photobox",
      icon: PhotoboothFlashIcon,
      isCustom: true,
      title: t.nav.photobox,
      bg: "var(--ps-tile-photobooth)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/camera",
      icon: Camera,
      isCustom: false,
      title: locale === "id" ? "Kamera Eksternal" : "External Camera",
      bg: "#FFD166",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/editor?import=1",
      icon: Insta360LensIcon,
      isCustom: true,
      title: t.home.importPhoto,
      bg: "var(--ps-tile-insta360)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/gallery",
      icon: GalleryFanIcon,
      isCustom: true,
      title: t.nav.gallery,
      bg: "var(--ps-tile-gallery)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/timeline",
      icon: TimelineClockIcon,
      isCustom: true,
      title: t.nav.timeline,
      bg: "var(--ps-tile-timeline)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
    {
      href: "/favorites",
      icon: Heart,
      isCustom: false,
      title: t.nav.favorites,
      bg: "var(--ps-tile-favorites)",
      fg: "#111827",
      accent: "#FFFFFF",
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    router.push(q ? `/templates?q=${encodeURIComponent(q)}` : "/templates");
  };

  const loggedInName =
    user?.name || localProfile.name || user?.email?.split("@")[0] || guestName.trim() || null;
  const avatarSrc = user?.avatarUrl || localProfile.avatarUrl;
  const greetingText = loggedInName
    ? locale === "id"
      ? `Haii, ${loggedInName}!`
      : `Heyy, ${loggedInName}!`
    : locale === "id"
      ? "Haii Bestie!"
      : "Heyy Bestie!";

  const handleSaveGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameDraft.trim().slice(0, 24);
    setGuestName(cleaned);
    setEditingName(false);
    try {
      if (cleaned) {
        localStorage.setItem("jevallene_guest_name", cleaned);
      } else {
        localStorage.removeItem("jevallene_guest_name");
      }
    } catch {
      // ignore storage errors
    }
  };

  const tabs: {
    id: HomeTab;
    label: string;
    shortTag?: string;
    icon: React.ComponentType<{ className?: string }>;
    activeCls: string;
  }[] = [
    {
      id: "photobox",
      label: "Photobox",
      icon: Camera,
      activeCls: "bg-[#38D1BF] text-[#111827] border-[#111827] shadow-[0_6px_18px_rgba(56,209,191,0.38)]",
    },
    {
      id: "studio",
      label: "Studio",
      icon: Sparkles,
      activeCls: "bg-[#D2F159] text-[#111827] border-[#111827] shadow-[0_6px_18px_rgba(210,241,89,0.38)]",
    },
    {
      id: "galeri",
      label: t.nav.gallery,
      icon: FolderOpen,
      activeCls: "bg-[#FF9EB5] text-[#111827] border-[#111827] shadow-[0_6px_18px_rgba(255,158,181,0.38)]",
    },
    {
      id: "birthday",
      label: "Innssaan Birthday",
      shortTag: "21 Nov",
      icon: Lock,
      activeCls: "bg-[#FDE047] text-[#111827] border-[#111827] shadow-[0_6px_18px_rgba(250,204,21,0.42)]",
    },
  ];

  if (isNativeApp) {
    return (
      <div className="space-y-4">
        {/* Compact Greeting + Search */}
        <section className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-accent text-brand-onAccent flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-brand-borderStrong shadow-xs">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={loggedInName || "Avatar"}
                  width={32}
                  height={32}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                (loggedInName?.[0] || "J").toUpperCase()
              )}
            </div>
            <span className="text-sm font-extrabold text-brand-text truncate">
              {greetingText}
            </span>
          </div>

          <form onSubmit={handleSearch} className="relative w-40 shrink-0">
            <Search className="w-3.5 h-3.5 text-brand-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder={locale === "id" ? "Cari..." : "Search..."}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-xs text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </form>
        </section>

        {/* GoPay-Style Primary Quick Action Card (Theme-Synced) */}
        <section className="rounded-2xl p-3.5 bg-gradient-to-br from-[#D2F159] to-[#38D1BF] dark:from-[#1B2330] dark:to-[#141922] text-[#111827] dark:text-brand-text border border-brand-borderStrong ps-sticky-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span>Jevallene Studio</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/85 dark:bg-brand-accentSoft border border-[#111827]/20 dark:border-brand-accent/40 text-[10px] font-bold text-[#111827] dark:text-brand-accent">
              {BUILTIN_TEMPLATES.length}+ Frame
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { href: "/photobox", icon: Camera, label: "Photobox" },
              { href: "/editor?import=1", icon: ImagePlus, label: locale === "id" ? "Impor" : "Import" },
              { href: "/templates", icon: Layers, label: "Template" },
              { href: "/camera", icon: Sparkles, label: locale === "id" ? "Kamera" : "Camera" },
            ].map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.href}
                  href={act.href}
                  className="group flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl bg-white/90 dark:bg-brand-surfaceMuted border border-[#111827]/20 dark:border-brand-border hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <Icon className="w-5 h-5 text-[#111827] dark:text-brand-accent group-hover:scale-110 transition-transform" strokeWidth={2.3} />
                  <span className="text-[10px] font-extrabold text-[#111827] dark:text-brand-text leading-none">
                    {act.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* GoPay-Style 4x2 Shortcut Icons + Names Grid */}
        <section aria-label="Shortcuts" className="rounded-2xl bg-brand-surface border border-brand-border p-3.5 ps-sticky-card">
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {quickMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center text-center gap-1.5 active:scale-95 transition-transform"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center ps-sticky-tile group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: item.bg, color: item.fg }}
                >
                  {item.isCustom ? (
                    (() => {
                      const CustomIcon = item.icon as React.ComponentType<{ className?: string; accent?: string }>;
                      return <CustomIcon className="w-5 h-5" accent={item.accent} />;
                    })()
                  ) : (
                    (() => {
                      const LucideIcon = item.icon as React.ComponentType<{ className?: string; strokeWidth?: number }>;
                      return <LucideIcon className="w-5 h-5" strokeWidth={2.2} />;
                    })()
                  )}
                </div>
                <span className="text-[10px] font-bold text-brand-text leading-tight line-clamp-1">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Compact Swipeable Ready-to-Shoot Frames */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-textMuted">
              {locale === "id" ? "Siap Jepret" : "Ready Frames"}
            </h2>
            <Link href="/templates" className="text-xs font-bold text-brand-accent hover:underline">
              {t.home.viewAll}
            </Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            {photoboxTemplates.map((tpl) => (
              <Link
                key={tpl.id}
                href={`/photobox?template=${encodeURIComponent(tpl.id)}`}
                className="group shrink-0 w-28 rounded-2xl bg-brand-surface border border-brand-border p-2 flex flex-col gap-1.5 hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <div className="aspect-[3/4] rounded-xl bg-brand-surfaceMuted flex items-center justify-center p-1.5 overflow-hidden">
                  <TemplateCanvasPreview
                    document={tpl.document}
                    slotImages={getSampleSlotImages(getSlotCount(tpl.document))}
                    scale={0.13}
                    className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <span className="text-[10px] font-bold text-brand-text truncate">
                  {locale === "id" ? tpl.title_id : tpl.title_en}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Native App: Innssaan Birthday Special Section */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-textMuted">
              Innssaan Birthday 🎂 (21 Nov)
            </h2>
            <Link href="/templates?filter=birthday_special" className="text-xs font-bold text-brand-accent hover:underline">
              {t.home.viewAll}
            </Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            {innssaanBirthdayTemplates.slice(0, 6).map((tpl) => {
              const locked = isTemplateLocked(tpl);
              return (
                <Link
                  key={tpl.id}
                  href={locked ? "/templates?filter=birthday_special" : `/photobox?template=${encodeURIComponent(tpl.id)}`}
                  className="group shrink-0 w-28 rounded-2xl bg-brand-surface border border-brand-border p-2 flex flex-col gap-1.5"
                >
                  <div className="relative aspect-[3/4] rounded-xl bg-brand-surfaceMuted flex items-center justify-center p-1.5 overflow-hidden">
                    <TemplateCanvasPreview
                      document={tpl.document}
                      slotImages={getSampleSlotImages(getSlotCount(tpl.document))}
                      scale={0.13}
                      className={`max-h-full w-auto object-contain ${locked ? "blur-[2px] brightness-75" : ""}`}
                    />
                    {locked && (
                      <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-1 text-center p-1">
                        <Lock className="w-4 h-4 text-white" />
                        <span className="px-1.5 py-0.5 rounded-full bg-black/80 text-white text-[9px] font-bold">
                          21 Nov
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-brand-text truncate">
                    {locale === "id" ? tpl.title_id : tpl.title_en}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Compact Recent Projects (if any) */}
        {user && recentProjects.length > 0 && (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-textMuted">
                {t.nav.gallery}
              </h2>
              <Link href="/gallery" className="text-xs font-bold text-brand-accent hover:underline">
                {t.home.viewAll}
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
              {recentProjects.slice(0, 6).map((proj) => (
                <Link
                  key={proj.id}
                  href={`/editor?project=${encodeURIComponent(proj.id)}`}
                  className="group shrink-0 w-24 rounded-2xl bg-brand-surface border border-brand-border p-1.5 flex flex-col gap-1 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  <div className="aspect-[3/4] rounded-xl bg-brand-surfaceMuted relative overflow-hidden">
                    <Image
                      src={proj.thumbnailDataUrl}
                      alt={proj.title}
                      fill
                      unoptimized
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-brand-text truncate">
                    {proj.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting + Search Row (Clean Solid Colors) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FF9EB5] text-[#111827] flex items-center justify-center text-[13px] font-bold shrink-0 overflow-hidden ps-sticky-btn transition-transform duration-300 hover:scale-110 hover:rotate-6">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={loggedInName || "Avatar"}
                width={36}
                height={36}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : loggedInName ? (
              loggedInName.charAt(0).toUpperCase()
            ) : (
              <Sparkles className="w-4 h-4 animate-pulse" />
            )}
          </div>
          <div>
            {editingName && !user ? (
              <form onSubmit={handleSaveGuestName} className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  maxLength={24}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={locale === "id" ? "Nama kamu..." : "Your name..."}
                  className="h-7 px-2.5 rounded-full border border-brand-border bg-brand-surface text-[13px] font-semibold text-brand-text focus:outline-none focus:border-[#38D1BF] w-36"
                />
                <button
                  type="submit"
                  aria-label="Save name"
                  className="w-7 h-7 rounded-full bg-[#D2F159] text-[#111827] flex items-center justify-center ps-sticky-btn"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <h1 className="text-[16px] font-bold text-brand-text tracking-tight leading-tight">
                  {greetingText}
                </h1>
                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameDraft(guestName);
                      setEditingName(true);
                    }}
                    title={locale === "id" ? "Ganti nama tanpa login" : "Set name without login"}
                    aria-label={locale === "id" ? "Ganti nama" : "Edit name"}
                    className="w-6 h-6 rounded-full bg-brand-surface text-brand-textMuted hover:text-brand-text flex items-center justify-center ps-sticky-btn"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <p className="text-[12px] text-brand-textMuted">
              {locale === "id"
                ? "Siap bikin frame photobox & edit foto hari ini?"
                : "Ready to shoot photobox frames & edit photos today?"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-brand-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder={locale === "id" ? "Cari template..." : "Search templates..."}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-brand-surface border border-brand-border text-[13px] text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-[#38D1BF] transition-colors"
          />
        </form>
      </section>

      {/* Studio & Fitur Quick Menu (Topmost) */}
      <section aria-label="Quick menu" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-brand-text">
            {locale === "id" ? "Studio & Fitur" : "Studio & Tools"}
          </h2>
          <Link
            href="/settings"
            className="text-[13px] font-semibold text-[#D9621F] hover:underline"
          >
            {t.nav.settings}
          </Link>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-y-4 gap-x-2.5 sm:gap-x-3">
          {quickMenu.map((item, idx) => {
            const tiltClass = idx % 2 === 0 ? "-rotate-2" : "rotate-2";
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col items-center text-center gap-2.5 active:scale-[0.96] transition-transform"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ps-sticky-tile ps-scratch-surface ${tiltClass}`}
                  style={{ backgroundColor: item.bg, color: item.fg }}
                >
                  {item.isCustom ? (
                    (() => {
                      const CustomIcon = item.icon as React.ComponentType<{ className?: string; accent?: string }>;
                      return <CustomIcon className="w-6 h-6" accent={item.accent} />;
                    })()
                  ) : (
                    (() => {
                      const LucideIcon = item.icon as React.ComponentType<{ className?: string; strokeWidth?: number }>;
                      return <LucideIcon className="w-6 h-6" strokeWidth={2.2} />;
                    })()
                  )}
                </div>
                <span className="text-[11px] sm:text-[12px] font-semibold text-brand-text leading-tight line-clamp-2">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dedicated Install Jevallene App Promo Banner (Below Studio & Fitur) */}
      <section aria-label="Install App Promo">
        <InstallAppButton locale={locale} variant="banner" />
      </section>

      {/* Colorful Animated 4-Tab Pill Bar */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="inline-flex min-w-full sm:min-w-0 items-center gap-2 p-1.5 rounded-2xl bg-brand-surface/90 border border-brand-border shadow-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] sm:text-[13px] border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  isActive
                    ? `${tab.activeCls} font-extrabold`
                    : "border-transparent bg-brand-surfaceMuted/50 text-brand-textMuted hover:text-brand-text hover:bg-brand-surfaceMuted font-semibold"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.shortTag && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isActive ? "bg-[#111827] text-[#FDE047]" : "bg-[#FDE047]/25 text-brand-text"
                    }`}
                  >
                    {tab.shortTag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STUDIO — 2x2 Bento Explanation Cards + Visual Previews */}
      {activeTab === "studio" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-brand-text">
              {locale === "id" ? "Studio & Editor Foto" : "Photo Studio & Editor"}
            </h2>
            <Link
              href="/editor"
              className="text-[13px] font-semibold text-[#D9621F] hover:underline"
            >
              {locale === "id" ? "Buka Editor" : "Open Editor"}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Editor & Crop */}
            <Link
              href="/editor"
              className="group rounded-2xl bg-[#FDE4CF] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Editor & Crop" : "Editor & Crop"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Atur posisi tengah foto, tambah stiker & teks bebas."
                      : "Center-crop photos, add stickers & custom text."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <ImagePlus className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-[#18191C] p-2 flex items-center justify-center gap-2 overflow-hidden">
                <div className="w-14 h-14 rounded-lg border-2 border-[#D2F159] bg-white/10 grid grid-cols-3 grid-rows-3 shrink-0">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#D2F159]" />
                  </div>
                  <div className="border-b border-white/20" />
                </div>
                <div className="text-[10px] font-bold text-white/80 leading-tight">
                  <div>{locale === "id" ? "Geser & Zoom" : "Drag & Zoom"}</div>
                  <div className="text-[#D2F159] text-[9px] mt-0.5">1:1 · 3:4 · 4:5</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Coba" : "Open"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: 209+ Template HD */}
            <Link
              href="/templates"
              className="group rounded-2xl bg-[#E0E7FF] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {BUILTIN_TEMPLATES.length}+ Template
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Korean 4-Cut, Polaroid, Spotify & frame 1:1."
                      : "Korean 4-Cut, Polaroid, Spotify & 1:1 frames."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-1.5 flex items-center justify-center gap-2 overflow-hidden">
                <TemplateCanvasPreview
                  document={featuredTemplates[0].document}
                  slotImages={getSampleSlotImages(getSlotCount(featuredTemplates[0].document))}
                  scale={0.1}
                  className="h-20 w-auto rounded shadow-xs"
                />
                {featuredTemplates[1] && (
                  <TemplateCanvasPreview
                    document={featuredTemplates[1].document}
                    slotImages={getSampleSlotImages(getSlotCount(featuredTemplates[1].document))}
                    scale={0.1}
                    className="h-20 w-auto rounded shadow-xs hidden sm:block"
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Lihat Semua" : "Browse"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Impor Banyak Foto */}
            <Link
              href="/editor?import=1"
              className="group rounded-2xl bg-[#CBECE7] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Impor Sekaligus" : "Batch Import"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Pilih banyak foto langsung isi semua slot frame."
                      : "Pick multiple photos from gallery at once."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-2 grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4].map((slot) => (
                  <div
                    key={slot}
                    className="rounded-lg bg-[#38D1BF]/25 border border-[#111827]/20 flex items-center justify-center text-[10px] font-bold text-[#111827]"
                  >
                    #{slot} ✓
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Impor" : "Import"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Efek Retro & Filter */}
            <Link
              href="/editor"
              className="group rounded-2xl bg-[#FFE4E6] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Efek Retro & Filter" : "Retro FX & Filters"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Soft Glow, Film Grain 35mm & Date Stamp oranye."
                      : "Soft Glow, 35mm Film Grain & orange Date Stamp."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-gradient-to-br from-stone-900 to-amber-950 p-2.5 flex flex-col justify-between">
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-white/15 text-[8px] font-bold text-white">GLOW</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/15 text-[8px] font-bold text-white">GRAIN</span>
                </div>
                <div className="text-right font-mono text-xs font-bold text-[#FF7A1A]">
                  &apos;26 11 19
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Pakai Efek" : "Try FX"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* TAB 2: PHOTOBOX — 2x2 Bento Explanation Cards + Visual Previews */}
      {activeTab === "photobox" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-brand-text">
              {locale === "id" ? "Fitur Photobox Live" : "Live Photobox Features"}
            </h2>
            <Link
              href="/photobox"
              className="text-[13px] font-semibold text-[#D9621F] hover:underline"
            >
              {t.home.startPhotobox}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Photobox 4-Cut */}
            <Link
              href={`/photobox?template=${encodeURIComponent(photoboxTemplates[0].id)}`}
              className="group rounded-2xl bg-[#CBECE7] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    Photobox 4-Cut
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Jepret beruntun pakai timer & preview frame real-time."
                      : "Auto-shoot timer with real-time frame preview."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div className="h-40 sm:h-48 rounded-xl bg-white/90 border border-[#111827]/15 p-2.5 flex items-center justify-center gap-3 overflow-hidden">
                <TemplateCanvasPreview
                  document={photoboxTemplates[0].document}
                  slotImages={getSampleSlotImages(getSlotCount(photoboxTemplates[0].document))}
                  scale={0.22}
                  className="max-h-full max-w-full w-auto h-auto object-contain rounded-md shadow-sm group-hover:scale-[1.03] transition-transform"
                />
                {photoboxTemplates[1] && (
                  <TemplateCanvasPreview
                    document={photoboxTemplates[1].document}
                    slotImages={getSampleSlotImages(getSlotCount(photoboxTemplates[1].document))}
                    scale={0.22}
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-md shadow-sm hidden sm:block group-hover:scale-[1.03] transition-transform"
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Mulai Foto" : "Shoot"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: GIF Boomerang */}
            <Link
              href="/photobox"
              className="group rounded-2xl bg-[#D2F159] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    GIF Boomerang
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Momen countdown jadi strip GIF bergerak & QR."
                      : "Countdown burst turns into animated GIF & QR."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Film className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-[#111827] p-2 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="px-1.5 py-0.5 rounded bg-[#FF9EB5] text-[#111827] text-[8px] font-black w-fit">
                    BOOMERANG .GIF
                  </span>
                  <span className="text-[10px] font-bold text-white/80">
                    {locale === "id" ? "Sync ke QR & Cloud" : "Synced to QR & Cloud"}
                  </span>
                </div>
                <div className="w-12 h-full rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
                  <Film className="w-5 h-5 text-[#D2F159]" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Rekam GIF" : "Create GIF"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Tirai Studio AI */}
            <Link
              href="/photobox"
              className="group rounded-2xl bg-[#E0E7FF] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Tirai Studio AI" : "AI Studio Curtains"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Ganti background kamera langsung tanpa green screen."
                      : "Swap live camera background without green screen."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-2 flex items-center justify-around">
                {["#E11D48", "#38BDF8", "#F472B6", "#111827"].map((clr) => (
                  <div
                    key={clr}
                    className="w-6 h-16 rounded-md border border-[#111827]/30 shadow-xs"
                    style={{ backgroundColor: clr }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Pilih Tirai" : "Try BG"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Kamera Eksternal */}
            <Link
              href="/camera"
              className="group rounded-2xl bg-[#FFD166] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Kamera Eksternal" : "External Camera"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Hubungkan Webcam HD, DSLR, atau Insta360."
                      : "Connect HD Webcam, DSLR, or Insta360."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-[#111827] p-2.5 flex items-center justify-center gap-2.5">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-600 bg-zinc-900 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#38D1BF]/60 border border-white/40" />
                </div>
                <div className="text-[10px] font-bold text-white leading-tight">
                  <div>USB / HDMI</div>
                  <div className="text-[#FFD166] text-[9px] mt-0.5">1080p Ready</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Hubungkan" : "Connect"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* TAB 3: ALBUM (GALERI) — 2x2 Bento Explanation Cards + Visual Previews */}
      {activeTab === "galeri" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-brand-text">
              {locale === "id" ? "Album, Linimasa & Cloud" : "Albums, Timeline & Cloud"}
            </h2>
            <Link
              href="/gallery"
              className="text-[13px] font-semibold text-[#D9621F] hover:underline"
            >
              {t.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Album & Proyek Tersimpan */}
            <Link
              href="/gallery"
              className="group rounded-2xl bg-[#FF9EB5] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {t.nav.gallery}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Semua hasil Save Hasil tersimpan rapi & bisa diedit ulang."
                      : "All saved results stored neatly for re-editing."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <FolderOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-1.5 flex items-center justify-center relative overflow-hidden">
                {user && recentProjects.length > 0 ? (
                  <Image
                    src={recentProjects[0].thumbnailDataUrl}
                    alt={recentProjects[0].title}
                    fill
                    unoptimized
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111827]/70">
                    <FolderOpen className="w-5 h-5" />
                    <span>{locale === "id" ? "Koleksi Foto" : "Photo Collection"}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Buka Album" : "Open Album"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Linimasa Aktivitas */}
            <Link
              href="/timeline"
              className="group rounded-2xl bg-[#CBECE7] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {t.nav.timeline}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Catatan otomatis setiap jepretan & unduhanmu."
                      : "Automatic history of every capture & download."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Check className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-2 flex flex-col justify-center gap-1.5">
                {[
                  locale === "id" ? "Save Hasil Photobox" : "Photobox Saved",
                  locale === "id" ? "Edit Strip 4-Cut" : "4-Cut Strip Edited",
                ].map((ev) => (
                  <div key={ev} className="flex items-center gap-1.5 text-[10px] font-bold text-[#111827]">
                    <span className="w-2 h-2 rounded-full bg-[#38D1BF] shrink-0" />
                    <span className="truncate">{ev}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Lihat Linimasa" : "View Timeline"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Template Favorit */}
            <Link
              href="/favorites"
              className="group rounded-2xl bg-[#E0E7FF] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {t.nav.favorites}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Simpan bingkai andalanmu biar gampang dicari."
                      : "Bookmark your go-to frames for quick access."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Heart className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-1.5 flex items-center justify-center">
                <TemplateCanvasPreview
                  document={photoboxTemplates[0].document}
                  slotImages={getSampleSlotImages(getSlotCount(photoboxTemplates[0].document))}
                  scale={0.1}
                  className="h-20 w-auto rounded shadow-xs"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Cek Favorit" : "Check"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Cloud & QR Code */}
            <Link
              href="/gallery"
              className="group rounded-2xl bg-[#FEF3C7] p-3.5 sm:p-4 flex flex-col justify-between gap-3 ps-sticky-card ps-scratch-surface"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-snug">
                    {locale === "id" ? "Cloud & QR Sync" : "Cloud & QR Sync"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 mt-0.5 line-clamp-2">
                    {locale === "id"
                      ? "Simpan online 100 MB & bagikan link lewat QR."
                      : "100 MB cloud storage & instant QR share."}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Cloud className="w-4 h-4" />
                </div>
              </div>
              <div className="h-24 rounded-xl bg-white/80 border border-[#111827]/15 p-2 flex items-center justify-center gap-3">
                <QrCode className="w-12 h-12 text-[#111827]" />
                <div className="text-[10px] font-bold text-[#111827] leading-tight">
                  <div>100 MB</div>
                  <div className="text-[#D9621F] text-[9px] mt-0.5">PNG · GIF</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#111827]">
                <span>{locale === "id" ? "Buka Cloud" : "Open"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* TAB 4: INNSSAAAN BIRTHDAY SPECIAL — Locked until 21 Nov */}
      {activeTab === "birthday" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-bold text-brand-text">
                {locale === "id"
                  ? "Spesial Ulang Tahun ke-23 Innssaan • 21 November 🎂"
                  : "Innssaan's 23rd Birthday Special • November 21 🎂"}
              </h2>
              <p className="text-[12px] text-brand-textMuted">
                {locale === "id"
                  ? "Koleksi khusus (terkunci & otomatis terbuka pada 21 November)."
                  : "Dedicated special collection (locked & automatically unlocks on November 21)."}
              </p>
            </div>
            <Link
              href="/templates?filter=birthday_special"
              className="text-[13px] font-semibold text-[#D9621F] hover:underline shrink-0"
            >
              {locale === "id" ? "Lihat semua" : "View all"}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {innssaanBirthdayTemplates.map((tpl) => {
              const title = locale === "id" ? tpl.title_id : tpl.title_en;
              const locked = isTemplateLocked(tpl);
              const shotCount = getSlotCount(tpl.document);

              return locked ? (
                <div
                  key={tpl.id}
                  className="rounded-2xl bg-brand-surface border border-brand-border p-3 flex flex-col justify-between gap-2.5 opacity-90 cursor-not-allowed"
                >
                  <div className="relative h-36 rounded-xl bg-brand-surfaceMuted p-2 flex items-center justify-center overflow-hidden">
                    <TemplateCanvasPreview
                      document={tpl.document}
                      slotImages={getSampleSlotImages(shotCount)}
                      scale={0.18}
                      className="max-h-full max-w-full w-auto h-auto object-contain blur-[2px] brightness-75"
                    />
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 p-2 text-center">
                      <span className="w-8 h-8 rounded-full bg-white/95 text-[#111827] flex items-center justify-center shadow">
                        <Lock className="w-4 h-4" />
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#111827]/90 text-white text-[10px] font-bold">
                        {locale === "id" ? "Terbuka 21 Nov" : "Unlocks Nov 21"}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-brand-text truncate">{title}</div>
                    <div className="text-[10px] text-brand-textMuted mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>{locale === "id" ? "Terkunci · 21 Nov" : "Locked · Nov 21"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={tpl.id}
                  href={`/photobox?template=${encodeURIComponent(tpl.id)}`}
                  className="group rounded-2xl bg-[#FEF3C7] p-3 flex flex-col justify-between gap-2.5 ps-sticky-card ps-scratch-surface"
                >
                  <div className="h-36 rounded-xl bg-white/90 border border-[#111827]/15 p-2 flex items-center justify-center overflow-hidden">
                    <TemplateCanvasPreview
                      document={tpl.document}
                      slotImages={getSampleSlotImages(shotCount)}
                      scale={0.18}
                      className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-[1.03] transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold text-[#111827] truncate">{title}</div>
                    <div className="text-[10px] font-semibold text-[#92400E] mt-0.5 flex items-center justify-between">
                      <span>{locale === "id" ? "Pakai Sekarang" : "Use Now"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}


      {/* PhotoStudio Showcase Hero: Camera Studio Banner + Live 4-Cut Strip Preview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded-2xl p-5 sm:p-6 text-[#111827] flex flex-col justify-between min-h-[188px] ps-sticky-card ps-scratch-surface"
          style={{
            background: "linear-gradient(135deg, #FF9F68 0%, #FA7B38 52%, #FF6B8B 100%)",
          }}
        >
          {/* Subtle camera viewfinder corner marks */}
          <span className="pointer-events-none absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
          <span className="pointer-events-none absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/60 rounded-tr-sm" />
          <span className="pointer-events-none absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/60 rounded-bl-sm" />
          <span className="pointer-events-none absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/60 rounded-br-sm" />

          <div className="relative flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[#111827] text-[11px] font-bold">
              <Camera className="w-3.5 h-3.5 text-[#FA7B38]" />
              <span>Jevallene PhotoStudio</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#111827]/15 text-[#111827] text-[11px] font-semibold">
              {BUILTIN_TEMPLATES.length} {locale === "id" ? "Frame HD" : "HD Frames"}
            </span>
          </div>

          <div className="relative mt-4 space-y-1">
            <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-tight text-[#111827]">
              {locale === "id"
                ? "Photobox 4-Cut & Editor Studio"
                : "4-Cut Photobox & Studio Editor"}
            </h2>
            <p className="text-[12px] sm:text-[13px] font-medium text-[#111827]/80 max-w-md">
              {locale === "id"
                ? "Jepret langsung dengan tirai AI virtual background, edit non-destruktif, dan simpan momenmu."
                : "Snap live with AI studio curtains, edit non-destructively, and save your favorite strips."}
            </p>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2.5">
            <Link
              href="/photobox"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#111827] text-white text-[12px] font-semibold hover:bg-[#1f2937] ps-sticky-btn"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.home.startPhotobox}</span>
            </Link>
            <Link
              href="/editor?import=1"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#111827] text-[12px] font-semibold hover:bg-[#F8FAFC] ps-sticky-btn"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>{t.home.importPhoto}</span>
            </Link>
          </div>
        </div>

        {/* Right Swipeable Card Deck: Live Frame + Feature Highlights */}
        <div className="min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-brand-textMuted uppercase tracking-wider">
              {locale === "id" ? "Live Frame & Fitur" : "Live Frame & Features"}
            </span>
            <span className="text-[11px] font-semibold text-[#D9621F] flex items-center gap-1">
              <span>{locale === "id" ? "Geser" : "Swipe"}</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1.5">
            {/* Slide 1: Live Photostrip Preview Card */}
            <Link
              href={`/templates?id=${featuredTemplates[0].id}`}
              className="snap-start shrink-0 w-[90%] sm:w-full group rounded-2xl bg-[#CBECE7] p-4 sm:p-5 flex items-center justify-between gap-4 min-h-[188px] ps-sticky-card ps-scratch-surface"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2F159] border border-[#111827] text-[#111827] text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                  <Layers className="w-3 h-3 shrink-0" />
                  <span>Live Frame</span>
                </span>
                <div className="text-[15px] font-bold text-[#111827] leading-snug line-clamp-2">
                  {locale === "id" ? featuredTemplates[0].title_id : featuredTemplates[0].title_en}
                </div>
                <div className="text-[12px] font-semibold text-[#111827]/80 flex items-center gap-1">
                  <span>{locale === "id" ? "Pakai Frame" : "Use Frame"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <div className="shrink-0 w-[92px] h-[140px] bg-white rounded-xl p-1.5 border border-[#111827]/15 shadow-sm flex items-center justify-center group-hover:scale-[1.03] transition-transform">
                <TemplateCanvasPreview
                  document={featuredTemplates[0].document}
                  slotImages={getSampleSlotImages(getSlotCount(featuredTemplates[0].document))}
                  scale={0.14}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </Link>

            {/* Slides 3..7: Feature Highlights with Visual Previews */}
            {[
              {
                href: "/photobox",
                badge: "Photobox & GIF",
                title: "Photobox + Boomerang GIF",
                desc:
                  locale === "id"
                    ? "Jepret beruntun dengan timer, tirai virtual AI, lalu ubah jadi strip GIF bergerak!"
                    : "Auto-shoot with timer, AI curtains, and turn shots into a moving Boomerang GIF!",
                bg: "bg-[#D2F159]",
                preview: (
                  <div className="shrink-0 w-[84px] h-[140px] rounded-xl bg-[#111827] p-1.5 flex flex-col gap-1 justify-between shadow-sm">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[7px] font-extrabold text-[#D2F159]">REC</span>
                      <span className="px-1 rounded bg-[#FF9EB5] text-[#111827] text-[7px] font-black">GIF</span>
                    </div>
                    <div className="flex-1 rounded bg-white/15 border border-white/20 flex items-center justify-center">
                      <Film className="w-4 h-4 text-[#D2F159]" />
                    </div>
                    <div className="flex-1 rounded bg-white/15 border border-white/20 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="text-[7px] font-bold text-center text-white/60">BOOMERANG</div>
                  </div>
                ),
              },
              {
                href: "/editor?import=1",
                badge: "Smart Import",
                title: locale === "id" ? "Impor Sekaligus & Crop" : "Batch Import & Crop",
                desc:
                  locale === "id"
                    ? "Pilih banyak foto sekaligus atau atur posisi & zoom ala Discord sebelum masuk bingkai."
                    : "Pick multiple photos at once or drag & zoom to center each photo before inserting.",
                bg: "bg-[#E0E7FF]",
                preview: (
                  <div className="shrink-0 w-[84px] h-[140px] rounded-xl bg-[#18191C] p-2 flex flex-col justify-between shadow-sm">
                    <span className="text-[7px] font-bold text-[#38D1BF]">CROP 1:1</span>
                    <div className="w-full aspect-square rounded-lg border-2 border-[#D2F159] bg-white/10 grid grid-cols-3 grid-rows-3 overflow-hidden">
                      <div className="border-r border-b border-white/20" />
                      <div className="border-r border-b border-white/20" />
                      <div className="border-b border-white/20" />
                      <div className="border-r border-b border-white/20" />
                      <div className="border-r border-b border-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D2F159]" />
                      </div>
                      <div className="border-b border-white/20" />
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="w-2/3 h-full bg-[#D2F159]" />
                    </div>
                  </div>
                ),
              },
              {
                href: "/templates",
                badge: `${BUILTIN_TEMPLATES.length}+ Frame`,
                title: locale === "id" ? "Template 4-Cut & 1:1" : "4-Cut & 1:1 Frames",
                desc:
                  locale === "id"
                    ? "Ratusan bingkai estetik mulai dari Korean 4-Cut, Polaroid, hingga tema spesial 1:1."
                    : "Hundreds of aesthetic frames from Korean 4-Cut and Polaroid to custom 1:1 themes.",
                bg: "bg-[#FFE4E6]",
                preview: (
                  <div className="shrink-0 w-[84px] h-[140px] bg-white rounded-xl p-1.5 border border-[#111827]/15 shadow-sm flex items-center justify-center">
                    <TemplateCanvasPreview
                      document={(featuredTemplates[1] ?? featuredTemplates[0]).document}
                      slotImages={getSampleSlotImages(getSlotCount((featuredTemplates[1] ?? featuredTemplates[0]).document))}
                      scale={0.13}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ),
              },
              {
                href: "/photobox",
                badge: "Retro FX",
                title: locale === "id" ? "Soft Glow, Grain & Date" : "Soft Glow, Grain & Date",
                desc:
                  locale === "id"
                    ? "Tambahkan efek Soft Glow, 35mm Film Grain, dan Date Stamp oranye ala kamera jadul."
                    : "Toggle Soft Glow, 35mm Film Grain, and retro orange camera Date Stamp on your shots.",
                bg: "bg-[#FEF3C7]",
                preview: (
                  <div className="shrink-0 w-[84px] h-[140px] rounded-xl bg-gradient-to-br from-amber-900 to-stone-900 p-2 flex flex-col justify-between shadow-sm border border-[#111827]/20">
                    <span className="text-[7px] font-bold text-amber-200/80">35MM</span>
                    <Sparkles className="w-6 h-6 text-amber-300/90 mx-auto" />
                    <span className="text-[9px] font-mono font-bold text-[#FF7A1A] text-right drop-shadow">
                      &apos;26 11 19
                    </span>
                  </div>
                ),
              },
              {
                href: "/gallery",
                badge: "Auto Sync",
                title: locale === "id" ? "Bagikan & Simpan Cloud" : "Direct Share & Cloud",
                desc:
                  locale === "id"
                    ? "Save Hasil langsung masuk Album & Linimasa, QR Code Cloud, atau bagikan ke WA/IG."
                    : "Auto-save to Album & Timeline, generate Cloud QR codes, or share directly.",
                bg: "bg-[#CBECE7]",
                preview: (
                  <div className="shrink-0 w-[84px] h-[140px] rounded-xl bg-white border border-[#111827]/15 p-2 flex flex-col items-center justify-between shadow-sm">
                    <Cloud className="w-5 h-5 text-[#0F766E]" />
                    <QrCode className="w-10 h-10 text-[#111827]" />
                    <span className="text-[7px] font-bold text-[#111827]/70 uppercase">QR SYNC</span>
                  </div>
                ),
              },
            ].map((feat) => (
              <Link
                key={feat.title}
                href={feat.href}
                className={`snap-start shrink-0 w-[90%] sm:w-full rounded-2xl ${feat.bg} p-4 sm:p-5 flex items-center justify-between gap-3.5 min-h-[188px] ps-sticky-card ps-scratch-surface active:scale-[0.98] transition-transform`}
              >
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/85 border border-[#111827] text-[10px] font-bold text-[#111827] uppercase tracking-wider">
                      {feat.badge}
                    </span>
                    <h3 className="text-[15px] font-extrabold text-[#111827] leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] font-medium text-[#111827]/80 leading-relaxed line-clamp-2">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111827]">
                    <span>{locale === "id" ? "Coba Sekarang" : "Try Now"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
                {feat.preview}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Copyright Footer */}
      <footer className="pt-4 border-t border-brand-border/70 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-brand-textMuted">
        <span className="font-semibold text-brand-text">
          © {new Date().getFullYear()} Jevallene by{" "}
          <span className="text-[#D9621F] font-bold">innssaan</span>
        </span>
        <span>
          {locale === "id"
            ? "Dibuat dengan ♥ oleh innssaan · Jevallene PhotoStudio"
            : "Crafted with ♥ by innssaan · Jevallene PhotoStudio"}
        </span>
      </footer>
    </div>
  );
}
