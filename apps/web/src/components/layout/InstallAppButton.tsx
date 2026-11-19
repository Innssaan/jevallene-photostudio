"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Download, Globe, Share, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppButtonProps {
  locale: string;
  compact?: boolean;
  variant?: "default" | "card" | "banner";
}

export function InstallAppButton({
  locale,
  compact = false,
  variant = "default",
}: InstallAppButtonProps) {
  const isId = locale === "id";
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isHidden, setIsHidden] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [webFallbackNotice, setWebFallbackNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent || "";
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    const isNative =
      ua.includes("JevalleneAndroidApp") ||
      cap?.isNativePlatform?.() === true ||
      new URLSearchParams(window.location.search).get("app") === "android";

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsHidden(standalone || isNative);
    setIsIos(/iphone|ipad|ipod/i.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsHidden(true);
      setInstallModalOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isHidden) return null;

  const handleInstallWeb = async () => {
    setWebFallbackNotice(null);
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        setInstallModalOpen(false);
      }
      return;
    }
    if (isIos) {
      setInstallModalOpen(false);
      setIosGuideOpen(true);
      return;
    }
    setWebFallbackNotice(
      isId
        ? "Buka menu browser (⋮ di Chrome/Edge) lalu pilih \"Tambahkan ke Layar Utama\" / \"Install App\"."
        : "Open your browser menu (⋮ in Chrome/Edge) and select \"Add to Home Screen\" / \"Install App\"."
    );
  };

  return (
    <>
      {variant === "banner" ? (
        <button
          type="button"
          onClick={() => {
            setWebFallbackNotice(null);
            setInstallModalOpen(true);
          }}
          className="group w-full text-left rounded-2xl bg-brand-surface border border-brand-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ps-sticky-card ps-scratch-surface hover:-translate-y-0.5 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#0B0B0E] border border-brand-borderStrong flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform">
              <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
                <rect width="64" height="64" rx="32" fill="#0B0B0E" />
                <circle cx="32" cy="32" r="26" stroke="#E5142A" strokeWidth="3" strokeDasharray="130 34" />
                <path
                  d="M 36.5 18 C 36.5 24 36.5 31 36.5 37.5 C 36.5 42.5 32.5 46.5 27.5 46.5 C 23.8 46.5 20.8 44.3 19.6 41"
                  stroke="#FAFAFA"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx="36.5" cy="18" r="2.8" fill="#E5142A" />
              </svg>
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFD166] border border-[#111827] text-[10px] font-extrabold text-[#111827] uppercase tracking-wider">
                  <Smartphone className="w-3 h-3 shrink-0" />
                  <span>Web & .APK</span>
                </span>
                <span className="text-[11px] font-bold text-brand-accent">
                  {isId ? "Gratis • Quick Action" : "Free • Quick Action"}
                </span>
              </div>
              <h3 className="text-sm sm:text-[15px] font-extrabold text-brand-text leading-snug">
                Install Jevallene PhotoStudio App
              </h3>
              <p className="text-xs text-brand-textMuted leading-relaxed line-clamp-2">
                {isId
                  ? "Pakai versi Web (PWA) atau download .APK Android asli dengan navigasi cepat & tanpa browser bar."
                  : "Use Web (PWA) or download native Android .APK with quick navigation & full-screen studio."}
              </p>
            </div>
          </div>

          <div className="shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#D2F159] text-[#111827] text-xs font-extrabold border border-[#111827] shadow-sm group-hover:bg-[#C3E544] transition-colors self-start sm:self-center">
            <Download className="w-4 h-4 shrink-0" />
            <span>{isId ? "Install Sekarang" : "Install Now"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      ) : variant === "card" ? (
        <button
          type="button"
          onClick={() => {
            setWebFallbackNotice(null);
            setInstallModalOpen(true);
          }}
          className="snap-start shrink-0 w-[90%] sm:w-full text-left rounded-2xl bg-[#FFD166] p-4 sm:p-5 flex items-center justify-between gap-3.5 min-h-[188px] ps-sticky-card ps-scratch-surface active:scale-[0.98] transition-transform"
        >
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/85 border border-[#111827] text-[10px] font-bold text-[#111827] uppercase tracking-wider">
                <Smartphone className="w-3 h-3 shrink-0" />
                <span>Web & .APK</span>
              </span>
              <h3 className="text-[15px] font-extrabold text-[#111827] leading-snug">
                Install Jevallene PhotoStudio App
              </h3>
              <p className="text-[11px] font-medium text-[#111827]/80 leading-relaxed line-clamp-2">
                {isId
                  ? "Pilih versi Web (PWA) atau Aplikasi Android (.APK asli) dengan Quick Action!"
                  : "Choose Web (PWA) or native Android (.APK) with Quick Action Bar!"}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-[12px] font-bold text-[#111827]">
              <Download className="w-3.5 h-3.5" />
              <span>{isId ? "Pilih Versi Install" : "Install Now"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mini Phone App Preview */}
          <div className="shrink-0 w-[84px] h-[140px] rounded-2xl bg-[#0B0B0E] border-2 border-[#111827] p-1.5 flex flex-col items-center justify-between shadow-md">
            <div className="w-8 h-1 rounded-full bg-white/20 mt-0.5" />
            <div className="flex flex-col items-center gap-1">
              <svg viewBox="0 0 64 64" fill="none" className="w-10 h-10">
                <rect width="64" height="64" rx="32" fill="#141922" />
                <circle cx="32" cy="32" r="26" stroke="#E5142A" strokeWidth="3" strokeDasharray="130 34" />
                <path
                  d="M 36.5 18 C 36.5 24 36.5 31 36.5 37.5 C 36.5 42.5 32.5 46.5 27.5 46.5 C 23.8 46.5 20.8 44.3 19.6 41"
                  stroke="#FAFAFA"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <circle cx="36.5" cy="18" r="2.8" fill="#E5142A" />
              </svg>
              <span className="text-[8px] font-extrabold text-white tracking-wide">JEVALLENE</span>
            </div>
            <div className="w-full h-4 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#D2F159]" />
            </div>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setWebFallbackNotice(null);
            setInstallModalOpen(true);
          }}
          className={
            compact
              ? "inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#D2F159] text-[#111827] text-xs font-bold hover:bg-[#C3E544] ps-sticky-btn"
              : "w-full inline-flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-[#D2F159] text-[#111827] text-xs font-bold hover:bg-[#C3E544] ps-sticky-btn"
          }
          title={isId ? "Install Aplikasi (Web / .APK)" : "Install App (Web / .APK)"}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>{isId ? "Install App" : "Install App"}</span>
        </button>
      )}

      {/* 2-Option Install Modal: Web (PWA) vs Native Android (.APK) */}
      {installModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setInstallModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-brand-surface border border-brand-border p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-accent" />
                <div>
                  <h3 className="font-display text-sm font-bold text-brand-text">
                    Install Jevallene PhotoStudio App
                  </h3>
                  <p className="text-[11px] text-brand-textMuted">
                    {isId
                      ? "Pilih versi pemasangan yang paling nyaman untuk perangkatmu"
                      : "Choose how you want to install Jevallene on your device"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInstallModalOpen(false)}
                className="p-1.5 rounded-lg text-brand-textMuted hover:bg-brand-surfaceMuted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Web (PWA) */}
              <button
                type="button"
                onClick={() => void handleInstallWeb()}
                className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl bg-[#CBECE7] border border-[#111827] shadow-[2px_2px_0_#111827] hover:brightness-95 active:scale-[0.98] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-[#111827] flex items-center justify-center shrink-0 text-[#111827]">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-[#111827]">
                    {isId ? "1. Install Versi Web (PWA)" : "1. Install Web App (PWA)"}
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 leading-snug mt-0.5">
                    {isId
                      ? "Ringan tanpa unduh file, cocok untuk Android, iPhone (Safari), & Desktop."
                      : "Lightweight browser install, works on Android, iPhone (Safari), & Desktop."}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#111827] shrink-0" />
              </button>

              {/* Option 2: Native Android (.APK) */}
              <a
                href="/downloads/jevallene-photostudio.apk"
                download="Jevallene-PhotoStudio.apk"
                onClick={() => setInstallModalOpen(false)}
                className="w-full text-left flex items-center gap-3 p-3.5 rounded-2xl bg-[#D2F159] border border-[#111827] shadow-[2px_2px_0_#111827] hover:brightness-95 active:scale-[0.98] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#111827] flex items-center justify-center shrink-0 text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#111827]">
                      {isId ? "2. Download Aplikasi Android (.APK)" : "2. Download Android App (.APK)"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white text-[9px] font-bold text-[#111827] border border-[#111827]">
                      Native
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#111827]/75 leading-snug mt-0.5">
                    {isId
                      ? "Aplikasi Android asli dengan Floating Pill Navbar & Quick Action Bar."
                      : "Native Android app with Floating Pill Navbar & Quick Action Bar."}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#111827] shrink-0" />
              </a>
            </div>

            {webFallbackNotice && (
              <p className="text-[11px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
                {webFallbackNotice}
              </p>
            )}
          </div>
        </div>
      )}

      {/* iOS Safari Add to Home Screen Guide */}
      {iosGuideOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setIosGuideOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-brand-surface border border-brand-border p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-accent" />
                <h3 className="font-display text-sm font-bold text-brand-text">
                  {isId ? "Tambahkan ke Layar Utama (iPhone/iPad)" : "Add to Home Screen (iOS)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIosGuideOpen(false)}
                className="p-1.5 rounded-lg text-brand-textMuted hover:bg-brand-surfaceMuted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-2.5 text-xs text-brand-textMuted">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D2F159] text-[#111827] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  {isId ? (
                    <>
                      Ketuk ikon <strong>Bagikan (Share)</strong>{" "}
                      <Share className="inline w-3.5 h-3.5 text-brand-accent" /> di bar bawah Safari.
                    </>
                  ) : (
                    <>
                      Tap the <strong>Share</strong> icon{" "}
                      <Share className="inline w-3.5 h-3.5 text-brand-accent" /> in Safari&apos;s toolbar.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#38D1BF] text-[#111827] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  {isId ? (
                    <>
                      Pilih <strong>&ldquo;Tambahkan ke Layar Utama&rdquo;</strong> (Add to Home Screen), lalu ketuk <strong>Tambah</strong>.
                    </>
                  ) : (
                    <>
                      Select <strong>&ldquo;Add to Home Screen&rdquo;</strong>, then tap <strong>Add</strong>.
                    </>
                  )}
                </span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setIosGuideOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#111827] text-white text-xs font-bold"
            >
              {isId ? "Mengerti" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
