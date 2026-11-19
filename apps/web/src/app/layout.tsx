import type { Metadata } from "next";
import {
  Bebas_Neue,
  Caveat,
  Dancing_Script,
  Inter,
  Pacifico,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Space_Mono,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-dancing",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JEVALLENE PhotoStudio — Photobox & Photo Editor",
  description:
    "Platform photobox dan studio editing foto gratis lintas platform dengan template estetik dan watermark Jevallene.",
  applicationName: "Jevallene PhotoStudio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jevallene",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0B0B0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`dark scroll-smooth ${inter.variable} ${jakarta.variable} ${playfair.variable} ${spaceMono.variable} ${caveat.variable} ${bebas.variable} ${dancingScript.variable} ${pacifico.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(window.location.search);if(p.get("native_auth")==="1"&&!(navigator.userAgent||"").includes("JevalleneAndroidApp")){window.location.replace("jevallene://auth-callback"+window.location.search+window.location.hash);return;}var t=localStorage.getItem("ps-theme-v2");if(t==="light"){document.documentElement.classList.remove("dark");}else{document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        {/* Real (unhashed) family names so canvas templates can use fonts like 'Shrikhand' */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* App Router root layout loads for every page, so this rule (written for pages/) is a false positive here */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Shrikhand&family=Dancing+Script:wght@500;700&family=Pacifico&family=Caveat:wght@500;700&family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        />
      </head>
      <body className="bg-brand-bg text-brand-text font-sans antialiased min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <I18nProvider>
              <AppShell>{children}</AppShell>
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
