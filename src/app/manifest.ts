import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Primera Fila · Conciertos en Madrid",
    short_name: "Primera Fila",
    description: "Los conciertos de tus artistas en Madrid y el día exacto en que salen las entradas.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080c",
    theme_color: "#08080c",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
