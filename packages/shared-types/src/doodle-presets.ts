import { CANVA_ART } from "./canva-art.js";
import { DOODLE_ART } from "./doodle-art.js";
import { GROOVY_ART } from "./groovy-art.js";
import type { TemplatePreset } from "./presets.js";
import {
  enforceMandatoryWatermark,
  type AspectRatioPreset,
  type FilterPreset,
  type PhotoSlot,
  type TemplateCategory,
  type TemplateLayer,
  type TemplateTheme,
} from "./template.js";
import { VECTOR_STICKERS } from "./vector-stickers.js";

type DoodleLayout = "strip-3" | "strip-4" | "grid-2x2";

interface DoodlePackSpec {
  id: string;
  title: string;
  descId: string;
  descEn: string;
  theme: TemplateTheme;
  layout: DoodleLayout;
  bg: string;
  isGradient?: boolean;
  contrastMode: "light" | "dark";
  titleColor: string;
  subColor: string;
  borderColor: string;
  titleFont: string;
  bodyFont: string;
  headline: string;
  footerText: string;
  filter: FilterPreset;
  /** Rich palette of 8+ sticker assets densely packed all around the frame */
  stickers: string[];
  borderRadius?: number;
}

const makeRect = (
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

const makeSticker = (
  id: string,
  assetId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation = 0,
  z = 6
): TemplateLayer => ({
  id,
  type: "sticker",
  assetId,
  x,
  y,
  width: w,
  height: h,
  rotation,
  opacity: 1,
  visible: true,
  zIndex: z,
});

const makeText = (
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
    zIndex: 7,
    ...extra,
  }) as TemplateLayer;

/** Dense perimeter & slot-corner coordinates for 600x1800 3-shot strip (20 stickers) */
const STRIP3_SLOTS_ANCHORS: Array<[number, number, number, number]> = [
  [12, 16, 76, -14],
  [112, 10, 62, 12],
  [432, 12, 66, -10],
  [512, 24, 78, 16],
  // Overlapping top corners & sides of slot 1 (y: 235..621)
  [18, 210, 74, -16],
  [508, 224, 76, 14],
  [12, 412, 64, 10],
  [522, 430, 66, -12],
  // Overlapping gap between slot 1 & 2 (y: 621..650)
  [26, 594, 78, -12],
  [258, 600, 84, 6],
  [496, 592, 78, 15],
  // Left & right of slot 2 (y: 650..1036)
  [12, 816, 68, -14],
  [520, 828, 68, 12],
  // Overlapping gap between slot 2 & 3 (y: 1036..1065)
  [22, 1012, 80, 14],
  [260, 1016, 80, -8],
  [498, 1010, 78, -16],
  // Left & right of slot 3 (y: 1065..1451)
  [14, 1250, 70, 10],
  [516, 1260, 70, -14],
  // Bottom cluster around footer (keeping bottom-center y>1660 clear for watermark)
  [24, 1446, 86, -12],
  [492, 1444, 86, 14],
  [36, 1564, 74, 10],
  [490, 1564, 74, -10],
];

/** Dense perimeter & slot-corner coordinates for 600x1800 4-shot strip (20 stickers) */
const STRIP4_SLOTS_ANCHORS: Array<[number, number, number, number]> = [
  [14, 14, 72, -12],
  [514, 16, 72, 14],
  [22, 178, 72, -16],
  [506, 184, 72, 12],
  [14, 344, 60, 10],
  [524, 354, 60, -10],
  [24, 502, 74, -12],
  [264, 506, 72, 8],
  [502, 500, 74, 14],
  [14, 684, 62, -14],
  [524, 692, 62, 12],
  [26, 844, 74, 12],
  [262, 848, 72, -6],
  [500, 842, 74, -14],
  [14, 1030, 62, 10],
  [524, 1036, 62, -12],
  [24, 1188, 74, -14],
  [264, 1192, 72, 6],
  [502, 1186, 74, 14],
  [26, 1528, 78, -10],
  [496, 1528, 78, 12],
];

/** Dense perimeter & gap coordinates for 800x1200 2x2 grid (18 stickers) */
const GRID2X2_ANCHORS: Array<[number, number, number, number]> = [
  [18, 18, 76, -14],
  [110, 22, 62, 12],
  [628, 22, 62, -10],
  [706, 18, 76, 14],
  // Overlapping slot outer & inner corners
  [24, 166, 68, -14],
  [364, 164, 72, 8],
  [706, 166, 68, 14],
  [18, 374, 58, 10],
  [724, 374, 58, -10],
  // Center cross intersection of 2x2 grid
  [26, 562, 72, -12],
  [360, 560, 80, 10],
  [702, 562, 72, 12],
  [18, 786, 58, -12],
  [724, 786, 58, 12],
  // Bottom cluster (keeping bottom-right clear for watermark)
  [24, 976, 72, -10],
  [364, 974, 72, 8],
  [702, 976, 72, 14],
  [34, 1076, 74, 10],
];

function buildDoodleTemplate(spec: DoodlePackSpec): TemplatePreset {
  const radius = spec.borderRadius ?? 16;
  const slots: PhotoSlot[] = [];
  const layers: TemplateLayer[] = [];

  let width = 600;
  let height = 1800;
  let aspectRatio: AspectRatioPreset = "custom";
  let category: TemplateCategory = "photobox";

  const addSlot = (
    id: string,
    index: number,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    slots.push({
      id,
      index,
      x,
      y,
      width: w,
      height: h,
      borderRadius: radius,
      filter: spec.filter,
    });
    layers.push(
      makeRect(`frame-${id}`, x - 3, y - 3, w + 6, h + 6, "transparent", -1, {
        borderRadius: radius + 3,
        strokeColor: spec.borderColor,
        strokeWidth: 3.5,
      })
    );
  };

  if (spec.layout === "strip-3") {
    width = 600;
    height = 1800;
    layers.push(
      makeSticker(
        "doodle-bg-pattern",
        spec.contrastMode === "dark"
          ? DOODLE_ART.fullDoodleBackdropDark
          : DOODLE_ART.fullDoodleBackdropLight,
        0,
        0,
        600,
        1800,
        0,
        -2
      )
    );
    [235, 650, 1065].forEach((y, i) => addSlot(`slot-${i + 1}`, i, 68, y, 464, 386));
    layers.push(
      makeText("title", 96, 86, 408, 76, spec.headline, spec.titleFont, 46, spec.titleColor),
      makeText("ft-title", 110, 1516, 380, 56, spec.footerText, spec.titleFont, 34, spec.titleColor),
      makeText("ft-sub", 110, 1580, 380, 26, "DOODLE STICKER EDITION • 2026", spec.bodyFont, 12, spec.subColor, {
        letterSpacing: 2,
      })
    );
    STRIP3_SLOTS_ANCHORS.forEach(([x, y, size, rot], idx) => {
      const asset = spec.stickers[idx % spec.stickers.length];
      layers.push(makeSticker(`stk-${idx + 1}`, asset, x, y, size, size, rot, 6));
    });
  } else if (spec.layout === "strip-4") {
    width = 600;
    height = 1800;
    layers.push(
      makeSticker(
        "doodle-bg-pattern",
        spec.contrastMode === "dark"
          ? DOODLE_ART.fullDoodleBackdropDark
          : DOODLE_ART.fullDoodleBackdropLight,
        0,
        0,
        600,
        1800,
        0,
        -2
      )
    );
    [200, 542, 884, 1226].forEach((y, i) => addSlot(`slot-${i + 1}`, i, 75, y, 450, 318));
    layers.push(
      makeText("title", 96, 68, 408, 68, spec.headline, spec.titleFont, 42, spec.titleColor),
      makeText("ft-title", 110, 1574, 380, 50, spec.footerText, spec.titleFont, 32, spec.titleColor),
      makeText("ft-sub", 110, 1630, 380, 24, "STICKER BOMB • 4-CUT", spec.bodyFont, 12, spec.subColor, {
        letterSpacing: 2,
      })
    );
    STRIP4_SLOTS_ANCHORS.forEach(([x, y, size, rot], idx) => {
      const asset = spec.stickers[idx % spec.stickers.length];
      layers.push(makeSticker(`stk-${idx + 1}`, asset, x, y, size, size, rot, 6));
    });
  } else {
    width = 800;
    height = 1200;
    aspectRatio = "2:3";
    category = "collage";
    [
      { x: 56, y: 190 },
      { x: 412, y: 190 },
      { x: 56, y: 608 },
      { x: 412, y: 608 },
    ].forEach((c, i) => addSlot(`slot-${i + 1}`, i, c.x, c.y, 332, 392));
    layers.push(
      makeText("title", 180, 68, 440, 68, spec.headline, spec.titleFont, 44, spec.titleColor),
      makeText("ft-title", 130, 1038, 540, 46, spec.footerText, spec.titleFont, 32, spec.titleColor),
      makeText("ft-sub", 130, 1094, 540, 24, "FULL DOODLE FRAME • 2026", spec.bodyFont, 12, spec.subColor, {
        letterSpacing: 2,
      })
    );
    GRID2X2_ANCHORS.forEach(([x, y, size, rot], idx) => {
      const asset = spec.stickers[idx % spec.stickers.length];
      layers.push(makeSticker(`stk-${idx + 1}`, asset, x, y, size, size, rot, 6));
    });
  }

  return {
    id: spec.id,
    slug: spec.id,
    title_id: spec.title,
    title_en: spec.title,
    description_id: spec.descId,
    description_en: spec.descEn,
    category,
    theme: spec.theme,
    is_featured: true,
    is_new: true,
    popularity_score: 97,
    document: {
      schemaVersion: "1.0",
      templateId: spec.id,
      version: 1,
      category,
      theme: spec.theme,
      canvas: {
        width,
        height,
        aspectRatio,
        background: {
          type: spec.isGradient ? "gradient" : "solid",
          value: spec.bg,
        },
      },
      slots,
      layers,
      watermark: enforceMandatoryWatermark({
        placement: spec.layout === "grid-2x2" ? "bottom-right" : "bottom-center",
        contrastMode: spec.contrastMode,
        fontFamily: spec.bodyFont,
        style: "minimal",
      }),
    },
  };
}

const DOODLE_SPECS: DoodlePackSpec[] = [
  {
    id: "doodle-y2k-sticker-bomb",
    title: "Y2K Doodle Sticker Bomb",
    descId: "Frame penuh stiker doodle Y2K: mahkota, bintang, hati, kaset, dan petir yang menempel di seluruh tepi foto.",
    descEn: "Maximalist Y2K doodle sticker-bomb frame packed with crowns, stars, hearts, cassettes, and bolts across every edge.",
    theme: "aesthetic",
    layout: "strip-3",
    bg: "linear-gradient(180deg, #fce7f3 0%, #e0e7ff 52%, #fef9c3 100%)",
    isGradient: true,
    contrastMode: "dark",
    titleColor: "#be185d",
    subColor: "#4338ca",
    borderColor: "#18181b",
    titleFont: "Shrikhand",
    bodyFont: "Space Mono",
    headline: "Sticker Bomb!",
    footerText: "So Iconic & Fun",
    filter: "aesthetic",
    stickers: [
      DOODLE_ART.doodleCrown,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleHeartOutline,
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodleSquiggle,
      CANVA_ART.chromeStar,
      DOODLE_ART.doodlePeace,
    ],
  },
  {
    id: "doodle-kawaii-cat-berry",
    title: "Kawaii Cat & Berry Doodle",
    descId: "Penuh stiker kucing lucu, stroberi, ceri, awan tersenyum, dan pita di sekeliling 4 frame foto.",
    descEn: "Sticker-packed kawaii cat, strawberry, cherry, smiling cloud, and ribbon doodle frame.",
    theme: "cute",
    layout: "strip-4",
    bg: "#fff1f2",
    contrastMode: "dark",
    titleColor: "#be123c",
    subColor: "#9f1239",
    borderColor: "#18181b",
    titleFont: "Pacifico",
    bodyFont: "Plus Jakarta Sans",
    headline: "Meow & Berry",
    footerText: "Purrfect Memories",
    filter: "korean",
    stickers: [
      DOODLE_ART.doodleCatFace,
      DOODLE_ART.doodleStrawberry,
      DOODLE_ART.doodleCherry,
      DOODLE_ART.doodleCloudSmile,
      DOODLE_ART.doodleHeartOutline,
      CANVA_ART.partyRibbon,
      DOODLE_ART.doodleStarCluster,
      GROOVY_ART.smileyDaisy,
    ],
  },
  {
    id: "doodle-sketchbook-noir",
    title: "Neon Sketchbook Doodle",
    descId: "Latar hitam penuh coretan kapur dan stiker doodle neon: planet, petir, nada musik, dan bintang.",
    descEn: "Dark chalkboard doodle frame covered in neon planets, bolts, music notes, and stars.",
    theme: "dark",
    layout: "strip-3",
    bg: "#121217",
    contrastMode: "light",
    titleColor: "#fde047",
    subColor: "#67e8f9",
    borderColor: "#f472b6",
    titleFont: "Caveat",
    bodyFont: "Space Mono",
    headline: "Midnight Doodles",
    footerText: "Glow in the Dark",
    filter: "cinematic",
    stickers: [
      DOODLE_ART.doodlePlanet,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodleMusicNotes,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCrown,
      CANVA_ART.neonBolt,
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodleSquiggle,
    ],
  },
  {
    id: "doodle-groovy-full-frame",
    title: "Groovy 70s Sticker Overload",
    descId: "Bingkai penuh stiker retro 70an: pelangi, jamur, kupu-kupu, bunga daisy, dan kacamata.",
    descEn: "Full-frame 70s groovy sticker overload with rainbows, mushrooms, butterflies, and daisies.",
    theme: "vintage",
    layout: "strip-3",
    bg: "#fef3c7",
    contrastMode: "dark",
    titleColor: "#b45309",
    subColor: "#78350f",
    borderColor: "#18181b",
    titleFont: "Shrikhand",
    bodyFont: "Space Mono",
    headline: "Flower Power",
    footerText: "Peace Love & Groove",
    filter: "retro",
    stickers: [
      GROOVY_ART.smileyDaisy,
      GROOVY_ART.rainbowCloud,
      GROOVY_ART.mushroom,
      GROOVY_ART.butterflyGroovy,
      GROOVY_ART.sunglasses,
      DOODLE_ART.doodlePeace,
      GROOVY_ART.flowerLilac,
      GROOVY_ART.flowerOrange,
    ],
  },
  {
    id: "doodle-cosmic-galaxy-4cut",
    title: "Cosmic Space Doodle 4-Cut",
    descId: "Strip 4 foto penuh stiker luar angkasa: planet cincin, bintang, petir, dan awan.",
    descEn: "4-cut cosmic space doodle strip loaded with ringed planets, stars, bolts, and clouds.",
    theme: "dark",
    layout: "strip-4",
    bg: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
    isGradient: true,
    contrastMode: "light",
    titleColor: "#a5f3fc",
    subColor: "#c4b5fd",
    borderColor: "#38bdf8",
    titleFont: "Shrikhand",
    bodyFont: "Space Mono",
    headline: "Space Cadet",
    footerText: "Out of This World",
    filter: "aesthetic",
    stickers: [
      DOODLE_ART.doodlePlanet,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCloudSmile,
      DOODLE_ART.doodleLightning,
      CANVA_ART.chromeStar,
      DOODLE_ART.doodleMusicNotes,
      CANVA_ART.goldSparkle,
      DOODLE_ART.doodleCrown,
    ],
  },
  {
    id: "doodle-cafe-bakery-2x2",
    title: "Cafe & Bakery Doodle 2x2",
    descId: "Kolase 2x2 penuh stiker kopi, stroberi, ceri, awan, dan doodle manis di setiap sudut.",
    descEn: "2x2 cafe collage packed with coffee cups, strawberries, cherries, and sweet doodles.",
    theme: "cute",
    layout: "grid-2x2",
    bg: "#fbf5ea",
    contrastMode: "dark",
    titleColor: "#78350f",
    subColor: "#92400e",
    borderColor: "#18181b",
    titleFont: "Caveat",
    bodyFont: "Space Mono",
    headline: "Coffee & Treats",
    footerText: "Sweet Cafe Break",
    filter: "vintage",
    stickers: [
      DOODLE_ART.doodleCoffee,
      DOODLE_ART.doodleStrawberry,
      DOODLE_ART.doodleCherry,
      DOODLE_ART.doodleCloudSmile,
      DOODLE_ART.doodleHeartOutline,
      DOODLE_ART.doodleSquiggle,
      GROOVY_ART.smileyDaisy,
      DOODLE_ART.doodleCatFace,
    ],
  },
  {
    id: "doodle-music-fest-3cut",
    title: "Music Fest Sticker Bomb",
    descId: "Strip konser musik penuh stiker kaset, nada musik, petir, kacamata, dan checkerboard.",
    descEn: "Music festival sticker bomb strip covered in cassettes, music notes, bolts, and checkerboards.",
    theme: "aesthetic",
    layout: "strip-3",
    bg: "#ede9fe",
    contrastMode: "dark",
    titleColor: "#4c1d95",
    subColor: "#6d28d9",
    borderColor: "#18181b",
    titleFont: "Bebas Neue",
    bodyFont: "Space Mono",
    headline: "LIVE & LOUD",
    footerText: "Backstage Pass",
    filter: "retro",
    stickers: [
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodleMusicNotes,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodleCheckerPatch,
      GROOVY_ART.sunglasses,
      DOODLE_ART.doodlePeace,
      DOODLE_ART.doodleStarCluster,
      VECTOR_STICKERS.vinylDisc,
    ],
  },
  {
    id: "doodle-coquette-scrapbook",
    title: "Coquette Scrapbook Overload",
    descId: "Penuh stiker pita coquette, hati, ceri, mahkota, dan bintang di sekeliling frame.",
    descEn: "Scrapbook sticker overload filled with coquette bows, hearts, cherries, crowns, and stars.",
    theme: "cute",
    layout: "strip-3",
    bg: "#fff5f7",
    contrastMode: "dark",
    titleColor: "#be185d",
    subColor: "#9d174d",
    borderColor: "#ec4899",
    titleFont: "Dancing Script",
    bodyFont: "Plus Jakarta Sans",
    headline: "Sweet Scrapbook",
    footerText: "XOXO Forever",
    filter: "korean",
    stickers: [
      CANVA_ART.partyRibbon,
      DOODLE_ART.doodleHeartOutline,
      DOODLE_ART.doodleCherry,
      DOODLE_ART.doodleCrown,
      DOODLE_ART.doodleCatFace,
      DOODLE_ART.doodleStrawberry,
      CANVA_ART.y2kHeart,
      DOODLE_ART.doodleStarCluster,
    ],
  },
  {
    id: "doodle-checker-skate-2x2",
    title: "Checker & Skate Doodle 2x2",
    descId: "Kolase 2x2 gaya skater dengan stiker papan catur, petir, kacamata, dan peace sign.",
    descEn: "Skater-style 2x2 collage covered in checkerboard patches, lightning bolts, and peace signs.",
    theme: "aesthetic",
    layout: "grid-2x2",
    bg: "#ecfdf5",
    contrastMode: "dark",
    titleColor: "#065f46",
    subColor: "#047857",
    borderColor: "#18181b",
    titleFont: "Shrikhand",
    bodyFont: "Space Mono",
    headline: "Skate & Smile",
    footerText: "Street Sticker Crew",
    filter: "retro",
    stickers: [
      DOODLE_ART.doodleCheckerPatch,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodlePeace,
      GROOVY_ART.sunglasses,
      DOODLE_ART.doodleSquiggle,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodleCrown,
    ],
  },
  {
    id: "doodle-notebook-journal-4cut",
    title: "School Notebook Doodle 4-Cut",
    descId: "Strip ala buku catatan sekolah penuh coretan pensil, awan, bintang, dan stiker lucu.",
    descEn: "School notebook 4-cut strip packed with hand-drawn clouds, stars, cats, and doodles.",
    theme: "cute",
    layout: "strip-4",
    bg: "#fefce8",
    contrastMode: "dark",
    titleColor: "#1e3a8a",
    subColor: "#1d4ed8",
    borderColor: "#18181b",
    titleFont: "Caveat",
    bodyFont: "Space Mono",
    headline: "Notebook Doodles",
    footerText: "Class Memories",
    filter: "natural",
    stickers: [
      DOODLE_ART.doodleCloudSmile,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCatFace,
      DOODLE_ART.doodleHeartOutline,
      DOODLE_ART.doodleSquiggle,
      DOODLE_ART.doodleCrown,
      DOODLE_ART.doodleMusicNotes,
      DOODLE_ART.doodlePeace,
    ],
  },
  {
    id: "doodle-pastel-party-2x2",
    title: "Pastel Party Sticker 2x2",
    descId: "Kolase ulang tahun 2x2 penuh stiker mahkota, bintang, pita, hati, dan awan.",
    descEn: "2x2 pastel birthday collage bursting with crowns, stars, ribbons, hearts, and clouds.",
    theme: "birthday",
    layout: "grid-2x2",
    bg: "linear-gradient(135deg, #fdf2f8 0%, #ede9fe 50%, #e0f2fe 100%)",
    isGradient: true,
    contrastMode: "dark",
    titleColor: "#7c3aed",
    subColor: "#db2777",
    borderColor: "#18181b",
    titleFont: "Pacifico",
    bodyFont: "Plus Jakarta Sans",
    headline: "Party Overload!",
    footerText: "Best Day Ever",
    filter: "aesthetic",
    stickers: [
      DOODLE_ART.doodleCrown,
      CANVA_ART.partyRibbon,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleHeartOutline,
      DOODLE_ART.doodleCloudSmile,
      CANVA_ART.chromeStar,
      DOODLE_ART.doodleStrawberry,
      GROOVY_ART.smileyDaisy,
    ],
  },
  {
    id: "doodle-neon-rave-4cut",
    title: "Neon Rave Sticker 4-Cut",
    descId: "Strip 4 foto pesta malam gelap penuh stiker neon: petir, kaset, planet, dan bola disko.",
    descEn: "Dark neon rave 4-cut strip packed with bolts, cassettes, planets, and disco balls.",
    theme: "dark",
    layout: "strip-4",
    bg: "#090514",
    contrastMode: "light",
    titleColor: "#f472b6",
    subColor: "#22d3ee",
    borderColor: "#22d3ee",
    titleFont: "Bebas Neue",
    bodyFont: "Space Mono",
    headline: "NEON STICKER RAVE",
    footerText: "All Night Long",
    filter: "cinematic",
    stickers: [
      CANVA_ART.neonBolt,
      CANVA_ART.discoBall,
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodlePlanet,
      DOODLE_ART.doodleMusicNotes,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodleCrown,
    ],
  },
  {
    id: "doodle-summer-fruit-3cut",
    title: "Summer Fruit Sticker 3-Cut",
    descId: "Strip musim panas segar penuh stiker stroberi, ceri, bunga daisy, pelangi, dan kupu-kupu.",
    descEn: "Fresh summer 3-cut strip covered in strawberries, cherries, daisies, rainbows, and butterflies.",
    theme: "cute",
    layout: "strip-3",
    bg: "#ecfeff",
    contrastMode: "dark",
    titleColor: "#0e7490",
    subColor: "#0284c7",
    borderColor: "#18181b",
    titleFont: "Shrikhand",
    bodyFont: "Plus Jakarta Sans",
    headline: "Juicy Summer",
    footerText: "Sweet Sunshine",
    filter: "natural",
    stickers: [
      DOODLE_ART.doodleStrawberry,
      DOODLE_ART.doodleCherry,
      GROOVY_ART.rainbowCloud,
      GROOVY_ART.smileyDaisy,
      GROOVY_ART.butterflyGroovy,
      DOODLE_ART.doodleCloudSmile,
      GROOVY_ART.sunglasses,
      DOODLE_ART.doodleStarCluster,
    ],
  },
  {
    id: "doodle-retro-pop-2x2",
    title: "Retro Pop Sticker 2x2",
    descId: "Kolase 2x2 penuh stiker pop retro: bibir, kacamata, kaset, petir, dan papan catur.",
    descEn: "Retro pop-art 2x2 collage loaded with lips, shades, cassettes, bolts, and checkerboards.",
    theme: "vintage",
    layout: "grid-2x2",
    bg: "#fff7ed",
    contrastMode: "dark",
    titleColor: "#c2410c",
    subColor: "#ea580c",
    borderColor: "#18181b",
    titleFont: "Shrikhand",
    bodyFont: "Space Mono",
    headline: "Pop Culture",
    footerText: "Retro Overload",
    filter: "retro",
    stickers: [
      GROOVY_ART.lips,
      GROOVY_ART.sunglasses,
      DOODLE_ART.doodleCassette,
      DOODLE_ART.doodleLightning,
      DOODLE_ART.doodleCheckerPatch,
      DOODLE_ART.doodleSquiggle,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCrown,
    ],
  },
  {
    id: "doodle-dreamy-cloud-3cut",
    title: "Dreamy Cloud & Cat 3-Cut",
    descId: "Strip biru pastel penuh stiker awan senyum, kucing, planet, dan bintang berkelip.",
    descEn: "Pastel sky blue strip filled with smiling clouds, cats, planets, and twinkling stars.",
    theme: "cute",
    layout: "strip-3",
    bg: "linear-gradient(180deg, #e0f2fe 0%, #f3e8ff 100%)",
    isGradient: true,
    contrastMode: "dark",
    titleColor: "#1d4ed8",
    subColor: "#6d28d9",
    borderColor: "#18181b",
    titleFont: "Pacifico",
    bodyFont: "Plus Jakarta Sans",
    headline: "Cloud Nine",
    footerText: "Floating in Dreams",
    filter: "korean",
    stickers: [
      DOODLE_ART.doodleCloudSmile,
      DOODLE_ART.doodleCatFace,
      DOODLE_ART.doodlePlanet,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleHeartOutline,
      CANVA_ART.chromeStar,
      DOODLE_ART.doodleMusicNotes,
      GROOVY_ART.rainbowCloud,
    ],
  },
  {
    id: "doodle-love-bomb-4cut",
    title: "Love Bomb Sticker 4-Cut",
    descId: "Strip 4 foto penuh stiker hati, pita, ceri, dan bunga untuk pasangan atau sahabat.",
    descEn: "4-cut love bomb strip packed with doodle hearts, bows, cherries, and flowers.",
    theme: "romantic",
    layout: "strip-4",
    bg: "#ffe4e6",
    contrastMode: "dark",
    titleColor: "#9f1239",
    subColor: "#be123c",
    borderColor: "#18181b",
    titleFont: "Dancing Script",
    bodyFont: "Plus Jakarta Sans",
    headline: "Full of Love",
    footerText: "You & Me Always",
    filter: "korean",
    stickers: [
      DOODLE_ART.doodleHeartOutline,
      CANVA_ART.y2kHeart,
      CANVA_ART.partyRibbon,
      DOODLE_ART.doodleCherry,
      DOODLE_ART.doodleCrown,
      DOODLE_ART.doodleStarCluster,
      DOODLE_ART.doodleCatFace,
      DOODLE_ART.doodleSquiggle,
    ],
  },
];

export const DOODLE_STICKER_TEMPLATES: TemplatePreset[] =
  DOODLE_SPECS.map(buildDoodleTemplate);
