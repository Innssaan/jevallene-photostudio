import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

export type VirtualBgMode = "none" | "transparent" | "blur" | "solid" | "gradient" | "curtain" | "image";

export interface VirtualBackgroundOption {
  id: string;
  label_id: string;
  label_en: string;
  mode: VirtualBgMode;
  value: string;
  blurAmount?: number;
  curtainColors?: {
    shadow: string;
    mid: string;
    highlight: string;
  };
}

const UNIVERSE_BG_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
  <defs>
    <radialGradient id="neb1" cx="28%" cy="32%" r="55%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.65"/>
      <stop offset="55%" stop-color="#1e1b4b" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#050510" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="neb2" cx="76%" cy="68%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#0ea5e9" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#050510" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="#050510"/>
  <rect width="1280" height="720" fill="url(#neb1)"/>
  <rect width="1280" height="720" fill="url(#neb2)"/>
  <g fill="#ffffff">
    <circle cx="120" cy="95" r="2.2" opacity="0.9"/>
    <circle cx="240" cy="180" r="1.4" opacity="0.7"/>
    <circle cx="380" cy="70" r="2.5" opacity="0.95"/>
    <circle cx="510" cy="210" r="1.6" opacity="0.75"/>
    <circle cx="640" cy="110" r="2.8" opacity="0.9"/>
    <circle cx="790" cy="160" r="1.5" opacity="0.8"/>
    <circle cx="940" cy="85" r="2.4" opacity="0.95"/>
    <circle cx="1110" cy="145" r="2.0" opacity="0.85"/>
    <circle cx="165" cy="360" r="1.8" opacity="0.8"/>
    <circle cx="310" cy="480" r="2.4" opacity="0.9"/>
    <circle cx="470" cy="410" r="1.5" opacity="0.7"/>
    <circle cx="880" cy="350" r="2.2" opacity="0.85"/>
    <circle cx="1040" cy="420" r="2.8" opacity="0.95"/>
    <circle cx="1180" cy="310" r="1.7" opacity="0.8"/>
    <circle cx="190" cy="610" r="2.6" opacity="0.9"/>
    <circle cx="420" cy="640" r="1.6" opacity="0.75"/>
    <circle cx="720" cy="590" r="2.2" opacity="0.85"/>
    <circle cx="960" cy="630" r="1.9" opacity="0.8"/>
    <circle cx="1140" cy="570" r="2.5" opacity="0.95"/>
  </g>
  <path d="M1020 150 L1026 168 L1044 174 L1026 180 L1020 198 L1014 180 L996 174 L1014 168 Z" fill="#fef08a" opacity="0.9"/>
  <path d="M260 510 L265 524 L279 529 L265 534 L260 548 L255 534 L241 529 L255 524 Z" fill="#a5f3fc" opacity="0.9"/>
</svg>
`)}`;

export const VIRTUAL_BG_PRESETS: VirtualBackgroundOption[] = [
  {
    id: "none",
    label_id: "Asli",
    label_en: "Original",
    mode: "none",
    value: "",
  },
  {
    id: "remove-bg",
    label_id: "Hapus Background",
    label_en: "Remove Background",
    mode: "transparent",
    value: "transparent",
  },
  {
    id: "blur",
    label_id: "Blur Studio",
    label_en: "Studio Blur",
    mode: "blur",
    value: "blur",
    blurAmount: 14,
  },
  {
    id: "studio-maroon",
    label_id: "Merah Maroon Studio",
    label_en: "Maroon Studio",
    mode: "gradient",
    value: "linear-gradient(180deg, #7f1d1d 0%, #5c0f1b 55%, #3b0712 100%)",
  },
  {
    id: "studio-blue",
    label_id: "Biru Studio",
    label_en: "Blue Studio",
    mode: "gradient",
    value: "linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 55%, #0f172a 100%)",
  },
  {
    id: "universe",
    label_id: "Universe Background",
    label_en: "Universe Space",
    mode: "image",
    value: UNIVERSE_BG_SVG,
  },
  {
    id: "curtain-maroon",
    label_id: "Tirai Maroon",
    label_en: "Maroon Velvet",
    mode: "curtain",
    value: "linear-gradient(90deg, #3b0707, #881317, #2d0505, #991b1b, #3b0707)",
    curtainColors: { shadow: "#240404", mid: "#6b0f12", highlight: "#a82024" },
  },
  {
    id: "curtain-cream",
    label_id: "Gorden Linen",
    label_en: "Linen Drape",
    mode: "curtain",
    value: "linear-gradient(90deg, #d6cbb8, #f5efe6, #cfc3ae, #f7f2ea, #d6cbb8)",
    curtainColors: { shadow: "#bdb099", mid: "#e5dccb", highlight: "#faf6ee" },
  },
  {
    id: "curtain-navy",
    label_id: "Tirai Navy",
    label_en: "Navy Velvet",
    mode: "curtain",
    value: "linear-gradient(90deg, #091124, #1e3a6e, #0b152c, #254682, #091124)",
    curtainColors: { shadow: "#070d1c", mid: "#15294f", highlight: "#2b4f8c" },
  },
  {
    id: "curtain-emerald",
    label_id: "Tirai Zamrud",
    label_en: "Emerald Velvet",
    mode: "curtain",
    value: "linear-gradient(90deg, #042419, #0d5c42, #052e20, #117352, #042419)",
    curtainColors: { shadow: "#031c13", mid: "#094732", highlight: "#147a57" },
  },
  {
    id: "obsidian",
    label_id: "Hitam Studio",
    label_en: "Dark Studio",
    mode: "solid",
    value: "#141413",
  },
  {
    id: "sunset",
    label_id: "Gradien Senja",
    label_en: "Sunset",
    mode: "gradient",
    value: "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
  },
];

let segmenterPromise: Promise<ImageSegmenter> | null = null;
let maskCanvas: HTMLCanvasElement | null = null;
let personCanvas: HTMLCanvasElement | null = null;
const bgImageCache = new Map<string, HTMLImageElement>();
const curtainCache = new Map<string, HTMLCanvasElement>();

function getRealisticCurtainCanvas(
  id: string,
  colors: NonNullable<VirtualBackgroundOption["curtainColors"]>,
  w: number,
  h: number
): HTMLCanvasElement {
  const key = `${id}-${w}x${h}`;
  const cached = curtainCache.get(key);
  if (cached) return cached;

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  // 1. Base mid-tone fill
  ctx.fillStyle = colors.mid;
  ctx.fillRect(0, 0, w, h);

  // 2. Organic vertical velvet folds with varied widths
  const foldWeights = [1.0, 0.78, 1.15, 0.85, 1.05, 0.72, 1.18, 0.9, 1.08, 0.82, 1.02, 0.88];
  const totalWeight = foldWeights.reduce((a, b) => a + b, 0);
  let x = 0;

  for (let i = 0; i < foldWeights.length; i++) {
    const fw = (foldWeights[i] / totalWeight) * w;
    const grad = ctx.createLinearGradient(x, 0, x + fw, 0);
    grad.addColorStop(0, colors.shadow);
    grad.addColorStop(0.22, colors.mid);
    grad.addColorStop(0.46, colors.highlight);
    grad.addColorStop(0.62, colors.mid);
    grad.addColorStop(0.88, colors.shadow);
    grad.addColorStop(1, colors.shadow);
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, fw + 1, h);

    // Subtle fabric crease highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fillRect(x + fw * 0.44, 0, Math.max(2, fw * 0.06), h);
    x += fw;
  }

  // 3. Top pleat gathering shadow
  const topGather = ctx.createLinearGradient(0, 0, 0, h * 0.14);
  topGather.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  topGather.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = topGather;
  ctx.fillRect(0, 0, w, h * 0.14);

  // 4. Soft studio overhead spotlight + natural edge vignette
  const spotlight = ctx.createRadialGradient(w * 0.5, h * 0.36, w * 0.08, w * 0.5, h * 0.45, w * 0.72);
  spotlight.addColorStop(0, "rgba(255, 245, 230, 0.16)");
  spotlight.addColorStop(0.55, "rgba(0, 0, 0, 0)");
  spotlight.addColorStop(1, "rgba(0, 0, 0, 0.48)");
  ctx.fillStyle = spotlight;
  ctx.fillRect(0, 0, w, h);

  curtainCache.set(key, c);
  return c;
}

export async function getSelfieSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      return ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    })().catch((err) => {
      segmenterPromise = null;
      throw err;
    });
  }
  return segmenterPromise;
}

function getOrCreateCanvas(
  existing: HTMLCanvasElement | null,
  w: number,
  h: number
): HTMLCanvasElement {
  const c = existing ?? document.createElement("canvas");
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  return c;
}

function loadBgImage(src: string): Promise<HTMLImageElement> {
  const cached = bgImageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      bgImageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  value: string,
  w: number,
  h: number
) {
  const match = value.match(/linear-gradient\(([^)]+)\)/i);
  if (!match) {
    ctx.fillStyle = "#141413";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const parts = match[1].split(",").map((s) => s.trim());
  const grad = ctx.createLinearGradient(0, 0, w, h);
  const stops = parts.slice(parts[0]?.endsWith("deg") ? 1 : 0);
  stops.forEach((stop, i) => {
    const [color, pctStr] = stop.split(/\s+/);
    const pct = pctStr?.endsWith("%") ? parseFloat(pctStr) / 100 : i / Math.max(1, stops.length - 1);
    grad.addColorStop(Math.max(0, Math.min(1, pct)), color);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export async function compositeSourceWithVirtualBg(
  source: HTMLVideoElement | HTMLImageElement,
  outputCanvas: HTMLCanvasElement,
  bg: VirtualBackgroundOption,
  options: { mirror?: boolean; filterCss?: string } = {}
): Promise<void> {
  const w =
    source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
  const h =
    source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
  if (!w || !h) return;

  if (outputCanvas.width !== w) outputCanvas.width = w;
  if (outputCanvas.height !== h) outputCanvas.height = h;
  const ctx = outputCanvas.getContext("2d");
  if (!ctx) return;

  const drawSourceTransformed = (targetCtx: CanvasRenderingContext2D, filter?: string) => {
    targetCtx.save();
    if (filter) targetCtx.filter = filter;
    if (options.mirror) {
      targetCtx.translate(w, 0);
      targetCtx.scale(-1, 1);
    }
    targetCtx.drawImage(source, 0, 0, w, h);
    targetCtx.restore();
  };

  if (bg.mode === "none") {
    drawSourceTransformed(ctx, options.filterCss && options.filterCss !== "none" ? options.filterCss : undefined);
    return;
  }

  // 1. Draw chosen background (skip fill for "transparent" cutout mode)
  ctx.save();
  if (bg.mode === "transparent") {
    ctx.clearRect(0, 0, w, h);
  } else if (bg.mode === "blur") {
    drawSourceTransformed(ctx, `blur(${bg.blurAmount ?? 14}px)`);
  } else if (bg.mode === "curtain" && bg.curtainColors) {
    const curtainCanvas = getRealisticCurtainCanvas(bg.id, bg.curtainColors, w, h);
    ctx.drawImage(curtainCanvas, 0, 0, w, h);
  } else if (bg.mode === "solid") {
    ctx.fillStyle = bg.value || "#141413";
    ctx.fillRect(0, 0, w, h);
  } else if (bg.mode === "gradient") {
    drawGradientBackground(ctx, bg.value, w, h);
  } else if (bg.mode === "image" && bg.value) {
    try {
      const bgImg = await loadBgImage(bg.value);
      const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
      const boxRatio = w / h;
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
      if (imgRatio > boxRatio) {
        sw = bgImg.naturalHeight * boxRatio;
        sx = (bgImg.naturalWidth - sw) / 2;
      } else {
        sh = bgImg.naturalWidth / boxRatio;
        sy = (bgImg.naturalHeight - sh) / 2;
      }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
    } catch {
      ctx.fillStyle = "#141413";
      ctx.fillRect(0, 0, w, h);
    }
  }
  ctx.restore();

  // 2. Segment person & composite on top
  try {
    const segmenter = await getSelfieSegmenter();
    const result = segmenter.segment(source);
    const mask = result.confidenceMasks?.[0];
    if (!mask) {
      result.close();
      return;
    }

    const maskData = mask.getAsFloat32Array();
    const mw = mask.width;
    const mh = mask.height;

    maskCanvas = getOrCreateCanvas(maskCanvas, mw, mh);
    const mCtx = maskCanvas.getContext("2d");
    if (mCtx) {
      const imgData = mCtx.createImageData(mw, mh);
      const data = imgData.data;
      for (let i = 0; i < maskData.length; i++) {
        // Soft threshold for smoother hair/shoulder edges
        const conf = maskData[i];
        const alpha = conf <= 0.35 ? 0 : conf >= 0.7 ? 255 : Math.round(((conf - 0.35) / 0.35) * 255);
        const p = i * 4;
        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
        data[p + 3] = alpha;
      }
      mCtx.putImageData(imgData, 0, 0);
    }
    result.close();

    personCanvas = getOrCreateCanvas(personCanvas, w, h);
    const pCtx = personCanvas.getContext("2d");
    if (pCtx && maskCanvas) {
      pCtx.clearRect(0, 0, w, h);
      pCtx.save();
      if (options.mirror) {
        pCtx.translate(w, 0);
        pCtx.scale(-1, 1);
      }
      pCtx.drawImage(maskCanvas, 0, 0, w, h);
      pCtx.globalCompositeOperation = "source-in";
      if (options.filterCss && options.filterCss !== "none") {
        pCtx.filter = options.filterCss;
      }
      pCtx.drawImage(source, 0, 0, w, h);
      pCtx.restore();

      ctx.drawImage(personCanvas, 0, 0, w, h);
    }
  } catch {
    // Graceful fallback if WebGL/MediaPipe is unavailable
    drawSourceTransformed(ctx, options.filterCss && options.filterCss !== "none" ? options.filterCss : undefined);
  }
}

export async function replaceImageBackground(
  dataUrl: string,
  bg: VirtualBackgroundOption
): Promise<string> {
  if (bg.mode === "none") return dataUrl;
  const img = await loadBgImage(dataUrl);
  const canvas = document.createElement("canvas");
  await compositeSourceWithVirtualBg(img, canvas, bg);
  return canvas.toDataURL("image/png");
}
