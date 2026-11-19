import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jevallene PhotoStudio",
    short_name: "Jevallene",
    description:
      "Photobox & Photo Editor gratis lintas platform dengan template estetik oleh Innssaan.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0B0E",
    theme_color: "#0B0B0E",
    icons: [
      {
        src: "/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
