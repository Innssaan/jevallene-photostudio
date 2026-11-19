function svgUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Handcrafted open-source-style SVG vector stickers & editorial stamps
 * (zero emojis) for print-grade photobooth & zine templates.
 */
export const VECTOR_STICKERS = {
  theaterMasks: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g fill="none" stroke="#8E1B24" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 28 C18 20, 62 20, 62 28 L60 66 C58 84, 42 94, 40 94 C38 94, 22 84, 20 66 Z" fill="#FBF9F5"/>
        <path d="M29 44 Q33 40 37 44" /><path d="M45 44 Q49 40 53 44" />
        <path d="M32 66 Q40 76 48 66" />
        <path d="M56 36 C56 28, 100 28, 100 36 L98 74 C96 92, 80 102, 78 102 C76 102, 60 92, 58 74 Z" fill="#8E1B24"/>
        <path d="M67 54 Q71 58 75 54" stroke="#FBF9F5"/>
        <path d="M83 54 Q87 58 91 54" stroke="#FBF9F5"/>
        <path d="M70 80 Q78 72 86 80" stroke="#FBF9F5"/>
      </g>
    </svg>
  `),

  cupidBow: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <g fill="none" stroke="#8E1B24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 78 C18 42, 42 18, 78 22" />
        <line x1="22" y1="78" x2="78" y2="22" stroke-dasharray="3 3" stroke-width="1.8"/>
        <line x1="16" y1="84" x2="86" y2="14" />
        <path d="M74 14 L86 14 L86 26" />
        <path d="M16 84 L12 76 M16 84 L24 88" />
      </g>
    </svg>
  `),

  postalStamp: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
      <g fill="none" stroke="#8E1B24" stroke-width="2" opacity="0.85">
        <path d="M8 22 Q24 14 40 22 T72 22 T104 22" />
        <path d="M8 34 Q24 26 40 34 T72 34 T104 34" />
        <path d="M8 46 Q24 38 40 46 T72 46 T104 46" />
        <circle cx="88" cy="34" r="22" stroke-dasharray="4 2"/>
        <text x="88" y="38" text-anchor="middle" font-family="serif" font-size="10" fill="#8E1B24" stroke="none">LOVE</text>
      </g>
    </svg>
  `),

  hibiscus: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)">
        <path d="M0,-8 C18,-48 48,-24 12,-2 C46,-10 46,30 8,10 C28,46 -12,50 -4,12 C-38,40 -52,6 -12,2 C-48,-16 -24,-52 0,-8 Z" fill="#DC2626" stroke="#7F1D1D" stroke-width="2.5"/>
        <circle cx="0" cy="0" r="8" fill="#FDE047"/>
        <line x1="0" y1="0" x2="22" y2="-26" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
        <circle cx="24" cy="-28" r="4" fill="#FEF08A"/>
      </g>
    </svg>
  `),

  vinylDisc: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="54" fill="#111827" stroke="#000000" stroke-width="2"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="#374151" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="34" fill="none" stroke="#374151" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="24" fill="none" stroke="#374151" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="18" fill="#991B1B"/>
      <circle cx="60" cy="60" r="4.5" fill="#FAF4EC"/>
    </svg>
  `),

  discoBall: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <radialGradient id="d" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="55%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#475569"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="url(#d)" stroke="#1E293B" stroke-width="2.5"/>
      <g stroke="#64748B" stroke-width="1.2" fill="none">
        <ellipse cx="60" cy="60" rx="50" ry="18"/>
        <ellipse cx="60" cy="60" rx="50" ry="35"/>
        <ellipse cx="60" cy="60" rx="18" ry="50"/>
        <ellipse cx="60" cy="60" rx="35" ry="50"/>
        <line x1="10" y1="60" x2="110" y2="60"/>
        <line x1="60" y1="10" x2="60" y2="110"/>
      </g>
      <rect x="44" y="26" width="12" height="10" fill="#FFFFFF" opacity="0.85"/>
      <rect x="66" y="42" width="10" height="10" fill="#FFFFFF" opacity="0.7"/>
    </svg>
  `),

  retroCamera: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 100">
      <rect x="10" y="24" width="120" height="66" rx="10" fill="#18181B" stroke="#09090B" stroke-width="3"/>
      <rect x="10" y="24" width="120" height="22" rx="6" fill="#E4E4E7" stroke="#09090B" stroke-width="2.5"/>
      <rect x="26" y="14" width="22" height="10" rx="3" fill="#D4D4D8" stroke="#09090B" stroke-width="2"/>
      <circle cx="110" cy="35" r="5" fill="#DC2626"/>
      <circle cx="72" cy="58" r="24" fill="#D4D4D8" stroke="#09090B" stroke-width="3"/>
      <circle cx="72" cy="58" r="17" fill="#18181B"/>
      <circle cx="72" cy="58" r="10" fill="#27272A" stroke="#52525B" stroke-width="1.5"/>
      <circle cx="67" cy="53" r="3" fill="#FFFFFF" opacity="0.7"/>
    </svg>
  `),

  satinBow: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <path d="M56 42 C34 12, 10 22, 18 46 C22 58, 42 54, 56 46 Z" fill="#FB7185" stroke="#881337" stroke-width="2.5"/>
      <path d="M64 42 C86 12, 110 22, 102 46 C98 58, 78 54, 64 46 Z" fill="#FB7185" stroke="#881337" stroke-width="2.5"/>
      <path d="M54 48 L36 82 L48 76 L58 50 Z" fill="#F43F5E" stroke="#881337" stroke-width="2.2"/>
      <path d="M66 48 L84 82 L72 76 L62 50 Z" fill="#F43F5E" stroke="#881337" stroke-width="2.2"/>
      <circle cx="60" cy="44" r="9" fill="#FDA4AF" stroke="#881337" stroke-width="2.5"/>
    </svg>
  `),

  soundwaveMark: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="#FAF4EC"/>
      <path d="M26 38 Q50 30 74 42" fill="none" stroke="#4A181D" stroke-width="6" stroke-linecap="round"/>
      <path d="M30 52 Q50 45 70 55" fill="none" stroke="#4A181D" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M34 66 Q50 61 66 68" fill="none" stroke="#4A181D" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `),

  waxSeal: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 8 C64 8, 76 14, 84 24 C92 34, 92 54, 86 68 C78 84, 64 92, 48 90 C32 90, 18 82, 12 68 C6 52, 10 32, 20 20 C30 10, 40 8, 50 8 Z" fill="#991B1B" stroke="#450A0A" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="26" fill="#B91C1C" stroke="#7F1D1D" stroke-width="2"/>
      <text x="50" y="56" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#FEF2F2">J</text>
    </svg>
  `),

  washiTape: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 44">
      <polygon points="6,4 134,2 128,22 136,40 4,42 10,22" fill="#FDE68A" fill-opacity="0.88" stroke="#D97706" stroke-width="1.5"/>
    </svg>
  `),

  binderClip: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
      <circle cx="60" cy="24" r="16" fill="none" stroke="#27272A" stroke-width="5"/>
      <circle cx="60" cy="24" r="7" fill="#F4F4F5"/>
      <polygon points="22,38 98,38 110,74 10,74" fill="#18181B" stroke="#09090B" stroke-width="2.5"/>
    </svg>
  `),

  smileySun: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g stroke="#111827" stroke-width="2.5" stroke-linecap="round">
        <path d="M60 8 L66 24 L82 14 L78 32 L98 28 L86 44 L106 50 L90 62 L106 74 L86 80 L94 98 L76 92 L74 112 L60 98 L46 112 L44 92 L26 98 L34 80 L14 74 L30 62 L14 50 L34 44 L22 28 L42 32 L38 14 L54 24 Z" fill="#FDE047"/>
        <circle cx="60" cy="60" r="28" fill="#FEF08A"/>
        <circle cx="50" cy="54" r="3" fill="#111827" stroke="none"/>
        <circle cx="70" cy="54" r="3" fill="#111827" stroke="none"/>
        <path d="M48 66 Q60 76 72 66" fill="none"/>
      </g>
    </svg>
  `),

  starburst: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 6 L58 34 L86 20 L68 46 L94 58 L64 64 L74 92 L50 72 L26 92 L36 64 L6 58 L32 46 L14 20 L42 34 Z" fill="#D2F159" stroke="#111827" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>
  `),

  cherryPair: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110">
      <path d="M58 18 Q40 38 34 64 M58 18 Q72 42 74 66" fill="none" stroke="#15803D" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M58 18 Q74 10 82 22 Q68 28 58 18 Z" fill="#4ADE80" stroke="#15803D" stroke-width="2"/>
      <circle cx="34" cy="76" r="18" fill="#F43F5E" stroke="#881337" stroke-width="2.5"/>
      <circle cx="74" cy="78" r="18" fill="#E11D48" stroke="#881337" stroke-width="2.5"/>
      <circle cx="28" cy="70" r="4" fill="#FFE4E6"/>
      <circle cx="68" cy="72" r="4" fill="#FFE4E6"/>
    </svg>
  `),

  musicNotes: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110">
      <g fill="#38D1BF" stroke="#111827" stroke-width="2.5" stroke-linejoin="round">
        <path d="M38 74 L38 26 L86 18 L86 66" fill="none" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="28" cy="78" rx="13" ry="10" transform="rotate(-18 28 78)"/>
        <ellipse cx="76" cy="70" rx="13" ry="10" transform="rotate(-18 76 70)"/>
      </g>
    </svg>
  `),
};
