import type { Artist, ConcertEvent, Sale } from "./types";
import { CATALOG } from "./catalog";

/** PRNG determinista para que los datos de ejemplo no cambien en cada recarga */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const VENUES: Record<1 | 2 | 3, string[]> = {
  1: ["Estadio Santiago Bernabéu", "Riyadh Air Metropolitano", "Movistar Arena"],
  2: ["Movistar Arena", "Palacio Vistalegre", "IFEMA Madrid Live", "Caja Mágica"],
  3: ["La Riviera", "Sala But", "Teatro Eslava", "Sala Sol", "Joy Eslava", "Teatro Barceló"],
};
const VENDORS = [
  { name: "Ticketmaster", url: (q: string) => `https://www.ticketmaster.es/search?q=${encodeURIComponent(q)}` },
  { name: "Live Nation", url: (q: string) => `https://www.ticketmaster.es/search?q=${encodeURIComponent(q)}` },
  { name: "DICE", url: (q: string) => `https://dice.fm/search?query=${encodeURIComponent(q)}` },
];
const TOURS = ["World Tour", "Gira 2027", "Live", "En directo", "Tour", "Arena Tour"];
const PRESALES = ["Preventa fans", "Preventa Live Nation", "Preventa Santander", "Preventa club de fans"];

const DAY = 86_400_000;

/** Hora 10:00 de Madrid aproximada (09:00 UTC) a `days` días de hoy */
function at(base: number, days: number, hourUtc: number) {
  return new Date(base + days * DAY + hourUtc * 3_600_000).toISOString();
}

export function demoEventsFor(artists: Artist[], now = new Date()): ConcertEvent[] {
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  // Semana del año: los datos se "mueven" poco a poco pero son estables durante días
  const epoch = Math.floor(base / (14 * DAY));
  const events: ConcertEvent[] = [];

  for (const artist of artists) {
    const meta = CATALOG.find((c) => c.id === artist.id);
    const tier = meta?.tier ?? 3;
    const rnd = mulberry32(seedOf(artist.id) ^ epoch);
    const roll = rnd();
    const count = roll < 0.18 ? 0 : roll < 0.78 ? 1 : 2;

    for (let i = 0; i < count; i++) {
      const showDay = Math.floor(25 + rnd() * 340);
      const vendor = VENDORS[Math.floor(rnd() * VENDORS.length)];
      const venues = VENUES[tier];
      const venue = venues[Math.floor(rnd() * venues.length)];
      const id = `${artist.id}-${epoch}-${i}`;
      const sales: Sale[] = [];

      // Escenarios: ya a la venta / sale pronto (incluye hoy) / sale más adelante
      const s = rnd();
      let generalDay: number;
      if (s < 0.3) generalDay = -Math.floor(2 + rnd() * 60);
      else if (s < 0.8) generalDay = Math.floor(rnd() * 21);
      else generalDay = Math.floor(21 + rnd() * 90);
      generalDay = Math.min(generalDay, showDay - 10);

      if (rnd() < 0.7) {
        const preDay = generalDay - (1 + Math.floor(rnd() * 3));
        sales.push({
          id: id + "-pre",
          kind: "presale",
          name: PRESALES[Math.floor(rnd() * PRESALES.length)],
          start: at(base, preDay, 9),
          end: at(base, generalDay, 7),
        });
      }
      sales.push({
        id: id + "-gen",
        kind: "general",
        name: "Venta general",
        start: at(base, generalDay, 9),
        end: at(base, showDay, 18),
      });

      events.push({
        id,
        artistId: artist.id,
        artistName: artist.name,
        tour: `${artist.name.split(" ")[0]} ${TOURS[Math.floor(rnd() * TOURS.length)]}`,
        date: at(base, showDay, tier === 3 ? 20 : 19),
        venue,
        city: "Madrid",
        vendor: vendor.name,
        ticketUrl: vendor.url(artist.name),
        priceFrom: tier === 1 ? 65 + Math.floor(rnd() * 40) : tier === 2 ? 35 + Math.floor(rnd() * 30) : 18 + Math.floor(rnd() * 15),
        hue: artist.hue,
        sales,
        source: "demo",
      });
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}
