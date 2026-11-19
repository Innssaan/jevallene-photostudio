"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  FlipHorizontal2,
  PlugZap,
  RefreshCw,
  Search,
  Sparkles,
  Usb,
  Video,
  VideoOff,
} from "lucide-react";
import { enforceMandatoryWatermark, type TemplateDocument } from "@photostudio/shared-types";
import { useI18n } from "@/lib/i18n";
import { formatCameraLabel } from "@/lib/camera-label";
import { addLocalTimelineEntry, saveLocalProject } from "@/lib/local-store";

type CameraBrandFilter = "all" | "insta360" | "action" | "mirrorless" | "bridge";

interface SupportedCamera {
  id: string;
  name: string;
  brand: string;
  category: Exclude<CameraBrandFilter, "all">;
  badge?: string;
  badgeColor?: string;
  connectionType: string;
  maxResolution: string;
  stepsId: string[];
  stepsEn: string[];
}

const SUPPORTED_CAMERAS: SupportedCamera[] = [
  {
    id: "insta360-ace-pro-2",
    name: "Insta360 Ace Pro 2",
    brand: "Insta360",
    category: "insta360",
    badge: "Direkomendasikan",
    badgeColor: "bg-[#D2F159]",
    connectionType: "USB-C UVC (Webcam Mode)",
    maxResolution: "4K / 1080p60",
    stepsId: [
      "Nyalakan Insta360 Ace Pro 2 lalu sambungkan ke PC/Laptop/HP dengan kabel USB-C data.",
      "Pada layar kamera, pilih mode \"Webcam\" (bukan U-Disk / Charging).",
      "Klik \"Scan & Hubungkan Kamera\" di atas lalu pilih \"Insta360 Ace Pro 2\".",
    ],
    stepsEn: [
      "Power on Insta360 Ace Pro 2 and connect via a USB-C data cable.",
      "On the camera touchscreen, select \"Webcam\" mode (not U-Disk).",
      "Click \"Scan & Connect Camera\" above and select \"Insta360 Ace Pro 2\".",
    ],
  },
  {
    id: "insta360-ace-pro",
    name: "Insta360 Ace / Ace Pro",
    brand: "Insta360",
    category: "insta360",
    connectionType: "USB-C UVC (Webcam Mode)",
    maxResolution: "1080p60",
    stepsId: [
      "Sambungkan kamera via USB-C ke komputer.",
      "Pilih opsi \"Webcam Mode\" saat muncul di layar sentuh kamera.",
      "Klik Scan di panel atas untuk langsung menampilkan live feed.",
    ],
    stepsEn: [
      "Connect the camera via USB-C to your computer.",
      "Choose \"Webcam Mode\" when prompted on the camera screen.",
      "Click Scan above to start the live preview.",
    ],
  },
  {
    id: "insta360-x4-x3",
    name: "Insta360 X4 / X3",
    brand: "Insta360",
    category: "insta360",
    connectionType: "USB-C Webcam Mode",
    maxResolution: "1080p30",
    stepsId: [
      "Buka Settings > General > USB Mode di kamera, pilih \"Webcam\".",
      "Hubungkan kabel USB-C ke perangkat Anda.",
      "Klik Scan lalu pilih kamera Insta360 di daftar perangkat.",
    ],
    stepsEn: [
      "Open Settings > General > USB Mode on camera and pick \"Webcam\".",
      "Plug the USB-C cable into your device.",
      "Click Scan and select the Insta360 device from the list.",
    ],
  },
  {
    id: "insta360-link-2",
    name: "Insta360 Link 2 / Link 2C",
    brand: "Insta360",
    category: "insta360",
    badge: "Plug & Play",
    badgeColor: "bg-[#38D1BF]",
    connectionType: "USB-C UVC Direct",
    maxResolution: "4K 30fps / 1080p60",
    stepsId: [
      "Colokkan Insta360 Link 2 ke port USB-C / USB-A.",
      "Kamera otomatis terdeteksi tanpa perlu ubah mode.",
      "Klik Scan dan pilih \"Insta360 Link 2\".",
    ],
    stepsEn: [
      "Plug Insta360 Link 2 into USB-C / USB-A.",
      "It is detected automatically with no mode switching needed.",
      "Click Scan and choose \"Insta360 Link 2\".",
    ],
  },
  {
    id: "gopro-hero-13-12",
    name: "GoPro HERO13 / 12 / 11 Black",
    brand: "GoPro",
    category: "action",
    connectionType: "USB-C Webcam Mode",
    maxResolution: "1080p30",
    stepsId: [
      "Pastikan GoPro Webcam / UVC mode aktif (atau gunakan GoPro Webcam Utility di PC/Mac).",
      "Hubungkan GoPro dengan kabel USB-C.",
      "Klik Scan lalu pilih GoPro Webcam.",
    ],
    stepsEn: [
      "Ensure GoPro Webcam / UVC mode is active (or install GoPro Webcam Utility).",
      "Connect GoPro using a USB-C cable.",
      "Click Scan and pick GoPro Webcam.",
    ],
  },
  {
    id: "dji-osmo-action-5",
    name: "DJI Osmo Action 5 Pro / Action 4",
    brand: "DJI",
    category: "action",
    connectionType: "USB-C UVC (Webcam Mode)",
    maxResolution: "1080p60",
    stepsId: [
      "Colokkan DJI Osmo Action dengan kabel USB-C.",
      "Pilih \"Webcam\" pada pop-up layar kamera.",
      "Klik Scan untuk mengaktifkan live preview.",
    ],
    stepsEn: [
      "Connect DJI Osmo Action via USB-C cable.",
      "Tap \"Webcam\" on the camera pop-up prompt.",
      "Click Scan to activate the live preview.",
    ],
  },
  {
    id: "sony-zv-e10-a7",
    name: "Sony ZV-E10 / ZV-1 / Alpha A7 IV",
    brand: "Sony",
    category: "mirrorless",
    badge: "USB Streaming",
    badgeColor: "bg-[#A0B0E8]",
    connectionType: "USB-C UVC (USB Streaming)",
    maxResolution: "4K30 / 1080p60",
    stepsId: [
      "Di menu kamera Sony, aktifkan Setup > USB > USB Streaming.",
      "Sambungkan kabel USB-C ke PC/Laptop.",
      "Klik Scan dan pilih perangkat Sony Camera.",
    ],
    stepsEn: [
      "On your Sony camera menu, enable Setup > USB > USB Streaming.",
      "Connect USB-C cable to your PC/Laptop.",
      "Click Scan and choose the Sony Camera device.",
    ],
  },
  {
    id: "canon-eos-r50-r10",
    name: "Canon EOS R50 / R10 / R8",
    brand: "Canon",
    category: "mirrorless",
    connectionType: "USB-C UVC / EOS Webcam Utility",
    maxResolution: "1080p60",
    stepsId: [
      "Aktifkan mode \"Video calls/streaming\" di menu USB kamera (untuk seri UVC) atau gunakan EOS Webcam Utility.",
      "Hubungkan kamera via USB-C.",
      "Klik Scan untuk menghubungkan ke Photobox.",
    ],
    stepsEn: [
      "Enable \"Video calls/streaming\" in USB settings (UVC models) or use EOS Webcam Utility.",
      "Connect the camera via USB-C.",
      "Click Scan to connect to Photobox.",
    ],
  },
  {
    id: "fujifilm-xs20-xt5",
    name: "Fujifilm X-S20 / X-T5 / X-H2",
    brand: "Fujifilm",
    category: "mirrorless",
    connectionType: "USB-C UVC Webcam",
    maxResolution: "4K30 / 1080p60",
    stepsId: [
      "Atur Connection Setting > USB Power Supply/Comm > USB Webcam.",
      "Hubungkan kamera via kabel USB-C.",
      "Klik Scan dan pilih Fujifilm Webcam.",
    ],
    stepsEn: [
      "Set Connection Setting > USB Power Supply/Comm > USB Webcam.",
      "Connect via USB-C cable.",
      "Click Scan and choose Fujifilm Webcam.",
    ],
  },
  {
    id: "hdmi-capture-card",
    name: "Elgato Cam Link 4K / HDMI Capture Card",
    brand: "Capture Card",
    category: "bridge",
    badge: "Universal",
    badgeColor: "bg-[#FFD166]",
    connectionType: "HDMI to USB-C/A Capture",
    maxResolution: "4K60 / 1080p60",
    stepsId: [
      "Sambungkan output Clean HDMI kamera DSLR/Mirrorless ke Capture Card.",
      "Colokkan Capture Card ke port USB komputer/tablet.",
      "Klik Scan dan pilih USB Video / Cam Link.",
    ],
    stepsEn: [
      "Connect your camera Clean HDMI output to the Capture Card.",
      "Plug the Capture Card into your computer/tablet USB port.",
      "Click Scan and select USB Video / Cam Link.",
    ],
  },
  {
    id: "obs-virtual-cam",
    name: "OBS Virtual Camera / Camo / EpocCam",
    brand: "Virtual Bridge",
    category: "bridge",
    connectionType: "Virtual Webcam / Wi-Fi / USB",
    maxResolution: "1080p60",
    stepsId: [
      "Jalankan OBS Studio (Start Virtual Camera) atau aplikasi Camo/EpocCam.",
      "Klik Scan di panel atas.",
      "Pilih OBS Virtual Camera sebagai sumber kamera Photobox.",
    ],
    stepsEn: [
      "Start OBS Virtual Camera or Camo/EpocCam on your computer.",
      "Click Scan in the panel above.",
      "Select OBS Virtual Camera as your Photobox source.",
    ],
  },
];

export default function ExternalCameraPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const isId = locale === "id";

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [resolution, setResolution] = useState<"2160" | "1080" | "720">("1080");
  const [mirror, setMirror] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTrackInfo, setActiveTrackInfo] = useState<string>("");

  const [brandFilter, setBrandFilter] = useState<CameraBrandFilter>("all");
  const [query, setQuery] = useState("");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const connectCamera = useCallback(
    async (deviceId?: string, res: "2160" | "1080" | "720" = resolution) => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          isId
            ? "Browser ini belum mendukung akses kamera (MediaDevices)."
            : "This browser does not support camera access (MediaDevices)."
        );
        return;
      }

      setIsScanning(true);
      setCameraError(null);
      stopStream();

      const resMap = {
        "2160": { width: 3840, height: 2160 },
        "1080": { width: 1920, height: 1080 },
        "720": { width: 1280, height: 720 },
      }[res];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: resMap.width }, height: { ideal: resMap.height } }
            : { width: { ideal: resMap.width }, height: { ideal: resMap.height } },
          audio: false,
        });
        streamRef.current = stream;

        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings();
        if (settings?.width && settings?.height) {
          setActiveTrackInfo(`${settings.width}×${settings.height}${settings.frameRate ? ` · ${Math.round(settings.frameRate)}fps` : ""}`);
        } else {
          setActiveTrackInfo("");
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        const all = await navigator.mediaDevices.enumerateDevices();
        const vids = all.filter((d) => d.kind === "videoinput");
        setDevices(vids);

        const activeId = settings?.deviceId || deviceId || vids[0]?.deviceId || "";
        if (activeId) {
          setSelectedDeviceId(activeId);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setCameraError(
          isId
            ? `Gagal terhubung ke kamera (${msg || "Pastikan izin kamera diizinkan & kamera dalam Webcam Mode"}).`
            : `Failed to connect camera (${msg || "Please allow camera permission & ensure Webcam Mode is active"}).`
        );
      } finally {
        setIsScanning(false);
      }
    },
    [isId, resolution, stopStream]
  );

  useEffect(() => {
    void connectCamera(undefined, "1080");
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureToEditor = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    const doc: TemplateDocument = {
      schemaVersion: "1.0",
      templateId: "free-edit",
      version: 1,
      category: "custom",
      theme: "minimal",
      canvas: {
        width: 1080,
        height: 1350,
        aspectRatio: "4:5",
        background: { type: "solid", value: "#faf8f5" },
      },
      slots: [
        {
          id: "slot-1",
          index: 0,
          x: 48,
          y: 48,
          width: 1080 - 96,
          height: 1350 - 96 - 70,
          borderRadius: 16,
          filter: "natural",
        },
      ],
      layers: [],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "auto" }),
    };
    const now = new Date().toISOString();
    const projectId = `cam-${Date.now()}`;
    saveLocalProject({
      id: projectId,
      templateId: doc.templateId,
      title: isId ? "Jepretan Kamera Eksternal" : "External Camera Shot",
      document: doc,
      slotImages: [dataUrl],
      filter: "natural",
      caption: "",
      thumbnailDataUrl: dataUrl,
      createdAt: now,
      updatedAt: now,
    });
    addLocalTimelineEntry({
      eventType: "session",
      title: isId ? "Jepretan Kamera Eksternal" : "External Camera Shot",
      templateId: doc.templateId,
    });
    router.push(`/editor?project=${encodeURIComponent(projectId)}`);
  };

  const filteredCameras = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SUPPORTED_CAMERAS.filter((cam) => {
      const matchCat = brandFilter === "all" || cam.category === brandFilter;
      const matchQuery =
        !q ||
        cam.name.toLowerCase().includes(q) ||
        cam.brand.toLowerCase().includes(q) ||
        cam.connectionType.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [brandFilter, query]);

  const filterTabs: { id: CameraBrandFilter; label: string; color: string }[] = [
    { id: "all", label: isId ? "Semua Kamera" : "All Cameras", color: "bg-[#D2F159]" },
    { id: "insta360", label: "Insta360", color: "bg-[#38D1BF]" },
    { id: "action", label: isId ? "Action Cam" : "Action Cams", color: "bg-[#FF9EB5]" },
    { id: "mirrorless", label: "Mirrorless & DSLR", color: "bg-[#A0B0E8]" },
    { id: "bridge", label: "Capture Card & Virtual", color: "bg-[#FFD166]" },
  ];

  const selectedIdx = devices.findIndex((d) => d.deviceId === selectedDeviceId);
  const selectedDeviceLabel =
    selectedIdx >= 0
      ? formatCameraLabel(devices[selectedIdx]?.label, selectedIdx, isId)
      : isId
        ? "Kamera Terdeteksi"
        : "Detected Camera";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent mb-1">
            <PlugZap className="w-3.5 h-3.5" />
            <span>{isId ? "Koneksi Perangkat Eksternal" : "External Device Connection"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-text">
            {isId ? "Connect Your External Camera" : "Connect Your External Camera"}
          </h1>
          <p className="text-sm text-brand-textMuted mt-1">
            {isId
              ? "Hubungkan Insta360 Ace Pro 2, Action Cam, Mirrorless, atau Capture Card via USB-C UVC langsung ke studio."
              : "Connect Insta360 Ace Pro 2, Action Cams, Mirrorless, or Capture Cards via USB-C UVC directly to the studio."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void connectCamera(selectedDeviceId || undefined, resolution)}
          disabled={isScanning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs font-bold self-start ps-sticky-btn disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
          <span>{isId ? "Scan & Hubungkan Kamera" : "Scan & Connect Camera"}</span>
        </button>
      </div>

      {/* Live Camera Preview & Device Selector */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 rounded-3xl bg-brand-surface p-4 sm:p-5 space-y-4 nb-box">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0B0F1A] border border-brand-border flex items-center justify-center">
            {cameraError ? (
              <div className="p-6 text-center space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9EB5] text-[#111827] flex items-center justify-center mx-auto ps-sticky-btn">
                  <VideoOff className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => void connectCamera(undefined, resolution)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#38D1BF] text-[#111827] text-xs font-bold ps-sticky-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isId ? "Coba Scan Lagi" : "Retry Scan"}</span>
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${mirror ? "-scale-x-100" : ""}`}
              />
            )}

            {!cameraError && (
              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D2F159] text-[#111827] text-[11px] font-bold ps-sticky-btn">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="truncate max-w-[200px]">{selectedDeviceLabel}</span>
                {activeTrackInfo && <span className="opacity-75">· {activeTrackInfo}</span>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMirror((m) => !m)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ps-sticky-btn ${
                  mirror
                    ? "bg-[#38D1BF] text-[#111827]"
                    : "bg-brand-surfaceMuted text-brand-textMuted"
                }`}
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" />
                <span>Mirror</span>
              </button>

              {(["2160", "1080", "720"] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => {
                    setResolution(res);
                    void connectCamera(selectedDeviceId || undefined, res);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ps-sticky-btn ${
                    resolution === res
                      ? "bg-[#FFD166] text-[#111827]"
                      : "bg-brand-surfaceMuted text-brand-textMuted"
                  }`}
                >
                  {res === "2160" ? "4K" : `${res}p`}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={
                  selectedDeviceId
                    ? `/photobox?deviceId=${encodeURIComponent(selectedDeviceId)}`
                    : "/photobox"
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold ps-sticky-btn"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isId ? "Gunakan di Photobox" : "Use in Photobox"}</span>
              </Link>
              <button
                type="button"
                disabled={Boolean(cameraError)}
                onClick={handleCaptureToEditor}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A0B0E8] text-[#111827] hover:bg-[#8FA2E3] text-xs font-bold ps-sticky-btn disabled:opacity-45"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isId ? "Jepret ke Editor" : "Snap to Editor"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detected Devices List */}
        <div className="lg:col-span-5 rounded-3xl bg-brand-surface p-5 space-y-4 nb-box">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#A0B0E8] text-[#111827] flex items-center justify-center ps-sticky-btn">
                <Usb className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-brand-text">
                  {isId ? "Perangkat Terdeteksi" : "Detected Cameras"}
                </h2>
                <p className="text-[11px] text-brand-textMuted">
                  {devices.length}{" "}
                  {isId ? "input video ditemukan di perangkat ini" : "video input(s) found"}
                </p>
              </div>
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-bg/60 p-5 text-center space-y-2">
              <Video className="w-7 h-7 text-brand-textMuted mx-auto" />
              <p className="text-xs text-brand-textMuted">
                {isId
                  ? "Belum ada kamera terdeteksi. Colokkan kamera eksternal (USB-C / Capture Card) lalu klik Scan."
                  : "No cameras detected yet. Plug in your external camera and click Scan."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((dev, idx) => {
                const isSelected = dev.deviceId === selectedDeviceId;
                const rawLabel = dev.label || "";
                const label = formatCameraLabel(rawLabel, idx, isId);
                const isExternalHint = /insta360|gopro|dji|sony|canon|fujifilm|cam link|usb|capture|obs|external/i.test(
                  rawLabel
                );
                return (
                  <button
                    key={dev.deviceId || idx}
                    type="button"
                    onClick={() => {
                      setSelectedDeviceId(dev.deviceId);
                      void connectCamera(dev.deviceId, resolution);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center justify-between gap-2.5 ps-sticky-btn ${
                      isSelected
                        ? "bg-[#D2F159] text-[#111827]"
                        : "bg-brand-surfaceMuted text-brand-text hover:bg-brand-bg"
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <Video className="w-4 h-4 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{label}</div>
                        <div
                          className={`text-[10px] font-semibold ${
                            isSelected ? "text-[#111827]/75" : "text-brand-textMuted"
                          }`}
                        >
                          {isExternalHint
                            ? isId
                              ? "Kamera Eksternal / Bridge"
                              : "External / Bridge Camera"
                            : isId
                              ? "Kamera Bawaan / Video Input"
                              : "Built-in / Video Input"}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Insta360 Ace Pro 2 Tip */}
          <div className="rounded-2xl bg-[#CBECE7] text-[#111827] p-3.5 border border-[#111827] space-y-1">
            <div className="text-xs font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isId ? "Tips Insta360 Ace Pro 2:" : "Insta360 Ace Pro 2 Tip:"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#111827]/85">
              {isId
                ? "Pastikan kabel USB-C mendukung transfer data, lalu pilih \"Webcam\" di layar kamera. Setelah muncul di daftar atas, klik \"Gunakan di Photobox\"."
                : "Use a USB-C data cable and choose \"Webcam\" on the camera screen. Once listed above, click \"Use in Photobox\"."}
            </p>
          </div>
        </div>
      </section>

      {/* Supported External Cameras Directory */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-brand-text">
              {isId ? "Daftar Kamera yang Bisa Connect" : "Supported External Cameras"}
            </h2>
            <p className="text-xs text-brand-textMuted">
              {isId
                ? "Semua kamera dengan mode USB-C UVC Webcam, USB Streaming, atau HDMI Capture Card dapat langsung digunakan."
                : "Any camera supporting USB-C UVC Webcam, USB Streaming, or HDMI Capture Card works out of the box."}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-brand-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isId ? "Cari kamera (mis. Ace Pro 2)..." : "Search camera (e.g. Ace Pro 2)..."}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-brand-surface border border-brand-border text-xs text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-[#38D1BF]"
            />
          </div>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const active = brandFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBrandFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold ps-sticky-btn ${
                  active
                    ? `${tab.color} text-[#111827]`
                    : "bg-brand-surface text-brand-textMuted hover:text-brand-text"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Camera Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCameras.map((cam) => {
            const steps = isId ? cam.stepsId : cam.stepsEn;
            return (
              <div
                key={cam.id}
                className="rounded-2xl bg-brand-surface p-4 space-y-3 nb-box flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textMuted">
                        {cam.brand}
                      </span>
                      <h3 className="text-sm font-bold text-brand-text leading-snug">
                        {cam.name}
                      </h3>
                    </div>
                    {cam.badge && (
                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#111827] ps-sticky-btn ${
                          cam.badgeColor || "bg-[#D2F159]"
                        }`}
                      >
                        {cam.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-surfaceMuted border border-brand-border font-semibold text-brand-text">
                      {cam.connectionType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-surfaceMuted border border-brand-border font-semibold text-brand-textMuted">
                      {cam.maxResolution}
                    </span>
                  </div>

                  <ol className="space-y-1.5 text-xs text-brand-textMuted list-decimal list-inside pt-1">
                    {steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      void connectCamera(selectedDeviceId || undefined, resolution);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold ps-sticky-btn"
                  >
                    <PlugZap className="w-3.5 h-3.5" />
                    <span>{isId ? "Hubungkan Kamera Ini" : "Connect This Camera"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
