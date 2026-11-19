"use client";

import React, { useEffect, useState } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setPhase("fading");
    }, 1050);

    const doneTimer = window.setTimeout(() => {
      setPhase("done");
    }, 1450);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden={phase === "fading"}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between py-10 px-6 bg-brand-bg text-brand-text transition-all duration-400 ease-out ${
        phase === "fading"
          ? "opacity-0 scale-[1.02] pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Top balance spacer */}
      <div className="h-6" />

      {/* Center Logo & Brand Name */}
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-4">
          <div className="absolute -inset-3 rounded-full bg-[#E5142A]/10 blur-xl" />
          <svg
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
            className="relative w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg"
          >
            <rect width="64" height="64" rx="32" fill="#0B0B0E" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#E5142A"
              strokeWidth="2.5"
              strokeOpacity="0.9"
              strokeDasharray="140 36"
              className="origin-center animate-[spin_2.4s_linear_infinite]"
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
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text">
          Jevallene
        </h1>
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-brand-textMuted mt-1">
          PhotoStudio
        </p>

        {/* Subtle launch progress bar */}
        <div className="mt-6 w-28 h-1 rounded-full bg-brand-surfaceMuted overflow-hidden">
          <div className="h-full w-full origin-left bg-gradient-to-r from-[#D2F159] via-[#38D1BF] to-[#E5142A] animate-[splashProgress_1.05s_ease-out_forwards]" />
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center">
        <p className="text-xs font-semibold text-brand-textMuted">
          © {new Date().getFullYear()} Jevallene by{" "}
          <span className="text-[#D9621F] font-bold">Innssaan</span>
        </p>
      </div>
    </div>
  );
}
