"use client";

import { useEffect, useState } from "react";

const NATIVE_PREVIEW_KEY = "jevallene_native_preview";

export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get("app");

    if (appParam === "android") {
      try {
        sessionStorage.setItem(NATIVE_PREVIEW_KEY, "1");
      } catch {
        // ignore
      }
      setIsNative(true);
      return;
    }

    if (appParam === "web") {
      try {
        sessionStorage.removeItem(NATIVE_PREVIEW_KEY);
      } catch {
        // ignore
      }
      setIsNative(false);
      return;
    }

    const ua = window.navigator.userAgent || "";
    const cap = (
      window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
    ).Capacitor;
    let previewFlag = false;
    try {
      previewFlag = sessionStorage.getItem(NATIVE_PREVIEW_KEY) === "1";
    } catch {
      previewFlag = false;
    }

    if (
      ua.includes("JevalleneAndroidApp") ||
      cap?.isNativePlatform?.() === true ||
      previewFlag
    ) {
      setIsNative(true);
    }
  }, []);

  return isNative;
}
