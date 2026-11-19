"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  Languages,
  LogIn,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { openAuthModal, useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  clearAllLocalData,
  getFavoriteTemplateIds,
  getLocalProjects,
  getLocalTimeline,
} from "@/lib/local-store";
import { useTheme } from "@/lib/theme";

function resizeAvatarToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function SettingsPage() {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { user, localProfile, updateProfile, signOut } = useAuth();
  const isId = locale === "id";

  const [counts, setCounts] = useState({ projects: 0, favorites: 0, timeline: 0 });
  const [cleared, setCleared] = useState(false);

  const [nameDraft, setNameDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshCounts = () => {
    setCounts({
      projects: getLocalProjects().length,
      favorites: getFavoriteTemplateIds().length,
      timeline: getLocalTimeline().length,
    });
  };

  useEffect(() => {
    refreshCounts();
  }, []);

  useEffect(() => {
    const initialName = user?.name || localProfile.name || "";
    const initialAvatar = user?.avatarUrl || localProfile.avatarUrl || null;
    setNameDraft(initialName);
    setAvatarDraft(initialAvatar);
  }, [user, localProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeAvatarToDataUrl(file);
      setAvatarDraft(dataUrl);
      await updateProfile({ avatarUrl: dataUrl });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      // ignore invalid image
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: nameDraft.trim() || null,
        avatarUrl: avatarDraft,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2200);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClear = () => {
    clearAllLocalData();
    refreshCounts();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const displayInitial = (nameDraft.trim() || user?.email || "J")[0]?.toUpperCase() || "J";

  return (
    <div className="space-y-5 max-w-3xl mx-auto pt-2 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-text">
          {isId ? "Profil & Pengaturan" : "Profile & Settings"}
        </h1>
        <p className="text-xs sm:text-sm text-brand-textMuted mt-1">
          {isId
            ? "Edit nama & avatar profil, atur tema Dark/Light, bahasa, dan penyimpanan."
            : "Edit your profile name & avatar, Dark/Light theme, language, and storage."}
        </p>
      </div>

      {/* Profile Editor Card */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 space-y-4 ps-sticky-card"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
            <User className="w-4 h-4 text-brand-accent" />
            <span>{isId ? "Profil Saya" : "My Profile"}</span>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-surfaceMuted text-brand-textMuted hover:text-red-500 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isId ? "Keluar" : "Sign Out"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isId ? "Masuk / Daftar" : "Sign In"}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar + Camera Upload Trigger */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-brand-accent text-brand-onAccent flex items-center justify-center text-xl font-extrabold overflow-hidden border-2 border-brand-borderStrong shadow-sm">
                {avatarDraft ? (
                  <Image
                    src={avatarDraft}
                    alt={nameDraft || "Avatar"}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayInitial
                )}
              </div>
              <button
                type="button"
                aria-label={isId ? "Ganti foto profil" : "Change avatar"}
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-surface border border-brand-borderStrong text-brand-text flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-transform"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1 sm:hidden">
              <div className="text-xs font-bold text-brand-text">
                {nameDraft.trim() || (isId ? "Pengguna Jevallene" : "Jevallene User")}
              </div>
              {user?.email && (
                <div className="text-[11px] text-brand-textMuted truncate max-w-[180px]">
                  {user.email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-brand-accent hover:underline"
                >
                  {isId ? "Ganti Avatar" : "Change Avatar"}
                </button>
                {avatarDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarDraft(null);
                      void updateProfile({ avatarUrl: null });
                    }}
                    className="text-[11px] font-semibold text-brand-textMuted hover:text-red-500"
                  >
                    {isId ? "Hapus" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Input + Save Button */}
          <div className="flex-1 min-w-0 space-y-2">
            <label htmlFor="profile-name-input" className="block text-xs font-semibold text-brand-textMuted">
              {isId ? "Nama Tampilan" : "Display Name"}
              {user?.email ? ` • ${user.email}` : ""}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="profile-name-input"
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder={isId ? "Masukkan nama kamu..." : "Enter your name..."}
                maxLength={40}
                className="flex-1 h-10 px-3.5 rounded-xl border border-brand-border bg-brand-bg text-sm text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-brand-accent transition-colors"
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="h-10 px-5 rounded-full bg-brand-accent text-brand-onAccent text-xs font-extrabold inline-flex items-center justify-center gap-1.5 ps-sticky-btn shrink-0 disabled:opacity-60"
              >
                {profileSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isId ? "Tersimpan!" : "Saved!"}</span>
                  </>
                ) : (
                  <span>{isId ? "Simpan Profil" : "Save Profile"}</span>
                )}
              </button>
            </div>
            {avatarDraft && (
              <div className="hidden sm:flex items-center gap-3 pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-brand-accent hover:underline"
                >
                  {isId ? "Ganti Foto Avatar" : "Change Avatar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarDraft(null);
                    void updateProfile({ avatarUrl: null });
                  }}
                  className="text-[11px] font-semibold text-brand-textMuted hover:text-red-500"
                >
                  {isId ? "Hapus Avatar" : "Remove Avatar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Language & Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 space-y-3 ps-sticky-card">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
            <Languages className="w-4 h-4 text-brand-accent" />
            <span>{t.settings.languageTitle}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { code: "id", label: "Indonesia" },
                { code: "en", label: "English" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLocale(lang.code)}
                className={`h-10 px-4 rounded-full border text-xs font-bold transition-all ${
                  locale === lang.code
                    ? "bg-brand-accent text-brand-onAccent border-brand-accent"
                    : "border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 space-y-3 ps-sticky-card">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
            {theme === "light" ? (
              <Sun className="w-4 h-4 text-brand-accent" />
            ) : (
              <Moon className="w-4 h-4 text-brand-accent" />
            )}
            <span>{t.settings.themeTitle}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (theme !== "dark") toggleTheme();
              }}
              className={`h-10 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                theme === "dark"
                  ? "bg-brand-accent text-brand-onAccent border-brand-accent"
                  : "border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t.settings.themeDark}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (theme !== "light") toggleTheme();
              }}
              className={`h-10 px-3 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                theme === "light"
                  ? "bg-brand-accent text-brand-onAccent border-brand-accent"
                  : "border-brand-border bg-brand-bg text-brand-textMuted hover:text-brand-text"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t.settings.themeLight}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local Storage */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 space-y-4 ps-sticky-card">
        <div>
          <h2 className="text-sm font-bold text-brand-text">{t.settings.storageTitle}</h2>
          <p className="text-xs text-brand-textMuted mt-0.5">{t.settings.storageDesc}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-brand-surfaceMuted p-3">
            <div className="text-lg font-bold text-brand-text">{counts.projects}</div>
            <div className="text-[11px] text-brand-textMuted">{t.settings.projectsCount}</div>
          </div>
          <div className="rounded-xl bg-brand-surfaceMuted p-3">
            <div className="text-lg font-bold text-brand-text">{counts.favorites}</div>
            <div className="text-[11px] text-brand-textMuted">{t.settings.favoritesCount}</div>
          </div>
          <div className="rounded-xl bg-brand-surfaceMuted p-3">
            <div className="text-lg font-bold text-brand-text">{counts.timeline}</div>
            <div className="text-[11px] text-brand-textMuted">{t.settings.timelineCount}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full border border-brand-border text-xs font-semibold hover:border-red-500 hover:text-red-500 transition-colors"
        >
          {cleared ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">{t.settings.clearedNotice}</span>
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.settings.clearData}</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy & Watermark */}
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-5 flex items-start gap-3 ps-sticky-card">
        <div className="w-9 h-9 rounded-full bg-brand-surfaceMuted text-brand-accent flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-brand-text">{t.settings.privacyTitle}</h2>
          <p className="text-xs text-brand-textMuted mt-1 leading-relaxed">
            {t.settings.privacyDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
