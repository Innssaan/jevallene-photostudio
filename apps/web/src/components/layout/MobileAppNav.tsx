"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  FolderOpen,
  Home,
  LayoutGrid,
  User,
} from "lucide-react";

interface MobileAppNavProps {
  locale: string;
}

export function MobileAppNav({ locale }: MobileAppNavProps) {
  const pathname = usePathname();
  const isId = locale === "id";

  const leftItems = [
    { href: "/", icon: Home, label: isId ? "Beranda" : "Home" },
    { href: "/templates", icon: LayoutGrid, label: "Template" },
  ];

  const rightItems = [
    { href: "/gallery", icon: FolderOpen, label: "Album" },
    { href: "/settings", icon: User, label: isId ? "Profil" : "Profile" },
  ];

  const isPhotoboxActive = pathname === "/photobox";

  const renderNavItem = (item: { href: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }) => {
    const Icon = item.icon;
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={`relative flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all duration-200 active:scale-90 ${
          active
            ? "text-brand-accent"
            : "text-brand-textMuted hover:text-brand-text"
        }`}
      >
        <span
          className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
            active ? "bg-brand-accentSoft ps-nav-active-icon" : "bg-transparent"
          }`}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
        </span>
        <span
          className={`text-[10px] leading-none transition-all duration-200 ${
            active ? "font-extrabold text-brand-accent" : "font-semibold"
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Mobile App Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-surface border-t border-brand-border shadow-[0_-6px_24px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto h-16 px-2 grid grid-cols-5 items-center">
        {leftItems.map(renderNavItem)}

        {/* Center Camera Button -> Photobox */}
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/photobox"
            aria-label="Photobox"
            aria-current={isPhotoboxActive ? "page" : undefined}
            className={`w-[52px] h-[52px] -mt-5 rounded-full flex items-center justify-center border-2 border-brand-borderStrong ring-4 ring-brand-surface transition-all duration-200 active:scale-90 hover:scale-105 ps-cam-btn-glow ${
              isPhotoboxActive
                ? "bg-brand-accent text-brand-onAccent scale-105"
                : "bg-brand-accent text-brand-onAccent"
            }`}
          >
            <Camera className="w-5 h-5 transition-transform duration-200" strokeWidth={2.4} />
          </Link>
          <span
            className={`text-[9px] mt-0.5 leading-none font-bold ${
              isPhotoboxActive ? "text-brand-accent" : "text-brand-textMuted"
            }`}
          >
            Photobox
          </span>
        </div>

        {rightItems.map(renderNavItem)}
      </div>
    </nav>
  );
}
