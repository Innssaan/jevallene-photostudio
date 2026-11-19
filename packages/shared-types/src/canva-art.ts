const svgUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

export const CANVA_ART = {
  // 1. Luxury Black & Gold Gala elements
  goldCornerTL: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f7e3a1"/>
          <stop offset="50%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#9e7b1f"/>
        </linearGradient>
      </defs>
      <path d="M12 128 L12 12 L128 12" fill="none" stroke="url(#g1)" stroke-width="4"/>
      <path d="M22 110 L22 22 L110 22" fill="none" stroke="url(#g1)" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#f7e3a1"/>
      <path d="M28 42 Q42 28 56 42 Q42 56 28 42 Z" fill="url(#g1)" opacity="0.85"/>
    </svg>
  `),
  goldCornerBR: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#9e7b1f"/>
          <stop offset="50%" stop-color="#d4af37"/>
          <stop offset="100%" stop-color="#f7e3a1"/>
        </linearGradient>
      </defs>
      <path d="M12 128 L128 128 L128 12" fill="none" stroke="url(#g2)" stroke-width="4"/>
      <path d="M30 118 L118 118 L118 30" fill="none" stroke="url(#g2)" stroke-width="1.5"/>
      <circle cx="128" cy="128" r="5" fill="#f7e3a1"/>
      <path d="M84 98 Q98 84 112 98 Q98 112 84 98 Z" fill="url(#g2)" opacity="0.85"/>
    </svg>
  `),
  champagneFlutes: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140">
      <defs>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fceabb"/>
          <stop offset="100%" stop-color="#d4af37"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-14 55 70)">
        <path d="M40 24 L66 24 L62 66 Q53 80 44 66 Z" fill="url(#g3)" opacity="0.9" stroke="#fff3c4" stroke-width="2"/>
        <line x1="53" y1="74" x2="53" y2="114" stroke="#f7e3a1" stroke-width="3"/>
        <ellipse cx="53" cy="115" rx="14" ry="4" fill="#d4af37"/>
      </g>
      <g transform="rotate(14 86 70)">
        <path d="M74 24 L100 24 L96 66 Q87 80 78 66 Z" fill="url(#g3)" opacity="0.9" stroke="#fff3c4" stroke-width="2"/>
        <line x1="87" y1="74" x2="87" y2="114" stroke="#f7e3a1" stroke-width="3"/>
        <ellipse cx="87" cy="115" rx="14" ry="4" fill="#d4af37"/>
      </g>
      <path d="M70 8 L73 16 L81 19 L73 22 L70 30 L67 22 L59 19 L67 16 Z" fill="#fff3c4"/>
    </svg>
  `),
  goldSparkle: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 6 L57 42 L94 50 L57 58 L50 94 L43 58 L6 50 L43 42 Z" fill="#f7e3a1"/>
      <circle cx="20" cy="20" r="4" fill="#d4af37"/>
      <circle cx="80" cy="80" r="3" fill="#d4af37"/>
    </svg>
  `),

  // 2. Botanical & Floral Wedding elements
  floralBouquetTop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120">
      <path d="M20 70 Q70 25 120 60 Q170 25 220 70" fill="none" stroke="#6f8769" stroke-width="3"/>
      <ellipse cx="45" cy="48" rx="18" ry="8" transform="rotate(-25 45 48)" fill="#8fa888"/>
      <ellipse cx="75" cy="36" rx="16" ry="7" transform="rotate(20 75 36)" fill="#a3ba9b"/>
      <ellipse cx="165" cy="36" rx="16" ry="7" transform="rotate(-20 165 36)" fill="#a3ba9b"/>
      <ellipse cx="195" cy="48" rx="18" ry="8" transform="rotate(25 195 48)" fill="#8fa888"/>
      <circle cx="120" cy="52" r="22" fill="#f2b8c6"/>
      <circle cx="120" cy="52" r="14" fill="#e58ca3"/>
      <circle cx="120" cy="52" r="6" fill="#fff5d6"/>
      <circle cx="88" cy="60" r="14" fill="#f8d4de"/>
      <circle cx="88" cy="60" r="6" fill="#e79eb2"/>
      <circle cx="152" cy="60" r="14" fill="#f8d4de"/>
      <circle cx="152" cy="60" r="6" fill="#e79eb2"/>
      <circle cx="58" cy="66" r="7" fill="#fffaf2" stroke="#d8b98a" stroke-width="1.5"/>
      <circle cx="182" cy="66" r="7" fill="#fffaf2" stroke="#d8b98a" stroke-width="1.5"/>
    </svg>
  `),
  eucalyptusSprig: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">
      <path d="M20 125 Q55 75 95 15" fill="none" stroke="#5e7658" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="38" cy="96" rx="15" ry="9" transform="rotate(-35 38 96)" fill="#8aa384"/>
      <ellipse cx="52" cy="108" rx="14" ry="8" transform="rotate(25 52 108)" fill="#758f6f"/>
      <ellipse cx="56" cy="70" rx="16" ry="9" transform="rotate(-40 56 70)" fill="#9cb596"/>
      <ellipse cx="74" cy="80" rx="14" ry="8" transform="rotate(20 74 80)" fill="#7e9878"/>
      <ellipse cx="76" cy="42" rx="14" ry="8" transform="rotate(-35 76 42)" fill="#8aa384"/>
      <ellipse cx="90" cy="48" rx="12" ry="7" transform="rotate(15 90 48)" fill="#a8bfa2"/>
      <circle cx="96" cy="16" r="5" fill="#a8bfa2"/>
    </svg>
  `),

  // 3. Graduation Class of 2026 elements
  gradCap: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
      <polygon points="80,18 148,46 80,74 12,46" fill="#1b2a4a" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M40 58 L40 86 Q80 102 120 86 L120 58" fill="#13203b" stroke="#d4af37" stroke-width="2"/>
      <line x1="136" y1="52" x2="136" y2="96" stroke="#f0c75e" stroke-width="3"/>
      <circle cx="136" cy="98" r="6" fill="#f0c75e"/>
      <circle cx="80" cy="46" r="4.5" fill="#f0c75e"/>
    </svg>
  `),
  laurelWreath: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 100">
      <path d="M90 88 Q42 82 24 22" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M90 88 Q138 82 156 22" fill="none" stroke="#d4af37" stroke-width="2.5"/>
      <ellipse cx="30" cy="36" rx="12" ry="5" transform="rotate(-30 30 36)" fill="#e7c667"/>
      <ellipse cx="42" cy="58" rx="12" ry="5" transform="rotate(-15 42 58)" fill="#e7c667"/>
      <ellipse cx="62" cy="76" rx="12" ry="5" transform="rotate(10 62 76)" fill="#e7c667"/>
      <ellipse cx="150" cy="36" rx="12" ry="5" transform="rotate(30 150 36)" fill="#e7c667"/>
      <ellipse cx="138" cy="58" rx="12" ry="5" transform="rotate(15 138 58)" fill="#e7c667"/>
      <ellipse cx="118" cy="76" rx="12" ry="5" transform="rotate(-10 118 76)" fill="#e7c667"/>
      <path d="M90 14 L94 24 L104 24 L96 30 L99 40 L90 34 L81 40 L84 30 L76 24 L86 24 Z" fill="#f5d77f"/>
    </svg>
  `),

  // 4. Neon Disco Party elements
  discoBall: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150">
      <line x1="65" y1="0" x2="65" y2="28" stroke="#c084fc" stroke-width="3"/>
      <circle cx="65" cy="80" r="48" fill="#1e1b4b" stroke="#38bdf8" stroke-width="3"/>
      <ellipse cx="65" cy="80" rx="48" ry="18" fill="none" stroke="#818cf8" stroke-width="1.5"/>
      <ellipse cx="65" cy="80" rx="48" ry="34" fill="none" stroke="#818cf8" stroke-width="1.5"/>
      <ellipse cx="65" cy="80" rx="22" ry="48" fill="none" stroke="#818cf8" stroke-width="1.5"/>
      <line x1="65" y1="32" x2="65" y2="128" stroke="#c084fc" stroke-width="1.5"/>
      <rect x="44" y="54" width="12" height="10" fill="#e0f2fe" opacity="0.9"/>
      <rect x="72" y="68" width="12" height="10" fill="#f0abfc" opacity="0.9"/>
      <rect x="52" y="88" width="12" height="10" fill="#67e8f9" opacity="0.9"/>
      <path d="M18 36 L22 44 L30 48 L22 52 L18 60 L14 52 L6 48 L14 44 Z" fill="#f472b6"/>
      <path d="M112 104 L115 110 L121 113 L115 116 L112 122 L109 116 L103 113 L109 110 Z" fill="#38bdf8"/>
    </svg>
  `),
  neonBolt: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
      <polygon points="58,8 22,64 48,64 38,112 78,52 52,52" fill="#f472b6" stroke="#22d3ee" stroke-width="3" stroke-linejoin="round"/>
    </svg>
  `),

  // 5. Y2K & Birthday Celebration elements
  chromeStar: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="c1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#cbd5e1"/>
          <stop offset="70%" stop-color="#64748b"/>
          <stop offset="100%" stop-color="#f8fafc"/>
        </linearGradient>
      </defs>
      <path d="M60 6 L69 47 L114 60 L69 73 L60 114 L51 73 L6 60 L51 47 Z" fill="url(#c1)" stroke="#334155" stroke-width="2"/>
    </svg>
  `),
  y2kHeart: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110">
      <path d="M60 96 C20 68 8 46 12 28 C16 12 34 10 48 22 L60 34 L72 22 C86 10 104 12 108 28 C112 46 100 68 60 96 Z" fill="#ff5ca8" stroke="#1e293b" stroke-width="3"/>
      <ellipse cx="36" cy="30" rx="8" ry="4" transform="rotate(-30 36 30)" fill="#ffffff" opacity="0.75"/>
    </svg>
  `),
  partyConfetti: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100">
      <rect x="20" y="18" width="16" height="7" rx="3" transform="rotate(-25 20 18)" fill="#f43f5e"/>
      <circle cx="64" cy="36" r="6" fill="#3b82f6"/>
      <rect x="96" y="14" width="14" height="7" rx="3" transform="rotate(35 96 14)" fill="#f59e0b"/>
      <polygon points="142,20 150,36 134,36" fill="#10b981"/>
      <rect x="176" y="28" width="16" height="7" rx="3" transform="rotate(-18 176 28)" fill="#8b5cf6"/>
      <circle cx="42" cy="70" r="5" fill="#f59e0b"/>
      <rect x="122" y="64" width="15" height="7" rx="3" transform="rotate(20 122 64)" fill="#ec4899"/>
      <circle cx="196" cy="74" r="5" fill="#06b6d4"/>
    </svg>
  `),
  partyRibbon: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <path d="M22 92 Q42 52 28 24 Q58 40 94 20 Q74 58 96 92 Q60 72 22 92 Z" fill="#f472b6" stroke="#be185d" stroke-width="2.5"/>
      <circle cx="58" cy="56" r="10" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
    </svg>
  `),
};
