import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "var(--ps-bg)",
          surface: "var(--ps-surface)",
          surfaceMuted: "var(--ps-surface-muted)",
          border: "var(--ps-border)",
          borderStrong: "var(--ps-border-strong)",
          text: "var(--ps-text)",
          textMuted: "var(--ps-text-muted)",
          faint: "var(--ps-faint)",
          glow: "var(--ps-glow)",
          accent: "var(--ps-accent)",
          onAccent: "var(--ps-on-accent)",
          accentSoft: "var(--ps-accent-soft)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
