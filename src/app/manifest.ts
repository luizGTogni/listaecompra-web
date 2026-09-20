import type { MetadataRoute } from "next";
import { THEME_COLORS } from "@/app/theme-colors";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lista e Compra",
    short_name: "Lista e Compra",
    description: "Your shopping list",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    // Shown on the splash screen while the app loads.
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
