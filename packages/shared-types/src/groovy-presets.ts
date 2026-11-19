import { enforceMandatoryWatermark, type TemplateLayer } from "./template.js";
import type { TemplatePreset } from "./presets.js";
import { GROOVY_ART } from "./groovy-art.js";

const SHRIKHAND = "'Shrikhand', 'Pacifico', cursive";

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
  size: number,
  color: string,
  z = 4,
  rotation = 0
): TemplateLayer => ({
  id,
  type: "text",
  x,
  y,
  width: w,
  height: h,
  rotation,
  visible: true,
  content,
  fontFamily: SHRIKHAND,
  fontSize: size,
  color,
  align: "center",
  zIndex: z,
});

/** Title with a hard drop shadow (shadow layer sits right behind the fill). */
const shadowText = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  size: number,
  fill: string,
  shadow: string,
  rotation = 0
): TemplateLayer[] => [
  text(`${id}-shadow`, x + 4, y + 5, w, h, content, size, shadow, 3, rotation),
  text(id, x, y, w, h, content, size, fill, 4, rotation),
];

const slotYs = [196, 488, 780];
const SLOT_W = 336;
const SLOT_H = 268;
const LEFT_X = 36;
const RIGHT_X = 428;

const layers: TemplateLayer[] = [
  // Strip bases
  rect("strip-left", 14, 14, 380, 1172, "#7C8650", -5, { borderRadius: 34, strokeColor: "#4D5530", strokeWidth: 3 }),
  rect("strip-right", 406, 14, 380, 1172, "#5B3A29", -5, { borderRadius: 34, strokeColor: "#3B2417", strokeWidth: 3 }),

  // White photo frames
  ...slotYs.flatMap((y, i) => [
    rect(`frame-l-${i}`, LEFT_X - 6, y - 6, SLOT_W + 12, SLOT_H + 12, "#FFFFFF", -3, { borderRadius: 8 }),
    rect(`frame-r-${i}`, RIGHT_X - 6, y - 6, SLOT_W + 12, SLOT_H + 12, "#FFFFFF", -3, { borderRadius: 8 }),
  ]),

  // Faint sparkle pattern on the brown strip
  ...[
    [424, 330, 34],
    [738, 340, 30],
    [420, 640, 28],
    [742, 648, 34],
    [430, 944, 30],
    [738, 956, 28],
  ].map(([x, y, s], i) => sticker(`pat-${i}`, GROOVY_ART.sparkleCream, x, y, s, s, i * 20, -4, 0.22)),

  // Cloud scallops
  sticker("cloud-top-l", GROOVY_ART.cloudCorner, 14, 12, 380, 78, 0, 1),
  sticker("cloud-bot-l", GROOVY_ART.cloudCornerBottom, 14, 1096, 380, 78, 0, 1),

  // LEFT strip title + sunglasses
  ...shadowText("title-l", 30, 52, 348, 130, "Groovy\nDays", 54, "#F5E6C8", "#4D5530"),
  sticker("sunglasses", GROOVY_ART.sunglasses, 196, 62, 104, 42, -4, 7),

  // LEFT strip stickers
  sticker("l-or-1", GROOVY_ART.flowerOrange, 14, 96, 62, 62, 0, 7),
  sticker("l-or-2", GROOVY_ART.flowerOrange, 28, 160, 40, 40, 12, 7),
  sticker("l-or-3", GROOVY_ART.flowerOrange, 336, 100, 54, 54, 0, 7),
  sticker("l-daisy-1", GROOVY_ART.daisyWhite, 346, 164, 36, 36, 0, 7),
  sticker("l-rainbow", GROOVY_ART.rainbowCloud, 8, 440, 126, 86, -4, 7),
  sticker("l-lips", GROOVY_ART.lips, 262, 438, 118, 78, 8, 7),
  sticker("l-smiley", GROOVY_ART.smileyDaisy, 4, 726, 100, 100, 0, 7),
  sticker("l-butterfly", GROOVY_ART.butterflyGroovy, 250, 712, 136, 106, 6, 7),
  sticker("l-red-1", GROOVY_ART.flowerRed, 10, 1008, 68, 68, 0, 7),
  sticker("l-red-2", GROOVY_ART.flowerRed, 30, 1068, 46, 46, 14, 7),
  sticker("l-lilac", GROOVY_ART.flowerLilac, 236, 990, 156, 156, 0, 7),
  ...shadowText("foot-l", 70, 1056, 190, 84, "Good Friends\nGood Times", 24, "#F5E6C8", "#4D5530"),

  // RIGHT strip title (two colour lines)
  ...shadowText("title-r1", 440, 38, 340, 90, "GROOVY", 64, "#F4826B", "#7C2D12"),
  ...shadowText("title-r2", 440, 104, 340, 90, "BABY", 72, "#F9A03F", "#7C2D12"),
  sticker("r-red-1", GROOVY_ART.flowerRed, 408, 30, 52, 52, 0, 7),
  sticker("r-daisy-1", GROOVY_ART.daisyWhite, 736, 24, 52, 52, 0, 7),
  sticker("r-or-1", GROOVY_ART.flowerOrange, 418, 150, 40, 40, 12, 7),
  sticker("r-red-2", GROOVY_ART.flowerRed, 740, 138, 44, 44, 0, 7),

  // RIGHT strip stickers
  sticker("r-daisy-2", GROOVY_ART.daisyWhite, 388, 430, 116, 116, 0, 7),
  sticker("r-balloon", GROOVY_ART.balloonFlower, 636, 418, 140, 162, 8, 7),
  sticker("r-clover", GROOVY_ART.cloverBlob, 394, 728, 118, 126, -4, 7),
  sticker("r-mushroom", GROOVY_ART.mushroom, 396, 996, 126, 126, -6, 7),
  sticker("r-balloon-2", GROOVY_ART.balloonFlower, 620, 996, 148, 172, 0, 7),
  sticker("r-bow", GROOVY_ART.bowBlue, 706, 1050, 84, 66, 8, 8),
  sticker("r-smiley", GROOVY_ART.smileyDaisy, 726, 960, 60, 60, 10, 8),
  ...shadowText("foot-r", 456, 1056, 200, 84, "Good Friends\nGood Times", 24, "#F5E6C8", "#2A1810"),
];

export const GROOVY_TEMPLATES: TemplatePreset[] = [
  {
    id: "groovy-days-dual",
    slug: "groovy-days-dual",
    title_id: "Groovy Days & Groovy Baby 3-Cut",
    title_en: "Groovy Days & Groovy Baby 3-Cut",
    description_id:
      "Dua strip 3 foto bertema 70-an: hijau zaitun 'Groovy Days' dan cokelat 'Groovy Baby' penuh bunga daisy, pelangi, kupu-kupu, jamur, dan awan.",
    description_en:
      "Dual 70s strips: olive 'Groovy Days' and chocolate 'Groovy Baby' packed with daisies, rainbow, butterfly, mushroom and cloud art.",
    category: "photobox",
    theme: "cute",
    is_featured: true,
    is_new: true,
    popularity_score: 99,
    document: {
      schemaVersion: "1.0",
      templateId: "groovy-days-dual",
      version: 1,
      category: "photobox",
      theme: "cute",
      canvas: {
        width: 800,
        height: 1240,
        aspectRatio: "custom",
        background: { type: "solid", value: "#FFFFFF" },
      },
      slots: [
        ...slotYs.map((y, i) => ({
          id: `slot-l-${i + 1}`,
          index: i,
          x: LEFT_X,
          y,
          width: SLOT_W,
          height: SLOT_H,
          borderRadius: 6,
          filter: "natural" as const,
        })),
        ...slotYs.map((y, i) => ({
          id: `slot-r-${i + 1}`,
          index: i,
          x: RIGHT_X,
          y,
          width: SLOT_W,
          height: SLOT_H,
          borderRadius: 6,
          filter: "natural" as const,
        })),
      ],
      layers,
      watermark: enforceMandatoryWatermark({
        placement: "bottom-center",
        contrastMode: "dark",
        fontFamily: SHRIKHAND,
        style: "minimal",
      }),
    },
  },
];
