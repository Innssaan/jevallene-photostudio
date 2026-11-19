import {
  CANVA_ART,
  CANVA_REF_ART,
  DOODLE_ART,
  GROOVY_ART,
  VECTOR_STICKERS,
  type AssetLayer,
  type TemplateLayer,
} from "@photostudio/shared-types";

export type StickerCategory = "all" | "love" | "cute" | "badges" | "editorial" | "studio";

export interface StickerPreset {
  id: string;
  category: Exclude<StickerCategory, "all">;
  label: string;
  assetId: string;
  kind: "vector" | "badge";
  bg?: string;
  fg?: string;
}

function svgUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

const CUSTOM_LOVE_AND_CUTE_SVGS = {
  doubleHeart: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M44 86 C18 68 12 44 26 30 C36 20 50 26 54 36 C58 26 72 20 82 30 C96 44 90 68 64 86 L54 94 Z" fill="#FF6B8B" stroke="#111827" stroke-width="4" stroke-linejoin="round"/>
      <path d="M78 96 C60 83 56 66 66 56 C73 49 83 53 86 60 C89 53 99 49 106 56 C116 66 112 83 94 96 L86 102 Z" fill="#FF9EB5" stroke="#111827" stroke-width="4" stroke-linejoin="round"/>
    </svg>
  `),
  sparkleHeart: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M60 98 C26 74 16 46 32 28 C44 15 56 24 60 34 C64 24 76 15 88 28 C104 46 94 74 60 98 Z" fill="#EF4444" stroke="#111827" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M24 22 L27 12 L30 22 L40 25 L30 28 L27 38 L24 28 L14 25 Z" fill="#FFD166" stroke="#111827" stroke-width="2.5"/>
      <path d="M92 78 L94 70 L96 78 L104 80 L96 82 L94 90 L92 82 L84 80 Z" fill="#D2F159" stroke="#111827" stroke-width="2.5"/>
    </svg>
  `),
  pixelHeart: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M24 36 h24 v12 h24 v-12 h24 v12 h12 v24 h-12 v12 h-12 v12 h-12 v12 h-24 v-12 h-12 v-12 h-12 v-12 h-12 v-24 h12 z" fill="#FF4D6D" stroke="#111827" stroke-width="4" stroke-linejoin="miter"/>
      <rect x="28" y="44" width="12" height="12" fill="#FFFFFF"/>
    </svg>
  `),
  loveLetter: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect x="16" y="30" width="88" height="62" rx="8" fill="#FFF1F5" stroke="#111827" stroke-width="4"/>
      <path d="M18 34 L60 68 L102 34" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M60 72 C48 62 44 50 51 44 C56 40 60 44 60 48 C60 44 64 40 69 44 C76 50 72 62 60 72 Z" fill="#FF4D6D" stroke="#111827" stroke-width="3"/>
    </svg>
  `),
  teddyBear: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="32" cy="34" r="16" fill="#C68B59" stroke="#111827" stroke-width="4"/>
      <circle cx="88" cy="34" r="16" fill="#C68B59" stroke="#111827" stroke-width="4"/>
      <circle cx="32" cy="34" r="8" fill="#F3D5B5"/>
      <circle cx="88" cy="34" r="8" fill="#F3D5B5"/>
      <circle cx="60" cy="64" r="36" fill="#C68B59" stroke="#111827" stroke-width="4"/>
      <ellipse cx="60" cy="72" rx="16" ry="13" fill="#F3D5B5" stroke="#111827" stroke-width="3"/>
      <circle cx="46" cy="56" r="4.5" fill="#111827"/>
      <circle cx="74" cy="56" r="4.5" fill="#111827"/>
      <ellipse cx="60" cy="68" rx="5.5" ry="4" fill="#111827"/>
      <circle cx="36" cy="68" r="6" fill="#FF9EB5" opacity="0.8"/>
      <circle cx="84" cy="68" r="6" fill="#FF9EB5" opacity="0.8"/>
    </svg>
  `),
  cuteDuck: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="60" cy="64" r="36" fill="#FFD166" stroke="#111827" stroke-width="4"/>
      <path d="M52 28 C54 16 66 16 68 28" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <circle cx="45" cy="56" r="4.5" fill="#111827"/>
      <circle cx="75" cy="56" r="4.5" fill="#111827"/>
      <ellipse cx="60" cy="68" rx="14" ry="8" fill="#FA7B38" stroke="#111827" stroke-width="3.5"/>
      <circle cx="34" cy="68" r="6" fill="#FF6B8B" opacity="0.75"/>
      <circle cx="86" cy="68" r="6" fill="#FF6B8B" opacity="0.75"/>
    </svg>
  `),
  happyFrog: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="38" cy="36" r="16" fill="#80ED99" stroke="#111827" stroke-width="4"/>
      <circle cx="82" cy="36" r="16" fill="#80ED99" stroke="#111827" stroke-width="4"/>
      <circle cx="38" cy="36" r="6" fill="#111827"/>
      <circle cx="82" cy="36" r="6" fill="#111827"/>
      <ellipse cx="60" cy="68" rx="40" ry="30" fill="#80ED99" stroke="#111827" stroke-width="4"/>
      <path d="M42 70 Q60 84 78 70" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <circle cx="34" cy="66" r="6.5" fill="#FF9EB5"/>
      <circle cx="86" cy="66" r="6.5" fill="#FF9EB5"/>
    </svg>
  `),
};

export const STICKER_PRESETS: StickerPreset[] = [
  // Love & Hearts
  { id: "sparkle-heart", category: "love", label: "Sparkle Heart", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.sparkleHeart, kind: "vector" },
  { id: "double-heart", category: "love", label: "Double Love", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.doubleHeart, kind: "vector" },
  { id: "pixel-heart", category: "love", label: "Pixel Heart", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.pixelHeart, kind: "vector" },
  { id: "love-letter", category: "love", label: "Love Letter", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.loveLetter, kind: "vector" },
  { id: "y2k-heart", category: "love", label: "Y2K Heart", assetId: CANVA_ART.y2kHeart, kind: "vector" },
  { id: "doodle-heart", category: "love", label: "Doodle Heart", assetId: DOODLE_ART.doodleHeartOutline, kind: "vector" },
  { id: "cupid-bow", category: "love", label: "Cupid Bow", assetId: VECTOR_STICKERS.cupidBow, kind: "vector" },
  { id: "pop-lips", category: "love", label: "Pop Lips", assetId: GROOVY_ART.lips, kind: "vector" },
  { id: "satin-bow", category: "love", label: "Satin Bow", assetId: VECTOR_STICKERS.satinBow, kind: "vector" },

  // Lucu & Funny Characters / Doodles
  { id: "teddy-bear", category: "cute", label: "Beruang Lucu", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.teddyBear, kind: "vector" },
  { id: "cute-duck", category: "cute", label: "Bebek Gemoy", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.cuteDuck, kind: "vector" },
  { id: "happy-frog", category: "cute", label: "Katak Senyum", assetId: CUSTOM_LOVE_AND_CUTE_SVGS.happyFrog, kind: "vector" },
  { id: "cute-bunny", category: "cute", label: "Kelinci", assetId: CANVA_REF_ART.cuteBunny, kind: "vector" },
  { id: "doodle-cat", category: "cute", label: "Kucing", assetId: DOODLE_ART.doodleCatFace, kind: "vector" },
  { id: "cloud-smile", category: "cute", label: "Awan Senyum", assetId: DOODLE_ART.doodleCloudSmile, kind: "vector" },
  { id: "smiley-daisy", category: "cute", label: "Bunga Senyum", assetId: GROOVY_ART.smileyDaisy, kind: "vector" },
  { id: "smiley-sun", category: "cute", label: "Sunny Smile", assetId: VECTOR_STICKERS.smileySun, kind: "vector" },
  { id: "sunglasses-cool", category: "cute", label: "Kacamata Cool", assetId: GROOVY_ART.sunglasses, kind: "vector" },
  { id: "strawberry", category: "cute", label: "Stroberi", assetId: DOODLE_ART.doodleStrawberry, kind: "vector" },
  { id: "cherry-pair", category: "cute", label: "Cherry", assetId: VECTOR_STICKERS.cherryPair, kind: "vector" },
  { id: "doodle-crown", category: "cute", label: "Mahkota", assetId: DOODLE_ART.doodleCrown, kind: "vector" },
  { id: "peace-sign", category: "cute", label: "Peace!", assetId: DOODLE_ART.doodlePeace, kind: "vector" },
  { id: "rainbow-cloud", category: "cute", label: "Pelangi", assetId: GROOVY_ART.rainbowCloud, kind: "vector" },
  { id: "retro-mushroom", category: "cute", label: "Jamur Lucu", assetId: GROOVY_ART.mushroom, kind: "vector" },
  { id: "popcorn-bucket", category: "cute", label: "Popcorn", assetId: CANVA_REF_ART.popcornBucket, kind: "vector" },

  // Kata-Kata Lucu & Badges
  { id: "badge-gemes", category: "badges", label: "GEMES BGT!", assetId: "badge:GEMES BGT!|#FF9EB5|#111827", kind: "badge", bg: "#FF9EB5", fg: "#111827" },
  { id: "badge-lucu", category: "badges", label: "LUCU PARAH", assetId: "badge:LUCU PARAH|#D2F159|#111827", kind: "badge", bg: "#D2F159", fg: "#111827" },
  { id: "badge-bucin", category: "badges", label: "BUCIN ERA", assetId: "badge:BUCIN ERA|#FF6B8B|#FFFFFF", kind: "badge", bg: "#FF6B8B", fg: "#FFFFFF" },
  { id: "badge-slay", category: "badges", label: "SLAYYY", assetId: "badge:SLAYYY|#38D1BF|#111827", kind: "badge", bg: "#38D1BF", fg: "#111827" },
  { id: "badge-capek-cute", category: "badges", label: "CAPEK TAPI CUTE", assetId: "badge:CAPEK TAPI CUTE|#FFD166|#111827", kind: "badge", bg: "#FFD166", fg: "#111827" },
  { id: "badge-random", category: "badges", label: "RANDOM BGT", assetId: "badge:RANDOM BGT|#FA7B38|#FFFFFF", kind: "badge", bg: "#FA7B38", fg: "#FFFFFF" },
  { id: "badge-luv3000", category: "badges", label: "LUV U 3000", assetId: "badge:LUV U 3000|#EF4444|#FFFFFF", kind: "badge", bg: "#EF4444", fg: "#FFFFFF" },
  { id: "badge-muka-bantal", category: "badges", label: "MUKA BANTAL", assetId: "badge:MUKA BANTAL|#A0B0E8|#111827", kind: "badge", bg: "#A0B0E8", fg: "#111827" },
  { id: "badge-glowing", category: "badges", label: "AUTO GLOWING", assetId: "badge:AUTO GLOWING|#38D1BF|#111827", kind: "badge", bg: "#38D1BF", fg: "#111827" },
  { id: "badge-jajan", category: "badges", label: "JAJAN DULU", assetId: "badge:JAJAN DULU|#FFD166|#111827", kind: "badge", bg: "#FFD166", fg: "#111827" },
  { id: "badge-senyum", category: "badges", label: "FULL SENYUM", assetId: "badge:FULL SENYUM|#D2F159|#111827", kind: "badge", bg: "#D2F159", fg: "#111827" },
  { id: "badge-estetik", category: "badges", label: "SI PALING ESTETIK", assetId: "badge:SI PALING ESTETIK|#111827|#D2F159", kind: "badge", bg: "#111827", fg: "#D2F159" },
  { id: "badge-ciee", category: "badges", label: "CIEEEE", assetId: "badge:CIEEEE|#FF6B8B|#FFFFFF", kind: "badge", bg: "#FF6B8B", fg: "#FFFFFF" },
  { id: "badge-no-jomblo", category: "badges", label: "NO JOMBLO", assetId: "badge:NO JOMBLO|#A0B0E8|#111827", kind: "badge", bg: "#A0B0E8", fg: "#111827" },
  { id: "badge-bestie", category: "badges", label: "BESTIE!", assetId: "badge:BESTIE!|#FF6B8B|#FFFFFF", kind: "badge", bg: "#FF6B8B", fg: "#FFFFFF" },
  { id: "badge-cute", category: "badges", label: "SO CUTE", assetId: "badge:SO CUTE|#D2F159|#111827", kind: "badge", bg: "#D2F159", fg: "#111827" },
  { id: "badge-photobox", category: "badges", label: "PHOTOBOX", assetId: "badge:PHOTOBOX|#FA7B38|#FFFFFF", kind: "badge", bg: "#FA7B38", fg: "#FFFFFF" },
  { id: "badge-memories", category: "badges", label: "MEMORIES", assetId: "badge:MEMORIES|#A0B0E8|#111827", kind: "badge", bg: "#A0B0E8", fg: "#111827" },
  { id: "badge-real", category: "badges", label: "100% REAL", assetId: "badge:100% REAL|#38D1BF|#111827", kind: "badge", bg: "#38D1BF", fg: "#111827" },
  { id: "badge-xoxo", category: "badges", label: "XOXO", assetId: "badge:XOXO|#FFD166|#111827", kind: "badge", bg: "#FFD166", fg: "#111827" },
  { id: "badge-vibes", category: "badges", label: "GOOD VIBES", assetId: "badge:GOOD VIBES|#FF9EB5|#111827", kind: "badge", bg: "#FF9EB5", fg: "#111827" },
  { id: "badge-4cut", category: "badges", label: "4-CUT", assetId: "badge:4-CUT|#111827|#D2F159", kind: "badge", bg: "#111827", fg: "#D2F159" },

  // Editorial & Craft Vector Illustrations
  { id: "hibiscus", category: "editorial", label: "Hibiscus", assetId: VECTOR_STICKERS.hibiscus, kind: "vector" },
  { id: "wax-seal", category: "editorial", label: "Wax Seal", assetId: VECTOR_STICKERS.waxSeal, kind: "vector" },
  { id: "postal-stamp", category: "editorial", label: "Postal Stamp", assetId: VECTOR_STICKERS.postalStamp, kind: "vector" },
  { id: "washi-tape", category: "editorial", label: "Washi Tape", assetId: VECTOR_STICKERS.washiTape, kind: "vector" },
  { id: "butterfly-groovy", category: "editorial", label: "Butterfly", assetId: GROOVY_ART.butterflyGroovy, kind: "vector" },
  { id: "gold-sparkle", category: "editorial", label: "Gold Sparkle", assetId: CANVA_ART.goldSparkle, kind: "vector" },
  { id: "chrome-star", category: "editorial", label: "Chrome Star", assetId: CANVA_ART.chromeStar, kind: "vector" },

  // Studio & Music Vector Illustrations
  { id: "retro-camera", category: "studio", label: "35mm Camera", assetId: VECTOR_STICKERS.retroCamera, kind: "vector" },
  { id: "vinyl-disc", category: "studio", label: "Vinyl Disc", assetId: VECTOR_STICKERS.vinylDisc, kind: "vector" },
  { id: "disco-ball", category: "studio", label: "Disco Ball", assetId: VECTOR_STICKERS.discoBall, kind: "vector" },
  { id: "theater-masks", category: "studio", label: "Theater Masks", assetId: VECTOR_STICKERS.theaterMasks, kind: "vector" },
  { id: "soundwave", category: "studio", label: "Soundwave", assetId: VECTOR_STICKERS.soundwaveMark, kind: "vector" },
  { id: "binder-clip", category: "studio", label: "Binder Clip", assetId: VECTOR_STICKERS.binderClip, kind: "vector" },
  { id: "starburst", category: "studio", label: "Starburst", assetId: VECTOR_STICKERS.starburst, kind: "vector" },
  { id: "music-notes", category: "studio", label: "Music Notes", assetId: VECTOR_STICKERS.musicNotes, kind: "vector" },
];

const ASSET_LABELS: Array<[string, string, string]> = [
  [DOODLE_ART.doodleCassette, "Kaset", "Cassette"],
  [DOODLE_ART.doodleCrown, "Mahkota", "Crown"],
  [DOODLE_ART.doodleStrawberry, "Stroberi", "Strawberry"],
  [DOODLE_ART.doodleCherry, "Ceri", "Cherry"],
  [DOODLE_ART.doodleCatFace, "Kucing", "Cat"],
  [DOODLE_ART.doodleCloudSmile, "Awan Senyum", "Smiling Cloud"],
  [DOODLE_ART.doodlePlanet, "Planet", "Planet"],
  [DOODLE_ART.doodleCoffee, "Cangkir Kopi", "Coffee Cup"],
  [DOODLE_ART.doodleStarCluster, "Bintang", "Stars"],
  [DOODLE_ART.doodleSquiggle, "Garis Doodle", "Squiggle"],
  [DOODLE_ART.doodleHeartOutline, "Hati", "Heart"],
  [DOODLE_ART.doodlePeace, "Simbol Peace", "Peace Sign"],
  [DOODLE_ART.doodleMusicNotes, "Nada Musik", "Music Notes"],
  [DOODLE_ART.doodleLightning, "Petir", "Lightning"],
  [DOODLE_ART.doodleCheckerPatch, "Papan Catur", "Checkerboard"],
  [GROOVY_ART.smileyDaisy, "Bunga Daisy", "Smiley Daisy"],
  [GROOVY_ART.rainbowCloud, "Pelangi", "Rainbow"],
  [GROOVY_ART.butterflyGroovy, "Kupu-Kupu", "Butterfly"],
  [GROOVY_ART.mushroom, "Jamur Retro", "Mushroom"],
  [GROOVY_ART.sunglasses, "Kacamata", "Sunglasses"],
  [GROOVY_ART.lips, "Bibir Pop", "Pop Lips"],
  [CANVA_ART.champagneFlutes, "Gelas Champagne", "Champagne Flutes"],
  [CANVA_ART.goldSparkle, "Kilau Emas", "Gold Sparkle"],
  [CANVA_ART.floralBouquetTop, "Buket Bunga", "Floral Bouquet"],
  [CANVA_ART.eucalyptusSprig, "Daun Eukaliptus", "Eucalyptus"],
  [CANVA_ART.gradCap, "Topi Toga", "Grad Cap"],
  [CANVA_ART.laurelWreath, "Daun Salam", "Laurel Wreath"],
  [CANVA_ART.discoBall, "Bola Disko", "Disco Ball"],
  [CANVA_ART.neonBolt, "Petir Neon", "Neon Bolt"],
  [CANVA_ART.chromeStar, "Bintang Krom", "Chrome Star"],
  [CANVA_ART.y2kHeart, "Hati Y2K", "Y2K Heart"],
  [CANVA_ART.partyConfetti, "Konfeti Pesta", "Confetti"],
  [CANVA_ART.partyRibbon, "Pita Pesta", "Party Ribbon"],
  [CANVA_REF_ART.barcodeBlack, "Barcode", "Barcode"],
  [CANVA_REF_ART.musicPlayerControls, "Pemutar Musik", "Music Player"],
  [CANVA_REF_ART.airplaneBlue, "Pesawat", "Airplane"],
  [CANVA_REF_ART.denimPocket, "Kantong Denim", "Denim Pocket"],
  [CANVA_REF_ART.theaterCurtainTop, "Tirai Teater", "Theater Curtain"],
  [CANVA_REF_ART.popcornBucket, "Popcorn", "Popcorn"],
  [CANVA_REF_ART.clapperboard, "Clapperboard", "Clapperboard"],
  [CANVA_REF_ART.cuteBunny, "Kelinci", "Bunny"],
  [CANVA_REF_ART.tornKraftPaper, "Kertas Kraft", "Kraft Paper"],
];

export function getLayerDisplayName(layer: TemplateLayer, locale: string): string {
  const isId = locale === "id";
  if (layer.type === "date") {
    if (!layer.content || layer.content === "{{date}}") {
      return isId ? "Tanggal" : "Date";
    }
    return `${isId ? "Tanggal" : "Date"}: ${layer.content}`;
  }
  if (layer.type === "text") {
    return layer.content || (isId ? "Teks" : "Text");
  }
  const asset = layer as AssetLayer;
  const raw = asset.assetId ?? asset.assetUrl ?? "";
  if (raw.startsWith("badge:")) {
    const label = raw.slice(6).split("|")[0];
    return label || (isId ? "Lencana" : "Badge");
  }
  const preset = STICKER_PRESETS.find((s) => s.assetId === raw);
  if (preset) return preset.label;

  const builtIn = ASSET_LABELS.find(([uri]) => uri === raw);
  if (builtIn) return isId ? builtIn[1] : builtIn[2];

  if (layer.type === "frame") {
    return isId ? "Bingkai Dekoratif" : "Decorative Frame";
  }
  if (layer.type === "shape") {
    return isId ? "Elemen Dekorasi" : "Shape Element";
  }
  return isId ? "Stiker Studio" : "Studio Sticker";
}
