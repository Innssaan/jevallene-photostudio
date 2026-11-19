"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  Film,
  Loader2,
  QrCode,
  Share2,
  X,
} from "lucide-react";
import { uploadRenderToCloud } from "@/lib/cloud-storage";

interface ShareResultModalProps {
  open: boolean;
  locale: string;
  title: string;
  source: "photobox" | "editor";
  previewDataUrl: string | null;
  onDownloadFormat?: (format: "png" | "jpeg" | "webp") => Promise<void> | void;
  onGenerateGif?: () => Promise<string | null>;
  onClose: () => void;
}

export function ShareResultModal({
  open,
  locale,
  title,
  source,
  previewDataUrl,
  onDownloadFormat,
  onGenerateGif,
  onClose,
}: ShareResultModalProps) {
  const isId = locale === "id";
  const [qrLoading, setQrLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isCloudUrl, setIsCloudUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudSaved, setCloudSaved] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifDataUrl, setGifDataUrl] = useState<string | null>(null);

  const activeMediaUrl = gifDataUrl ?? previewDataUrl;

  useEffect(() => {
    setGifDataUrl(null);
    setGifLoading(false);
    setShareNotice(null);
  }, [open, previewDataUrl]);

  useEffect(() => {
    if (!open || !activeMediaUrl) return;
    let cancelled = false;

    const initShareAndQr = async () => {
      setQrLoading(true);
      setCopied(false);
      setCloudSaved(false);
      setCloudError(null);

      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: activeMediaUrl, title }),
        });
        if (!res.ok) throw new Error("Share store failed");
        const json = (await res.json()) as { url?: string };
        if (!json.url) throw new Error("Missing share url");

        const fullUrl = json.url.startsWith("http")
          ? json.url
          : `${window.location.origin}${json.url}`;
        const qr = await QRCode.toDataURL(fullUrl, {
          width: 240,
          margin: 2,
          color: { dark: "#111827", light: "#ffffff" },
        });
        if (cancelled) return;
        setShareUrl(fullUrl);
        setQrDataUrl(qr);
        setIsCloudUrl(false);
      } catch {
        if (!cancelled) {
          setShareUrl(null);
          setQrDataUrl(null);
        }
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    };

    void initShareAndQr();
    return () => {
      cancelled = true;
    };
  }, [open, activeMediaUrl, title]);

  if (!open) return null;

  const handleLocalDownload = (format: "png" | "jpeg" | "webp") => {
    if (onDownloadFormat) {
      void onDownloadFormat(format);
      return;
    }
    if (!previewDataUrl) return;
    const link = document.createElement("a");
    link.href = previewDataUrl;
    link.download = `jevallene-${Date.now()}.${format === "jpeg" ? "jpg" : format}`;
    link.click();
  };

  const handleUploadCloud = async () => {
    if (!activeMediaUrl) return;
    setCloudSaving(true);
    setCloudError(null);
    setCloudSaved(false);

    try {
      const res = await uploadRenderToCloud({
        title,
        source,
        dataUrl: activeMediaUrl,
      });
      if (res.error) {
        setCloudError(res.error);
        return;
      }
      setCloudSaved(true);
      if (res.item?.public_url) {
        const qr = await QRCode.toDataURL(res.item.public_url, {
          width: 240,
          margin: 2,
          color: { dark: "#111827", light: "#ffffff" },
        });
        setShareUrl(res.item.public_url);
        setQrDataUrl(qr);
        setIsCloudUrl(true);
      }
    } finally {
      setCloudSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-jevallene-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-brand-border bg-brand-surface p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">
              {isId ? "Save Hasil" : "Save Result"}
            </h3>
            <p className="text-[11px] text-brand-textMuted">
              {isId
                ? "Simpan ke perangkat, unggah ke Cloud, atau scan QR Code"
                : "Save locally, upload to Cloud, or scan QR Code"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-brand-border hover:bg-brand-surfaceMuted"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Result Preview */}
        <div className="rounded-2xl border border-brand-border bg-brand-surfaceMuted/50 p-3 flex items-center justify-center h-44 overflow-hidden">
          {gifDataUrl || previewDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifDataUrl ?? previewDataUrl ?? ""}
              alt={title}
              className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
            />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-brand-textMuted" />
          )}
        </div>

        {/* 1. Simpan & Bagikan Langsung */}
        <div className="rounded-2xl border border-brand-border bg-brand-bg p-3.5 space-y-2.5">
          <div className="text-xs font-bold text-brand-text">
            {isId ? "1. Simpan & Bagikan" : "1. Save & Share"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "png", label: "PNG", cls: "bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1]" },
                { id: "jpeg", label: "JPG", cls: "bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3]" },
                { id: "webp", label: "WebP", cls: "bg-[#FFD166] text-[#111827] hover:bg-[#F7C348]" },
              ] as const
            ).map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => handleLocalDownload(fmt.id)}
                className={`min-h-[42px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors ${fmt.cls}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{fmt.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!previewDataUrl}
            onClick={async () => {
              const targetUrl = gifDataUrl ?? previewDataUrl;
              if (!targetUrl) return;
              setShareNotice(null);
              try {
                const res = await fetch(targetUrl);
                const blob = await res.blob();
                const isGif = Boolean(gifDataUrl);
                const ext = isGif ? "gif" : "png";
                const mime = isGif ? "image/gif" : blob.type || "image/png";
                const file = new File([blob], `${(title || "jevallene-photostudio").replace(/\s+/g, "-")}.${ext}`, {
                  type: mime,
                });
                if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
                  await navigator.share({
                    title: title || "Jevallene PhotoStudio",
                    text: isId
                      ? "Hasil foto dari Jevallene PhotoStudio by Innssaan!"
                      : "Photo strip from Jevallene PhotoStudio by Innssaan!",
                    files: [file],
                  });
                } else {
                  setShareNotice(
                    isId
                      ? "Browser ini belum mendukung Bagikan File langsung — silakan unduh PNG/JPG di atas lalu kirim."
                      : "This browser does not support direct file sharing — please download PNG/JPG above."
                  );
                }
              } catch (err) {
                if ((err as Error)?.name !== "AbortError") {
                  setShareNotice(
                    isId ? "Gagal membuka menu bagikan." : "Failed to open share sheet."
                  );
                }
              }
            }}
            className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF9EB5] text-[#111827] hover:bg-[#F787A3] text-xs font-bold disabled:opacity-50 ps-sticky-btn"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {isId
                ? "Bagikan Langsung (IG / WA / TikTok)"
                : "Share Directly (IG / WA / TikTok)"}
            </span>
          </button>

          {onGenerateGif && (
            <button
              type="button"
              disabled={gifLoading}
              onClick={async () => {
                if (gifDataUrl) {
                  const link = document.createElement("a");
                  link.href = gifDataUrl;
                  link.download = `${(title || "jevallene-boomerang").replace(/\s+/g, "-")}.gif`;
                  link.click();
                  return;
                }
                setGifLoading(true);
                try {
                  const url = await onGenerateGif();
                  if (url) setGifDataUrl(url);
                } finally {
                  setGifLoading(false);
                }
              }}
              className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-surfaceMuted text-brand-text border border-brand-border hover:border-brand-accent text-xs font-bold disabled:opacity-50"
            >
              {gifLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isId ? "Membuat GIF Boomerang..." : "Creating Boomerang GIF..."}</span>
                </>
              ) : gifDataUrl ? (
                <>
                  <Download className="w-4 h-4 text-[#38D1BF]" />
                  <span>{isId ? "Unduh GIF Boomerang" : "Download Boomerang GIF"}</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4 text-[#FA7B38]" />
                  <span>{isId ? "Buat & Preview GIF Boomerang Strip" : "Create Boomerang GIF Strip"}</span>
                </>
              )}
            </button>
          )}

          {shareNotice && (
            <p className="text-[11px] font-medium text-amber-500">{shareNotice}</p>
          )}
        </div>

        {/* 2. Upload ke Cloud */}
        <div className="rounded-2xl border border-brand-border bg-brand-bg p-3.5 space-y-2">
          <div className="text-xs font-bold text-brand-text">
            {isId ? "2. Upload ke Cloud" : "2. Upload to Cloud"}
          </div>
          <button
            type="button"
            disabled={cloudSaving}
            onClick={() => void handleUploadCloud()}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D2F159] text-[#111827] text-xs font-bold ps-sticky-btn disabled:opacity-50"
          >
            {cloudSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isId ? "Mengunggah..." : "Uploading..."}</span>
              </>
            ) : cloudSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>{isId ? "Tersimpan ke Cloud!" : "Saved to Cloud!"}</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>{isId ? "Upload ke Cloud" : "Upload to Cloud"}</span>
              </>
            )}
          </button>
          {cloudError && (
            <p className="text-[11px] font-medium text-rose-600">{cloudError}</p>
          )}
        </div>

        {/* 3. QR Code Langsung (Scan -> Foto Keluar) */}
        <div className="rounded-2xl border border-brand-border bg-brand-bg p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-text">
              {isId ? "3. QR Code (Scan Langsung)" : "3. QR Code (Instant Scan)"}
            </span>
            <span className="text-[10px] font-semibold text-brand-textMuted">
              {isCloudUrl
                ? isId
                  ? "Link Cloud Permanen"
                  : "Permanent Cloud Link"
                : isId
                  ? "Aktif 1 Jam"
                  : "Active 1h"}
            </span>
          </div>

          <div className="rounded-xl bg-white p-3 flex flex-col items-center justify-center border border-brand-border/60">
            {qrLoading ? (
              <div className="py-8 flex flex-col items-center gap-2 text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[11px] font-medium">
                  {isId ? "Membuat QR Code..." : "Generating QR Code..."}
                </span>
              </div>
            ) : qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR Code" className="w-40 h-40 object-contain" />
            ) : (
              <p className="py-6 text-xs text-stone-500 text-center">
                {isId ? "QR Code tidak tersedia." : "QR Code unavailable."}
              </p>
            )}
          </div>

          {shareUrl && (
            <div className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface p-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 min-w-0 bg-transparent text-[11px] font-mono text-brand-text focus:outline-none px-1.5"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-[11px] font-bold shrink-0"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? (isId ? "Tersalin" : "Copied") : (isId ? "Salin" : "Copy")}</span>
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg border border-brand-border hover:border-brand-accent shrink-0"
                title={isId ? "Buka Foto" : "Open Photo"}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {qrDataUrl && (
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="p-1.5 rounded-lg border border-brand-border hover:border-brand-accent shrink-0"
                  title={isId ? "Unduh QR" : "Save QR"}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
