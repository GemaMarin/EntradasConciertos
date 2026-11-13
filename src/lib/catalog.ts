import type { Artist } from "./types";
import { hashHue } from "./colors";

/**
 * Catálogo de ejemplo (modo demo). Cuando conectemos Ticketmaster la búsqueda
 * usará su catálogo real de artistas.
 * tier: 1 = estadio, 2 = pabellón, 3 = sala
 */
const RAW: [string, string[], 1 | 2 | 3][] = [
  ["Rosalía", ["Pop", "Flamenco"], 1],
  ["Quevedo", ["Urbano"], 1],
  ["Aitana", ["Pop"], 1],
  ["Vetusta Morla", ["Indie"], 2],
  ["Love of Lesbian", ["Indie"], 2],
  ["Leiva", ["Rock"], 2],
  ["Amaral", ["Pop rock"], 2],
  ["Lola Índigo", ["Pop", "Urbano"], 2],
  ["Rels B", ["Urbano"], 2],
  ["Morat", ["Pop"], 2],
  ["Viva Suecia", ["Indie"], 2],
  ["Carolina Durante", ["Indie", "Punk"], 3],
  ["Sidonie", ["Indie", "Pop"], 3],
  ["Natalia Lacunza", ["Pop"], 3],
  ["Ojete Calor", ["Pop"], 2],
  ["Rigoberta Bandini", ["Pop"], 2],
  ["Coldplay", ["Pop rock"], 1],
  ["Dua Lipa", ["Pop"], 1],
  ["Taylor Swift", ["Pop"], 1],
  ["Arctic Monkeys", ["Rock", "Indie"], 1],
  ["The Killers", ["Rock"], 2],
  ["Muse", ["Rock"], 1],
  ["Bad Bunny", ["Urbano"], 1],
  ["Karol G", ["Urbano"], 1],
  ["Billie Eilish", ["Pop"], 1],
  ["Sabrina Carpenter", ["Pop"], 2],
  ["Olivia Rodrigo", ["Pop"], 2],
  ["Fontaines D.C.", ["Post-punk"], 3],
  ["Phoenix", ["Indie"], 3],
  ["Tame Impala", ["Psicodelia"], 2],
  ["The National", ["Indie"], 2],
  ["Bon Iver", ["Folk"], 2],
  ["Florence + The Machine", ["Pop", "Indie"], 2],
  ["Rammstein", ["Metal"], 1],
  ["Metallica", ["Metal"], 1],
  ["Bruce Springsteen", ["Rock"], 1],
  ["Massive Attack", ["Trip-hop"], 2],
  ["Bizarrap", ["Electrónica", "Urbano"], 2],
  ["Fred again..", ["Electrónica"], 2],
  ["Ed Sheeran", ["Pop"], 1],
];

export const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const CATALOG: (Artist & { tier: 1 | 2 | 3 })[] = RAW.map(([name, genres, tier]) => ({
  id: "demo-" + slug(name),
  name,
  genres,
  tier,
  hue: hashHue(name),
  source: "demo",
}));

export function searchCatalog(q: string): Artist[] {
  const n = slug(q);
  if (!n) return CATALOG;
  return CATALOG.filter((a) => slug(a.name).includes(n) || a.genres.some((g) => slug(g).includes(n)));
}
