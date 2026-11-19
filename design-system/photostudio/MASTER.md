# PhotoStudio Design System (MASTER)

Generated with the UI UX Pro Max skill. Chosen style: **Vintage Analog / Retro Film**
(search `--domain style`), picked over the auto-generated "Motion-Driven / pure black"
result, which targets landing pages and did not fit a tool-style app.

## Principles
- Warm paper surfaces and ink text; maroon accent taken from the photobooth ticket references.
- No emoji as UI icons (Lucide only). Emoji remain only as user-selectable stickers.
- No purple/pink gradients, no decorative badges, tighter print-like corners.
- Visible focus ring on every control, pointer cursor on clickable elements,
  `prefers-reduced-motion` respected, text contrast >= 4.5:1.

## Tokens (see `apps/web/src/app/globals.css`)
| Token | Light | Dark |
|---|---|---|
| bg | #f4ecdd | #14110f |
| surface | #fbf7ef | #1d1916 |
| surface-muted | #ebe1cd | #28221e |
| border | #d6c9b0 | #3b332c |
| text | #231a17 | #f3ece0 |
| text-muted | #66584d | #b3a592 |
| accent | #7a1f24 | #e3a08f |
| on-accent | #fbf7ef | #1d1916 |

## Typography
- Headings (h1/h2): Newsreader (serif)
- UI/body: Public Sans
- Loaded via `next/font/google` in `layout.tsx`.

## Shape
- Radii: lg 6px, xl 8px, 2xl 10px, 3xl 14px.
