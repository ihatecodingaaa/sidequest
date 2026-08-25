import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIDEQUEST",
    short_name: "SIDEQUEST",
    description:
      "A youth-first crime prevention app for Singapore. See what is happening, play the decision, act on it, and design what comes next.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0b12",
    theme_color: "#0a0b12",
    categories: ["education", "lifestyle", "social"],
    lang: "en-SG",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Safe", short_name: "Safe", url: "/safe", description: "Official help, fast" },
      { name: "Missions", short_name: "Missions", url: "/missions", description: "Play a mission" },
    ],
  };
}
