import { NextRequest, NextResponse } from "next/server";
import { CATALOG, searchCatalog } from "@/lib/catalog";
import { ticketmasterEnabled, tmSearchArtists } from "@/lib/ticketmaster";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (ticketmasterEnabled() && q.length >= 2) {
    try {
      return NextResponse.json({ mode: "live", artists: await tmSearchArtists(q) });
    } catch (e) {
      console.error(e);
    }
  }
  const artists = q ? searchCatalog(q) : CATALOG;
  return NextResponse.json({
    mode: "demo",
    artists: artists.map(({ id, name, genres, hue, source }) => ({ id, name, genres, hue, source })),
  });
}
