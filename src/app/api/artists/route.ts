import { NextRequest, NextResponse } from "next/server";
import { CATALOG, searchCatalog } from "@/lib/catalog";
import { dzLookup, dzSearch } from "@/lib/deezer";
import type { Artist } from "@/lib/types";

const strip = ({ id, name, genres, hue, source }: Artist): Artist => ({ id, name, genres, hue, source });

/** Sugerencias iniciales: el catálogo curado, con foto de Deezer si está disponible */
async function popular(): Promise<Artist[]> {
  const out: Artist[] = [];
  for (let i = 0; i < CATALOG.length; i += 8) {
    const batch = CATALOG.slice(i, i + 8);
    const found = await Promise.all(batch.map((a) => dzLookup(a.name)));
    batch.forEach((a, j) => {
      const dz = found[j];
      out.push(dz ? { ...dz, genres: a.genres } : strip(a));
    });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ artists: await popular() });
  try {
    return NextResponse.json({ artists: await dzSearch(q) });
  } catch (e) {
    console.error(e);
    // Sin conexión con Deezer: buscamos en el catálogo local
    return NextResponse.json({ artists: searchCatalog(q).map(strip), offline: true });
  }
}
