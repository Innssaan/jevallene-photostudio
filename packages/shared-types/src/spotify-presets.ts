import { enforceMandatoryWatermark, type PhotoSlot, type TemplateLayer } from "./template.js";
import type { TemplatePreset } from "./presets.js";

const SANS = "'Plus Jakarta Sans', system-ui, sans-serif";
const PLAYFAIR = "'Playfair Display', Georgia, serif";
const MONO = "'Space Mono', monospace";

const SPOTIFY_ADDED_AT = "2026-11-20T04:12:00+07:00";

function svgUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

function buildSpotifyBackdrop(topHex: string, midHex: string, botHex: string, glowHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${topHex}"/>
        <stop offset="55%" stop-color="${midHex}"/>
        <stop offset="100%" stop-color="${botHex}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="18%" r="60%">
        <stop offset="0%" stop-color="${glowHex}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${glowHex}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#bgGrad)"/>
    <rect width="1080" height="1920" fill="url(#glow)"/>
  </svg>`;
  return svgUri(svg);
}

function buildSpotifyBadge(accentHex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 56">
    <circle cx="28" cy="28" r="20" fill="#1DB954"/>
    <path d="M18 23 Q28 19 38 24" fill="none" stroke="#111827" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M20 29 Q28 26 36 30" fill="none" stroke="#111827" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M22 35 Q28 33 34 36" fill="none" stroke="#111827" stroke-width="2.4" stroke-linecap="round"/>
    <text x="58" y="34" font-family="sans-serif" font-weight="700" font-size="19" letter-spacing="2" fill="${accentHex}">SPOTIFY</text>
  </svg>`;
  return svgUri(svg);
}

function buildPlayerBar(trackColor: string, fillColor: string, iconColor: string, heartColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 120">
    <!-- Progress bar -->
    <rect x="0" y="14" width="880" height="7" rx="3.5" fill="${trackColor}" opacity="0.35"/>
    <rect x="0" y="14" width="420" height="7" rx="3.5" fill="${fillColor}"/>
    <circle cx="420" cy="17.5" r="10" fill="${iconColor}"/>
    <!-- Time labels -->
    <text x="0" y="42" font-family="monospace" font-size="16" fill="${iconColor}" opacity="0.75">01:42</text>
    <text x="880" y="42" text-anchor="end" font-family="monospace" font-size="16" fill="${iconColor}" opacity="0.75">03:54</text>
    <!-- Controls -->
    <!-- Shuffle / Heart left -->
    <path d="M22 76 C22 69 32 67 36 74 C40 67 50 69 50 76 C50 85 36 93 36 93 C36 93 22 85 22 76 Z" fill="${heartColor}"/>
    <!-- Prev -->
    <rect x="310" y="65" width="5" height="28" rx="2" fill="${iconColor}"/>
    <polygon points="342,65 318,79 342,93" fill="${iconColor}"/>
    <!-- Play/Pause Circle -->
    <circle cx="440" cy="79" r="28" fill="${iconColor}"/>
    <polygon points="433,66 433,92 456,79" fill="${fillColor === '#1DB954' ? '#111827' : '#FFFFFF'}"/>
    <!-- Next -->
    <polygon points="538,65 562,79 538,93" fill="${iconColor}"/>
    <rect x="565" y="65" width="5" height="28" rx="2" fill="${iconColor}"/>
    <!-- Spotify Wave right -->
    <g fill="${fillColor}">
      <rect x="812" y="72" width="5" height="14" rx="2.5"/>
      <rect x="824" y="64" width="5" height="30" rx="2.5"/>
      <rect x="836" y="68" width="5" height="22" rx="2.5"/>
      <rect x="848" y="60" width="5" height="38" rx="2.5"/>
      <rect x="860" y="70" width="5" height="18" rx="2.5"/>
    </g>
  </svg>`;
  return svgUri(svg);
}

function buildSpotifyFourSlots(): PhotoSlot[] {
  return [
    { id: "slot-1", index: 0, x: 100, y: 150, width: 880, height: 318, borderRadius: 18, filter: "natural" },
    { id: "slot-2", index: 1, x: 100, y: 492, width: 880, height: 318, borderRadius: 18, filter: "natural" },
    { id: "slot-3", index: 2, x: 100, y: 834, width: 880, height: 318, borderRadius: 18, filter: "natural" },
    { id: "slot-4", index: 3, x: 100, y: 1176, width: 880, height: 318, borderRadius: 18, filter: "natural" },
  ];
}

function buildSlotFrames(slots: PhotoSlot[], fill: string, stroke: string): TemplateLayer[] {
  return slots.map((s, idx) => ({
    id: `frame-${idx + 1}`,
    type: "shape" as const,
    shapeKind: "rect" as const,
    x: s.x - 8,
    y: s.y - 8,
    width: s.width + 16,
    height: s.height + 16,
    borderRadius: (s.borderRadius ?? 18) + 4,
    tintColor: fill,
    strokeColor: stroke,
    strokeWidth: 3,
    zIndex: -1,
    visible: true,
  }));
}

export const SPOTIFY_PLAYLIST_TEMPLATES: TemplatePreset[] = [
  // 1. Spotify Playlist: Kangen (Noir & Cyan Cube)
  {
    id: "spotify-kangen-4cut",
    slug: "spotify-kangen-4cut",
    title_id: "Spotify • Kangen (Noir & Cyan)",
    title_en: "Spotify • Kangen (Noir & Cyan)",
    description_id: "Template pemutar Spotify playlist 'Kangen' dengan nuansa gelap noir, aksen cyan menyala, dan cover album asli.",
    description_en: "Spotify 'Kangen' playlist player template in moody noir charcoal & glowing cyan with original cover art.",
    category: "photobox",
    theme: "dark",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: SPOTIFY_ADDED_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "spotify-kangen-4cut",
      version: 1,
      category: "photobox",
      theme: "dark",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#141619" },
      },
      slots: buildSpotifyFourSlots(),
      layers: [
        {
          id: "bg-sp-kangen",
          type: "sticker",
          assetId: buildSpotifyBackdrop("#1F2428", "#141619", "#0B0D0F", "#2DD4BF"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildSpotifyFourSlots(), "#1E2226", "#2DD4BF"),
        {
          id: "stk-sp-badge-kangen",
          type: "sticker",
          assetId: buildSpotifyBadge("#E2E8F0"),
          x: 100,
          y: 56,
          width: 220,
          height: 56,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-sp-kangen-tag",
          type: "text",
          content: "PLAYLIST VIBES",
          x: 620,
          y: 66,
          width: 360,
          height: 36,
          fontFamily: MONO,
          fontSize: 20,
          color: "#2DD4BF",
          align: "right",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        // Now Playing Card at bottom
        {
          id: "sp-card-bg-kangen",
          type: "shape",
          shapeKind: "rect",
          x: 100,
          y: 1534,
          width: 880,
          height: 296,
          borderRadius: 24,
          tintColor: "#1B1F24",
          strokeColor: "#2DD4BF",
          strokeWidth: 2,
          zIndex: 2,
          visible: true,
        },
        {
          id: "sp-cover-kangen",
          type: "sticker",
          assetId: "/covers/kangen.jpg",
          x: 128,
          y: 1560,
          width: 112,
          height: 112,
          borderRadius: 14,
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-title-kangen",
          type: "text",
          content: "Kangen",
          x: 264,
          y: 1564,
          width: 580,
          height: 52,
          fontFamily: SANS,
          fontSize: 40,
          color: "#F8FAFC",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-sub-kangen",
          type: "text",
          content: "Spotify Playlist • Late Night Mood",
          x: 264,
          y: 1622,
          width: 600,
          height: 36,
          fontFamily: SANS,
          fontSize: 22,
          color: "#94A3B8",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-player-kangen",
          type: "sticker",
          assetId: buildPlayerBar("#94A3B8", "#1DB954", "#F8FAFC", "#2DD4BF"),
          x: 128,
          y: 1692,
          width: 824,
          height: 112,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 2. Spotify Playlist: jalanin dulu aja. (Golden Sunset & Olive)
  {
    id: "spotify-jalanin-dulu-aja-4cut",
    slug: "spotify-jalanin-dulu-aja-4cut",
    title_id: "Spotify • jalanin dulu aja. (Sunset)",
    title_en: "Spotify • jalanin dulu aja. (Sunset)",
    description_id: "Template pemutar Spotify playlist 'jalanin dulu aja.' bernuansa senja keemasan & olive hangat dengan cover asli.",
    description_en: "Spotify 'jalanin dulu aja.' playlist player template in warm golden-hour sunset & olive tones with original cover.",
    category: "photobox",
    theme: "aesthetic",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: SPOTIFY_ADDED_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "spotify-jalanin-dulu-aja-4cut",
      version: 1,
      category: "photobox",
      theme: "aesthetic",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#1E221A" },
      },
      slots: buildSpotifyFourSlots(),
      layers: [
        {
          id: "bg-sp-jalanin",
          type: "sticker",
          assetId: buildSpotifyBackdrop("#3A2E1E", "#1E221A", "#131510", "#F59E0B"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildSpotifyFourSlots(), "#2A2B22", "#F59E0B"),
        {
          id: "stk-sp-badge-jalanin",
          type: "sticker",
          assetId: buildSpotifyBadge("#FEF3C7"),
          x: 100,
          y: 56,
          width: 220,
          height: 56,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-sp-jalanin-tag",
          type: "text",
          content: "GOLDEN HOUR",
          x: 620,
          y: 66,
          width: 360,
          height: 36,
          fontFamily: MONO,
          fontSize: 20,
          color: "#FBBF24",
          align: "right",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-card-bg-jalanin",
          type: "shape",
          shapeKind: "rect",
          x: 100,
          y: 1534,
          width: 880,
          height: 296,
          borderRadius: 24,
          tintColor: "#26231B",
          strokeColor: "#D97706",
          strokeWidth: 2,
          zIndex: 2,
          visible: true,
        },
        {
          id: "sp-cover-jalanin",
          type: "sticker",
          assetId: "/covers/jalanin-dulu-aja.jpg",
          x: 128,
          y: 1560,
          width: 112,
          height: 112,
          borderRadius: 14,
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-title-jalanin",
          type: "text",
          content: "jalanin dulu aja.",
          x: 264,
          y: 1564,
          width: 660,
          height: 52,
          fontFamily: SANS,
          fontSize: 38,
          color: "#FEF3C7",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-sub-jalanin",
          type: "text",
          content: "Spotify Playlist • Chill & Keep Going",
          x: 264,
          y: 1622,
          width: 620,
          height: 36,
          fontFamily: SANS,
          fontSize: 22,
          color: "#D6D3D1",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-player-jalanin",
          type: "sticker",
          assetId: buildPlayerBar("#D6D3D1", "#1DB954", "#FEF3C7", "#F59E0B"),
          x: 128,
          y: 1692,
          width: 824,
          height: 112,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "light",
        style: "minimal",
      }),
    },
  },

  // 3. Spotify Playlist: For my future wife (Warm Golden-Hour Tulips)
  {
    id: "spotify-for-my-future-wife-4cut",
    slug: "spotify-for-my-future-wife-4cut",
    title_id: "Spotify • For my future wife 🌷",
    title_en: "Spotify • For my future wife 🌷",
    description_id: "Template pemutar Spotify playlist 'For my future wife' bernuansa krem hangat & tulip pink senja dengan cover asli.",
    description_en: "Romantic Spotify 'For my future wife' playlist player template in warm cream & tulip pink with original cover art.",
    category: "photobox",
    theme: "romantic",
    popularity_score: 99,
    is_featured: true,
    is_new: true,
    added_at: SPOTIFY_ADDED_AT,
    document: {
      schemaVersion: "1.0",
      templateId: "spotify-for-my-future-wife-4cut",
      version: 1,
      category: "photobox",
      theme: "romantic",
      canvas: {
        width: 1080,
        height: 1920,
        aspectRatio: "9:16",
        background: { type: "solid", value: "#FFF5EB" },
      },
      slots: buildSpotifyFourSlots(),
      layers: [
        {
          id: "bg-sp-wife",
          type: "sticker",
          assetId: buildSpotifyBackdrop("#FFF5EB", "#FDE8D7", "#F9D5C4", "#FB7185"),
          x: 0,
          y: 0,
          width: 1080,
          height: 1920,
          zIndex: -2,
          visible: true,
        },
        ...buildSlotFrames(buildSpotifyFourSlots(), "#FFFFFF", "#C2410C"),
        {
          id: "stk-sp-badge-wife",
          type: "sticker",
          assetId: buildSpotifyBadge("#7C2D12"),
          x: 100,
          y: 56,
          width: 220,
          height: 56,
          zIndex: 4,
          visible: true,
        },
        {
          id: "hdr-sp-wife-tag",
          type: "text",
          content: "ALWAYS YOURS ♡",
          x: 600,
          y: 66,
          width: 380,
          height: 36,
          fontFamily: MONO,
          fontSize: 20,
          color: "#9A3412",
          align: "right",
          letterSpacing: 3,
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-card-bg-wife",
          type: "shape",
          shapeKind: "rect",
          x: 100,
          y: 1534,
          width: 880,
          height: 296,
          borderRadius: 24,
          tintColor: "#FFFFFF",
          strokeColor: "#FDBA74",
          strokeWidth: 3,
          zIndex: 2,
          visible: true,
        },
        {
          id: "sp-cover-wife",
          type: "sticker",
          assetId: "/covers/for-my-future-wife.jpg",
          x: 128,
          y: 1560,
          width: 112,
          height: 112,
          borderRadius: 14,
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-title-wife",
          type: "text",
          content: "For my future wife",
          x: 264,
          y: 1564,
          width: 660,
          height: 52,
          fontFamily: PLAYFAIR,
          fontSize: 38,
          color: "#431407",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-sub-wife",
          type: "text",
          content: "Spotify Playlist • Golden Hour Love",
          x: 264,
          y: 1622,
          width: 620,
          height: 36,
          fontFamily: SANS,
          fontSize: 22,
          color: "#9A3412",
          align: "left",
          zIndex: 4,
          visible: true,
        },
        {
          id: "sp-player-wife",
          type: "sticker",
          assetId: buildPlayerBar("#FDBA74", "#1DB954", "#7C2D12", "#F43F5E"),
          x: 128,
          y: 1692,
          width: 824,
          height: 112,
          zIndex: 4,
          visible: true,
        },
      ],
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "dark",
        style: "minimal",
      }),
    },
  },
];
