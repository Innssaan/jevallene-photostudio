import { CANVA_ART } from "./canva-art.js";
import type { TemplatePreset } from "./presets.js";
import {
  enforceMandatoryWatermark,
  type FilterPreset,
  type PhotoSlot,
  type TemplateLayer,
} from "./template.js";

const rect = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  z: number,
  extra: Partial<TemplateLayer> = {}
): TemplateLayer =>
  ({
    id,
    type: "shape",
    shapeKind: "rect",
    x,
    y,
    width: w,
    height: h,
    visible: true,
    tintColor: fill,
    zIndex: z,
    ...extra,
  }) as TemplateLayer;

const sticker = (
  id: string,
  assetId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation = 0,
  z = 6,
  opacity = 1
): TemplateLayer => ({
  id,
  type: "sticker",
  assetId,
  x,
  y,
  width: w,
  height: h,
  rotation,
  opacity,
  visible: true,
  zIndex: z,
});

const text = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  fontFamily: string,
  fontSize: number,
  color: string,
  extra: Partial<TemplateLayer> = {}
): TemplateLayer =>
  ({
    id,
    type: "text",
    x,
    y,
    width: w,
    height: h,
    visible: true,
    content,
    fontFamily,
    fontSize,
    color,
    align: "center",
    zIndex: 5,
    ...extra,
  }) as TemplateLayer;

const framedSlots = (
  coords: Array<{ x: number; y: number; w: number; h: number }>,
  opts: {
    filter: FilterPreset;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
  }
): { slots: PhotoSlot[]; frames: TemplateLayer[] } => {
  const slots: PhotoSlot[] = coords.map((c, index) => ({
    id: `slot-${index + 1}`,
    index,
    x: c.x,
    y: c.y,
    width: c.w,
    height: c.h,
    borderRadius: opts.borderRadius,
    filter: opts.filter,
  }));
  const frames: TemplateLayer[] = coords.map((c, index) =>
    rect(
      `frame-${index + 1}`,
      c.x - opts.borderWidth,
      c.y - opts.borderWidth,
      c.w + opts.borderWidth * 2,
      c.h + opts.borderWidth * 2,
      "transparent",
      -1,
      {
        borderRadius: opts.borderRadius + opts.borderWidth,
        strokeColor: opts.borderColor,
        strokeWidth: opts.borderWidth,
      }
    )
  );
  return { slots, frames };
};

const gala = framedSlots(
  [
    { x: 68, y: 230, w: 464, h: 390 },
    { x: 68, y: 650, w: 464, h: 390 },
    { x: 68, y: 1070, w: 464, h: 390 },
  ],
  { filter: "cinematic", borderRadius: 4, borderColor: "#d4af37", borderWidth: 3 }
);

const floral = framedSlots(
  [
    { x: 75, y: 200, w: 450, h: 318 },
    { x: 75, y: 542, w: 450, h: 318 },
    { x: 75, y: 884, w: 450, h: 318 },
    { x: 75, y: 1226, w: 450, h: 318 },
  ],
  { filter: "korean", borderRadius: 10, borderColor: "#d9cbb8", borderWidth: 2 }
);

const grad = framedSlots(
  [
    { x: 68, y: 235, w: 464, h: 386 },
    { x: 68, y: 650, w: 464, h: 386 },
    { x: 68, y: 1065, w: 464, h: 386 },
  ],
  { filter: "natural", borderRadius: 6, borderColor: "#e7c667", borderWidth: 3 }
);

const neonSlots: PhotoSlot[] = [
  { id: "slot-1", index: 0, x: 68, y: 235, width: 464, height: 386, borderRadius: 14, filter: "retro" },
  { id: "slot-2", index: 1, x: 68, y: 652, width: 464, height: 386, borderRadius: 14, filter: "retro" },
  { id: "slot-3", index: 2, x: 68, y: 1069, width: 464, height: 386, borderRadius: 14, filter: "retro" },
];

const koreanGrid = framedSlots(
  [
    { x: 56, y: 190, w: 332, h: 392 },
    { x: 412, y: 190, w: 332, h: 392 },
    { x: 56, y: 608, w: 332, h: 392 },
    { x: 412, y: 608, w: 332, h: 392 },
  ],
  { filter: "korean", borderRadius: 4, borderColor: "#d5cbbd", borderWidth: 2 }
);

const bdaySlots: PhotoSlot[] = [
  { id: "slot-1", index: 0, x: 70, y: 235, width: 460, height: 386, borderRadius: 20, filter: "aesthetic" },
  { id: "slot-2", index: 1, x: 70, y: 650, width: 460, height: 386, borderRadius: 20, filter: "aesthetic" },
  { id: "slot-3", index: 2, x: 70, y: 1065, width: 460, height: 386, borderRadius: 20, filter: "aesthetic" },
];

export const CANVA_INSPIRED_TEMPLATES: TemplatePreset[] = [
  // 1. Black & Gold Gala 3-Cut (Canva Luxury Party Strip)
  {
    id: "canva-black-gold-gala",
    slug: "canva-black-gold-gala",
    title_id: "Black & Gold Gala 3-Cut",
    title_en: "Black & Gold Gala 3-Cut",
    description_id:
      "Strip photobooth malam gala hitam-emas ala Canva dengan ornamen champagne, sudut foil emas, dan tipografi klasik.",
    description_en:
      "Canva-style black and gold gala photobooth strip with champagne flutes, gold foil corners, and classic serif typography.",
    category: "photobox",
    theme: "dark",
    is_featured: true,
    is_new: true,
    popularity_score: 99,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-black-gold-gala",
      version: 1,
      category: "photobox",
      theme: "dark",
      canvas: {
        width: 600,
        height: 1800,
        aspectRatio: "custom",
        background: { type: "solid", value: "#111114" },
      },
      slots: gala.slots,
      layers: [
        ...gala.frames,
        sticker("gala-corner-tl", CANVA_ART.goldCornerTL, 24, 24, 96, 96, 0, 2),
        sticker("gala-corner-br", CANVA_ART.goldCornerBR, 480, 1680, 96, 96, 0, 2),
        text(
          "gala-kicker",
          40,
          72,
          520,
          28,
          "A NIGHT TO REMEMBER",
          "Space Mono",
          16,
          "#d4af37",
          { letterSpacing: 4 }
        ),
        text(
          "gala-title",
          40,
          112,
          520,
          68,
          "GOLDEN GALA",
          "Playfair Display",
          50,
          "#f7e3a1",
          { letterSpacing: 3 }
        ),
        text(
          "gala-footer-title",
          130,
          1516,
          340,
          56,
          "Cheers to Tonight",
          "Dancing Script",
          42,
          "#f7e3a1"
        ),
        text(
          "gala-footer-sub",
          80,
          1592,
          440,
          28,
          "VIP PHOTOBOOTH • SPECIAL EDITION",
          "Space Mono",
          13,
          "#cbb47a",
          { letterSpacing: 2.5 }
        ),
        sticker("gala-flutes", CANVA_ART.champagneFlutes, 34, 1492, 108, 108, -8, 6),
        sticker("gala-sparkle", CANVA_ART.goldSparkle, 472, 1506, 72, 72, 0, 6),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "light",
        fontFamily: "Space Mono",
        style: "minimal",
      }),
    },
  },

  // 2. Garden Floral Wedding 4-Cut (Canva Botanical Strip)
  {
    id: "canva-floral-wedding",
    slug: "canva-floral-wedding",
    title_id: "Garden Floral Wedding 4-Cut",
    title_en: "Garden Floral Wedding 4-Cut",
    description_id:
      "Strip photobooth pernikahan botani lembut dengan buket bunga mawar pastel, daun eukaliptus, dan skrip romantis.",
    description_en:
      "Soft botanical wedding photobooth strip with pastel rose bouquet, eucalyptus sprigs, and romantic script.",
    category: "photobox",
    theme: "romantic",
    is_featured: true,
    is_new: true,
    popularity_score: 97,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-floral-wedding",
      version: 1,
      category: "photobox",
      theme: "romantic",
      canvas: {
        width: 600,
        height: 1800,
        aspectRatio: "custom",
        background: { type: "solid", value: "#fbf8f3" },
      },
      slots: floral.slots,
      layers: [
        ...floral.frames,
        sticker("floral-top-bouquet", CANVA_ART.floralBouquetTop, 160, 10, 280, 112, 0, 3),
        text(
          "floral-title",
          40,
          118,
          520,
          58,
          "Forever & Always",
          "Dancing Script",
          44,
          "#4d5d48"
        ),
        text(
          "floral-couple",
          80,
          1582,
          440,
          42,
          "SOPHIA  &  DANIEL",
          "Playfair Display",
          28,
          "#3f4b3b",
          { letterSpacing: 3 }
        ),
        text(
          "floral-date",
          80,
          1638,
          440,
          26,
          "GARDEN CELEBRATION • 2026",
          "Space Mono",
          13,
          "#7b8774",
          { letterSpacing: 2 }
        ),
        sticker("floral-leaf-left", CANVA_ART.eucalyptusSprig, 14, 1554, 92, 108, -12, 3),
        sticker("floral-leaf-right", CANVA_ART.eucalyptusSprig, 494, 1554, 92, 108, 22, 3),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "dark",
        fontFamily: "Space Mono",
        style: "italic",
      }),
    },
  },

  // 3. Class of 2026 Graduation Strip (Canva Academic Milestone)
  {
    id: "canva-graduation-2026",
    slug: "canva-graduation-2026",
    title_id: "Class of 2026 Grad Strip",
    title_en: "Class of 2026 Grad Strip",
    description_id:
      "Strip photobooth kelulusan navy-emas ala Canva dengan topi toga, rangkaian daun salam, dan tipografi kampus klasik.",
    description_en:
      "Canva-style navy and gold graduation photobooth strip with mortarboard cap, laurel wreath, and collegiate typography.",
    category: "photobox",
    theme: "editorial",
    is_featured: true,
    is_new: true,
    popularity_score: 96,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-graduation-2026",
      version: 1,
      category: "photobox",
      theme: "editorial",
      canvas: {
        width: 600,
        height: 1800,
        aspectRatio: "custom",
        background: { type: "solid", value: "#121c36" },
      },
      slots: grad.slots,
      layers: [
        ...grad.frames,
        text(
          "grad-kicker",
          40,
          64,
          420,
          28,
          "CONGRATULATIONS",
          "Space Mono",
          16,
          "#e7c667",
          { letterSpacing: 4 }
        ),
        text(
          "grad-title",
          40,
          104,
          460,
          76,
          "CLASS OF 2026",
          "Bebas Neue",
          62,
          "#ffffff",
          { letterSpacing: 4 }
        ),
        sticker("grad-cap-top", CANVA_ART.gradCap, 446, 22, 124, 92, 12, 6),
        text(
          "grad-footer-quote",
          60,
          1516,
          480,
          52,
          "The Adventure Begins",
          "Playfair Display",
          36,
          "#f5d77f"
        ),
        text(
          "grad-footer-sub",
          60,
          1582,
          480,
          26,
          "COMMENCEMENT EDITION • HONOR ROLL",
          "Space Mono",
          13,
          "#cbd5e1",
          { letterSpacing: 2 }
        ),
        sticker("grad-laurel-bottom", CANVA_ART.laurelWreath, 210, 1622, 180, 96, 0, 3),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "light",
        fontFamily: "Space Mono",
        style: "minimal",
      }),
    },
  },

  // 4. Neon Disco Night 3-Cut (Canva Glow Party Strip)
  {
    id: "canva-neon-disco",
    slug: "canva-neon-disco",
    title_id: "Neon Disco Night 3-Cut",
    title_en: "Neon Disco Night 3-Cut",
    description_id:
      "Strip pesta malam neon ultraviolet dengan bola disko, petir neon pink-cyan, dan font retro groovy.",
    description_en:
      "Ultraviolet neon night party photobooth strip with disco ball, pink-cyan lightning bolts, and groovy retro display type.",
    category: "photobox",
    theme: "aesthetic",
    is_featured: true,
    is_new: true,
    popularity_score: 96,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-neon-disco",
      version: 1,
      category: "photobox",
      theme: "aesthetic",
      canvas: {
        width: 600,
        height: 1800,
        aspectRatio: "custom",
        background: {
          type: "gradient",
          value: "linear-gradient(180deg, #130826 0%, #1e1142 52%, #0c1433 100%)",
        },
      },
      slots: neonSlots,
      layers: [
        rect("neon-frame-1", 65, 232, 470, 392, "transparent", -1, {
          borderRadius: 17,
          strokeColor: "#f472b6",
          strokeWidth: 3,
        }),
        rect("neon-frame-2", 65, 649, 470, 392, "transparent", -1, {
          borderRadius: 17,
          strokeColor: "#38bdf8",
          strokeWidth: 3,
        }),
        rect("neon-frame-3", 65, 1066, 470, 392, "transparent", -1, {
          borderRadius: 17,
          strokeColor: "#c084fc",
          strokeWidth: 3,
        }),
        text(
          "disco-kicker",
          36,
          68,
          410,
          26,
          "AFTER HOURS • LIVE SET",
          "Space Mono",
          15,
          "#67e8f9",
          { letterSpacing: 3 }
        ),
        text(
          "disco-title",
          36,
          104,
          410,
          76,
          "Disco Fever",
          "Shrikhand",
          54,
          "#f472b6"
        ),
        sticker("disco-ball-top", CANVA_ART.discoBall, 456, 8, 118, 136, 0, 6),
        text(
          "disco-footer",
          110,
          1520,
          380,
          56,
          "DANCE ALL NIGHT",
          "Bebas Neue",
          48,
          "#f0abfc",
          { letterSpacing: 5 }
        ),
        text(
          "disco-sub",
          110,
          1592,
          380,
          26,
          "GLOW BOOTH • EST. MIDNIGHT",
          "Space Mono",
          13,
          "#67e8f9",
          { letterSpacing: 2.5 }
        ),
        sticker("disco-bolt-left", CANVA_ART.neonBolt, 34, 1506, 80, 96, -15, 6),
        sticker("disco-bolt-right", CANVA_ART.neonBolt, 486, 1506, 80, 96, 15, 6),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "light",
        fontFamily: "Space Mono",
        style: "italic",
      }),
    },
  },

  // 5. Korean Cream Minimalist 4-Cut (Canva 2x2 Editorial Grid)
  {
    id: "canva-korean-minimal-couple",
    slug: "canva-korean-minimal-couple",
    title_id: "Korean Cream Minimalist 4-Cut",
    title_en: "Korean Cream Minimalist 4-Cut",
    description_id:
      "Grid 2x2 estetika krim Korea minimalis ala Canva dengan bingkai tipis rapi dan skrip elegan.",
    description_en:
      "Minimalist Korean warm-cream 2x2 Canva collage with crisp hairline borders and refined editorial script.",
    category: "collage",
    theme: "minimal",
    is_featured: true,
    is_new: true,
    popularity_score: 95,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-korean-minimal-couple",
      version: 1,
      category: "collage",
      theme: "minimal",
      canvas: {
        width: 800,
        height: 1200,
        aspectRatio: "2:3",
        background: { type: "solid", value: "#f6f1e9" },
      },
      slots: koreanGrid.slots,
      layers: [
        ...koreanGrid.frames,
        text(
          "kmin-kicker",
          120,
          44,
          560,
          24,
          "SELF-PORTRAIT ARCHIVE  •  SEOUL STUDIO",
          "Space Mono",
          13,
          "#857a6b",
          { letterSpacing: 3 }
        ),
        text(
          "kmin-title",
          120,
          78,
          560,
          64,
          "Everyday Moments",
          "Playfair Display",
          46,
          "#2c2620",
          { letterSpacing: 1 }
        ),
        sticker("kmin-sparkle-tl", CANVA_ART.goldSparkle, 56, 74, 52, 52, 0, 3),
        sticker("kmin-sparkle-tr", CANVA_ART.goldSparkle, 692, 74, 52, 52, 0, 3),
        text(
          "kmin-footer-script",
          120,
          1040,
          560,
          46,
          "Captured in warm light",
          "Dancing Script",
          34,
          "#574d41"
        ),
        text(
          "kmin-footer-meta",
          120,
          1104,
          560,
          24,
          "FRAME NO. 01 — 04   |   EDITION 2026",
          "Space Mono",
          12,
          "#8f8373",
          { letterSpacing: 2.5 }
        ),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "dark",
        fontFamily: "Space Mono",
        style: "minimal",
      }),
    },
  },

  // 6. Birthday Y2K Celebration Strip (Canva Pastel Party Strip)
  {
    id: "canva-birthday-y2k-celebration",
    slug: "canva-birthday-y2k-celebration",
    title_id: "Birthday Y2K Party Strip",
    title_en: "Birthday Y2K Party Strip",
    description_id:
      "Strip ulang tahun Y2K pastel ceria dengan konfeti, bintang krom, pita pesta, dan tipografi ceria ala Canva.",
    description_en:
      "Cheerful pastel Y2K birthday photobooth strip with confetti, chrome stars, party ribbons, and playful Canva display lettering.",
    category: "photobox",
    theme: "birthday",
    is_featured: true,
    is_new: true,
    popularity_score: 96,
    document: {
      schemaVersion: "1.0",
      templateId: "canva-birthday-y2k-celebration",
      version: 1,
      category: "photobox",
      theme: "birthday",
      canvas: {
        width: 600,
        height: 1800,
        aspectRatio: "custom",
        background: {
          type: "gradient",
          value: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #ede9fe 100%)",
        },
      },
      slots: bdaySlots,
      layers: [
        rect("bday-frame-1", 66, 231, 468, 394, "transparent", -1, {
          borderRadius: 24,
          strokeColor: "#ec4899",
          strokeWidth: 4,
        }),
        rect("bday-frame-2", 66, 646, 468, 394, "transparent", -1, {
          borderRadius: 24,
          strokeColor: "#8b5cf6",
          strokeWidth: 4,
        }),
        rect("bday-frame-3", 66, 1061, 468, 394, "transparent", -1, {
          borderRadius: 24,
          strokeColor: "#f43f5e",
          strokeWidth: 4,
        }),
        sticker("bday-confetti-top", CANVA_ART.partyConfetti, 190, 8, 220, 80, 0, 2),
        text(
          "bday-title",
          40,
          78,
          520,
          72,
          "Happy Birthday!",
          "Pacifico",
          50,
          "#be185d"
        ),
        text(
          "bday-sub",
          60,
          162,
          480,
          26,
          "MAKE A WISH • PARTY EDITION",
          "Plus Jakarta Sans",
          14,
          "#6d28d9",
          { letterSpacing: 3 }
        ),
        sticker("bday-star-left", CANVA_ART.chromeStar, 24, 184, 72, 72, -12, 6),
        sticker("bday-heart-right", CANVA_ART.y2kHeart, 500, 598, 78, 72, 12, 6),
        text(
          "bday-footer",
          110,
          1514,
          380,
          52,
          "Sweetest Day Ever",
          "Shrikhand",
          36,
          "#db2777"
        ),
        text(
          "bday-footer-tag",
          90,
          1582,
          420,
          26,
          "CELEBRATING WITH MY FAVORITE PEOPLE",
          "Plus Jakarta Sans",
          13,
          "#5b21b6",
          { letterSpacing: 2 }
        ),
        sticker("bday-ribbon-left", CANVA_ART.partyRibbon, 26, 1494, 82, 82, -10, 6),
        sticker("bday-star-right", CANVA_ART.chromeStar, 494, 1498, 72, 72, 14, 6),
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "dark",
        fontFamily: "Plus Jakarta Sans",
        style: "minimal",
      }),
    },
  },
];
