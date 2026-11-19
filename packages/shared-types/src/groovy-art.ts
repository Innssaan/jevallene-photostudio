function svgUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/** Retro 70s "groovy" vector sticker pack (no emojis). */
export const GROOVY_ART = {
  daisyWhite: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)" fill="#FFFFFF" stroke="#1C1917" stroke-width="2.5">
        <ellipse cx="0" cy="-30" rx="13" ry="24"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(45)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(90)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(135)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(180)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(225)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(270)"/>
        <ellipse cx="0" cy="-30" rx="13" ry="24" transform="rotate(315)"/>
        <circle r="15" fill="#FBBF24"/>
      </g>
    </svg>
  `),

  smileyDaisy: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)" fill="#FFFFFF" stroke="#1C1917" stroke-width="3">
        <circle cx="0" cy="-38" r="17"/>
        <circle cx="27" cy="-27" r="17"/>
        <circle cx="38" cy="0" r="17"/>
        <circle cx="27" cy="27" r="17"/>
        <circle cx="0" cy="38" r="17"/>
        <circle cx="-27" cy="27" r="17"/>
        <circle cx="-38" cy="0" r="17"/>
        <circle cx="-27" cy="-27" r="17"/>
        <circle r="29" fill="#FDE047"/>
        <circle cx="-9" cy="-6" r="3.5" fill="#1C1917" stroke="none"/>
        <circle cx="9" cy="-6" r="3.5" fill="#1C1917" stroke="none"/>
        <path d="M-13 6 Q0 20 13 6" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `),

  flowerLilac: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)" fill="#C4B5FD" stroke="#1C1917" stroke-width="2.8">
        <circle cx="0" cy="-30" r="24"/>
        <circle cx="29" cy="-9" r="24"/>
        <circle cx="18" cy="25" r="24"/>
        <circle cx="-18" cy="25" r="24"/>
        <circle cx="-29" cy="-9" r="24"/>
        <circle r="17" fill="#FBBF24"/>
      </g>
    </svg>
  `),

  flowerOrange: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)" fill="#FB923C" stroke="#7C2D12" stroke-width="2.6">
        <circle cx="0" cy="-30" r="20"/>
        <circle cx="29" cy="-9" r="20"/>
        <circle cx="18" cy="25" r="20"/>
        <circle cx="-18" cy="25" r="20"/>
        <circle cx="-29" cy="-9" r="20"/>
        <circle r="14" fill="#FEF08A"/>
      </g>
    </svg>
  `),

  flowerRed: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <g transform="translate(60,60)" fill="#EF4444" stroke="#7F1D1D" stroke-width="2.6">
        <circle cx="0" cy="-28" r="20"/>
        <circle cx="27" cy="-9" r="20"/>
        <circle cx="17" cy="23" r="20"/>
        <circle cx="-17" cy="23" r="20"/>
        <circle cx="-27" cy="-9" r="20"/>
        <circle r="13" fill="#FDE68A"/>
      </g>
    </svg>
  `),

  rainbowCloud: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110">
      <g fill="none" stroke-width="11" stroke-linecap="butt">
        <path d="M24 92 A56 56 0 0 1 136 92" stroke="#EF4444"/>
        <path d="M35 92 A45 45 0 0 1 125 92" stroke="#FB923C"/>
        <path d="M46 92 A34 34 0 0 1 114 92" stroke="#FACC15"/>
        <path d="M57 92 A23 23 0 0 1 103 92" stroke="#4ADE80"/>
      </g>
      <g fill="#FFFFFF" stroke="#1C1917" stroke-width="3">
        <circle cx="26" cy="88" r="16"/>
        <circle cx="48" cy="92" r="14"/>
        <circle cx="134" cy="88" r="16"/>
        <circle cx="112" cy="92" r="14"/>
        <rect x="26" y="90" width="108" height="14" rx="6" stroke="none"/>
      </g>
    </svg>
  `),

  butterflyGroovy: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 110">
      <g stroke="#1C1917" stroke-width="3" stroke-linejoin="round">
        <path d="M68 52 C50 6 8 10 12 44 C14 62 40 74 68 58 Z" fill="#F472B6"/>
        <path d="M72 52 C90 6 132 10 128 44 C126 62 100 74 72 58 Z" fill="#FB923C"/>
        <path d="M66 60 C46 62 22 80 36 98 C52 108 68 84 68 66 Z" fill="#38BDF8"/>
        <path d="M74 60 C94 62 118 80 104 98 C88 108 72 84 72 66 Z" fill="#FACC15"/>
        <ellipse cx="70" cy="58" rx="5" ry="30" fill="#1C1917"/>
        <path d="M68 28 Q58 10 50 8 M72 28 Q82 10 90 8" fill="none" stroke-linecap="round"/>
      </g>
      <circle cx="34" cy="38" r="8" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="106" cy="38" r="8" fill="#FFFFFF" opacity="0.8"/>
    </svg>
  `),

  mushroom: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130">
      <g stroke="#451A03" stroke-width="3" stroke-linejoin="round">
        <path d="M52 70 C46 98 46 116 54 118 L76 118 C82 116 82 98 76 70 Z" fill="#FEF3C7"/>
        <path d="M10 72 C10 30 46 10 72 14 C104 18 124 42 118 72 C100 80 30 84 10 72 Z" fill="#EA580C"/>
      </g>
      <g fill="#FFFBEB">
        <circle cx="38" cy="46" r="9"/>
        <circle cx="76" cy="34" r="11"/>
        <circle cx="98" cy="58" r="8"/>
        <circle cx="58" cy="62" r="6"/>
      </g>
    </svg>
  `),

  balloonFlower: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 150">
      <g fill="#F9A8D4" stroke="#831843" stroke-width="3" stroke-linejoin="round">
        <ellipse cx="65" cy="28" rx="20" ry="24"/>
        <ellipse cx="30" cy="56" rx="20" ry="24" transform="rotate(-50 30 56)"/>
        <ellipse cx="100" cy="56" rx="20" ry="24" transform="rotate(50 100 56)"/>
        <ellipse cx="44" cy="102" rx="20" ry="26" transform="rotate(24 44 102)"/>
        <ellipse cx="86" cy="102" rx="20" ry="26" transform="rotate(-24 86 102)"/>
        <ellipse cx="65" cy="66" rx="24" ry="28" fill="#FBCFE8"/>
      </g>
      <g fill="#FFFFFF">
        <path d="M24 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z"/>
        <path d="M96 84 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z"/>
      </g>
    </svg>
  `),

  cloverBlob: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 140">
      <g stroke="#3F6212" stroke-width="3" stroke-linejoin="round">
        <ellipse cx="42" cy="38" rx="22" ry="28" fill="#A7C486" transform="rotate(-25 42 38)"/>
        <ellipse cx="90" cy="46" rx="22" ry="28" fill="#D9C79A" transform="rotate(25 90 46)"/>
        <ellipse cx="40" cy="92" rx="22" ry="28" fill="#D9C79A" transform="rotate(25 40 92)"/>
        <ellipse cx="92" cy="98" rx="22" ry="28" fill="#A7C486" transform="rotate(-25 92 98)"/>
        <ellipse cx="66" cy="68" rx="20" ry="22" fill="#C7D9A8"/>
      </g>
      <circle cx="66" cy="68" r="9" fill="#FBBF24"/>
    </svg>
  `),

  lips: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100">
      <g stroke="#1C1917" stroke-width="3" stroke-linejoin="round">
        <path d="M10 44 C30 18 56 22 75 34 C94 22 120 18 140 44 C120 78 98 88 75 88 C52 88 30 78 10 44 Z" fill="#F9A8D4"/>
        <path d="M44 56 C58 78 98 78 112 56 C100 90 60 94 44 56 Z" fill="#F472B6"/>
        <path d="M10 44 C40 52 110 52 140 44" fill="none"/>
      </g>
    </svg>
  `),

  sunglasses: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
      <g stroke="#7F1D1D" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <rect x="8" y="12" width="80" height="52" rx="22" fill="#B91C1C"/>
        <rect x="112" y="12" width="80" height="52" rx="22" fill="#B91C1C"/>
        <path d="M88 30 Q100 20 112 30" fill="none"/>
      </g>
      <rect x="20" y="22" width="56" height="32" rx="14" fill="#111827"/>
      <rect x="124" y="22" width="56" height="32" rx="14" fill="#111827"/>
      <path d="M28 30 L44 30 M132 30 L148 30" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `),

  cloudCorner: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90">
      <path d="M0 0 L240 0 L240 14 C228 14 226 38 206 36 C204 58 178 62 168 48 C154 70 124 66 118 46 C100 64 74 58 70 40 C48 52 30 40 32 28 C14 34 0 24 0 14 Z" fill="#FFF7E6" stroke="#5B3A29" stroke-width="4" stroke-linejoin="round"/>
    </svg>
  `),

  cloudCornerBottom: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90">
      <path d="M0 90 L240 90 L240 76 C228 76 226 52 206 54 C204 32 178 28 168 42 C154 20 124 24 118 44 C100 26 74 32 70 50 C48 38 30 50 32 62 C14 56 0 66 0 76 Z" fill="#FFF7E6" stroke="#5B3A29" stroke-width="4" stroke-linejoin="round"/>
    </svg>
  `),

  bowBlue: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 100">
      <g stroke="#1E3A5F" stroke-width="3" stroke-linejoin="round">
        <path d="M62 50 C40 14 8 24 14 52 C18 70 44 66 62 54 Z" fill="#BAE6FD"/>
        <path d="M68 50 C90 14 122 24 116 52 C112 70 86 66 68 54 Z" fill="#BAE6FD"/>
        <path d="M60 56 L40 94 L54 86 L66 60 Z" fill="#7DD3FC"/>
        <path d="M70 56 L90 94 L76 86 L64 60 Z" fill="#7DD3FC"/>
        <circle cx="65" cy="52" r="11" fill="#FDE68A"/>
      </g>
      <circle cx="65" cy="52" r="4" fill="#1C1917"/>
    </svg>
  `),

  sparkleCream: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
      <path d="M30 4 C32 20 40 28 56 30 C40 32 32 40 30 56 C28 40 20 32 4 30 C20 28 28 20 30 4 Z" fill="#FFF7E6" stroke="#5B3A29" stroke-width="2"/>
    </svg>
  `),
};
