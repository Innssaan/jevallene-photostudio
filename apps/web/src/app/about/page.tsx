"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Info, Loader2, Mail, MapPin, MessageCircle, MessageSquareHeart, Send, Star, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type FeedbackCategory = "feature" | "bug" | "ui" | "other";

interface FeedbackEntry {
  id: string;
  name: string;
  email?: string;
  category: FeedbackCategory;
  rating: number;
  message: string;
  createdAt: string;
}

const FEEDBACK_STORAGE_KEY = "jevallene_feedback_v1";
const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "30135211-8fbd-4914-85b3-1b23b06915f2";

export default function AboutPage() {
  const { locale, t } = useI18n();
  const isId = locale === "id";
  const [name, setName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [history, setHistory] = useState<FeedbackEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (raw) {
        setHistory(JSON.parse(raw) as FeedbackEntry[]);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const categories: { id: FeedbackCategory; label: string; color: string }[] = [
    { id: "feature", label: isId ? "Saran Fitur" : "Feature Idea", color: "bg-[#D2F159]" },
    { id: "ui", label: isId ? "Tampilan UI" : "UI / Design", color: "bg-[#38D1BF]" },
    { id: "bug", label: isId ? "Lapor Bug" : "Bug Report", color: "bg-[#FF9EB5]" },
    { id: "other", label: isId ? "Lainnya" : "Other", color: "bg-[#FFD166]" },
  ];

  const categoryLabel = categories.find((c) => c.id === category)?.label ?? category;

  const buildFormattedBody = () => {
    const sender = name.trim() || (isId ? "Pengunjung Web" : "Web Visitor");
    return [
      `[Kritik & Saran - Jevallene PhotoStudio]`,
      `${isId ? "Dari" : "From"}: ${sender}`,
      `${isId ? "Kategori" : "Category"}: ${categoryLabel}`,
      `Rating: ${rating}/5`,
      ``,
      message.trim(),
    ].join("\n");
  };

  const saveLocalFeedback = () => {
    const entry: FeedbackEntry = {
      id: `${Date.now()}`,
      name: name.trim() || (isId ? "Anonim" : "Anonymous"),
      email: senderEmail.trim() || undefined,
      category,
      rating,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const handleDeleteFeedback = (id: string) => {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const handleClearAllFeedback = () => {
    setHistory([]);
    try {
      localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const handleSendWhatsApp = () => {
    if (!message.trim()) return;
    saveLocalFeedback();
    setSendStatus({
      type: "success",
      text: isId
        ? "Masukan tersimpan & membuka WhatsApp."
        : "Feedback saved & opening WhatsApp.",
    });
    const url = `https://wa.me/628562010605?text=${encodeURIComponent(buildFormattedBody())}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessage("");
  };

  const handleSendEmail = async () => {
    if (!message.trim() || isSendingEmail) return;
    const trimmedEmail = senderEmail.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setSendStatus({
        type: "error",
        text: isId ? "Format email tidak valid." : "Invalid email format.",
      });
      return;
    }

    setIsSendingEmail(true);
    setSendStatus(null);
    const sender = name.trim() || (isId ? "Pengunjung PhotoStudio" : "PhotoStudio Visitor");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[Jevallene PhotoStudio] ${categoryLabel} (${rating}/5) — ${sender}`,
          from_name: "JEVALLENE PhotoStudio",
          name: sender,
          email: trimmedEmail || "noreply@innssaan.my.id",
          topics: `${categoryLabel} (${rating}/5)`,
          message: buildFormattedBody(),
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (res.ok && data.success) {
        saveLocalFeedback();
        setMessage("");
        setSendStatus({
          type: "success",
          text: isId
            ? `Terima kasih, ${sender}! Masukanmu sudah terkirim langsung ke email Innssaan.`
            : `Thank you, ${sender}! Your feedback was sent directly to Innssaan's email.`,
        });
      } else {
        setSendStatus({
          type: "error",
          text:
            data.message ||
            (isId ? "Gagal mengirim email. Silakan coba lagi." : "Failed to send email. Please try again."),
        });
      }
    } catch {
      setSendStatus({
        type: "error",
        text: isId
          ? "Koneksi bermasalah. Gagal mengirim email."
          : "Network error. Failed to send email.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-accent mb-1">
          <Info className="w-3.5 h-3.5" />
          <span>{isId ? "Tentang Studio" : "About Studio"}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Jevallene — Creative Digital Studio
        </h1>
        <p className="text-sm text-brand-textMuted mt-1">
          {isId
            ? "Creative Digital Studio oleh Innssaan. Bergerak di bidang Web Development, UI/UX Design, Fotografi, dan Videografi."
            : "Creative Digital Studio by Innssaan. Specializing in Web Development, UI/UX Design, Photography, and Videography."}
        </p>
      </div>

      <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* App Navigation */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-text">
              {isId ? "Navigasi" : "Navigation"}
            </p>
            <ul className="space-y-2 text-xs text-brand-textMuted">
              <li>
                <Link href="/" className="hover:text-brand-accent transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/photobox" className="hover:text-brand-accent transition-colors">
                  {t.nav.photobox}
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-brand-accent transition-colors">
                  {t.nav.templates}
                </Link>
              </li>
              <li>
                <Link href="/editor" className="hover:text-brand-accent transition-colors">
                  {t.nav.editor}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-brand-accent transition-colors">
                  {t.nav.gallery}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-text">
              {isId ? "Terhubung" : "Connect"}
            </p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-brand-textMuted">
              <li>
                <a
                  href="https://www.instagram.com/innssaan_/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-accent transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@sannveerse"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-accent transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Innssaan"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-accent transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/628562010605"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-accent transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/yQnaVA475"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-accent transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="mailto:rifkitv21@gmail.com"
                  className="hover:text-brand-accent transition-colors"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Collaboration */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-text">
              {isId ? "Lokasi & Kolaborasi" : "Location & Status"}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-text">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" />
              <span>Bandung, Indonesia</span>
            </div>
            <p className="text-xs text-brand-textMuted leading-relaxed">
              {isId
                ? "Tersedia untuk kolaborasi & diskusi proyek kreatif."
                : "Available for creative collaborations & project inquiries."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://wa.me/628562010605"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#25D366] text-[#091A10] text-xs font-bold hover:bg-[#1EBE5B] ps-sticky-btn"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isId ? "Diskusi via WhatsApp" : "Chat via WhatsApp"}</span>
              </a>
              <a
                href="https://innssaan.my.id/#kontak"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#A0B0E8] text-[#111827] text-xs font-bold hover:bg-[#8FA2E3] ps-sticky-btn"
              >
                <span>{isId ? "Kontak Innssaan" : "Contact Innssaan"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-textMuted">
          <p>
            © 2026 Innssaan · JEVALLENE.{" "}
            {isId ? "Seluruh hak cipta dilindungi." : "All rights reserved."}
          </p>
          <span>Bandung, Indonesia</span>
        </div>
      </div>

      {/* Kritik & Saran Section */}
      <section className="rounded-3xl bg-brand-surface p-6 space-y-5 nb-box">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF9EB5] text-[#111827] text-[11px] font-bold ps-sticky-btn">
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>{isId ? "Masukan Pengguna" : "User Feedback"}</span>
            </div>
            <h2 className="text-lg font-bold text-brand-text pt-1">
              {isId ? "Kritik & Saran untuk Web Ini" : "Feedback & Suggestions"}
            </h2>
            <p className="text-xs text-brand-textMuted">
              {isId
                ? "Bantu Jevallene PhotoStudio jadi lebih baik! Kirim masukan fitur, laporan bug, atau ide tampilan langsung ke Innssaan."
                : "Help Jevallene PhotoStudio get better! Send feature ideas, bug reports, or UI feedback directly to Innssaan."}
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-brand-text">
            {isId ? "Kategori Masukan" : "Feedback Category"}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold ps-sticky-btn ${
                    active
                      ? `${cat.color} text-[#111827]`
                      : "bg-brand-surfaceMuted text-brand-textMuted hover:text-brand-text"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating + Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-brand-text">
              {isId ? "Penilaian Pengalaman" : "Experience Rating"}
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ps-sticky-btn ${
                    star <= rating
                      ? "bg-[#FFD166] text-[#111827]"
                      : "bg-brand-surfaceMuted text-brand-textMuted"
                  }`}
                >
                  <Star
                    className="w-4 h-4"
                    fill={star <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-brand-textMuted">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="feedback-name" className="block text-xs font-semibold text-brand-text">
                {isId ? "Nama / Panggilan (opsional)" : "Name / Nickname (optional)"}
              </label>
              <input
                id="feedback-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isId ? "Contoh: Bestie / Raka" : "e.g. Bestie / Alex"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm sm:text-xs text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-[#38D1BF]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="feedback-email" className="block text-xs font-semibold text-brand-text">
                {isId ? "Email Kamu (opsional)" : "Your Email (optional)"}
              </label>
              <input
                id="feedback-email"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder={isId ? "emailkamu@gmail.com" : "you@email.com"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm sm:text-xs text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-[#38D1BF]"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label htmlFor="feedback-message" className="block text-xs font-semibold text-brand-text">
            {isId ? "Kritik & Saran Kamu" : "Your Feedback & Suggestions"}
          </label>
          <textarea
            id="feedback-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isId
                ? "Tulis kritik, saran fitur baru, atau kendala yang kamu temui saat memakai web ini..."
                : "Write your feedback, feature ideas, or issues you encountered..."
            }
            className="w-full px-3.5 py-2.5 rounded-2xl border border-brand-border bg-brand-bg text-xs text-brand-text placeholder:text-brand-textMuted focus:outline-none focus:border-[#38D1BF] resize-y"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={!message.trim() || isSendingEmail}
            onClick={() => void handleSendEmail()}
            className="min-h-[42px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#38D1BF] text-[#111827] hover:bg-[#2AC3B1] text-xs font-bold disabled:opacity-45 ps-sticky-btn"
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isId ? "Mengirim ke Email..." : "Sending Email..."}</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                <span>{isId ? "Kirim Langsung ke Email" : "Send Directly via Email"}</span>
              </>
            )}
          </button>
          <button
            type="button"
            disabled={!message.trim() || isSendingEmail}
            onClick={handleSendWhatsApp}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#D2F159] text-[#111827] hover:bg-[#C3E544] text-xs font-bold disabled:opacity-45 ps-sticky-btn"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isId ? "Kirim via WhatsApp" : "Send via WhatsApp"}</span>
          </button>
        </div>

        {sendStatus && (
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
              sendStatus.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sendStatus.text}</span>
          </div>
        )}

        {/* Recent local feedback log */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-brand-border space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-textMuted">
                {isId ? "Riwayat Masukan Kamu" : "Your Recent Feedback"} ({history.length})
              </p>
              <button
                type="button"
                onClick={handleClearAllFeedback}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>{isId ? "Hapus Semua" : "Clear All"}</span>
              </button>
            </div>
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-brand-border bg-brand-bg/70 px-3.5 py-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-brand-text truncate">{item.name}</span>
                      {item.email && (
                        <span className="text-[10px] text-brand-textMuted truncate">
                          ({item.email})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-brand-textMuted">
                        {item.rating}/5 · {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="p-1.5 rounded-lg text-brand-textMuted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title={isId ? "Hapus riwayat ini" : "Delete this feedback"}
                        aria-label={isId ? "Hapus riwayat masukan" : "Delete feedback"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-brand-textMuted leading-relaxed">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
