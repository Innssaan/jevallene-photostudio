"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface AuthModalProps {
  open: boolean;
  locale: "id" | "en";
  onClose: () => void;
}

export function AuthModal({ open, locale, onClose }: AuthModalProps) {
  const { isSupabaseConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleGoogle = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await signInWithGoogle();
    if (res.error) setErrorMsg(res.error);
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    if (mode === "signin") {
      const res = await signInWithEmail(email, password);
      if (res.error) setErrorMsg(res.error);
      else onClose();
    } else {
      const res = await signUpWithEmail(email, password, name.trim() || undefined);
      if (res.error) setErrorMsg(res.error);
      else if (res.message) setInfoMsg(res.message);
    }

    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-brand-surface border border-brand-border rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-brand-surfaceMuted text-brand-textMuted"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h2 className="text-xl font-semibold">
            {mode === "signin"
              ? locale === "id"
                ? "Masuk ke Akun (Opsional)"
                : "Sign In (Optional)"
              : locale === "id"
                ? "Daftar Akun Baru"
                : "Create Account"}
          </h2>
          <p className="text-xs text-brand-textMuted mt-1">
            {locale === "id"
              ? "Anda tetap bisa memakai seluruh fitur secara gratis tanpa login."
              : "You can continue using all studio features freely in Guest Mode."}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-xl border border-brand-border bg-brand-surfaceMuted p-3 text-xs text-brand-textMuted leading-relaxed">
            {locale === "id"
              ? "Login Google/Email memerlukan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di apps/web/.env.local."
              : "Google/Email sign-in requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local."}
          </div>
        )}

        {/* Continue with Google */}
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleGoogle()}
          className="w-full h-11 px-4 rounded-full border border-brand-border bg-brand-surface hover:bg-brand-surfaceMuted flex items-center justify-center gap-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{locale === "id" ? "Lanjutkan dengan Google" : "Continue with Google"}</span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-brand-textMuted">
          <div className="flex-1 h-px bg-brand-border" />
          <span>{locale === "id" ? "atau" : "or"}</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={locale === "id" ? "Nama lengkap" : "Full name"}
              className="w-full h-10 px-4 rounded-full border border-brand-border bg-brand-bg text-sm focus:outline-none focus:border-brand-accent"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-10 px-4 rounded-full border border-brand-border bg-brand-bg text-sm focus:outline-none focus:border-brand-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={locale === "id" ? "Kata sandi (min. 6 karakter)" : "Password (min. 6 chars)"}
            className="w-full h-10 px-4 rounded-full border border-brand-border bg-brand-bg text-sm focus:outline-none focus:border-brand-accent"
          />

          {errorMsg && <p className="text-xs text-red-500 px-1">{errorMsg}</p>}
          {infoMsg && <p className="text-xs text-emerald-600 px-1">{infoMsg}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-full bg-brand-accent text-brand-onAccent text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {mode === "signin"
              ? locale === "id"
                ? "Masuk"
                : "Sign In"
              : locale === "id"
                ? "Daftar"
                : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-xs text-brand-textMuted">
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className="hover:text-brand-text underline underline-offset-2"
            >
              {locale === "id" ? "Belum punya akun? Daftar" : "Need an account? Sign Up"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg(null);
              }}
              className="hover:text-brand-text underline underline-offset-2"
            >
              {locale === "id" ? "Sudah punya akun? Masuk" : "Already have an account? Sign In"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
