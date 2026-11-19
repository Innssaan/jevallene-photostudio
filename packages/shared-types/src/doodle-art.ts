const svgUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

export const DOODLE_ART = {
  // Hand-drawn ink & pastel doodle stickers (zero emojis)
  doodleCrown: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90">
      <path d="M16 70 L10 26 L38 48 L60 16 L82 48 L110 26 L104 70 Z" fill="#fde047" stroke="#18181b" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="10" cy="22" r="5" fill="#f472b6" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="60" cy="12" r="6" fill="#38bdf8" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="110" cy="22" r="5" fill="#f472b6" stroke="#18181b" stroke-width="2.5"/>
      <line x1="22" y1="60" x2="98" y2="60" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
  doodleStrawberry: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <path d="M50 26 C76 26 86 48 76 74 C66 94 56 100 50 100 C44 100 34 94 24 74 C14 48 24 26 50 26 Z" fill="#fb7185" stroke="#18181b" stroke-width="3.5"/>
      <path d="M32 28 Q42 12 50 24 Q58 12 68 28 Q54 34 32 28 Z" fill="#4ade80" stroke="#18181b" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="40" cy="50" r="2.5" fill="#fef08a"/>
      <circle cx="58" cy="48" r="2.5" fill="#fef08a"/>
      <circle cx="48" cy="66" r="2.5" fill="#fef08a"/>
      <circle cx="36" cy="72" r="2.5" fill="#fef08a"/>
      <circle cx="62" cy="72" r="2.5" fill="#fef08a"/>
    </svg>
  `),
  doodleCherry: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110">
      <path d="M34 68 Q46 32 68 18" fill="none" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 74 Q68 38 68 18" fill="none" stroke="#15803d" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="78" cy="22" rx="14" ry="7" transform="rotate(-20 78 22)" fill="#4ade80" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="32" cy="74" r="18" fill="#ef4444" stroke="#18181b" stroke-width="3.5"/>
      <circle cx="74" cy="78" r="18" fill="#dc2626" stroke="#18181b" stroke-width="3.5"/>
      <circle cx="26" cy="68" r="4" fill="#ffffff" opacity="0.85"/>
      <circle cx="68" cy="72" r="4" fill="#ffffff" opacity="0.85"/>
    </svg>
  `),
  doodleCatFace: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110">
      <path d="M22 44 L18 14 L46 30 Q60 26 74 30 L102 14 L98 44 Q108 66 96 86 Q60 102 24 86 Q12 66 22 44 Z" fill="#ffffff" stroke="#18181b" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="24,38 22,22 38,31" fill="#fbcfe8"/>
      <polygon points="96,38 98,22 82,31" fill="#fbcfe8"/>
      <circle cx="44" cy="58" r="4.5" fill="#18181b"/>
      <circle cx="76" cy="58" r="4.5" fill="#18181b"/>
      <ellipse cx="34" cy="68" rx="6" ry="3.5" fill="#fda4af"/>
      <ellipse cx="86" cy="68" rx="6" ry="3.5" fill="#fda4af"/>
      <path d="M54 66 Q60 72 66 66" fill="none" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>
      <line x1="12" y1="60" x2="26" y2="62" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="12" y1="70" x2="26" y2="69" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="60" x2="94" y2="62" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="70" x2="94" y2="69" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),
  doodleCloudSmile: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 90">
      <path d="M28 72 C14 72 10 52 22 44 C20 26 42 16 58 26 C68 14 94 18 98 38 C114 40 118 62 102 72 Z" fill="#e0f2fe" stroke="#18181b" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="52" cy="48" r="3.5" fill="#18181b"/>
      <circle cx="76" cy="48" r="3.5" fill="#18181b"/>
      <path d="M56 56 Q64 64 72 56" fill="none" stroke="#18181b" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
  doodleCassette: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 90">
      <rect x="10" y="14" width="110" height="64" rx="8" fill="#c084fc" stroke="#18181b" stroke-width="3.5"/>
      <rect x="20" y="24" width="90" height="32" rx="4" fill="#fef08a" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="44" cy="40" r="8" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="86" cy="40" r="8" fill="#ffffff" stroke="#18181b" stroke-width="2.5"/>
      <rect x="56" y="34" width="18" height="12" fill="#18181b" rx="2"/>
      <polygon points="32,78 40,64 90,64 98,78" fill="#f472b6" stroke="#18181b" stroke-width="2.5"/>
    </svg>
  `),
  doodlePlanet: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 100">
      <circle cx="65" cy="50" r="26" fill="#a78bfa" stroke="#18181b" stroke-width="3.5"/>
      <ellipse cx="65" cy="52" rx="52" ry="14" transform="rotate(-18 65 52)" fill="none" stroke="#fde047" stroke-width="5"/>
      <ellipse cx="65" cy="52" rx="52" ry="14" transform="rotate(-18 65 52)" fill="none" stroke="#18181b" stroke-width="2"/>
      <circle cx="56" cy="42" r="4" fill="#ddd6fe"/>
    </svg>
  `),
  doodleCoffee: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <path d="M26 38 L74 38 L68 92 L32 92 Z" fill="#fde68a" stroke="#18181b" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="22" y="28" width="56" height="12" rx="4" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
      <path d="M30 56 L70 56 L67 74 L33 74 Z" fill="#a16207" opacity="0.85"/>
      <path d="M40 18 Q44 10 40 4" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M58 18 Q62 10 58 4" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),
  doodleStarCluster: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M48 16 L54 36 L74 42 L54 48 L48 68 L42 48 L22 42 L42 36 Z" fill="#fde047" stroke="#18181b" stroke-width="3" stroke-linejoin="round"/>
      <path d="M88 64 L92 76 L104 80 L92 84 L88 96 L84 84 L72 80 L84 76 Z" fill="#f472b6" stroke="#18181b" stroke-width="2.5"/>
      <circle cx="28" cy="88" r="6" fill="#38bdf8" stroke="#18181b" stroke-width="2.5"/>
    </svg>
  `),
  doodleSquiggle: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60">
      <path d="M10 34 Q24 10 38 34 T66 34 T94 34 T122 34" fill="none" stroke="#ec4899" stroke-width="6" stroke-linecap="round"/>
      <path d="M10 34 Q24 10 38 34 T66 34 T94 34 T122 34" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),
  doodleHeartOutline: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 100">
      <path d="M55 86 C20 62 10 42 14 26 C18 12 34 10 46 22 L55 32 L64 22 C76 10 92 12 96 26 C100 42 90 62 55 86 Z" fill="#fda4af" stroke="#18181b" stroke-width="4" stroke-linejoin="round"/>
      <path d="M26 28 Q32 20 38 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
  doodlePeace: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="38" fill="#86efac" stroke="#18181b" stroke-width="4"/>
      <line x1="50" y1="12" x2="50" y2="88" stroke="#18181b" stroke-width="4"/>
      <line x1="50" y1="50" x2="23" y2="77" stroke="#18181b" stroke-width="4"/>
      <line x1="50" y1="50" x2="77" y2="77" stroke="#18181b" stroke-width="4"/>
    </svg>
  `),
  doodleMusicNotes: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 100">
      <path d="M36 74 L36 24 L82 14 L82 64" fill="none" stroke="#18181b" stroke-width="4" stroke-linejoin="round"/>
      <line x1="36" y1="36" x2="82" y2="26" stroke="#18181b" stroke-width="4"/>
      <ellipse cx="28" cy="76" rx="12" ry="9" transform="rotate(-15 28 76)" fill="#38bdf8" stroke="#18181b" stroke-width="3"/>
      <ellipse cx="74" cy="66" rx="12" ry="9" transform="rotate(-15 74 66)" fill="#f472b6" stroke="#18181b" stroke-width="3"/>
    </svg>
  `),
  doodleLightning: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 110">
      <polygon points="54,8 18,58 44,58 34,102 72,48 46,48" fill="#fde047" stroke="#18181b" stroke-width="3.5" stroke-linejoin="round"/>
    </svg>
  `),
  doodleCheckerPatch: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="10" y="10" width="80" height="80" rx="8" fill="#ffffff" stroke="#18181b" stroke-width="3.5"/>
      <rect x="14" y="14" width="24" height="24" fill="#18181b"/>
      <rect x="62" y="14" width="24" height="24" fill="#18181b"/>
      <rect x="38" y="38" width="24" height="24" fill="#18181b"/>
      <rect x="14" y="62" width="24" height="24" fill="#18181b"/>
      <rect x="62" y="62" width="24" height="24" fill="#18181b"/>
    </svg>
  `),

  // Full-canvas hand-drawn doodle pattern backdrop (600x1800) for behind slots
  fullDoodleBackdropLight: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1800">
      <g fill="none" stroke="#18181b" stroke-width="2.5" opacity="0.16" stroke-linecap="round">
        <path d="M24 90 Q40 60 56 90 T88 90"/>
        <circle cx="550" cy="140" r="18"/>
        <path d="M510 340 L526 364 L554 350 L534 378 L556 402 L526 392 L512 418 L510 388 L480 384 L506 368 Z"/>
        <path d="M20 520 Q44 495 44 530 Q44 565 20 540"/>
        <circle cx="38" cy="720" r="14"/>
        <path d="M540 680 Q560 650 580 680"/>
        <path d="M28 980 L48 960 L58 990 Z"/>
        <circle cx="560" cy="960" r="20"/>
        <path d="M18 1260 Q38 1230 58 1260 T98 1260"/>
        <path d="M524 1280 L554 1260 L548 1296 Z"/>
        <circle cx="42" cy="1480" r="16"/>
        <path d="M520 1520 Q550 1490 572 1526"/>
      </g>
    </svg>
  `),
  fullDoodleBackdropDark: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1800">
      <g fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.18" stroke-linecap="round">
        <path d="M24 90 Q40 60 56 90 T88 90"/>
        <circle cx="550" cy="140" r="18"/>
        <path d="M510 340 L526 364 L554 350 L534 378 L556 402 L526 392 L512 418 L510 388 L480 384 L506 368 Z"/>
        <circle cx="38" cy="720" r="14"/>
        <path d="M540 680 Q560 650 580 680"/>
        <path d="M28 980 L48 960 L58 990 Z"/>
        <circle cx="560" cy="960" r="20"/>
        <path d="M18 1260 Q38 1230 58 1260 T98 1260"/>
        <path d="M524 1280 L554 1260 L548 1296 Z"/>
        <circle cx="42" cy="1480" r="16"/>
        <path d="M520 1520 Q550 1490 572 1526"/>
      </g>
    </svg>
  `),
};
