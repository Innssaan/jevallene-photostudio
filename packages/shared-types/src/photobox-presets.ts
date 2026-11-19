import {
  enforceMandatoryWatermark,
  type AssetLayer,
  type FilterPreset,
  type PhotoSlot,
  type TemplateLayer,
  type TextLayer,
} from "./template.js";
import type { TemplatePreset } from "./presets.js";

const PLAYFAIR = "'Playfair Display', Georgia, serif";
const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO = "'Space Mono', monospace";
const CAVEAT = "'Caveat', cursive";
const BEBAS = "'Bebas Neue', Impact, sans-serif";

function shape(
  id: string,
  zIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  extra: Partial<AssetLayer> = {}
): AssetLayer {
  return { id, type: "shape", zIndex, x, y, width, height, visible: true, tintColor: fill, ...extra };
}

function text(
  id: string,
  zIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  content: string,
  fontSize: number,
  color: string,
  align: TextLayer["align"] = "center",
  fontFamily: string = SANS,
  letterSpacing = 0
): TextLayer {
  return {
    id,
    type: "text",
    zIndex,
    x,
    y,
    width,
    height,
    visible: true,
    content,
    fontFamily,
    fontSize,
    color,
    align,
    letterSpacing,
  };
}

function slot(id: string, index: number, x: number, y: number, w: number, h: number, filter: FilterPreset, radius = 4): PhotoSlot {
  return { id, index, x, y, width: w, height: h, borderRadius: radius, filter };
}

interface TicketConfig {
  id: string;
  slug: string;
  title: string;
  description_id: string;
  description_en: string;
  theme: "vintage" | "editorial";
  popularity: number;
  bg: string;
  card: string;
  ink: string;
  accent: string;
  header: string;
  col1Top: string;
  col1Bot: string;
  col2Top: string;
  col2Bot: string;
  col3Top: string;
  col3Bot: string;
  footer: string;
  brand: string;
  filter: FilterPreset;
  watermarkLight: boolean;
  showStars: boolean;
}

/** Two identical 4-shot ticket strips side by side (classic photobooth print). */
function ticketDouble(cfg: TicketConfig): TemplatePreset {
  const slots: PhotoSlot[] = [];
  const layers: TemplateLayer[] = [];
  let z = 1;

  [40, 520].forEach((cx, s) => {
    const p = `s${s + 1}`;
    layers.push(
      shape(`${p}-card`, -3, cx, 30, 440, 1400, cfg.card, {
        shapeKind: cfg.showStars ? "ticket" : "rect",
        borderRadius: 24,
      }),
      shape(`${p}-frame`, -2, cx + 16, 44, 408, 1372, "transparent", {
        borderRadius: 16,
        strokeColor: cfg.accent,
        strokeWidth: 2.5,
      })
    );

    if (cfg.showStars) {
      layers.push(
        shape(`${p}-star-l`, z++, cx + 178, 56, 16, 16, cfg.accent, { shapeKind: "star" }),
        shape(`${p}-star-c`, z++, cx + 208, 52, 24, 24, cfg.accent, { shapeKind: "star" }),
        shape(`${p}-star-r`, z++, cx + 246, 56, 16, 16, cfg.accent, { shapeKind: "star" })
      );
    }

    layers.push(
      text(`${p}-title`, z++, cx + 20, cfg.showStars ? 74 : 58, 400, 74, cfg.header, 42, cfg.accent, "center", PLAYFAIR, 1),
      shape(`${p}-line1`, z++, cx + 16, 152, 408, 2.5, cfg.accent),
      // 3-column ticket metadata table
      shape(`${p}-div1`, z++, cx + 132, 152, 2, 76, cfg.accent),
      shape(`${p}-div2`, z++, cx + 248, 152, 2, 76, cfg.accent),
      text(`${p}-c1t`, z++, cx + 20, 158, 108, 26, cfg.col1Top, 15, cfg.ink, "center", PLAYFAIR),
      text(`${p}-c1b`, z++, cx + 20, 184, 108, 38, cfg.col1Bot, 28, cfg.accent, "center", PLAYFAIR),
      text(`${p}-c2t`, z++, cx + 136, 158, 108, 26, cfg.col2Top, 15, cfg.ink, "center", PLAYFAIR),
      text(`${p}-c2b`, z++, cx + 136, 184, 108, 38, cfg.col2Bot, 28, cfg.accent, "center", PLAYFAIR),
      text(`${p}-c3t`, z++, cx + 252, 158, 168, 26, cfg.col3Top, 14, cfg.ink, "center", MONO),
      text(`${p}-c3b`, z++, cx + 252, 184, 168, 38, cfg.col3Bot, 22, cfg.accent, "center", MONO),
      shape(`${p}-line2`, z++, cx + 16, 228, 408, 2.5, cfg.accent),
      shape(`${p}-line3`, z++, cx + 16, 1286, 408, 2, cfg.accent),
      text(`${p}-footer`, z++, cx + 20, 1294, 400, 28, cfg.footer, 12, cfg.ink, "center", MONO, 1),
      text(`${p}-brand`, z++, cx + 20, 1326, 400, 56, cfg.brand, 36, cfg.accent, "center", PLAYFAIR, 0),
      shape(`${p}-barcode`, z++, cx + 135, 1384, 170, 22, cfg.ink, { shapeKind: "barcode", opacity: 0.78 })
    );
    for (let i = 0; i < 4; i++) {
      slots.push(slot(`${p}-slot-${i + 1}`, i, cx + 32, 250 + i * 256, 376, 236, cfg.filter));
    }
  });

  return {
    id: cfg.id,
    slug: cfg.slug,
    title_id: cfg.title,
    title_en: cfg.title,
    description_id: cfg.description_id,
    description_en: cfg.description_en,
    category: "photobox",
    theme: cfg.theme,
    popularity_score: cfg.popularity,
    is_featured: true,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: cfg.id,
      version: 1,
      category: "photobox",
      theme: cfg.theme,
      canvas: {
        width: 1000,
        height: 1500,
        aspectRatio: "2:3",
        background: { type: "solid", value: cfg.bg },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: cfg.showStars ? "bottom-center" : "bottom-left",
        contrastMode: cfg.watermarkLight ? "light" : "dark",
        fontFamily: cfg.showStars ? PLAYFAIR : MONO,
        style: cfg.showStars ? "italic" : "minimal",
      }),
    },
  };
}

function musicPlayer(): TemplatePreset {
  const slots: PhotoSlot[] = [];
  const layers: TemplateLayer[] = [];
  let z = 1;
  const barHeights = [10, 22, 34, 18, 40, 26, 12, 36, 44, 20, 30, 14, 38, 24, 42, 16, 32, 10, 28, 40, 18, 34, 22, 12, 36, 26];

  [40, 520].forEach((cx, s) => {
    const p = `c${s + 1}`;
    for (let i = 0; i < 3; i++) {
      slots.push(slot(`${p}-slot-${i + 1}`, i, cx, 40 + i * 340, 440, 300, "natural", 2));
    }
    layers.push(
      text(`${p}-title`, z++, cx, 1066, 340, 60, "Farewell", 42, "#ffffff", "left", SANS),
      text(`${p}-sub`, z++, cx, 1126, 340, 34, "Batch of 2026", 22, "#a3a3a3", "left", SANS),
      text(`${p}-heart`, z++, cx + 360, 1070, 80, 60, "♥", 46, "#22c55e", "right", SANS),
      shape(`${p}-track`, z++, cx, 1190, 440, 6, "#525252", { borderRadius: 3 }),
      shape(`${p}-fill`, z++, cx, 1190, 210, 6, "#22c55e", { borderRadius: 3 }),
      shape(`${p}-knob`, z++, cx + 202, 1184, 18, 18, "#ffffff", { borderRadius: 9 }),
      text(`${p}-t1`, z++, cx, 1206, 120, 30, "20:25", 16, "#a3a3a3", "left", MONO),
      text(`${p}-t2`, z++, cx + 320, 1206, 120, 30, "20:26", 16, "#a3a3a3", "right", MONO),
      text(`${p}-controls`, z++, cx, 1244, 440, 64, "⇄    ⏮    ⏸    ⏭    ↻", 32, "#ffffff", "center", SANS),
      shape(`${p}-logo`, z++, cx, 1332, 60, 60, "#ffffff", { borderRadius: 30 }),
      text(`${p}-logo-note`, z++, cx, 1332, 60, 60, "♪", 34, "#000000", "center", SANS)
    );
    barHeights.forEach((h, b) => {
      layers.push(shape(`${p}-bar-${b}`, z++, cx + 90 + b * 13.5, 1362 - h / 2, 6, h, "#ffffff", { borderRadius: 3 }));
    });
  });

  return {
    id: "music-player",
    slug: "music-player-strip",
    title_id: "Music Player Strip",
    title_en: "Music Player Strip",
    description_id: "Dua kolom 3 foto dengan kartu pemutar musik hitam, cocok untuk kenang-kenangan acara atau perpisahan.",
    description_en: "Two columns of 3 photos with a black music-player card, great for farewells and events.",
    category: "photobox",
    theme: "dark",
    popularity_score: 94,
    is_featured: true,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "music-player",
      version: 1,
      category: "photobox",
      theme: "dark",
      canvas: {
        width: 1000,
        height: 1500,
        aspectRatio: "2:3",
        background: { type: "solid", value: "#000000" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "light",
        fontFamily: MONO,
        style: "minimal",
      }),
    },
  };
}

function comicHero(): TemplatePreset {
  const slots: PhotoSlot[] = [];
  const layers: TemplateLayer[] = [];
  let z = 1;
  const panels = [
    { fill: "#d62839", word: "POW!", ink: "#fbf7ef" },
    { fill: "#f5f5f5", word: "ZAP!", ink: "#0b1a3a" },
    { fill: "#2ec4b6", word: "WOW!", ink: "#0b1a3a" },
    { fill: "#ff9f1c", word: "BAM!", ink: "#0b1a3a" },
  ];

  layers.push(
    shape("blueprint-grid", -5, 0, 0, 1080, 1920, "rgba(255,255,255,0.09)", {
      shapeKind: "grid",
      strokeWidth: 1.5,
    }),
    shape("card", -4, 90, 170, 900, 1520, "#0b1a3a", { borderRadius: 10 }),
    shape("card-left", -3, 90, 170, 450, 1520, "#7f1d1d", { borderRadius: 10 }),
    shape("tag", z++, 60, 30, 380, 120, "#ffffff", { borderRadius: 10, strokeColor: "#d62839", strokeWidth: 4 }),
    shape("tag-band", z++, 60, 30, 380, 40, "#d62839", { borderRadius: 10 }),
    text("tag-hello", z++, 60, 30, 380, 40, "HELLO, MY NAME IS", 18, "#ffffff", "center", SANS, 2),
    text("tag-name", z++, 60, 74, 380, 70, "Your Name", 48, "#111111", "center", CAVEAT)
  );

  panels.forEach((panel, i) => {
    const y = 210 + i * 350;
    slots.push(slot(`slot-${i + 1}`, i, 120, y, 390, 330, "natural", 2));
    layers.push(
      shape(`panel-${i + 1}`, z++, 560, y, 400, 330, panel.fill, { borderRadius: 2 }),
      text(`panel-word-${i + 1}`, z++, 560, y + 100, 400, 130, panel.word, 108, panel.ink, "center", BEBAS, 4)
    );
  });

  layers.push(
    text("title", z++, 90, 1606, 900, 74, "HERO NIGHT", 76, "#ef4444", "center", BEBAS, 6)
  );

  return {
    id: "comic-hero",
    slug: "comic-hero-blueprint",
    title_id: "Comic Hero Blueprint",
    title_en: "Comic Hero Blueprint",
    description_id: "9:16 untuk Story: 4 foto di kiri dan panel ilustrasi komik di kanan, berlatar blueprint biru.",
    description_en: "9:16 for Stories: 4 photos on the left with comic illustration panels on the right over a blueprint backdrop.",
    category: "photobox",
    theme: "editorial",
    popularity_score: 90,
    is_featured: true,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "comic-hero",
      version: 1,
      category: "photobox",
      theme: "editorial",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "gradient", value: "linear-gradient(180deg, #1e4fa8 0%, #12306b 100%)" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "top-right",
        contrastMode: "light",
        fontFamily: BEBAS,
        style: "italic",
      }),
    },
  };
}

export const PHOTOBOX_STYLE_TEMPLATES: TemplatePreset[] = [
  ticketDouble({
    id: "theater-ticket",
    slug: "theater-show-ticket",
    title: "Theater Show Ticket",
    description_id: "Dua strip 4 foto bergaya tiket teater maroon dengan tirai merah, baris, nomor show, dan tanggal.",
    description_en: "Two 4-shot strips styled as maroon theater tickets with row, show number, and date.",
    theme: "vintage",
    popularity: 99,
    bg: "#6b0f12",
    card: "#fbf3e6",
    ink: "#6b0f12",
    accent: "#7f1d1d",
    header: "Theater Show",
    col1Top: "Row",
    col1Bot: "B2",
    col2Top: "Show",
    col2Bot: "02",
    col3Top: "{{date}}",
    col3Bot: "20.00",
    footer: "SAVE THE BEST MOMENT ★ SAVE THE BEST MOMENT",
    brand: "your studio.",
    filter: "vintage",
    watermarkLight: true,
    showStars: true,
  }),
  ticketDouble({
    id: "navy-ticket",
    slug: "raw-memories-ticket",
    title: "Raw Memories Ticket",
    description_id: "Dua strip 4 foto bergaya tiket krem di atas latar navy dengan judul 'Raw Memories'.",
    description_en: "Two 4-shot cream ticket strips on a navy backdrop titled 'Raw Memories'.",
    theme: "editorial",
    popularity: 96,
    bg: "#14213d",
    card: "#fdf3ea",
    ink: "#1e3a5f",
    accent: "#1e3a5f",
    header: "Photobooth",
    col1Top: "{{date}}",
    col1Bot: "10.00",
    col2Top: "Row",
    col2Bot: "A",
    col3Top: "Seat",
    col3Bot: "07",
    footer: "★   RAW MEMORIES   ★",
    brand: "Raw Memories",
    filter: "natural",
    watermarkLight: true,
    showStars: false,
  }),
  musicPlayer(),
  comicHero(),
  receiptStrip(),
  vintageNewspaper(),
  boardingPass(),
  magazineCover(),
];

function receiptStrip(): TemplatePreset {
  const slots: PhotoSlot[] = [0, 1, 2, 3].map((i) =>
    slot(`slot-${i + 1}`, i, 70, 210 + i * 245, 580, 225, "bw", 4)
  );
  let z = 1;
  const layers: TemplateLayer[] = [
    shape("paper", -2, 32, 24, 656, 1400, "#fcfaf4", {
      borderRadius: 6,
      strokeColor: "#d6d3cd",
      strokeWidth: 2,
    }),
    text("shop", z++, 50, 52, 620, 44, "STUDIO RECEIPT", 34, "#18181b", "center", MONO, 4),
    text("meta", z++, 50, 102, 620, 26, "ORDER #0428  ·  {{date}}", 15, "#52525b", "center", MONO, 1),
    shape("rule-top", z++, 64, 146, 592, 2, "#18181b"),
    text("cols", z++, 70, 162, 580, 24, "QTY   ITEM                        AMT", 14, "#3f3f46", "left", MONO),
    shape("rule-mid", z++, 64, 192, 592, 1.5, "#a1a1aa"),
    shape("rule-bot", z++, 64, 1200, 592, 2, "#18181b"),
    text("total-l", z++, 70, 1216, 420, 28, "4 x GOOD MEMORIES", 18, "#18181b", "left", MONO),
    text("total-r", z++, 480, 1216, 170, 28, "FREE", 18, "#18181b", "right", MONO),
    text("thanks", z++, 50, 1262, 620, 26, "THANK YOU FOR VISITING!", 15, "#52525b", "center", MONO, 2),
    shape("barcode", z++, 210, 1304, 300, 44, "#18181b", { shapeKind: "barcode" }),
  ];

  return {
    id: "receipt-strip",
    slug: "studio-receipt-strip",
    title_id: "Studio Receipt 4-Cut",
    title_en: "Studio Receipt 4-Cut",
    description_id: "Strip photobox bergaya struk belanja hitam-putih lengkap dengan barcode dan daftar momen.",
    description_en: "Black-and-white thermal receipt photobox strip complete with barcode and itemized memories.",
    category: "photobox",
    theme: "minimal",
    popularity_score: 97,
    is_featured: true,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "receipt-strip",
      version: 1,
      category: "photobox",
      theme: "minimal",
      canvas: {
        width: 720,
        height: 1500,
        aspectRatio: "custom",
        background: { type: "solid", value: "#e4e4e7" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "dark",
        fontFamily: MONO,
        style: "minimal",
      }),
    },
  };
}

function vintageNewspaper(): TemplatePreset {
  let z = 1;
  const slots: PhotoSlot[] = [
    slot("slot-1", 0, 64, 244, 832, 470, "bw", 4),
    slot("slot-2", 1, 64, 742, 404, 320, "bw", 4),
    slot("slot-3", 2, 492, 742, 404, 320, "bw", 4),
  ];
  const layers: TemplateLayer[] = [
    shape("rule-top-1", z++, 64, 52, 832, 4, "#1c1917"),
    text("masthead", z++, 64, 68, 832, 66, "THE DAILY MOMENT", 56, "#1c1917", "center", PLAYFAIR, 2),
    shape("rule-top-2", z++, 64, 146, 832, 2, "#1c1917"),
    text("edition", z++, 64, 156, 832, 28, "VOL. 26  ·  {{date}}  ·  SPECIAL EDITION", 15, "#44403c", "center", MONO, 2),
    shape("rule-top-3", z++, 64, 192, 832, 2, "#1c1917"),
    text("headline", z++, 64, 206, 832, 30, "EXTRA! CAPTURED LIVE IN STUDIO", 22, "#1c1917", "center", BEBAS, 4),
    shape("rule-bot", z++, 64, 1084, 832, 2, "#1c1917"),
    text("caption-l", z++, 64, 1098, 520, 32, "EXCLUSIVE PHOTOGRAPHIC EDITION", 14, "#44403c", "left", MONO, 1),
  ];

  return {
    id: "vintage-newspaper",
    slug: "vintage-newspaper-collage",
    title_id: "The Daily Moment (Koran)",
    title_en: "The Daily Moment (Newspaper)",
    description_id: "Kolase koran retro 3 foto dengan masthead klasik, garis editorial, dan filter hitam-putih.",
    description_en: "Retro 3-photo newspaper collage with classic masthead, editorial rules, and B&W filter.",
    category: "collage",
    theme: "vintage",
    popularity_score: 93,
    is_featured: false,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "vintage-newspaper",
      version: 1,
      category: "collage",
      theme: "vintage",
      canvas: {
        width: 960,
        height: 1200,
        aspectRatio: "4:5",
        background: { type: "solid", value: "#efe8d8" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "dark",
        fontFamily: PLAYFAIR,
        style: "italic",
      }),
    },
  };
}

function boardingPass(): TemplatePreset {
  const slots: PhotoSlot[] = [];
  const layers: TemplateLayer[] = [];
  let z = 1;

  [40, 520].forEach((cx, s) => {
    const p = `bp${s + 1}`;
    layers.push(
      shape(`${p}-card`, -3, cx, 36, 440, 1380, "#f8fafc", { borderRadius: 20 }),
      shape(`${p}-band`, -2, cx, 36, 440, 88, "#e5142a", { borderRadius: 20 }),
      text(`${p}-air`, z++, cx + 24, 52, 260, 36, "BOARDING PASS", 26, "#ffffff", "left", BEBAS, 3),
      text(`${p}-cls`, z++, cx + 280, 56, 136, 28, "FIRST CLASS", 13, "#fecaca", "right", MONO, 1),
      text(`${p}-route`, z++, cx + 24, 140, 392, 46, "BDO  ✈  SEL", 36, "#0f172a", "center", MONO, 3),
      text(`${p}-meta`, z++, cx + 24, 194, 392, 26, "GATE 07  ·  SEAT 14A  ·  {{date}}", 13, "#475569", "center", MONO),
      shape(`${p}-div`, z++, cx + 24, 230, 392, 2, "#cbd5e1"),
      shape(`${p}-stub`, z++, cx + 24, 1260, 392, 2, "#cbd5e1"),
      text(`${p}-note`, z++, cx + 24, 1274, 392, 28, "PRIORITY MEMORY FLIGHT", 13, "#475569", "center", MONO, 2),
      shape(`${p}-bar`, z++, cx + 95, 1314, 250, 48, "#0f172a", { shapeKind: "barcode" })
    );
    for (let i = 0; i < 3; i++) {
      slots.push(slot(`${p}-slot-${i + 1}`, i, cx + 28, 250 + i * 332, 384, 308, "korean", 8));
    }
  });

  return {
    id: "boarding-pass",
    slug: "boarding-pass-strip",
    title_id: "Boarding Pass 3-Cut",
    title_en: "Boarding Pass 3-Cut",
    description_id: "Dua strip 3 foto bergaya tiket pesawat First Class lengkap dengan kode rute & barcode.",
    description_en: "Two 3-shot strips styled as First Class airline boarding passes with route code & barcode.",
    category: "photobox",
    theme: "editorial",
    popularity_score: 92,
    is_featured: false,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "boarding-pass",
      version: 1,
      category: "photobox",
      theme: "editorial",
      canvas: {
        width: 1000,
        height: 1500,
        aspectRatio: "2:3",
        background: { type: "solid", value: "#0f172a" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-left",
        contrastMode: "light",
        fontFamily: MONO,
        style: "italic",
      }),
    },
  };
}

function magazineCover(): TemplatePreset {
  let z = 1;
  const slots: PhotoSlot[] = [
    slot("slot-1", 0, 56, 210, 560, 880, "cinematic", 8),
    slot("slot-2", 1, 636, 210, 208, 260, "cinematic", 8),
    slot("slot-3", 2, 636, 494, 208, 260, "cinematic", 8),
  ];
  const layers: TemplateLayer[] = [
    text("title", z++, 56, 48, 788, 110, "ATELIER", 104, "#fafafa", "center", PLAYFAIR, 8),
    text("issue", z++, 56, 168, 788, 28, "ISSUE 09  ·  {{date}}  ·  STUDIO EDITION", 15, "#a1a1aa", "center", MONO, 3),
    text("cover-story", z++, 636, 782, 208, 44, "THE NEW ERA", 30, "#e5142a", "left", BEBAS, 2),
    text("cover-sub", z++, 636, 830, 208, 60, "PORTRAIT SERIES", 14, "#d4d4d8", "left", MONO, 1),
    shape("barcode", z++, 636, 1020, 208, 54, "#fafafa", { shapeKind: "barcode" }),
    text("footer", z++, 56, 1118, 360, 30, "COLLECTOR'S PRINT", 14, "#a1a1aa", "left", MONO, 3),
  ];

  return {
    id: "magazine-cover",
    slug: "atelier-magazine-cover",
    title_id: "Atelier Magazine Cover",
    title_en: "Atelier Magazine Cover",
    description_id: "Sampul majalah editorial 3:4 dengan 1 potret utama, 2 inset detail, dan masthead Playfair.",
    description_en: "3:4 editorial magazine cover with 1 hero portrait, 2 detail insets, and Playfair masthead.",
    category: "ig_feed",
    theme: "editorial",
    popularity_score: 90,
    is_featured: false,
    is_new: true,
    document: {
      schemaVersion: "1.0",
      templateId: "magazine-cover",
      version: 1,
      category: "ig_feed",
      theme: "editorial",
      canvas: {
        width: 900,
        height: 1200,
        aspectRatio: "3:4",
        background: { type: "solid", value: "#18181b" },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "light",
        fontFamily: PLAYFAIR,
        style: "italic",
      }),
    },
  };
}
