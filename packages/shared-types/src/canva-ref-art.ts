const svgUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

export const CANVA_REF_ART = {
  // Barcode for tickets, boarding passes & receipts
  barcodeBlack: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 50">
      <g fill="#18181b">
        <rect x="4" y="4" width="6" height="42"/>
        <rect x="14" y="4" width="3" height="42"/>
        <rect x="22" y="4" width="8" height="42"/>
        <rect x="34" y="4" width="2" height="42"/>
        <rect x="40" y="4" width="5" height="42"/>
        <rect x="50" y="4" width="9" height="42"/>
        <rect x="64" y="4" width="3" height="42"/>
        <rect x="72" y="4" width="6" height="42"/>
        <rect x="82" y="4" width="2" height="42"/>
        <rect x="88" y="4" width="8" height="42"/>
        <rect x="100" y="4" width="4" height="42"/>
        <rect x="108" y="4" width="7" height="42"/>
        <rect x="120" y="4" width="3" height="42"/>
        <rect x="128" y="4" width="9" height="42"/>
        <rect x="142" y="4" width="4" height="42"/>
        <rect x="150" y="4" width="2" height="42"/>
        <rect x="156" y="4" width="7" height="42"/>
        <rect x="168" y="4" width="5" height="42"/>
        <rect x="178" y="4" width="3" height="42"/>
        <rect x="186" y="4" width="8" height="42"/>
        <rect x="198" y="4" width="4" height="42"/>
        <rect x="206" y="4" width="6" height="42"/>
        <rect x="216" y="4" width="3" height="42"/>
        <rect x="224" y="4" width="9" height="42"/>
      </g>
    </svg>
  `),
  // Spotify / Music player control bar
  musicPlayerControls: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 64">
      <line x1="16" y1="12" x2="244" y2="12" stroke="#ffffff" stroke-opacity="0.35" stroke-width="4" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="148" y2="12" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="148" cy="12" r="6" fill="#ffffff"/>
      <polygon points="74,34 74,54 58,44" fill="#ffffff"/>
      <rect x="54" y="34" width="4" height="20" fill="#ffffff"/>
      <circle cx="130" cy="44" r="18" fill="#ffffff"/>
      <polygon points="125,36 125,52 139,44" fill="#15803d"/>
      <polygon points="186,34 186,54 202,44" fill="#ffffff"/>
      <rect x="202" y="34" width="4" height="20" fill="#ffffff"/>
    </svg>
  `),
  // Realistic airline boarding pass ticket card (362x1152) with notches, perforation, & globe mark
  boardingPassTicketCard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362 1152">
      <defs>
        <clipPath id="bpClip">
          <path d="M16 0 L346 0 Q362 0 362 16 L362 178 A14 14 0 0 0 362 206 L362 986 A14 14 0 0 0 362 1014 L362 1136 Q362 1152 346 1152 L16 1152 Q0 1152 0 1136 L0 1014 A14 14 0 0 0 0 986 L0 206 A14 14 0 0 0 0 178 L0 16 Q0 0 16 0 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#bpClip)">
        <rect width="362" height="1152" fill="#ffffff"/>
        <rect width="362" height="68" fill="#0f3d7a"/>
        <rect y="68" width="362" height="6" fill="#38bdf8"/>
        <!-- Subtle world-map / globe watermark in header -->
        <circle cx="318" cy="34" r="20" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
        <ellipse cx="318" cy="34" rx="10" ry="20" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
        <line x1="298" y1="34" x2="338" y2="34" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
        <!-- Route divider dashed line -->
        <line x1="20" y1="192" x2="342" y2="192" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 5"/>
        <!-- Flight info bar background -->
        <rect x="18" y="998" width="326" height="44" rx="6" fill="#f1f5f9"/>
        <!-- Bottom tear perforation line -->
        <line x1="16" y1="1000" x2="346" y2="1000" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>
      </g>
      <path d="M16 1 L346 1 Q361 1 361 16 L361 178 A14 14 0 0 0 361 206 L361 986 A14 14 0 0 0 361 1014 L361 1136 Q361 1151 346 1151 L16 1151 Q1 1151 1 1136 L1 1014 A14 14 0 0 0 1 986 L1 206 A14 14 0 0 0 1 178 L1 16 Q1 1 16 1 Z" fill="none" stroke="#cbd5e1" stroke-width="2"/>
    </svg>
  `),
  // Realistic Red Airline Boarding Pass ticket card (362x1152)
  boardingPassRedTicketCard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 362 1152">
      <defs>
        <clipPath id="bpRedClip">
          <path d="M16 0 L346 0 Q362 0 362 16 L362 178 A14 14 0 0 0 362 206 L362 986 A14 14 0 0 0 362 1014 L362 1136 Q362 1152 346 1152 L16 1152 Q0 1152 0 1136 L0 1014 A14 14 0 0 0 0 986 L0 206 A14 14 0 0 0 0 178 L0 16 Q0 0 16 0 Z"/>
        </clipPath>
      </defs>
      <g clip-path="url(#bpRedClip)">
        <rect width="362" height="1152" fill="#ffffff"/>
        <rect width="362" height="68" fill="#991b1b"/>
        <rect y="68" width="362" height="6" fill="#f87171"/>
        <circle cx="318" cy="34" r="20" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>
        <ellipse cx="318" cy="34" rx="10" ry="20" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>
        <line x1="298" y1="34" x2="338" y2="34" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.5"/>
        <line x1="20" y1="192" x2="342" y2="192" stroke="#fecaca" stroke-width="2" stroke-dasharray="6 5"/>
        <rect x="18" y="998" width="326" height="44" rx="6" fill="#fef2f2"/>
        <line x1="16" y1="1000" x2="346" y2="1000" stroke="#fca5a5" stroke-width="2" stroke-dasharray="5 5"/>
      </g>
      <path d="M16 1 L346 1 Q361 1 361 16 L361 178 A14 14 0 0 0 361 206 L361 986 A14 14 0 0 0 361 1014 L361 1136 Q361 1151 346 1151 L16 1151 Q1 1151 1 1136 L1 1014 A14 14 0 0 0 1 986 L1 206 A14 14 0 0 0 1 178 L1 16 Q1 1 16 1 Z" fill="none" stroke="#fca5a5" stroke-width="2"/>
    </svg>
  `),
  airplaneRed: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path d="M12 44 L34 38 L24 14 L34 14 L50 36 L68 34 Q74 34 74 40 Q74 46 68 46 L50 44 L34 66 L24 66 L34 42 L12 36 Z" fill="#991b1b"/>
    </svg>
  `),
  // Realistic vintage cream cinema ticket card (366x1156) with corner & side notches
  cinemaTicketCard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 366 1156">
      <path d="M24 0 L342 0 A24 24 0 0 0 366 24 L366 164 A12 12 0 0 0 366 188 L366 992 A12 12 0 0 0 366 1016 L366 1132 A24 24 0 0 0 342 1156 L24 1156 A24 24 0 0 0 0 1132 L0 1016 A12 12 0 0 0 0 992 L0 188 A12 12 0 0 0 0 164 L0 24 A24 24 0 0 0 24 0 Z" fill="#fbf6ea" stroke="#7c2d12" stroke-width="3"/>
      <rect x="14" y="14" width="338" height="1128" rx="6" fill="none" stroke="#9a3412" stroke-width="1.5" stroke-dasharray="4 3"/>
      <line x1="20" y1="176" x2="346" y2="176" stroke="#7c2d12" stroke-width="2" stroke-dasharray="6 5"/>
      <line x1="20" y1="1004" x2="346" y2="1004" stroke="#7c2d12" stroke-width="2" stroke-dasharray="6 5"/>
    </svg>
  `),
  // Realistic thermal receipt paper (520x1720) with zig-zag serrated top & bottom edges
  thermalReceiptCard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 1720">
      <path d="M0 16 L16 0 L32 16 L48 0 L64 16 L80 0 L96 16 L112 0 L128 16 L144 0 L160 16 L176 0 L192 16 L208 0 L224 16 L240 0 L256 16 L272 0 L288 16 L304 0 L320 16 L336 0 L352 16 L368 0 L384 16 L400 0 L416 16 L432 0 L448 16 L464 0 L480 16 L496 0 L520 16 L520 1704 L496 1720 L480 1704 L464 1720 L448 1704 L432 1720 L416 1704 L400 1720 L384 1704 L368 1720 L352 1704 L336 1720 L320 1704 L304 1720 L288 1704 L272 1720 L256 1704 L240 1720 L224 1704 L208 1720 L192 1704 L176 1720 L160 1704 L144 1720 L128 1704 L112 1720 L96 1704 L80 1720 L64 1704 L48 1720 L32 1704 L16 1720 L0 1704 Z" fill="#fcfbf7" stroke="#d4d4d8" stroke-width="2"/>
    </svg>
  `),
  // Realistic black & gold VIP concert/cinema ticket stub (516x1708)
  vipBlackTicketCard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 516 1708">
      <path d="M24 0 L492 0 A24 24 0 0 0 516 24 L516 184 A16 16 0 0 0 516 216 L516 1464 A16 16 0 0 0 516 1496 L516 1684 A24 24 0 0 0 492 1708 L24 1708 A24 24 0 0 0 0 1684 L0 1496 A16 16 0 0 0 0 1464 L0 216 A16 16 0 0 0 0 184 L0 24 A24 24 0 0 0 24 0 Z" fill="#111114" stroke="#facc15" stroke-width="3"/>
      <line x1="24" y1="200" x2="492" y2="200" stroke="#facc15" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="8 6"/>
      <line x1="24" y1="1480" x2="492" y2="1480" stroke="#facc15" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="8 6"/>
    </svg>
  `),
  // Realistic brushed steel elevator / locker door panel (540x1740)
  lockerDoorPanel: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 1740">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3f3f46"/>
          <stop offset="50%" stop-color="#27272a"/>
          <stop offset="100%" stop-color="#18181b"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="532" height="1732" rx="14" fill="url(#steel)" stroke="#52525b" stroke-width="4"/>
      <rect x="20" y="20" width="500" height="1700" rx="8" fill="none" stroke="#71717a" stroke-opacity="0.35" stroke-width="2"/>
      <!-- Air vents at bottom -->
      <rect x="170" y="1584" width="200" height="10" rx="5" fill="#09090b"/>
      <rect x="170" y="1604" width="200" height="10" rx="5" fill="#09090b"/>
      <rect x="170" y="1624" width="200" height="10" rx="5" fill="#09090b"/>
      <!-- Metallic handle on right -->
      <rect x="488" y="820" width="14" height="96" rx="6" fill="#a1a1aa" stroke="#18181b" stroke-width="2"/>
    </svg>
  `),
  // Airplane icon for Boarding Pass
  airplaneBlue: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <path d="M12 44 L34 38 L24 14 L34 14 L50 36 L68 34 Q74 34 74 40 Q74 46 68 46 L50 44 L34 66 L24 66 L34 42 L12 36 Z" fill="#1d4ed8"/>
    </svg>
  `),
  // Denim pocket overlay
  denimPocket: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 360">
      <path d="M24 18 L416 18 L400 260 L220 342 L40 260 Z" fill="#5b7ea6" stroke="#2c4463" stroke-width="4"/>
      <path d="M36 30 L404 30 L389 252 L220 328 L51 252 Z" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="10 6"/>
      <path d="M24 58 Q220 82 416 58" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6"/>
      <path d="M100 140 Q220 190 340 140" fill="none" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="8 5"/>
    </svg>
  `),
  // Red velvet theater curtain top
  theaterCurtainTop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 160">
      <path d="M0 0 L800 0 L800 120 Q700 155 600 95 Q500 155 400 95 Q300 155 200 95 Q100 155 0 110 Z" fill="#991b1b"/>
      <path d="M0 0 L800 0 L800 95 Q700 130 600 72 Q500 130 400 72 Q300 130 200 72 Q100 130 0 88 Z" fill="#b91c1c"/>
      <path d="M0 0 L800 0 L800 68 Q700 100 600 48 Q500 100 400 48 Q300 100 200 48 Q100 100 0 62 Z" fill="#dc2626"/>
    </svg>
  `),
  // Popcorn bucket & clapperboard
  popcornBucket: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 120">
      <circle cx="38" cy="36" r="14" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="56" cy="28" r="15" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="74" cy="38" r="13" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
      <polygon points="24,44 86,44 76,108 34,108" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
      <polygon points="34,44 46,44 42,108 34,108" fill="#dc2626"/>
      <polygon points="56,44 68,44 64,108 54,108" fill="#dc2626"/>
    </svg>
  `),
  clapperboard: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110">
      <rect x="14" y="38" width="92" height="60" rx="6" fill="#18181b" stroke="#ffffff" stroke-width="2.5"/>
      <g transform="rotate(-14 14 38)">
        <rect x="14" y="18" width="92" height="20" rx="3" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
        <polygon points="26,18 40,18 30,38 16,38" fill="#ffffff"/>
        <polygon points="54,18 68,18 58,38 44,38" fill="#ffffff"/>
        <polygon points="82,18 96,18 86,38 72,38" fill="#ffffff"/>
      </g>
      <line x1="24" y1="58" x2="96" y2="58" stroke="#facc15" stroke-width="3"/>
      <line x1="24" y1="74" x2="76" y2="74" stroke="#94a3b8" stroke-width="2.5"/>
    </svg>
  `),
  // Cute white bunny sticker
  cuteBunny: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
      <ellipse cx="36" cy="30" rx="10" ry="24" transform="rotate(-8 36 30)" fill="#ffffff" stroke="#f472b6" stroke-width="3"/>
      <ellipse cx="64" cy="30" rx="10" ry="24" transform="rotate(8 64 30)" fill="#ffffff" stroke="#f472b6" stroke-width="3"/>
      <ellipse cx="36" cy="32" rx="5" ry="15" transform="rotate(-8 36 32)" fill="#fbcfe8"/>
      <ellipse cx="64" cy="32" rx="5" ry="15" transform="rotate(8 64 32)" fill="#fbcfe8"/>
      <ellipse cx="50" cy="76" rx="30" ry="26" fill="#ffffff" stroke="#f472b6" stroke-width="3"/>
      <circle cx="40" cy="72" r="3.5" fill="#18181b"/>
      <circle cx="60" cy="72" r="3.5" fill="#18181b"/>
      <ellipse cx="32" cy="80" rx="5" ry="3" fill="#fda4af"/>
      <ellipse cx="68" cy="80" rx="5" ry="3" fill="#fda4af"/>
      <path d="M46 80 Q50 85 54 80" fill="none" stroke="#18181b" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),
  // Dalmatian / Cow spots full backdrop (600x1800)
  dalmatianSpotsBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1800">
      <g fill="#18181b">
        <ellipse cx="48" cy="68" rx="28" ry="18" transform="rotate(-20 48 68)"/>
        <ellipse cx="540" cy="90" rx="34" ry="22" transform="rotate(25 540 90)"/>
        <circle cx="140" cy="40" r="14"/>
        <ellipse cx="32" cy="290" rx="20" ry="32" transform="rotate(15 32 290)"/>
        <ellipse cx="566" cy="360" rx="24" ry="16" transform="rotate(-30 566 360)"/>
        <ellipse cx="38" cy="640" rx="28" ry="20" transform="rotate(-12 38 640)"/>
        <circle cx="556" cy="720" r="22"/>
        <ellipse cx="46" cy="1020" rx="22" ry="30" transform="rotate(18 46 1020)"/>
        <ellipse cx="552" cy="1080" rx="30" ry="18" transform="rotate(-22 552 1080)"/>
        <circle cx="40" cy="1380" r="18"/>
        <ellipse cx="548" cy="1440" rx="26" ry="22" transform="rotate(14 548 1440)"/>
        <ellipse cx="90" cy="1640" rx="28" ry="16" transform="rotate(-15 90 1640)"/>
        <ellipse cx="510" cy="1660" rx="24" ry="18" transform="rotate(20 510 1660)"/>
      </g>
    </svg>
  `),
  // Pink gingham check backdrop (800x1200)
  pinkGinghamBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200">
      <defs>
        <pattern id="pg" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="#fff5f8"/>
          <rect width="30" height="60" fill="#fbcfe8" fill-opacity="0.45"/>
          <rect width="60" height="30" fill="#fbcfe8" fill-opacity="0.45"/>
        </pattern>
      </defs>
      <rect width="800" height="1200" fill="url(#pg)"/>
    </svg>
  `),
  // Sky blue gingham check backdrop (600x1800)
  blueGinghamBackdrop: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1800">
      <defs>
        <pattern id="bg" width="56" height="56" patternUnits="userSpaceOnUse">
          <rect width="56" height="56" fill="#f0f9ff"/>
          <rect width="28" height="56" fill="#bae6fd" fill-opacity="0.5"/>
          <rect width="56" height="28" fill="#fbcfe8" fill-opacity="0.35"/>
        </pattern>
      </defs>
      <rect width="600" height="1800" fill="url(#bg)"/>
    </svg>
  `),
  // Torn kraft paper scrap
  tornKraftPaper: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120">
      <polygon points="10,20 46,12 84,24 128,10 172,22 210,14 202,98 164,108 122,94 78,108 38,96 14,104" fill="#d6bea0"/>
    </svg>
  `),
  // Blue checkerboard bar
  blueCheckerStrip: svgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 80">
      <defs>
        <pattern id="bc" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#ffffff"/>
          <rect width="20" height="20" fill="#2563eb"/>
          <rect x="20" y="20" width="20" height="20" fill="#2563eb"/>
        </pattern>
      </defs>
      <rect width="800" height="80" fill="url(#bc)"/>
    </svg>
  `),
};
