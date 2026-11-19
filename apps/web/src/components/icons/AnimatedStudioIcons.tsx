"use client";

import React from "react";

interface IconProps {
  className?: string;
  /** Optional accent color for duotone fills (used in colorful quick-menu tiles) */
  accent?: string;
}

/** Photo Editor: magic sparkles that twinkle in sequence on group hover */
export function EditorSparkleIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"
        fill={accent ?? "currentColor"}
        fillOpacity={accent ? 0.9 : 0.16}
        className="origin-[12px_9px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
      />
      <path
        d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15z"
        fill={accent ? "#D2F159" : "currentColor"}
        fillOpacity={accent ? 1 : 0.25}
        className="origin-[19px_17.5px] transition-all duration-300 delay-75 opacity-85 group-hover:opacity-100 group-hover:scale-125 group-hover:-rotate-12"
      />
      <path
        d="M5 16l.6 1.4L7 18l-1.4.6L5 20l-.6-1.4L3 18l1.4-.6L5 16z"
        className="origin-[5px_18px] transition-all duration-300 delay-150 opacity-75 group-hover:opacity-100 group-hover:scale-125 group-hover:rotate-12"
      />
    </svg>
  );
}

/** Templates: pixel-aligned 2x2 grid morphing into 1 wide hero + 3 columns on group hover */
export function TemplatesStackIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} overflow-visible`}
    >
      <rect
        x="3.5"
        y="3.5"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill={accent ?? "currentColor"}
        fillOpacity={accent ? 0.95 : 0.18}
        className="tpl-box tpl-box-1"
      />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" className="tpl-box tpl-box-2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" className="tpl-box tpl-box-3" />
      <rect
        x="13"
        y="13"
        width="7.5"
        height="7.5"
        rx="1.5"
        fill={accent ? "#D2F159" : "none"}
        fillOpacity={accent ? 0.95 : 0}
        className="tpl-box tpl-box-4"
      />
    </svg>
  );
}

/** Photobooth: camera dips slightly and emits a flash burst on group hover */
export function PhotoboothFlashIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <g className="origin-center transition-transform duration-200 group-hover:scale-95">
        <path
          d="M14.5 6h-5L8 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3l-1.5-2z"
          fill={accent ?? "currentColor"}
          fillOpacity={accent ? 0.9 : 0.14}
        />
        <circle
          cx="12"
          cy="13"
          r="3"
          fill={accent ? "#FA7B38" : "none"}
          fillOpacity={accent ? 0.95 : 0}
        />
      </g>
      <g className="opacity-0 scale-50 origin-[19px_5px] transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
        <line x1="19" y1="2" x2="19" y2="3.5" />
        <line x1="22" y1="5" x2="20.5" y2="5" />
        <line x1="21.2" y1="2.8" x2="20.1" y2="3.9" />
        <circle cx="18.2" cy="5.8" r="1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Insta360: aperture lens spins smoothly on group hover */
export function Insta360LensIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={accent ?? "currentColor"}
        fillOpacity={accent ? 0.88 : 0.12}
      />
      <g className="origin-[12px_12px] transition-transform duration-700 ease-out group-hover:rotate-180">
        <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
        <line x1="9.69" y1="8" x2="21.17" y2="8" />
        <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
        <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
        <line x1="14.31" y1="16" x2="2.83" y2="16" />
        <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
      </g>
      {accent && <circle cx="12" cy="12" r="2.2" fill={accent} />}
    </svg>
  );
}

/** Gallery: photo cards fan out cleanly without clipping on group hover */
export function GalleryFanIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} overflow-visible`}
    >
      <rect
        x="4"
        y="5"
        width="13"
        height="13"
        rx="2"
        fill={accent ? "#38D1BF" : "currentColor"}
        fillOpacity={accent ? 0.9 : 0.14}
        className="origin-[10.5px_16px] transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:-translate-x-1"
      />
      <g className="origin-[13.5px_16px] transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:translate-x-1">
        <rect x="7" y="6" width="13" height="13" rx="2" fill={accent ?? "var(--ps-surface)"} />
        <circle cx="11" cy="10.5" r="1.2" fill={accent ? "#FA7B38" : "none"} />
        <path d="M20 15.5l-3.5-3.5-6 6" />
      </g>
    </svg>
  );
}

/** Timeline: realistic clock with separate minute and hour hands sweeping on group hover */
export function TimelineClockIcon({ className = "w-6 h-6", accent }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill={accent ?? "currentColor"}
        fillOpacity={accent ? 0.92 : 0.12}
      />
      <line
        x1="12"
        y1="12"
        x2="15.5"
        y2="13.8"
        className="origin-[12px_12px] transition-transform duration-1000 ease-in-out group-hover:rotate-[35deg]"
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="6.5"
        className="origin-[12px_12px] transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]"
      />
      <circle cx="12" cy="12" r="1" fill={accent ? "#FA7B38" : "currentColor"} stroke="none" />
    </svg>
  );
}
