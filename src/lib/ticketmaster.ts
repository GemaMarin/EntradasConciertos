import type { Artist, ConcertEvent, Sale } from "./types";
import { matchCity } from "./cities";

/**
 * Integración con Ticketmaster Discovery API v2.
 * Solo se activa si existe la variable de entorno TICKETMASTER_API_KEY.
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */
const BASE = "https://app.ticketmaster.com/discovery/v2";

export const ticketmasterEnabled = () => Boolean(process.env.TICKETMASTER_API_KEY);

type TmImage = { url: string; ratio?: string; width: number };
type TmAttraction = { id: string; name: string };
type TmEvent = {
  id: string;
  name: string;
  url: string;
  images?: TmImage[];
  dates: { start: { dateTime?: string; localDate: string } };
  sales?: {
    public?: { startDateTime?: string; endDateTime?: string; startTBD?: boolean };
    presales?: { name: string; startDateTime: string; endDateTime?: string }[];
  };
  priceRanges?: { min: number }[];
  _embedded?: { venues?: { name: string; city?: { name: string } }[]; attractions?: TmAttraction[] };
};

async function tm<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("apikey", process.env.TICKETMASTER_API_KEY!);
  url.searchParams.set("locale", "*");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Ticketmaster ${res.status}`);
  return res.json();
}

const bestImage = (imgs?: TmImage[]) =>
  imgs?.filter((i) => i.ratio === "16_9").sort((a, b) => b.width - a.width)[0]?.url ?? imgs?.[0]?.url;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Ejecuta tareas con concurrencia limitada (Ticketmaster permite ~5 peticiones/s) */
async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

/** Busca por nombre de artista y se queda con los conciertos en las ciudades elegidas */
export async function tmEventsFor(artists: Artist[], cityIds: string[]): Promise<ConcertEvent[]> {
  const lists = await pool(artists, 4, async (artist) => {
    try {
      const data = await tm<{ _embedded?: { events: TmEvent[] } }>("/events.json", {
        keyword: artist.name,
        classificationName: "music",
        size: "100",
        sort: "date,asc",
      });
      return (data._embedded?.events ?? [])
        .filter((e) => e._embedded?.attractions?.some((a) => norm(a.name) === norm(artist.name)))
        .map((e) => ({ e, city: matchCity(e._embedded?.venues?.[0]?.city?.name ?? "", cityIds) }))
        .filter((x) => x.city)
        .map(({ e, city }) => mapEvent(e, artist, city!.name));
    } catch (err) {
      console.error(err);
      return [];
    }
  });
  return lists.flat();
}

function mapEvent(e: TmEvent, artist: Artist, cityName: string): ConcertEvent {
  const venue = e._embedded?.venues?.[0];
  const sales: Sale[] = (e.sales?.presales ?? []).map((p, i) => ({
    id: `${e.id}-pre-${i}`,
    kind: "presale" as const,
    name: p.name,
    start: p.startDateTime,
    end: p.endDateTime,
  }));
  if (e.sales?.public?.startDateTime && !e.sales.public.startTBD) {
    sales.push({
      id: `${e.id}-gen`,
      kind: "general",
      name: "Venta general",
      start: e.sales.public.startDateTime,
      end: e.sales.public.endDateTime,
    });
  }
  return {
    id: e.id,
    artistId: artist.id,
    artistName: artist.name,
    tour: norm(e.name) !== norm(artist.name) ? e.name : undefined,
    date: e.dates.start.dateTime ?? `${e.dates.start.localDate}T20:00:00+01:00`,
    venue: venue?.name ?? "Por confirmar",
    city: cityName,
    vendor: "Ticketmaster",
    ticketUrl: e.url,
    priceFrom: e.priceRanges?.[0]?.min,
    imageUrl: bestImage(e.images) ?? artist.imageUrl,
    hue: artist.hue,
    sales: sales.sort((a, b) => a.start.localeCompare(b.start)),
    source: "ticketmaster",
  };
}
