function svgUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Custom editorial album-cover & lifestyle SVG illustrations (zero emojis)
 * used in music-inspired & Pinterest-style photobooth templates.
 */
export const EDITORIAL_ART = {
  // Original official album covers served same-origin from /public/covers/
  bfiaflCover: "/covers/bfiafl.jpg",
  sunsetVinylCover: "/covers/freudian.jpg",

  // Iced Matcha Latte Cup Illustration
  matchaCup: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">
      <line x1="68" y1="10" x2="58" y2="44" stroke="#065F46" stroke-width="5" stroke-linecap="round"/>
      <path d="M28 42 L92 42 L82 124 L38 124 Z" fill="#FFFFFF" stroke="#064E3B" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 64 L88 64 L80 120 L40 120 Z" fill="#6EE7B7"/>
      <path d="M30 48 Q60 58 90 48 L88 66 Q60 72 32 66 Z" fill="#ECFDF5"/>
      <rect x="44" y="74" width="12" height="12" rx="2" fill="#D1FAE5" opacity="0.8"/>
      <rect x="64" y="84" width="12" height="12" rx="2" fill="#D1FAE5" opacity="0.8"/>
      <ellipse cx="60" cy="42" rx="33" ry="6" fill="#D1FAE5" stroke="#064E3B" stroke-width="2.5"/>
    </svg>
  `),

  // Pastel Cloud Heart Emblem
  pastelHeartCloud: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
      <path d="M60 84 C60 84 16 56 16 32 C16 18 28 10 40 14 C50 17 56 24 60 30 C64 24 70 17 80 14 C92 10 104 18 104 32 C104 56 60 84 60 84 Z" fill="#F472B6" stroke="#831843" stroke-width="3"/>
      <path d="M30 28 Q36 20 44 24" fill="none" stroke="#FDF2F8" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
};
