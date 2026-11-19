"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Cloud, CloudOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  CLOUD_QUOTA_BYTES,
  CLOUD_UPDATED_EVENT,
  formatCloudBytes,
  getCloudUsage,
  type CloudUsageStats,
} from "@/lib/cloud-storage";
import { useI18n } from "@/lib/i18n";

interface CloudUsageBarProps {
  compact?: boolean;
}

export function CloudUsageBar({ compact = false }: CloudUsageBarProps) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const [usage, setUsage] = useState<CloudUsageStats>({
    usedBytes: 0,
    quotaBytes: CLOUD_QUOTA_BYTES,
    percentage: 0,
    count: 0,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setUsage({ usedBytes: 0, quotaBytes: CLOUD_QUOTA_BYTES, percentage: 0, count: 0 });
      return;
    }
    const stats = await getCloudUsage();
    setUsage(stats);
  }, [user]);

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener(CLOUD_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CLOUD_UPDATED_EVENT, handler);
  }, [refresh]);

  if (!user) {
    return (
      <div
        className={`rounded-2xl bg-brand-surface nb-box flex items-center justify-between gap-3 ${
          compact ? "px-3.5 py-2.5" : "p-4"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-surfaceMuted flex items-center justify-center shrink-0 text-brand-textMuted">
            <CloudOff className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-brand-text truncate">
              {locale === "id" ? "Cloud Storage (0% terpakai)" : "Cloud Storage (0% used)"}
            </div>
            <div className="text-[11px] text-brand-textMuted truncate">
              {locale === "id"
                ? "Masuk lewat avatar kanan atas untuk simpan & sinkron ke Cloud."
                : "Sign in via top-right avatar to save & sync to Cloud."}
            </div>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-brand-surfaceMuted text-brand-textMuted text-[11px] font-bold">
          0%
        </span>
      </div>
    );
  }

  const barColor =
    usage.percentage >= 90 ? "#FA7B38" : usage.percentage >= 70 ? "#FFD166" : "#38D1BF";

  return (
    <div
      className={`rounded-2xl bg-[#CBECE7]/55 nb-box ps-scratch-surface ${
        compact ? "px-3.5 py-2.5 space-y-1.5" : "p-4 space-y-2.5"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#38D1BF] text-[#111827] flex items-center justify-center shrink-0 ps-sticky-tile">
            <Cloud className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-[#111827] truncate">
              Cloud Storage · {usage.count} {locale === "id" ? "foto" : "photos"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-[#334155]">
            {formatCloudBytes(usage.usedBytes)} / {formatCloudBytes(usage.quotaBytes)}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#D2F159] border border-[#111827] text-[#111827] text-[11px] font-extrabold">
            {usage.percentage}% {locale === "id" ? "terpakai" : "used"}
          </span>
        </div>
      </div>

      <div className="w-full h-2.5 rounded-full bg-white border border-[#111827]/70 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(usage.percentage > 0 ? 3 : 0, usage.percentage)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
}
