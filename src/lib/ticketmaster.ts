import type { Artist, ConcertEvent, Sale } from "./types";
import { hashHue } from "./colors";

/**
 * Integración con Ticketmaster Discovery API v2.
 * Solo se activa si existe la variable de entorno TICKETMASTER_API_KEY.
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */
const BASE = "https://app.ticketmaster.com/discovery/v2";

export const ticketmasterEnabled = () => Boolean(process.env.TICKETMASTER_API_KEY);

type TmImage = { url: string; ratio?: string; width: number };
type TmAttraction = {
  id: string;
  name: string;
  images?: TmImage[];
  classifications?: { genre?: { name: string }; subGenre?: { name: string } }[];
};
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

export async function tmSearchArtists(q: string): Promise<Artist[]> {
  const data = await tm<{ _embedded?: { attractions: TmAttraction[] } }>("/attractions.json", {
    keyword: q,
    classificationName: "music",
    size: "20",
  });
  return (data._embedded?.attractions ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    genres: [a.classifications?.[0]?.genre?.name].filter((g): g is string => !!g && g !== "Undefined"),
    hue: hashHue(a.name),
    imageUrl: bestImage(a.images),
    source: "ticketmaster" as const,
  }));
}

export async function tmEventsFor(artists: Artist[]): Promise<ConcertEvent[]> {
  const ids = artists.filter((a) => a.source === "ticketmaster").map((a) => a.id);
  if (!ids.length) return [];
  const data = await tm<{ _embedded?: { events: TmEvent[] } }>("/events.json", {
    attractionId: ids.join(","),
    countryCode: "ES",
    city: "Madrid",
    size: "100",
    sort: "date,asc",
  });
  return (data._embedded?.events ?? []).map((e) => {
    const attraction = e._embedded?.attractions?.find((a) => ids.includes(a.id)) ?? e._embedded?.attractions?.[0];
    const venue = e._embedded?.venues?.[0];
    const sales: Sale[] = [
      ...(e.sales?.presales ?? []).map((p, i) => ({
        id: `${e.id}-pre-${i}`,
        kind: "presale" as const,
        name: p.name,
        start: p.startDateTime,
        end: p.endDateTime,
      })),
    ];
    if (e.sales?.public?.startDateTime && !e.sales.public.startTBD) {
      sales.push({
        id: `${e.id}-gen`,
        kind: "general",
        name: "Venta general",
        start: e.sales.public.startDateTime,
        end: e.sales.public.endDateTime,
      });
    }
    const name = attraction?.name ?? e.name;
    return {
      id: e.id,
      artistId: attraction?.id ?? "",
      artistName: name,
      tour: e.name !== name ? e.name : undefined,
      date: e.dates.start.dateTime ?? `${e.dates.start.localDate}T20:00:00+01:00`,
      venue: venue?.name ?? "Por confirmar",
      city: venue?.city?.name ?? "Madrid",
      vendor: "Ticketmaster",
      ticketUrl: e.url,
      priceFrom: e.priceRanges?.[0]?.min,
      imageUrl: bestImage(e.images),
      hue: hashHue(name),
      sales: sales.sort((a, b) => a.start.localeCompare(b.start)),
      source: "ticketmaster" as const,
    };
  });
}
