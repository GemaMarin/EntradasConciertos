import type { Artist } from "./types";
import { hashHue } from "./colors";

/**
 * Catálogo universal de artistas vía la API pública de Deezer (gratis, sin clave).
 * https://developers.deezer.com/api/search
 */
type DzArtist = { id: number; name: string; picture_medium?: string; picture_big?: string; nb_fan?: number };

const toArtist = (a: DzArtist): Artist => ({
  id: `dz-${a.id}`,
  name: a.name,
  genres: [],
  hue: hashHue(a.name),
  imageUrl: a.picture_big || a.picture_medium,
  fans: a.nb_fan,
  source: "deezer",
});

export async function dzSearch(q: string, limit = 24): Promise<Artist[]> {
  const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=${limit}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Deezer ${res.status}`);
  const data = (await res.json()) as { data?: DzArtist[]; error?: unknown };
  if (data.error) throw new Error("Deezer error");
  return (data.data ?? []).map(toArtist);
}

/** Mejor coincidencia exacta para un nombre (para poner foto a las sugerencias) */
export async function dzLookup(name: string): Promise<Artist | null> {
  try {
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    const list = await dzSearch(name, 5);
    return list.find((a) => norm(a.name) === norm(name)) ?? null;
  } catch {
    return null;
  }
}
