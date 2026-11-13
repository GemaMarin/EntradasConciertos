export type Artist = {
  id: string;
  name: string;
  genres: string[];
  /** Tono base (0-360) para generar el degradado del artista */
  hue: number;
  imageUrl?: string;
  /** Seguidores en Deezer (para ordenar resultados) */
  fans?: number;
  source: ArtistSource;
};

export type ArtistSource = "demo" | "deezer" | "ticketmaster" | "custom";

export type SaleKind = "presale" | "general";

export type Sale = {
  id: string;
  kind: SaleKind;
  /** Nombre visible: "Preventa fans", "Venta general"… */
  name: string;
  start: string; // ISO
  end?: string; // ISO
};

export type ConcertEvent = {
  id: string;
  artistId: string;
  artistName: string;
  /** Nombre de la gira, si lo hay */
  tour?: string;
  date: string; // ISO
  venue: string;
  city: string;
  vendor: string;
  ticketUrl: string;
  priceFrom?: number;
  imageUrl?: string;
  hue: number;
  sales: Sale[];
  source: "demo" | "ticketmaster";
};

export type EventStatus = "interested" | "going";

/** Una salida a la venta "aplanada", con su concierto */
export type SaleItem = { sale: Sale; event: ConcertEvent };
