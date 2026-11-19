import { enforceMandatoryWatermark, type PhotoSlot, type TemplateLayer } from "./template.js";
import { VECTOR_STICKERS } from "./vector-stickers.js";
import type { TemplatePreset } from "./presets.js";

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const CAVEAT = "'Caveat', cursive";
const MONO = "'Space Mono', monospace";
const BEBAS = "'Bebas Neue', Impact, sans-serif";

const BIRTHDAY_ADDED_AT = "2026-11-20T03:45:00+07:00";
const BIRTHDAY_TECH_ADDED_AT = "2026-11-20T03:55:00+07:00";
const BIRTHDAY_UNLOCK_AT = "2026-11-21T00:00:00+07:00";

function svgUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

const BIRTHDAY_CAKE_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
    <ellipse cx="70" cy="118" rx="54" ry="12" fill="#FDE68A" stroke="#92400E" stroke-width="3"/>
    <rect x="26" y="76" width="88" height="40" rx="10" fill="#FDA4AF" stroke="#881337" stroke-width="3"/>
    <path d="M26 84 Q38 96 50 84 Q62 98 74 84 Q86 96 98 84 Q108 92 114 84 L114 76 Q114 72 106 72 L34 72 Q26 72 26 76 Z" fill="#FFF1F2" stroke="#881337" stroke-width="2.5"/>
    <rect x="40" y="46" width="60" height="30" rx="8" fill="#FDE047" stroke="#881337" stroke-width="3"/>
    <path d="M40 54 Q50 64 60 54 Q70 64 80 54 Q90 64 100 54 L100 46 Q100 42 94 42 L46 42 Q40 42 40 46 Z" fill="#FFFFFF" stroke="#881337" stroke-width="2.2"/>
    <rect x="54" y="22" width="8" height="22" rx="3" fill="#38BDF8" stroke="#0369A1" stroke-width="2"/>
    <rect x="78" y="22" width="8" height="22" rx="3" fill="#A78BFA" stroke="#5B21B6" stroke-width="2"/>
    <path d="M58 8 C63 14, 62 20, 58 20 C54 20, 53 14, 58 8 Z" fill="#FB923C" stroke="#C2410C" stroke-width="1.5"/>
    <path d="M82 8 C87 14, 86 20, 82 20 C78 20, 77 14, 82 8 Z" fill="#FB923C" stroke="#C2410C" stroke-width="1.5"/>
    <circle cx="58" cy="100" r="3" fill="#881337"/>
    <circle cx="82" cy="100" r="3" fill="#881337"/>
    <path d="M66 102 Q70 107 74 102" fill="none" stroke="#881337" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="50" cy="103" r="4" fill="#FB7185" opacity="0.6"/>
    <circle cx="90" cy="103" r="4" fill="#FB7185" opacity="0.6"/>
  </svg>
`);

const BALLOONS_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150">
    <path d="M42 82 Q36 112 52 142" fill="none" stroke="#64748B" stroke-width="2.2"/>
    <path d="M88 76 Q92 108 66 142" fill="none" stroke="#64748B" stroke-width="2.2"/>
    <path d="M64 62 Q64 104 60 142" fill="none" stroke="#64748B" stroke-width="2.2"/>
    <ellipse cx="40" cy="52" rx="24" ry="30" fill="#FB7185" stroke="#881337" stroke-width="2.8"/>
    <ellipse cx="32" cy="40" rx="5" ry="9" fill="#FFE4E6" opacity="0.7" transform="rotate(-18 32 40)"/>
    <ellipse cx="90" cy="48" rx="24" ry="30" fill="#38BDF8" stroke="#0369A1" stroke-width="2.8"/>
    <ellipse cx="82" cy="36" rx="5" ry="9" fill="#E0F2FE" opacity="0.7" transform="rotate(-18 82 36)"/>
    <ellipse cx="64" cy="36" rx="25" ry="31" fill="#FACC15" stroke="#A16207" stroke-width="2.8"/>
    <ellipse cx="55" cy="24" rx="5" ry="9" fill="#FEF9C3" opacity="0.75" transform="rotate(-18 55 24)"/>
  </svg>
`);

const GIFT_BOX_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect x="22" y="46" width="76" height="58" rx="8" fill="#C084FC" stroke="#581C87" stroke-width="3"/>
    <rect x="16" y="34" width="88" height="18" rx="6" fill="#A855F7" stroke="#581C87" stroke-width="3"/>
    <rect x="52" y="34" width="16" height="70" fill="#FDE047" stroke="#581C87" stroke-width="2.5"/>
    <path d="M56 32 C38 10, 22 22, 36 34 Z" fill="#FDE047" stroke="#581C87" stroke-width="2.5"/>
    <path d="M64 32 C82 10, 98 22, 84 34 Z" fill="#FDE047" stroke="#581C87" stroke-width="2.5"/>
    <circle cx="60" cy="33" r="6" fill="#FACC15" stroke="#581C87" stroke-width="2.5"/>
  </svg>
`);

const PIXEL_ROBOT_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <!-- Antenna -->
    <line x1="60" y1="14" x2="60" y2="28" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="12" r="7" fill="#D2F159" stroke="#0F172A" stroke-width="2.5"/>
    <!-- Head -->
    <rect x="24" y="28" width="72" height="54" rx="14" fill="#38BDF8" stroke="#0F172A" stroke-width="3.5"/>
    <!-- Ears -->
    <rect x="14" y="44" width="10" height="22" rx="4" fill="#0284C7" stroke="#0F172A" stroke-width="2.5"/>
    <rect x="96" y="44" width="10" height="22" rx="4" fill="#0284C7" stroke="#0F172A" stroke-width="2.5"/>
    <!-- Screen face -->
    <rect x="33" y="38" width="54" height="34" rx="8" fill="#0F172A"/>
    <!-- Cute glowing eyes -->
    <circle cx="47" cy="52" r="5.5" fill="#D2F159"/>
    <circle cx="73" cy="52" r="5.5" fill="#D2F159"/>
    <path d="M53 62 Q60 67 67 62" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Body -->
    <rect x="34" y="84" width="52" height="24" rx="8" fill="#0284C7" stroke="#0F172A" stroke-width="3"/>
    <text x="60" y="101" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#FDE047">23</text>
  </svg>
`);

const GAMEPAD_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 100">
    <path d="M34 26 L106 26 C124 26 132 52 126 74 C122 86 108 86 98 72 L90 62 L50 62 L42 72 C32 86 18 86 14 74 C8 52 16 26 34 26 Z" fill="#1E293B" stroke="#F8FAFC" stroke-width="3.5"/>
    <!-- D-pad -->
    <rect x="30" y="42" width="22" height="8" rx="2" fill="#38BDF8"/>
    <rect x="37" y="35" width="8" height="22" rx="2" fill="#38BDF8"/>
    <!-- Buttons -->
    <circle cx="98" cy="39" r="5" fill="#F43F5E"/>
    <circle cx="109" cy="48" r="5" fill="#FACC15"/>
    <circle cx="98" cy="57" r="5" fill="#22C55E"/>
    <circle cx="87" cy="48" r="5" fill="#A855F7"/>
    <!-- Center label -->
    <text x="70" y="50" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#94A3B8">LVL23</text>
  </svg>
`);

const CHIP_23_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <!-- Pins -->
    <g stroke="#38BDF8" stroke-width="4" stroke-linecap="round">
      <line x1="36" y1="14" x2="36" y2="28"/><line x1="52" y1="14" x2="52" y2="28"/>
      <line x1="68" y1="14" x2="68" y2="28"/><line x1="84" y1="14" x2="84" y2="28"/>
      <line x1="36" y1="92" x2="36" y2="106"/><line x1="52" y1="92" x2="52" y2="106"/>
      <line x1="68" y1="92" x2="68" y2="106"/><line x1="84" y1="92" x2="84" y2="106"/>
      <line x1="14" y1="36" x2="28" y2="36"/><line x1="14" y1="52" x2="28" y2="52"/>
      <line x1="14" y1="68" x2="28" y2="68"/><line x1="14" y1="84" x2="28" y2="84"/>
      <line x1="92" y1="36" x2="106" y2="36"/><line x1="92" y1="52" x2="106" y2="52"/>
      <line x1="92" y1="68" x2="106" y2="68"/><line x1="92" y1="84" x2="106" y2="84"/>
    </g>
    <rect x="26" y="26" width="68" height="68" rx="12" fill="#0F172A" stroke="#38BDF8" stroke-width="3.5"/>
    <rect x="34" y="34" width="52" height="52" rx="8" fill="#1E293B" stroke="#D2F159" stroke-width="2"/>
    <text x="60" y="68" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#D2F159">23</text>
  </svg>
`);

const TECH_CAT_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <!-- Headphone band -->
    <path d="M22 64 C22 24, 98 24, 98 64" fill="none" stroke="#38BDF8" stroke-width="7" stroke-linecap="round"/>
    <!-- Cat ears -->
    <polygon points="30,44 38,22 52,38" fill="#1E293B" stroke="#F8FAFC" stroke-width="2.5"/>
    <polygon points="90,44 82,22 68,38" fill="#1E293B" stroke="#F8FAFC" stroke-width="2.5"/>
    <!-- Cat head -->
    <ellipse cx="60" cy="64" rx="32" ry="28" fill="#1E293B" stroke="#F8FAFC" stroke-width="3"/>
    <!-- Earphones -->
    <rect x="14" y="50" width="14" height="28" rx="6" fill="#D2F159" stroke="#0F172A" stroke-width="2.5"/>
    <rect x="92" y="50" width="14" height="28" rx="6" fill="#D2F159" stroke="#0F172A" stroke-width="2.5"/>
    <!-- Cool visor sunglasses -->
    <rect x="36" y="54" width="20" height="12" rx="4" fill="#38BDF8"/>
    <rect x="64" y="54" width="20" height="12" rx="4" fill="#38BDF8"/>
    <line x1="56" y1="58" x2="64" y2="58" stroke="#38BDF8" stroke-width="3"/>
    <!-- Cute cat mouth -->
    <path d="M54 74 Q57 78 60 74 Q63 78 66 74" fill="none" stroke="#F8FAFC" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
`);

const ROCKET_STICKER = svgUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <g transform="rotate(35 60 60)">
      <path d="M60 12 C78 32 80 68 72 88 L48 88 C40 68 42 32 60 12 Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="3"/>
      <path d="M60 12 C69 22 73 34 74 42 L46 42 C47 34 51 22 60 12 Z" fill="#3B82F6"/>
      <circle cx="60" cy="56" r="10" fill="#38BDF8" stroke="#0F172A" stroke-width="2.5"/>
      <path d="M46 66 L30 88 L46 84 Z" fill="#F43F5E" stroke="#0F172A" stroke-width="2.5"/>
      <path d="M74 66 L90 88 L74 84 Z" fill="#F43F5E" stroke="#0F172A" stroke-width="2.5"/>
      <path d="M52 88 L60 110 L68 88 Z" fill="#FACC15" stroke="#EA580C" stroke-width="2"/>
    </g>
  </svg>
`);

function buildConfettiBackdrop(bgColor: string, accent1: string, accent2: string, accent3: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="confetti" width="160" height="160" patternUnits="userSpaceOnUse">
        <circle cx="24" cy="28" r="9" fill="${accent1}" opacity="0.7"/>
        <circle cx="116" cy="48" r="7" fill="${accent2}" opacity="0.75"/>
        <circle cx="68" cy="112" r="8" fill="${accent3}" opacity="0.7"/>
        <rect x="128" y="114" width="16" height="8" rx="4" fill="${accent1}" opacity="0.7" transform="rotate(28 136 118)"/>
        <rect x="28" y="130" width="14" height="7" rx="3.5" fill="${accent2}" opacity="0.75" transform="rotate(-24 35 133)"/>
        <polygon points="94,16 98,26 108,26 100,32 103,42 94,36 85,42 88,32 80,26 90,26" fill="${accent3}" opacity="0.65"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="${bgColor}"/>
    <rect width="1080" height="1920" fill="url(#confetti)"/>
    <path d="M0 0 L90 48 L180 0 L270 48 L360 0 L450 48 L540 0 L630 48 L720 0 L810 48 L900 0 L990 48 L1080 0" fill="none" stroke="${accent1}" stroke-width="5" opacity="0.55"/>
  </svg>`;
  return svgUri(svg);
}

function buildTechGridBackdrop(bgColor: string, gridColor: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="techgrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${gridColor}" stroke-width="1.5" opacity="0.45"/>
        <circle cx="0" cy="0" r="2.5" fill="${accentColor}" opacity="0.55"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="${bgColor}"/>
    <rect width="1080" height="1920" fill="url(#techgrid)"/>
  </svg>`;
  return svgUri(svg);
}

function buildCircuitBackdrop(bgColor: string, traceColor: string, nodeColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="circuit" width="180" height="180" patternUnits="userSpaceOnUse">
        <path d="M 20 20 L 70 20 L 90 40 L 150 40" fill="none" stroke="${traceColor}" stroke-width="2.5" opacity="0.35"/>
        <path d="M 30 140 L 80 140 L 110 110 L 160 110" fill="none" stroke="${traceColor}" stroke-width="2.5" opacity="0.3"/>
        <path d="M 120 10 L 120 65 L 145 90" fill="none" stroke="${nodeColor}" stroke-width="2" opacity="0.3"/>
        <circle cx="20" cy="20" r="4.5" fill="${nodeColor}" opacity="0.55"/>
        <circle cx="150" cy="40" r="4.5" fill="${traceColor}" opacity="0.55"/>
        <circle cx="30" cy="140" r="4.5" fill="${traceColor}" opacity="0.5"/>
        <circle cx="160" cy="110" r="4.5" fill="${nodeColor}" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="${bgColor}"/>
    <rect width="1080" height="1920" fill="url(#circuit)"/>
  </svg>`;
  return svgUri(svg);
}

function buildSpaceBackdrop(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="stars" width="180" height="180" patternUnits="userSpaceOnUse">
        <circle cx="22" cy="34" r="2.5" fill="#F8FAFC" opacity="0.75"/>
        <circle cx="96" cy="22" r="1.8" fill="#38BDF8" opacity="0.8"/>
        <circle cx="144" cy="88" r="3" fill="#FDE047" opacity="0.7"/>
        <circle cx="52" cy="132" r="2" fill="#F8FAFC" opacity="0.65"/>
        <circle cx="128" cy="154" r="2.2" fill="#A5B4FC" opacity="0.75"/>
      </pattern>
    </defs>
    <rect width="1080" height="1920" fill="#0B1026"/>
    <rect width="1080" height="1920" fill="url(#stars)"/>
  </svg>`;
  return svgUri(svg);
}

function buildFourCutSlots(): PhotoSlot[] {
  return [
    { id: "slot-1", index: 0, x: 96, y: 205, width: 888, height: 350, borderRadius: 24, filter: "natural" },
    { id: "slot-2", index: 1, x: 96, y: 585, width: 888, height: 350, borderRadius: 24, filter: "natural" },
    { id: "slot-3", index: 2, x: 96, y: 965, width: 888, height: 350, borderRadius: 24, filter: "natural" },
    { id: "slot-4", index: 3, x: 96, y: 1345, width: 888, height: 350, borderRadius: 24, filter: "natural" },
  ];
}

function buildSixCutSlots(): PhotoSlot[] {
  return [
    { id: "slot-1", index: 0, x: 84, y: 230, width: 438, height: 460, borderRadius: 20, filter: "natural" },
    { id: "slot-2", index: 1, x: 558, y: 230, width: 438, height: 460, borderRadius: 20, filter: "natural" },
    { id: "slot-3", index: 2, x: 84, y: 720, width: 438, height: 460, borderRadius: 20, filter: "natural" },
    { id: "slot-4", index: 3, x: 558, y: 720, width: 438, height: 460, borderRadius: 20, filter: "natural" },
    { id: "slot-5", index: 4, x: 84, y: 1210, width: 438, height: 460, borderRadius: 20, filter: "natural" },
    { id: "slot-6", index: 5, x: 558, y: 1210, width: 438, height: 460, borderRadius: 20, filter: "natural" },
  ];
}

function buildSlotFrames(slots: PhotoSlot[], fill: string, stroke: string): TemplateLayer[] {
  return slots.map((s, idx) => ({
    id: `frame-${idx + 1}`,
    type: "shape" as const,
    shapeKind: "rect" as const,
    x: s.x - 12,
    y: s.y - 12,
    width: s.width + 24,
    height: s.height + 24,
    borderRadius: (s.borderRadius ?? 20) + 6,
    tintColor: fill,
    strokeColor: stroke,
    strokeWidth: 5,
    zIndex: -1,
    visible: true,
  }));
}

export const BIRTHDAY_TEMPLATES: TemplatePreset[] = [
  // 1. Original Cute Birthday Cake (21 Nov)
  {
    id: "innssaan-birthday-cake-4cut",
    slug: "innssaan-birthday-cake-4cut",
    title_id: "Happy Birthday innssaan! 21 Nov 🎂",
    title_en: "Happy Birthday innssaan! Nov 21 🎂",
    description_id: "Template spesial ulang tahun innssaan tanggal 21 November dengan kue ulang tahun lucu, balon, pita, dan confetti ceria.",
    description_en: "Special November 21 birthday template for innssaan featuring cute birthday cake, balloons, satin bow, and cheerful confetti.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-birthday-cake-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#FFF7ED" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-bday-confetti-1",
          type: "sticker",
          assetId: buildConfettiBackdrop("#FFF7ED", "#FB7185", "#FACC15", "#38BDF8"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#FB7185"),
        {
          id: "hdr-bday-sub",
          type: "text",
          content: "HAPPY BIRTHDAY",
          x: 160,
          y: 38,
          width: 760,
          height: 44,
          fontFamily: SANS,
          fontSize: 28,
          color: "#E11D48",
          align: "center",
          letterSpacing: 8,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-bday-name",
          type: "text",
          content: "innssaan!",
          x: 160,
          y: 80,
          width: 760,
          height: 82,
          fontFamily: CAVEAT,
          fontSize: 72,
          color: "#881337",
          outline: "8px #FFFFFF",
          align: "center",
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-bday-cake",
          type: "sticker",
          assetId: BIRTHDAY_CAKE_STICKER,
          x: 842,
          y: 52,
          width: 136,
          height: 136,
          rotation: 8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-bday-balloons",
          type: "sticker",
          assetId: BALLOONS_STICKER,
          x: 42,
          y: 52,
          width: 122,
          height: 140,
          rotation: -10,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-bday-date-badge",
          type: "sticker",
          assetId: "badge:21 NOVEMBER • 23 ★|#F43F5E|#FFFFFF",
          x: 340,
          y: 1726,
          width: 400,
          height: 54,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-bday-wish",
          type: "text",
          content: "make a wish & stay cute ♡",
          x: 200,
          y: 1790,
          width: 680,
          height: 44,
          fontFamily: CAVEAT,
          fontSize: 34,
          color: "#9F1239",
          align: "center",
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "dark",
        style: "minimal",
      }),
    },
  },

  // 2. Original Party Club 6-Cut
  {
    id: "innssaan-birthday-party-6cut",
    slug: "innssaan-birthday-party-6cut",
    title_id: "innssaan's 21 Nov Party Club 🎈",
    title_en: "innssaan's Nov 21 Party Club 🎈",
    description_id: "Kolase ulang tahun 6-cut spesial innssaan (21 November) dengan kado, balon, bola disko, dan bintang lucu.",
    description_en: "6-cut birthday party collage for innssaan (Nov 21) with gift box, balloons, disco ball, and cute stars.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-birthday-party-6cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#F3E8FF" },
      },
      slots: buildSixCutSlots(),
      layers: [
        {
          id: "bg-bday-confetti-2",
          type: "sticker",
          assetId: buildConfettiBackdrop("#F3E8FF", "#A855F7", "#F472B6", "#FACC15"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildSixCutSlots(), "#FFFFFF", "#7E22CE"),
        {
          id: "hdr-party-title",
          type: "text",
          content: "innssaan's 23rd!",
          x: 180,
          y: 44,
          width: 720,
          height: 82,
          fontFamily: PLAYFAIR,
          fontSize: 54,
          color: "#581C87",
          outline: "8px #FFFFFF",
          align: "center",
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-party-sub",
          type: "text",
          content: "21 NOVEMBER • BIRTHDAY EDITION",
          x: 180,
          y: 132,
          width: 720,
          height: 44,
          fontFamily: MONO,
          fontSize: 22,
          color: "#7E22CE",
          align: "center",
          letterSpacing: 4,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-party-gift",
          type: "sticker",
          assetId: GIFT_BOX_STICKER,
          x: 48,
          y: 66,
          width: 120,
          height: 120,
          rotation: -12,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-party-disco",
          type: "sticker",
          assetId: VECTOR_STICKERS.discoBall,
          x: 902,
          y: 66,
          width: 116,
          height: 116,
          rotation: 10,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-party-badge",
          type: "sticker",
          assetId: "badge:LEVEL UP 23 • 21 NOV|#7E22CE|#FFFFFF",
          x: 330,
          y: 1720,
          width: 420,
          height: 54,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-party-note",
          type: "text",
          content: "cheers to another bright year!",
          x: 180,
          y: 1790,
          width: 720,
          height: 44,
          fontFamily: CAVEAT,
          fontSize: 34,
          color: "#581C87",
          align: "center",
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-left",
        contrastMode: "dark",
        style: "minimal",
      }),
    },
  },

  // 3. Tech Manly — Terminal Dark Mode v23.0
  {
    id: "innssaan-23-terminal-dark-4cut",
    slug: "innssaan-23-terminal-dark-4cut",
    title_id: "Innssaan v23.0 Terminal Tech 🤖",
    title_en: "Innssaan v23.0 Terminal Tech 🤖",
    description_id: "Template ulang tahun ke-23 Innssaan bertema terminal dark-mode & robot pixel lucu, font monospace & display.",
    description_en: "Manly dark-mode terminal 23rd birthday template for Innssaan (Nov 21) with cute pixel robot & monospace typography.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 100,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-terminal-dark-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#0D1117" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-tech-terminal",
          type: "sticker",
          assetId: buildTechGridBackdrop("#0D1117", "#1E293B", "#38BDF8"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#161B22", "#38BDF8"),
        {
          id: "hdr-term-cmd",
          type: "text",
          content: "> hbd(\"Innssaan\", { age: 23 })",
          x: 180,
          y: 44,
          width: 720,
          height: 44,
          fontFamily: MONO,
          fontSize: 24,
          color: "#D2F159",
          align: "center",
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-term-title",
          type: "text",
          content: "INNSSAAN v23.0",
          x: 180,
          y: 90,
          width: 720,
          height: 74,
          fontFamily: BEBAS,
          fontSize: 64,
          color: "#F8FAFC",
          outline: "8px #0F172A",
          shadow: "0px 4px 0px #38BDF8",
          align: "center",
          letterSpacing: 5,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-term-robot",
          type: "sticker",
          assetId: PIXEL_ROBOT_STICKER,
          x: 42,
          y: 48,
          width: 120,
          height: 120,
          rotation: -8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-term-chip",
          type: "sticker",
          assetId: CHIP_23_STICKER,
          x: 912,
          y: 50,
          width: 118,
          height: 118,
          rotation: 8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-term-badge",
          type: "sticker",
          assetId: "badge:RELEASE 21.11 • AGE 23|#38BDF8|#0F172A",
          x: 320,
          y: 1728,
          width: 440,
          height: 52,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-term-status",
          type: "text",
          content: "STATUS: LEVEL 23 DEPLOYED ✓",
          x: 200,
          y: 1794,
          width: 680,
          height: 42,
          fontFamily: MONO,
          fontSize: 21,
          color: "#94A3B8",
          align: "center",
          letterSpacing: 2,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 4. Tech Manly — Retro Arcade Level 23
  {
    id: "innssaan-23-arcade-pixel-4cut",
    slug: "innssaan-23-arcade-pixel-4cut",
    title_id: "Innssaan LVL 23 Retro Arcade 🎮",
    title_en: "Innssaan LVL 23 Retro Arcade 🎮",
    description_id: "Template ulang tahun ke-23 Innssaan tema game arcade retro dengan gamepad lucu, font Bebas & Space Mono.",
    description_en: "Retro arcade LVL 23 birthday template for Innssaan (Nov 21) featuring cute gamepad sticker and bold 3D typography.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 100,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-arcade-pixel-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#1E1B4B" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-tech-arcade",
          type: "sticker",
          assetId: buildTechGridBackdrop("#1E1B4B", "#4338CA", "#FACC15"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#312E81", "#FACC15"),
        {
          id: "hdr-arc-lvl",
          type: "text",
          content: "★ LEVEL 23 UNLOCKED ★",
          x: 180,
          y: 42,
          width: 720,
          height: 44,
          fontFamily: MONO,
          fontSize: 25,
          color: "#FACC15",
          align: "center",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-arc-name",
          type: "text",
          content: "INNSSAAN",
          x: 180,
          y: 86,
          width: 720,
          height: 80,
          fontFamily: BEBAS,
          fontSize: 72,
          color: "#FFFFFF",
          outline: "9px #0F172A",
          shadow: "0px 5px 0px #F43F5E",
          align: "center",
          letterSpacing: 8,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-arc-pad",
          type: "sticker",
          assetId: GAMEPAD_STICKER,
          x: 34,
          y: 56,
          width: 138,
          height: 98,
          rotation: -12,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-arc-cat",
          type: "sticker",
          assetId: TECH_CAT_STICKER,
          x: 912,
          y: 50,
          width: 118,
          height: 118,
          rotation: 10,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-arc-badge",
          type: "sticker",
          assetId: "badge:PLAYER 1 • 21 NOV|#FACC15|#1E1B4B",
          x: 340,
          y: 1728,
          width: 400,
          height: 52,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-arc-score",
          type: "text",
          content: "HIGH SCORE: 23 YEARS AWESOME",
          x: 180,
          y: 1794,
          width: 720,
          height: 42,
          fontFamily: MONO,
          fontSize: 21,
          color: "#C7D2FE",
          align: "center",
          letterSpacing: 2,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-left",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 5. Tech Manly — Cyber Blueprint Blue #23
  {
    id: "innssaan-23-blueprint-tech-4cut",
    slug: "innssaan-23-blueprint-tech-4cut",
    title_id: "Innssaan #23 Blue Blueprint ⚙️",
    title_en: "Innssaan #23 Blue Blueprint ⚙️",
    description_id: "Template biru teknik (blueprint) manly & estetik untuk ulang tahun ke-23 Innssaan tanggal 21 November.",
    description_en: "Sleek engineering blueprint blue 23rd birthday template for Innssaan (Nov 21) with rocket & microchip stickers.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-blueprint-tech-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#1E3A8A" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-tech-blueprint",
          type: "sticker",
          assetId: buildTechGridBackdrop("#1E3A8A", "#60A5FA", "#FFFFFF"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#93C5FD"),
        {
          id: "hdr-bp-spec",
          type: "text",
          content: "BLUEPRINT NO. 23 // 21 NOV",
          x: 180,
          y: 42,
          width: 720,
          height: 40,
          fontFamily: MONO,
          fontSize: 22,
          color: "#BAE6FD",
          align: "center",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-bp-name",
          type: "text",
          content: "INNSSAAN EDITION",
          x: 180,
          y: 86,
          width: 720,
          height: 76,
          fontFamily: SANS,
          fontSize: 48,
          color: "#FFFFFF",
          outline: "8px #0F172A",
          shadow: "0px 4px 0px #38BDF8",
          align: "center",
          letterSpacing: 4,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-bp-chip",
          type: "sticker",
          assetId: CHIP_23_STICKER,
          x: 42,
          y: 48,
          width: 118,
          height: 118,
          rotation: -8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-bp-rocket",
          type: "sticker",
          assetId: ROCKET_STICKER,
          x: 912,
          y: 48,
          width: 118,
          height: 118,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-bp-badge",
          type: "sticker",
          assetId: "badge:BUILT DIFFERENT • 23|#FFFFFF|#1E3A8A",
          x: 330,
          y: 1728,
          width: 420,
          height: 52,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-bp-date",
          type: "text",
          content: "HAPPY 23RD BIRTHDAY • 21.11",
          x: 180,
          y: 1794,
          width: 720,
          height: 42,
          fontFamily: MONO,
          fontSize: 21,
          color: "#DBEAFE",
          align: "center",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 6. Tech Manly — Midnight Circuit 6-Cut
  {
    id: "innssaan-23-midnight-circuit-6cut",
    slug: "innssaan-23-midnight-circuit-6cut",
    title_id: "Innssaan 23 Midnight Circuit 6-Cut ⚡",
    title_en: "Innssaan 23 Midnight Circuit 6-Cut ⚡",
    description_id: "Kolase 6-cut gelap dengan jalur sirkuit PCB neon lime & biru, kucing tekno berheadphone, dan angka 23.",
    description_en: "Dark PCB circuit 6-cut birthday frame for Innssaan (23) with neon lime & blue traces and cool tech cat.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-midnight-circuit-6cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#09090B" },
      },
      slots: buildSixCutSlots(),
      layers: [
        {
          id: "bg-tech-circuit",
          type: "sticker",
          assetId: buildCircuitBackdrop("#09090B", "#38BDF8", "#D2F159"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildSixCutSlots(), "#18181B", "#D2F159"),
        {
          id: "hdr-cir-title",
          type: "text",
          content: "INNSSAAN // 23",
          x: 180,
          y: 52,
          width: 720,
          height: 76,
          fontFamily: BEBAS,
          fontSize: 66,
          color: "#D2F159",
          outline: "8px #09090B",
          shadow: "0px 4px 0px #38BDF8",
          align: "center",
          letterSpacing: 6,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-cir-sub",
          type: "text",
          content: "21 NOV • TECH BIRTHDAY EDITION",
          x: 180,
          y: 136,
          width: 720,
          height: 40,
          fontFamily: MONO,
          fontSize: 22,
          color: "#38BDF8",
          align: "center",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-cir-cat",
          type: "sticker",
          assetId: TECH_CAT_STICKER,
          x: 42,
          y: 56,
          width: 122,
          height: 122,
          rotation: -10,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-cir-robot",
          type: "sticker",
          assetId: PIXEL_ROBOT_STICKER,
          x: 912,
          y: 56,
          width: 120,
          height: 120,
          rotation: 10,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-cir-badge",
          type: "sticker",
          assetId: "badge:23 Y.O. • 21 NOV|#D2F159|#09090B",
          x: 340,
          y: 1726,
          width: 400,
          height: 52,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-cir-note",
          type: "text",
          content: "power up & keep building!",
          x: 200,
          y: 1794,
          width: 680,
          height: 42,
          fontFamily: MONO,
          fontSize: 22,
          color: "#A1A1AA",
          align: "center",
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-left",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 7. Tech Cute — Innssaan 23.app Clean Slate Blue
  {
    id: "innssaan-23-macos-dev-4cut",
    slug: "innssaan-23-macos-dev-4cut",
    title_id: "Innssaan_23.app Dev Desk 💻",
    title_en: "Innssaan_23.app Dev Desk 💻",
    description_id: "Template ulang tahun ke-23 Innssaan bertema desktop developer modern warna biru slate dengan stiker robot & kue.",
    description_en: "Clean slate-blue developer desktop 23rd birthday template for Innssaan (Nov 21) with cute robot & cake stickers.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-macos-dev-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#E2E8F0" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-tech-dev",
          type: "sticker",
          assetId: buildTechGridBackdrop("#E2E8F0", "#CBD5E1", "#2563EB"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#1E293B"),
        {
          id: "hdr-dev-title",
          type: "text",
          content: "Innssaan_23.app",
          x: 180,
          y: 44,
          width: 720,
          height: 70,
          fontFamily: MONO,
          fontSize: 42,
          color: "#0F172A",
          outline: "8px #FFFFFF",
          shadow: "0px 4px 0px #93C5FD",
          align: "center",
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-dev-sub",
          type: "text",
          content: "Birthday Build • 21 November",
          x: 180,
          y: 120,
          width: 720,
          height: 44,
          fontFamily: CAVEAT,
          fontSize: 38,
          color: "#2563EB",
          align: "center",
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-dev-cat",
          type: "sticker",
          assetId: TECH_CAT_STICKER,
          x: 44,
          y: 52,
          width: 118,
          height: 118,
          rotation: -8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-dev-cake",
          type: "sticker",
          assetId: BIRTHDAY_CAKE_STICKER,
          x: 912,
          y: 50,
          width: 122,
          height: 122,
          rotation: 8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-dev-badge",
          type: "sticker",
          assetId: "badge:23 YEARS • NO BUGS ♡|#2563EB|#FFFFFF",
          x: 320,
          y: 1726,
          width: 440,
          height: 54,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-dev-note",
          type: "text",
          content: "happy birthday, Innssaan!",
          x: 200,
          y: 1790,
          width: 680,
          height: 44,
          fontFamily: PLAYFAIR,
          fontSize: 28,
          color: "#1E293B",
          align: "center",
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "dark",
        style: "minimal",
      }),
    },
  },

  // 8. Tech Manly — Space & Rocket 23 Mission
  {
    id: "innssaan-23-space-rocket-4cut",
    slug: "innssaan-23-space-rocket-4cut",
    title_id: "Innssaan 23 Space Mission 🚀",
    title_en: "Innssaan 23 Space Mission 🚀",
    description_id: "Template ulang tahun ke-23 Innssaan bertema luar angkasa & roket dengan bintang, chip 23, dan font tebal 3D.",
    description_en: "Space & rocket 23rd birthday template for Innssaan (Nov 21) with starry cosmos, rocket, and 23 chip stickers.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-space-rocket-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#0B1026" },
      },
      slots: buildFourCutSlots(),
      layers: [
        {
          id: "bg-tech-space",
          type: "sticker",
          assetId: buildSpaceBackdrop(),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildFourCutSlots(), "#172554", "#60A5FA"),
        {
          id: "hdr-spc-mission",
          type: "text",
          content: "MISSION 21 NOV // AGE 23",
          x: 180,
          y: 42,
          width: 720,
          height: 40,
          fontFamily: MONO,
          fontSize: 22,
          color: "#FDE047",
          align: "center",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-spc-name",
          type: "text",
          content: "INNSSAAN TO THE MOON!",
          x: 180,
          y: 88,
          width: 720,
          height: 76,
          fontFamily: BEBAS,
          fontSize: 58,
          color: "#FFFFFF",
          outline: "8px #0B1026",
          shadow: "0px 4px 0px #3B82F6",
          align: "center",
          letterSpacing: 4,
          zIndex: 4,
          visible: true,
        },
        {
          id: "stk-spc-rocket",
          type: "sticker",
          assetId: ROCKET_STICKER,
          x: 40,
          y: 48,
          width: 122,
          height: 122,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-spc-robot",
          type: "sticker",
          assetId: PIXEL_ROBOT_STICKER,
          x: 912,
          y: 48,
          width: 120,
          height: 120,
          rotation: 8,
          zIndex: 5,
          visible: true,
        },
        {
          id: "stk-spc-badge",
          type: "sticker",
          assetId: "badge:LAUNCHING 23 ★|#3B82F6|#FFFFFF",
          x: 340,
          y: 1728,
          width: 400,
          height: 52,
          zIndex: 5,
          visible: true,
        },
        {
          id: "ftr-spc-note",
          type: "text",
          content: "sky is not the limit, Innssaan!",
          x: 180,
          y: 1794,
          width: 720,
          height: 42,
          fontFamily: CAVEAT,
          fontSize: 34,
          color: "#93C5FD",
          align: "center",
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-right",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 9. Matrix Green Code 23
  {
    id: "innssaan-23-matrix-green-4cut",
    slug: "innssaan-23-matrix-green-4cut",
    title_id: "Innssaan 23 Matrix Code 💻",
    title_en: "Innssaan 23 Matrix Code 💻",
    description_id: "Template ulang tahun ke-23 Innssaan tema Matrix hijau neon dengan font monospace & robot pixel.",
    description_en: "Matrix neon-green 23rd birthday template for Innssaan (Nov 21) with monospace code & pixel robot.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-matrix-green-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#05140A" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-mtx", type: "sticker", assetId: buildCircuitBackdrop("#05140A", "#22C55E", "#D2F159"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#0A1F12", "#22C55E"),
        { id: "hdr-mtx-1", type: "text", content: "SYSTEM.INIT(21_NOV)", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#4ADE80", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-mtx-2", type: "text", content: "WAKE UP, INNSSAAN 23", x: 180, y: 88, width: 720, height: 76, fontFamily: BEBAS, fontSize: 58, color: "#D2F159", outline: "8px #05140A", shadow: "0px 4px 0px #16A34A", align: "center", letterSpacing: 4, zIndex: 4, visible: true },
        { id: "stk-mtx-1", type: "sticker", assetId: PIXEL_ROBOT_STICKER, x: 42, y: 48, width: 118, height: 118, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-mtx-2", type: "sticker", assetId: CHIP_23_STICKER, x: 916, y: 48, width: 118, height: 118, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-mtx-b", type: "sticker", assetId: "badge:MATRIX 23 • 21 NOV|#22C55E|#05140A", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 10. Minimal Silver Pro 23
  {
    id: "innssaan-23-apple-minimal-4cut",
    slug: "innssaan-23-apple-minimal-4cut",
    title_id: "Innssaan 23 Titanium Silver 🍏",
    title_en: "Innssaan 23 Titanium Silver 🍏",
    description_id: "Template ulang tahun ke-23 Innssaan bergaya minimal titanium silver yang bersih, manly, dan modern.",
    description_en: "Sleek titanium-silver minimalist 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-apple-minimal-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#F1F5F9" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-sil", type: "sticker", assetId: buildTechGridBackdrop("#F1F5F9", "#CBD5E1", "#64748B"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#0F172A"),
        { id: "hdr-sil-1", type: "text", content: "DESIGNED FOR INNSSAAN", x: 180, y: 44, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#475569", align: "center", letterSpacing: 4, zIndex: 4, visible: true },
        { id: "hdr-sil-2", type: "text", content: "PRO EDITION 23", x: 180, y: 90, width: 720, height: 72, fontFamily: SANS, fontSize: 50, color: "#0F172A", outline: "8px #FFFFFF", align: "center", letterSpacing: 4, zIndex: 4, visible: true },
        { id: "stk-sil-1", type: "sticker", assetId: TECH_CAT_STICKER, x: 42, y: 50, width: 116, height: 116, rotation: -6, zIndex: 5, visible: true },
        { id: "stk-sil-b", type: "sticker", assetId: "badge:21 NOVEMBER • 23|#0F172A|#F8FAFC", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "dark", style: "minimal" }),
    },
  },

  // 11. Cyberpunk Neon 23
  {
    id: "innssaan-23-neon-cyberpunk-4cut",
    slug: "innssaan-23-neon-cyberpunk-4cut",
    title_id: "Innssaan 23 Cyberpunk Neon ⚡",
    title_en: "Innssaan 23 Cyberpunk Neon ⚡",
    description_id: "Template ulang tahun ke-23 Innssaan tema cyberpunk neon cyan & magenta dengan font Bebas & gamepad.",
    description_en: "Cyberpunk neon cyan & magenta 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-neon-cyberpunk-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#130924" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-cyb", type: "sticker", assetId: buildTechGridBackdrop("#130924", "#701A75", "#22D3EE"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#1E1B4B", "#22D3EE"),
        { id: "hdr-cyb-1", type: "text", content: "CYBER BIRTHDAY // 21.11", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#22D3EE", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-cyb-2", type: "text", content: "INNSSAAN 23", x: 180, y: 86, width: 720, height: 80, fontFamily: BEBAS, fontSize: 68, color: "#F43F5E", outline: "8px #0F172A", shadow: "0px 4px 0px #22D3EE", align: "center", letterSpacing: 6, zIndex: 4, visible: true },
        { id: "stk-cyb-1", type: "sticker", assetId: GAMEPAD_STICKER, x: 36, y: 58, width: 132, height: 94, rotation: -10, zIndex: 5, visible: true },
        { id: "stk-cyb-2", type: "sticker", assetId: ROCKET_STICKER, x: 916, y: 48, width: 118, height: 118, zIndex: 5, visible: true },
        { id: "stk-cyb-b", type: "sticker", assetId: "badge:NEON AGE 23 ★|#F43F5E|#FFFFFF", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-left", contrastMode: "light", style: "minimal" }),
    },
  },

  // 12. Espresso & Code 23
  {
    id: "innssaan-23-coffee-dev-4cut",
    slug: "innssaan-23-coffee-dev-4cut",
    title_id: "Innssaan 23 Espresso & Code ☕",
    title_en: "Innssaan 23 Espresso & Code ☕",
    description_id: "Template ulang tahun ke-23 Innssaan bertema kopi hangat & coding dengan font Playfair & Space Mono.",
    description_en: "Warm espresso & code 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 97,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-coffee-dev-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#291709" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-cof", type: "sticker", assetId: buildTechGridBackdrop("#291709", "#78350F", "#F59E0B"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FEF3C7", "#D97706"),
        { id: "hdr-cof-1", type: "text", content: "brew(\"birthday\", 23)", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FBBF24", align: "center", zIndex: 4, visible: true },
        { id: "hdr-cof-2", type: "text", content: "Innssaan's 23rd", x: 180, y: 86, width: 720, height: 76, fontFamily: PLAYFAIR, fontSize: 54, color: "#FEF3C7", outline: "8px #291709", align: "center", zIndex: 4, visible: true },
        { id: "stk-cof-1", type: "sticker", assetId: BIRTHDAY_CAKE_STICKER, x: 904, y: 50, width: 126, height: 126, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-cof-b", type: "sticker", assetId: "badge:21 NOV • ROAST 23|#F59E0B|#291709", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 13. F1 Racing Pit Stop #23
  {
    id: "innssaan-23-f1-racing-4cut",
    slug: "innssaan-23-f1-racing-4cut",
    title_id: "Innssaan #23 Racing GP 🏎️",
    title_en: "Innssaan #23 Racing GP 🏎️",
    description_id: "Template ulang tahun ke-23 Innssaan bertema balap GP merah & karbon yang sporty dan manly.",
    description_en: "Sporty red & carbon GP racing 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-f1-racing-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#18181B" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-f1", type: "sticker", assetId: buildTechGridBackdrop("#18181B", "#3F3F46", "#EF4444"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#DC2626"),
        { id: "hdr-f1-1", type: "text", content: "LAP 23 • 21 NOVEMBER", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FCA5A5", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-f1-2", type: "text", content: "INNSSAAN GP #23", x: 180, y: 86, width: 720, height: 78, fontFamily: BEBAS, fontSize: 64, color: "#FFFFFF", outline: "8px #991B1B", shadow: "0px 4px 0px #000000", align: "center", letterSpacing: 5, zIndex: 4, visible: true },
        { id: "stk-f1-1", type: "sticker", assetId: ROCKET_STICKER, x: 42, y: 48, width: 118, height: 118, zIndex: 5, visible: true },
        { id: "stk-f1-b", type: "sticker", assetId: "badge:POLE POSITION #23|#DC2626|#FFFFFF", x: 320, y: 1728, width: 440, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 14. Deep Ocean Tech 23
  {
    id: "innssaan-23-ocean-wave-4cut",
    slug: "innssaan-23-ocean-wave-4cut",
    title_id: "Innssaan 23 Deep Ocean 🌊",
    title_en: "Innssaan 23 Deep Ocean 🌊",
    description_id: "Template ulang tahun ke-23 Innssaan bernuansa biru laut dalam yang tenang dengan chip 23 & kucing tekno.",
    description_en: "Deep ocean-blue 23rd birthday template for Innssaan (Nov 21) with chip 23 & tech cat.",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 97,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-ocean-wave-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#0C4A6E" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-ocn", type: "sticker", assetId: buildCircuitBackdrop("#0C4A6E", "#38BDF8", "#BAE6FD"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#F0F9FF", "#38BDF8"),
        { id: "hdr-ocn-1", type: "text", content: "21 NOV • CHAPTER 23", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#7DD3FC", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-ocn-2", type: "text", content: "INNSSAAN MAKING WAVES", x: 180, y: 86, width: 720, height: 74, fontFamily: SANS, fontSize: 42, color: "#FFFFFF", outline: "8px #082F49", shadow: "0px 4px 0px #0284C7", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "stk-ocn-1", type: "sticker", assetId: CHIP_23_STICKER, x: 42, y: 48, width: 118, height: 118, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-ocn-2", type: "sticker", assetId: TECH_CAT_STICKER, x: 916, y: 48, width: 118, height: 118, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-ocn-b", type: "sticker", assetId: "badge:OCEAN EDITION 23|#38BDF8|#082F49", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 15. Monochrome Editorial Pro 23
  {
    id: "innssaan-23-monochrome-pro-4cut",
    slug: "innssaan-23-monochrome-pro-4cut",
    title_id: "Innssaan 23 Monochrome Pro 🖤",
    title_en: "Innssaan 23 Monochrome Pro 🖤",
    description_id: "Template editorial monokrom hitam-putih maskulin untuk ulang tahun ke-23 Innssaan dengan piringan vinyl.",
    description_en: "Masculine black-and-white editorial 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-monochrome-pro-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#09090B" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-mono", type: "sticker", assetId: buildTechGridBackdrop("#09090B", "#27272A", "#FFFFFF"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#52525B"),
        { id: "hdr-mono-1", type: "text", content: "ISSUE NO. 23 • 21 NOV", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#A1A1AA", align: "center", letterSpacing: 4, zIndex: 4, visible: true },
        { id: "hdr-mono-2", type: "text", content: "INNSSAAN", x: 180, y: 86, width: 720, height: 76, fontFamily: PLAYFAIR, fontSize: 58, color: "#FFFFFF", align: "center", letterSpacing: 6, zIndex: 4, visible: true },
        { id: "stk-mono-1", type: "sticker", assetId: VECTOR_STICKERS.vinylDisc, x: 912, y: 50, width: 116, height: 116, zIndex: 5, visible: true },
        { id: "stk-mono-b", type: "sticker", assetId: "badge:EDITION 23|#FFFFFF|#09090B", x: 360, y: 1728, width: 360, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-left", contrastMode: "light", style: "minimal" }),
    },
  },

  // 16. Retro Synthwave 6-Cut
  {
    id: "innssaan-23-retro-synth-6cut",
    slug: "innssaan-23-retro-synth-6cut",
    title_id: "Innssaan 23 Synthwave 6-Cut 🌆",
    title_en: "Innssaan 23 Synthwave 6-Cut 🌆",
    description_id: "Kolase 6-cut retro synthwave ungu & oranye neon untuk ulang tahun ke-23 Innssaan.",
    description_en: "Retro synthwave 6-cut 23rd birthday collage for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-retro-synth-6cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#2E1065" } },
      slots: buildSixCutSlots(),
      layers: [
        { id: "bg-syn", type: "sticker", assetId: buildTechGridBackdrop("#2E1065", "#7C3AED", "#FB923C"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildSixCutSlots(), "#1E1B4B", "#FB923C"),
        { id: "hdr-syn-1", type: "text", content: "SYNTHWAVE 23", x: 180, y: 50, width: 720, height: 76, fontFamily: BEBAS, fontSize: 66, color: "#FB923C", outline: "8px #2E1065", shadow: "0px 4px 0px #F472B6", align: "center", letterSpacing: 6, zIndex: 4, visible: true },
        { id: "hdr-syn-2", type: "text", content: "INNSSAAN • 21 NOVEMBER", x: 180, y: 132, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FDE047", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "stk-syn-1", type: "sticker", assetId: VECTOR_STICKERS.discoBall, x: 42, y: 54, width: 116, height: 116, zIndex: 5, visible: true },
        { id: "stk-syn-2", type: "sticker", assetId: GAMEPAD_STICKER, x: 904, y: 66, width: 132, height: 94, rotation: 10, zIndex: 5, visible: true },
        { id: "stk-syn-b", type: "sticker", assetId: "badge:RETRO 23 ★|#FB923C|#2E1065", x: 350, y: 1726, width: 380, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-left", contrastMode: "light", style: "minimal" }),
    },
  },

  // 17. Emerald Dev Stack 6-Cut
  {
    id: "innssaan-23-emerald-dev-6cut",
    slug: "innssaan-23-emerald-dev-6cut",
    title_id: "Innssaan 23 Emerald Stack 6-Cut 💚",
    title_en: "Innssaan 23 Emerald Stack 6-Cut 💚",
    description_id: "Kolase 6-cut hijau emerald sirkuit untuk ulang tahun ke-23 Innssaan dengan robot pixel & chip 23.",
    description_en: "Emerald circuit 6-cut 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 97,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-emerald-dev-6cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#064E3B" } },
      slots: buildSixCutSlots(),
      layers: [
        { id: "bg-emr", type: "sticker", assetId: buildCircuitBackdrop("#064E3B", "#34D399", "#D2F159"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildSixCutSlots(), "#022C22", "#34D399"),
        { id: "hdr-emr-1", type: "text", content: "STACK v23.11", x: 180, y: 50, width: 720, height: 74, fontFamily: MONO, fontSize: 44, color: "#D2F159", outline: "8px #022C22", align: "center", zIndex: 4, visible: true },
        { id: "hdr-emr-2", type: "text", content: "INNSSAAN BIRTHDAY", x: 180, y: 132, width: 720, height: 40, fontFamily: SANS, fontSize: 24, color: "#A7F3D0", align: "center", letterSpacing: 5, zIndex: 4, visible: true },
        { id: "stk-emr-1", type: "sticker", assetId: PIXEL_ROBOT_STICKER, x: 42, y: 54, width: 118, height: 118, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-emr-2", type: "sticker", assetId: CHIP_23_STICKER, x: 916, y: 54, width: 118, height: 118, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-emr-b", type: "sticker", assetId: "badge:21 NOV • BUILD 23|#34D399|#022C22", x: 330, y: 1726, width: 420, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 18. Golden Luxury 23
  {
    id: "innssaan-23-golden-luxury-4cut",
    slug: "innssaan-23-golden-luxury-4cut",
    title_id: "Innssaan 23 Gold Edition ✨",
    title_en: "Innssaan 23 Gold Edition ✨",
    description_id: "Template ulang tahun ke-23 Innssaan nuansa hitam & emas elegan dengan bola disko & font serif mewah.",
    description_en: "Sleek black & gold 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-golden-luxury-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#18181B" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-gld", type: "sticker", assetId: buildConfettiBackdrop("#18181B", "#FACC15", "#FDE047", "#A16207"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#27272A", "#FACC15"),
        { id: "hdr-gld-1", type: "text", content: "21 NOVEMBER • GOLDEN 23", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FDE047", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-gld-2", type: "text", content: "Innssaan", x: 180, y: 86, width: 720, height: 78, fontFamily: PLAYFAIR, fontSize: 62, color: "#FEF08A", outline: "8px #18181B", align: "center", letterSpacing: 4, zIndex: 4, visible: true },
        { id: "stk-gld-1", type: "sticker", assetId: VECTOR_STICKERS.discoBall, x: 912, y: 50, width: 116, height: 116, zIndex: 5, visible: true },
        { id: "stk-gld-b", type: "sticker", assetId: "badge:TWENTY-THREE ★|#FACC15|#18181B", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 19. Street Denim 23
  {
    id: "innssaan-23-denim-street-4cut",
    slug: "innssaan-23-denim-street-4cut",
    title_id: "Innssaan 23 Street Denim 🧢",
    title_en: "Innssaan 23 Street Denim 🧢",
    description_id: "Template ulang tahun ke-23 Innssaan gaya streetwear denim biru dengan kucing tekno & gamepad.",
    description_en: "Streetwear indigo-denim 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-denim-street-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#1E3A8A" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-dnm", type: "sticker", assetId: buildTechGridBackdrop("#1E3A8A", "#1D4ED8", "#FACC15"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#EFF6FF", "#FACC15"),
        { id: "hdr-dnm-1", type: "text", content: "STREET CLUB • 21 NOV", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FDE047", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-dnm-2", type: "text", content: "INNSSAAN 23", x: 180, y: 86, width: 720, height: 78, fontFamily: BEBAS, fontSize: 66, color: "#FFFFFF", outline: "8px #0F172A", shadow: "0px 4px 0px #FACC15", align: "center", letterSpacing: 6, zIndex: 4, visible: true },
        { id: "stk-dnm-1", type: "sticker", assetId: TECH_CAT_STICKER, x: 42, y: 50, width: 118, height: 118, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-dnm-2", type: "sticker", assetId: GAMEPAD_STICKER, x: 904, y: 66, width: 132, height: 94, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-dnm-b", type: "sticker", assetId: "badge:STREET 23 ★|#FACC15|#1E3A8A", x: 350, y: 1728, width: 380, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-left", contrastMode: "light", style: "minimal" }),
    },
  },

  // 20. Pixel Cake 6-Cut
  {
    id: "innssaan-23-pixel-cake-6cut",
    slug: "innssaan-23-pixel-cake-6cut",
    title_id: "Innssaan 23 CAKE.EXE 6-Cut 🎂",
    title_en: "Innssaan 23 CAKE.EXE 6-Cut 🎂",
    description_id: "Kolase 6-cut biru cerah bertema CAKE.EXE untuk ulang tahun ke-23 Innssaan dengan robot pixel & kue lucu.",
    description_en: "Bright-blue CAKE.EXE 6-cut 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 98,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-pixel-cake-6cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#0284C7" } },
      slots: buildSixCutSlots(),
      layers: [
        { id: "bg-pxc", type: "sticker", assetId: buildTechGridBackdrop("#0284C7", "#38BDF8", "#FFFFFF"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildSixCutSlots(), "#FFFFFF", "#0369A1"),
        { id: "hdr-pxc-1", type: "text", content: "CAKE.EXE (v23)", x: 180, y: 50, width: 720, height: 74, fontFamily: MONO, fontSize: 44, color: "#FFFFFF", outline: "8px #0C4A6E", align: "center", zIndex: 4, visible: true },
        { id: "hdr-pxc-2", type: "text", content: "HAPPY BIRTHDAY INNSSAAN • 21 NOV", x: 180, y: 132, width: 720, height: 40, fontFamily: SANS, fontSize: 22, color: "#FEF08A", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "stk-pxc-1", type: "sticker", assetId: BIRTHDAY_CAKE_STICKER, x: 40, y: 50, width: 124, height: 124, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-pxc-2", type: "sticker", assetId: PIXEL_ROBOT_STICKER, x: 912, y: 50, width: 120, height: 120, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-pxc-b", type: "sticker", assetId: "badge:RUN BIRTHDAY_23 ★|#FEF08A|#0C4A6E", x: 320, y: 1726, width: 440, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 21. Sunset Horizon 23
  {
    id: "innssaan-23-sunset-horizon-4cut",
    slug: "innssaan-23-sunset-horizon-4cut",
    title_id: "Innssaan 23 Sunset Horizon 🌅",
    title_en: "Innssaan 23 Sunset Horizon 🌅",
    description_id: "Template ulang tahun ke-23 Innssaan bernuansa senja hangat dengan roket & tulisan tangan estetik.",
    description_en: "Warm sunset-horizon 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 97,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-sunset-horizon-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#431407" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-sun", type: "sticker", assetId: buildConfettiBackdrop("#431407", "#FB923C", "#FACC15", "#F43F5E"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FFF7ED", "#EA580C"),
        { id: "hdr-sun-1", type: "text", content: "CHAPTER 23 • 21 NOV", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#FDBA74", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-sun-2", type: "text", content: "Innssaan's 23rd!", x: 180, y: 84, width: 720, height: 80, fontFamily: CAVEAT, fontSize: 66, color: "#FFF7ED", outline: "8px #7C2D12", align: "center", zIndex: 4, visible: true },
        { id: "stk-sun-1", type: "sticker", assetId: ROCKET_STICKER, x: 912, y: 50, width: 118, height: 118, zIndex: 5, visible: true },
        { id: "stk-sun-b", type: "sticker", assetId: "badge:21 NOVEMBER • 23|#FB923C|#431407", x: 340, y: 1728, width: 400, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-right", contrastMode: "light", style: "minimal" }),
    },
  },

  // 22. Cobalt Core Circuit 23
  {
    id: "innssaan-23-cobalt-circuit-4cut",
    slug: "innssaan-23-cobalt-circuit-4cut",
    title_id: "Innssaan 23 Cobalt Core 🔷",
    title_en: "Innssaan 23 Cobalt Core 🔷",
    description_id: "Template ulang tahun ke-23 Innssaan warna biru kobalt dengan jalur sirkuit cyan, chip 23, & robot pixel.",
    description_en: "Electric cobalt-blue PCB circuit 23rd birthday template for Innssaan (Nov 21).",
    category: "birthday_special",
    theme: "birthday",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: BIRTHDAY_TECH_ADDED_AT,
    unlock_at: BIRTHDAY_UNLOCK_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "innssaan-23-cobalt-circuit-4cut",
      version: 1,
      category: "birthday_special",
      theme: "birthday",
      canvas: { width: 1080, height: 1920, aspectRatio: "9:16", background: { type: "solid", value: "#1D4ED8" } },
      slots: buildFourCutSlots(),
      layers: [
        { id: "bg-cob", type: "sticker", assetId: buildCircuitBackdrop("#1D4ED8", "#67E8F9", "#FFFFFF"), x: 0, y: 0, width: 1080, height: 1920, zIndex: -2, visible: true },
        ...buildSlotFrames(buildFourCutSlots(), "#FFFFFF", "#0F172A"),
        { id: "hdr-cob-1", type: "text", content: "CORE 23 // 21 NOVEMBER", x: 180, y: 42, width: 720, height: 40, fontFamily: MONO, fontSize: 22, color: "#A5F3FC", align: "center", letterSpacing: 3, zIndex: 4, visible: true },
        { id: "hdr-cob-2", type: "text", content: "INNSSAAN v23", x: 180, y: 86, width: 720, height: 78, fontFamily: BEBAS, fontSize: 66, color: "#FFFFFF", outline: "8px #0F172A", shadow: "0px 4px 0px #67E8F9", align: "center", letterSpacing: 6, zIndex: 4, visible: true },
        { id: "stk-cob-1", type: "sticker", assetId: CHIP_23_STICKER, x: 42, y: 48, width: 118, height: 118, rotation: -8, zIndex: 5, visible: true },
        { id: "stk-cob-2", type: "sticker", assetId: PIXEL_ROBOT_STICKER, x: 916, y: 48, width: 118, height: 118, rotation: 8, zIndex: 5, visible: true },
        { id: "stk-cob-b", type: "sticker", assetId: "badge:POWERED BY 23 ⚡|#67E8F9|#0F172A", x: 330, y: 1728, width: 420, height: 52, zIndex: 5, visible: true },
      ],
      watermark: enforceMandatoryWatermark({ placement: "bottom-left", contrastMode: "light", style: "minimal" }),
    },
  },
];
