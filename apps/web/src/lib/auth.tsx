"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { clearAllLocalData } from "./local-store";

export const OPEN_AUTH_MODAL_EVENT = "ps-open-auth-modal";

export function openAuthModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_AUTH_MODAL_EVENT));
  }
}

export interface AuthUserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

const LOCAL_PROFILE_KEY = "ps-local-profile";

export interface LocalProfileOverride {
  name: string | null;
  avatarUrl: string | null;
}

function readLocalProfile(): LocalProfileOverride {
  if (typeof window === "undefined") return { name: null, avatarUrl: null };
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
    if (!raw) return { name: null, avatarUrl: null };
    const parsed = JSON.parse(raw) as Partial<LocalProfileOverride>;
    return {
      name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim() : null,
      avatarUrl: typeof parsed.avatarUrl === "string" && parsed.avatarUrl ? parsed.avatarUrl : null,
    };
  } catch {
    return { name: null, avatarUrl: null };
  }
}

interface AuthContextValue {
  user: AuthUserProfile | null;
  localProfile: LocalProfileOverride;
  loading: boolean;
  isSupabaseConfigured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error?: string; message?: string }>;
  updateProfile: (patch: { name?: string | null; avatarUrl?: string | null }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let sharedSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!sharedSupabaseClient) {
    sharedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return sharedSupabaseClient;
}

function mapSupabaseUser(u: User | null): AuthUserProfile | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    null;
  const name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    u.email?.split("@")[0] ||
    null;

  return {
    id: u.id,
    email: u.email ?? null,
    name,
    avatarUrl,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

  const supabase: SupabaseClient | null = useMemo(() => {
    if (!isSupabaseConfigured) return null;
    return getSupabaseClient();
  }, [isSupabaseConfigured]);

  const [rawUser, setRawUser] = useState<AuthUserProfile | null>(null);
  const [localProfile, setLocalProfile] = useState<LocalProfileOverride>({ name: null, avatarUrl: null });
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    setLocalProfile(readLocalProfile());
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setRawUser(mapSupabaseUser(data.session?.user ?? null));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setRawUser(mapSupabaseUser(session?.user ?? null));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: "Supabase environment variables are not configured." };
    }
    let redirectTo: string | undefined;
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent || "";
      const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      const isAndroidApp =
        ua.includes("JevalleneAndroidApp") ||
        cap?.isNativePlatform?.() === true ||
        new URLSearchParams(window.location.search).get("app") === "android";
      redirectTo = isAndroidApp
        ? `${window.location.origin}/?native_auth=1`
        : window.location.origin;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    return error ? { error: error.message } : {};
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase environment variables are not configured." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    if (!supabase) {
      return { error: "Supabase environment variables are not configured." };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { full_name: name } : undefined,
      },
    });
    if (error) return { error: error.message };
    return {
      message: "Verification email sent! Please check your inbox.",
    };
  };

  const user: AuthUserProfile | null = useMemo(() => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      name: localProfile.name ?? rawUser.name,
      avatarUrl: localProfile.avatarUrl ?? rawUser.avatarUrl,
    };
  }, [rawUser, localProfile]);

  const updateProfile = async (patch: { name?: string | null; avatarUrl?: string | null }) => {
    const next: LocalProfileOverride = {
      name: patch.name !== undefined ? (patch.name?.trim() || null) : localProfile.name,
      avatarUrl: patch.avatarUrl !== undefined ? patch.avatarUrl : localProfile.avatarUrl,
    };
    setLocalProfile(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
    }
    if (supabase && rawUser) {
      const dataPayload: Record<string, string> = {};
      if (next.name) dataPayload.full_name = next.name;
      if (next.avatarUrl && next.avatarUrl.length < 2048) {
        dataPayload.avatar_url = next.avatarUrl;
      }
      if (Object.keys(dataPayload).length > 0) {
        const { error } = await supabase.auth.updateUser({ data: dataPayload });
        if (error) return { error: error.message };
      }
    }
    return {};
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearAllLocalData();
    setRawUser(null);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        localProfile,
        loading,
        isSupabaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
