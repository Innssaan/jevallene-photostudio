"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function SectionPlaceholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-brand-textMuted mt-1">{description}</p>
      </div>
      <div className="rounded-3xl border border-dashed border-brand-border bg-brand-surface p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-accentSoft text-brand-accent flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <p className="text-sm text-brand-textMuted max-w-md mx-auto">{t.pages.comingInMilestone}</p>
      </div>
    </div>
  );
}
