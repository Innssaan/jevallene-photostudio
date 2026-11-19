"use client";

import React from "react";
import { Lock, User } from "lucide-react";
import { openAuthModal } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

interface LockedFeatureCardProps {
  title: string;
  description?: string;
}

export function LockedFeatureCard({ title, description }: LockedFeatureCardProps) {
  const { locale } = useI18n();
  const isId = locale === "id";

  return (
    <div className="rounded-3xl bg-brand-surface p-8 sm:p-10 text-center space-y-4 nb-box max-w-xl mx-auto my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FFD166] text-[#111827] flex items-center justify-center mx-auto ps-sticky-tile ps-scratch-surface">
        <Lock className="w-6 h-6" strokeWidth={2.3} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9EB5] text-[#111827] text-[11px] font-bold ps-sticky-btn">
        <Lock className="w-3 h-3" />
        <span>
          {isId ? "Terbuka jika Anda sudah login" : "Unlocked once you sign in"}
        </span>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-brand-text">{title}</h2>
        <p className="text-xs sm:text-sm text-brand-textMuted max-w-md mx-auto leading-relaxed">
          {description ||
            (isId
              ? "Fitur ini terkunci saat belum login. Silakan masuk atau daftar akun terlebih dahulu untuk membuka dan menyinkronkan data Anda."
              : "This feature is locked while signed out. Please sign in or create an account to unlock and sync your data.")}
        </p>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={() => openAuthModal()}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold ps-sticky-btn"
        >
          <User className="w-4 h-4" strokeWidth={2.25} />
          <span>{isId ? "Login / Sign Up Sekarang" : "Login / Sign Up Now"}</span>
        </button>
      </div>
    </div>
  );
}
