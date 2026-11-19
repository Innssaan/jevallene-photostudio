"use client";

import React, { useEffect, useState } from "react";

const SESSION_KEY = "jevallene-preloader-shown";

export function StudioPreloader() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(true);

    let pct = 0;
    const tick = window.setInterval(() => {
      pct = Math.min(100, pct + Math.floor(Math.random() * 18) + 12);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(tick);
        setTimeout(() => setExiting(true), 160);
        setTimeout(() => setVisible(false), 660);
      }
    }, 65);

    return () => window.clearInterval(tick);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#060609]/95 backdrop-blur-md transition-opacity duration-500 ${
        exiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Split curtain accent panels */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 border-r border-brand-accent/40 bg-[#060609]/95 transition-transform duration-500 ease-out ${
          exiting ? "-translate-x-full" : "translate-x-0"
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 w-1/2 border-l border-brand-accent/40 bg-[#060609]/95 transition-transform duration-500 ease-out ${
          exiting ? "translate-x-full" : "translate-x-0"
        }`}
      />

      {/* Center JEVALLENE · PHOTOSTUDIO emblem & progress */}
      <div
        className={`relative z-10 flex flex-col items-center gap-4 px-6 transition-all duration-300 ${
          exiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="inline-flex items-center gap-2.5">
          <span className="inline-block w-3 h-3 rotate-45 border border-brand-accent bg-brand-accent/25 shadow-[0_0_14px_rgba(249,115,22,0.5)]" />
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-[0.26em] text-white">
            JEVALLENE
          </span>
        </div>

        <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#9A9AA2]">
          JEVALLENE · PHOTOSTUDIO
        </p>

        <div className="w-52 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-brand-accent transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="font-mono text-xs tracking-widest text-[#C4C4CC]">
          {String(progress).padStart(3, "0")}%
        </div>
      </div>
    </div>
  );
}
