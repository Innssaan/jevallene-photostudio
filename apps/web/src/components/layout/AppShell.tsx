"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Heart,
  Home,
  Info,
  Lock,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { MobileAppNav } from "@/components/layout/MobileAppNav";
import { SplashScreen } from "@/components/layout/SplashScreen";
import {
  EditorSparkleIcon,
  GalleryFanIcon,
  Insta360LensIcon,
  PhotoboothFlashIcon,
  TemplatesStackIcon,
  TimelineClockIcon,
} from "@/components/icons/AnimatedStudioIcons";
import { OPEN_AUTH_MODAL_EVENT, useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useIsNativeApp } from "@/lib/native-app";
import { useTheme } from "@/lib/theme";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isNativeApp = useIsNativeApp();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    const onOpenAuth = () => setAuthModalOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_AUTH_MODAL_EVENT, onOpenAuth);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // ignore sw registration errors
      });
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_AUTH_MODAL_EVENT, onOpenAuth);
    };
  }, []);

  const primaryNav = [
    { href: "/", label: t.nav.home, icon: Home, tileBg: "var(--ps-tile-home)", isCustom: false, requiresAuth: false },
    { href: "/templates", label: t.nav.templates, icon: TemplatesStackIcon, tileBg: "var(--ps-tile-templates)", isCustom: true, requiresAuth: false },
    { href: "/editor", label: t.nav.editor, icon: EditorSparkleIcon, tileBg: "var(--ps-tile-editor)", isCustom: true, requiresAuth: false },
    { href: "/photobox", label: t.nav.photobox, icon: PhotoboothFlashIcon, tileBg: "var(--ps-tile-photobooth)", isCustom: true, requiresAuth: false },
    { href: "/camera", label: locale === "id" ? "Kamera Eksternal" : "External Camera", icon: Camera, tileBg: "#FFD166", isCustom: false, requiresAuth: false },
    { href: "/editor?import=1", label: t.home.importPhoto, icon: Insta360LensIcon, tileBg: "var(--ps-tile-insta360)", isCustom: true, requiresAuth: false },
    { href: "/gallery", label: t.nav.gallery, icon: GalleryFanIcon, tileBg: "var(--ps-tile-gallery)", isCustom: true, requiresAuth: true },
    { href: "/timeline", label: t.nav.timeline, icon: TimelineClockIcon, tileBg: "var(--ps-tile-timeline)", isCustom: true, requiresAuth: true },
    { href: "/favorites", label: t.nav.favorites, icon: Heart, tileBg: "var(--ps-tile-favorites)", isCustom: false, requiresAuth: true },
    { href: "/about", label: "About", icon: Info, tileBg: "var(--ps-tile-home)", isCustom: false, requiresAuth: false },
  ];

  return (
    <div className={`min-h-screen bg-brand-bg text-brand-text ${isNativeApp ? "ps-native-app" : ""}`}>
      <SplashScreen />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed 240px Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 transition-transform duration-300 ease-out bg-brand-surface border-r border-brand-border flex flex-col px-3.5 py-4 overflow-y-auto overflow-x-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand Row */}
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-2.5 min-w-0"
          >
            <svg
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
              className="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-110"
            >
              <rect width="64" height="64" rx="32" fill="#0B0B0E" />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#E5142A"
                strokeWidth="2.5"
                strokeOpacity="0.85"
                strokeDasharray="140 36"
                className="origin-center animate-[spin_10s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]"
              />
              <path
                d="M 36.5 18 C 36.5 24 36.5 31 36.5 37.5 C 36.5 42.5 32.5 46.5 27.5 46.5 C 23.8 46.5 20.8 44.3 19.6 41"
                stroke="#FAFAFA"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-jevallene-morph"
              />
              <circle
                cx="36.5"
                cy="18"
                r="2.6"
                fill="#E5142A"
                className="origin-[36.5px_18px] animate-jevallene-dot"
              />
            </svg>
            <span className="text-[14px] font-semibold tracking-[-0.01em] leading-tight truncate">
              Jevallene PhotoStudio
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-brand-textMuted hover:bg-brand-surfaceMuted hover:text-brand-text transition-colors"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Primary Nav */}
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 h-10 px-2.5 rounded-xl text-sm border transition-colors ${active
                    ? "bg-brand-surfaceMuted text-brand-text font-semibold border-brand-border"
                    : "border-transparent text-brand-textMuted font-medium hover:bg-brand-surfaceMuted hover:text-brand-text"
                  }`}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[#111827] ps-sticky-tile ps-scratch-surface"
                  style={{ backgroundColor: item.tileBg }}
                >
                  {item.isCustom ? (
                    (() => {
                      const CustomIcon = item.icon as React.ComponentType<{ className?: string; accent?: string }>;
                      return <CustomIcon className="w-4 h-4" accent="#FFFFFF" />;
                    })()
                  ) : (
                    (() => {
                      const LucideIcon = item.icon as React.ComponentType<{ className?: string; strokeWidth?: number }>;
                      return <LucideIcon className="w-4 h-4" strokeWidth={2.2} />;
                    })()
                  )}
                </span>
                <span className="truncate">{item.label}</span>
                {item.requiresAuth && !user && (
                  <Lock
                    className="w-3.5 h-3.5 ml-auto text-brand-textMuted shrink-0"
                    aria-label={locale === "id" ? "Terbuka jika Anda sudah login" : "Unlocked once you sign in"}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-4 h-px bg-brand-border" />

        {/* Utility Nav */}
        <nav aria-label="Utility" className="flex flex-col gap-1">
          <Link
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            onClick={() => setSidebarOpen(false)}
            className={`group flex items-center gap-3 h-10 px-2.5 rounded-xl text-sm border transition-colors ${pathname === "/settings"
                ? "bg-brand-surfaceMuted text-brand-text font-semibold border-brand-border"
                : "border-transparent text-brand-textMuted font-medium hover:bg-brand-surfaceMuted hover:text-brand-text"
              }`}
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[#111827] ps-sticky-tile ps-scratch-surface"
              style={{ backgroundColor: "var(--ps-tile-settings)" }}
            >
              <Settings className="w-4 h-4" strokeWidth={2.2} />
            </span>
            <span>{t.nav.settings}</span>
          </Link>
        </nav>

        {/* Bottom Social Links & Copyright */}
        <div className="mt-auto pt-5 space-y-3">
          <div className="flex items-center justify-center gap-3.5">
            {/* GitHub */}
            <a
              href="https://github.com/Innssaan"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="w-6 h-6 flex items-center justify-center transition-transform duration-200 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                  fill="currentColor"
                  className="text-brand-text"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/innssaan_/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
              className="w-6 h-6 flex items-center justify-center transition-transform duration-200 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <defs>
                  <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="5%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
                <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3.8" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="3.2" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
                <circle cx="16.1" cy="7.9" r="1" fill="#FFFFFF" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@sannveerse"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              title="TikTok"
              className="w-6 h-6 flex items-center justify-center transition-transform duration-200 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path
                  fill="#25F4EE"
                  d="M18.9 6.2a4.6 4.6 0 0 1-3.6-4h-3.3v13.1a2.75 2.75 0 1 1-2-2.64V9.3a6.05 6.05 0 1 0 5.3 6V8.15a7.8 7.8 0 0 0 4.5 1.44V6.3c-.3 0-.6-.04-.9-.1Z"
                />
                <path
                  fill="#FE2C55"
                  d="M19.8 7a4.6 4.6 0 0 1-3.6-4h-3.3v13.1a2.75 2.75 0 1 1-2-2.64v-3.36a6.05 6.05 0 1 0 5.3 6V8.95a7.8 7.8 0 0 0 4.5 1.44V7.1c-.3 0-.6-.04-.9-.1Z"
                />
                <path
                  fill="currentColor"
                  className="text-brand-text"
                  d="M19.35 6.6a4.6 4.6 0 0 1-3.6-4h-3.3v13.1a2.75 2.75 0 1 1-2-2.64V9.7a6.05 6.05 0 1 0 5.3 6V8.55a7.8 7.8 0 0 0 4.5 1.44V6.7c-.3 0-.6-.04-.9-.1Z"
                />
              </svg>
            </a>

            {/* Spotify */}
            <a
              href="https://open.spotify.com/user/Innssaan_"
              target="_blank"
              rel="noreferrer"
              aria-label="Spotify"
              title="Spotify"
              className="w-6 h-6 flex items-center justify-center transition-transform duration-200 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" fill="#1ED760" />
                <path
                  fill="#0B0F1A"
                  d="M16.58 16.42a.62.62 0 0 1-.86.21c-2.35-1.44-5.31-1.76-8.79-.97a.62.62 0 1 1-.28-1.22c3.81-.87 7.08-.5 9.72 1.12.29.18.38.57.21.86Zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.57 11.23 1.33.37.23.48.7.26 1.07Zm.1-2.83c-3.23-1.92-8.55-2.09-11.63-1.16a.94.94 0 1 1-.54-1.79c3.54-1.07 9.42-.87 13.13 1.33a.94.94 0 0 1-.96 1.62Z"
                />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="https://discord.gg/yQnaVA475"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              title="Discord"
              className="w-6 h-6 flex items-center justify-center transition-transform duration-200 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
              </svg>
            </a>
          </div>
          <p className="text-[11px] font-semibold text-brand-textMuted text-center">
            ©Jevallene by Innssaan
          </p>
        </div>
      </aside>

      {/* Main Column */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        {/* Sticky Top Bar (solid surface so scrolled content never bleeds through) */}
        <header
          className={`sticky top-0 z-40 bg-brand-bg border-b border-brand-border pt-[env(safe-area-inset-top)] ${
            isNativeApp ? "" : ""
          }`}
        >
          <div
            className={`flex items-center justify-between gap-2 max-w-6xl mx-auto ${
              isNativeApp ? "h-12 px-3" : "h-[64px] px-4 sm:px-6 lg:px-8 gap-3"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {isNativeApp ? (
                <>
                  {pathname !== "/" ? (
                    <button
                      type="button"
                      aria-label={locale === "id" ? "Kembali" : "Back"}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.history.length > 1) {
                          router.back();
                        } else {
                          router.push("/");
                        }
                      }}
                      className="group h-8 px-2.5 rounded-full bg-brand-surface border border-brand-border flex items-center gap-1.5 text-brand-text hover:bg-brand-surfaceMuted ps-sticky-btn shrink-0 active:scale-95 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.4} />
                      <span className="text-[11px] font-bold">
                        {locale === "id" ? "Kembali" : "Back"}
                      </span>
                    </button>
                  ) : null}
                  <Link href="/" className="flex items-center gap-2 min-w-0">
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      aria-hidden="true"
                      className="w-7 h-7 shrink-0"
                    >
                      <rect width="64" height="64" rx="32" fill="#0B0B0E" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#E5142A"
                        strokeWidth="2.8"
                        strokeDasharray="140 36"
                      />
                      <path
                        d="M 36.5 18 C 36.5 24 36.5 31 36.5 37.5 C 36.5 42.5 32.5 46.5 27.5 46.5 C 23.8 46.5 20.8 44.3 19.6 41"
                        stroke="#FAFAFA"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="36.5" cy="18" r="2.6" fill="#E5142A" />
                    </svg>
                    <span className="text-sm font-extrabold tracking-tight text-brand-text truncate">
                      Jevallene PhotoStudio App
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text hover:bg-brand-surfaceMuted ps-sticky-btn shrink-0"
                  >
                    <Menu className="w-5 h-5" strokeWidth={2.25} />
                  </button>
                  {pathname !== "/" && (
                    <button
                      type="button"
                      aria-label={locale === "id" ? "Kembali" : "Back"}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.history.length > 1) {
                          router.back();
                        } else {
                          router.push("/");
                        }
                      }}
                      className="group h-9 px-3 rounded-full bg-brand-surface flex items-center gap-1.5 text-brand-text hover:bg-brand-surfaceMuted ps-sticky-btn shrink-0 active:scale-95 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={2.3} />
                      <span className="hidden sm:inline text-xs font-bold">
                        {locale === "id" ? "Kembali" : "Back"}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right Cluster */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
              {!isNativeApp && (
                <>
                  <button
                    type="button"
                    onClick={() => setLocale(locale === "id" ? "en" : "id")}
                    className="h-9 px-2.5 sm:px-3.5 rounded-full bg-[#FFD166] text-xs font-bold text-[#111827] hover:bg-[#F7C348] ps-sticky-btn"
                  >
                    {locale.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle color theme"
                    aria-pressed={theme === "dark"}
                    className="group w-9 h-9 rounded-full bg-[#A0B0E8] flex items-center justify-center text-[#111827] hover:bg-[#8FA2E3] ps-sticky-btn"
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" strokeWidth={2.25} />
                    ) : (
                      <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" strokeWidth={2.25} />
                    )}
                  </button>
                </>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (user) {
                      setProfileMenuOpen((o) => !o);
                    } else {
                      setAuthModalOpen(true);
                    }
                  }}
                  title={user ? user.name || user.email || "Profile" : locale === "id" ? "Masuk / Daftar" : "Sign In / Sign Up"}
                  aria-label={user ? "Account menu" : "Login / Sign Up"}
                  className={`rounded-full bg-[#38D1BF] flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#111827] overflow-hidden ps-sticky-btn ${
                    isNativeApp ? "h-8" : "h-9"
                  } ${user ? "pl-1 pr-2.5 sm:pr-3.5" : "px-2.5 sm:px-3.5 whitespace-nowrap"}`}
                >
                  {user ? (
                    <>
                      <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-[#111827]/10 flex items-center justify-center border border-[#111827]/30">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={user.name || "Google Avatar"}
                            width={28}
                            height={28}
                            unoptimized
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(user.name || user.email || "U").slice(0, 2).toUpperCase()}</span>
                        )}
                      </span>
                      <span className="max-w-[96px] sm:max-w-[150px] truncate">
                        {user.name || user.email?.split("@")[0] || "User"}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 shrink-0" strokeWidth={2.25} />
                      <span>Login / Sign Up</span>
                    </>
                  )}
                </button>

                {user && profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-brand-border bg-brand-surface p-3 shadow-lg z-50 space-y-2.5">
                    <div className="px-1">
                      <div className="text-sm font-semibold truncate">{user.name || "User"}</div>
                      {user.email && (
                        <div className="text-xs text-brand-textMuted truncate">{user.email}</div>
                      )}
                    </div>
                    <div className="h-px bg-brand-border" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        void signOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-brand-textMuted hover:bg-brand-surfaceMuted hover:text-brand-text transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{locale === "id" ? "Keluar" : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className={`ps-page-enter max-w-6xl w-full mx-auto flex-1 overflow-x-clip ${
            isNativeApp
              ? "px-3 pt-3 pb-24"
              : "px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-16"
          }`}
        >
          {children}
        </main>

        {/* Mobile App Floating Pill Bottom Navbar + Center Quick Action (in .apk) */}
        {isNativeApp && <MobileAppNav locale={locale} />}

        {/* Mobile & Tablet Floating Quick Photobooth Camera Button (Web Home only) */}
        {!isNativeApp && pathname === "/" && (
          <Link
            href="/photobox"
            aria-label={locale === "id" ? "Buka Kamera Photobooth" : "Open Photobooth Camera"}
            className="lg:hidden fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#D2F159] text-[#111827] text-xs font-extrabold ps-sticky-btn"
          >
            <Camera className="w-4 h-4 shrink-0" strokeWidth={2.4} />
            <span>{locale === "id" ? "Quick Photobooth" : "Quick Photobooth"}</span>
          </Link>
        )}
      </div>

      <AuthModal
        open={authModalOpen}
        locale={locale}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
