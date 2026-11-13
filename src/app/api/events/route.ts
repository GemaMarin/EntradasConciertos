import { NextRequest, NextResponse } from "next/server";
import type { Artist, ConcertEvent } from "@/lib/types";
import { demoEventsFor } from "@/lib/demo-events";
import { ticketmasterEnabled, tmEventsFor } from "@/lib/ticketmaster";

export async function POST(req: NextRequest) {
  const { artists = [] } = (await req.json()) as { artists?: Artist[] };
  const demo = artists.filter((a) => a.source === "demo");
  const live = artists.filter((a) => a.source === "ticketmaster");

  let events: ConcertEvent[] = demoEventsFor(demo);
  if (ticketmasterEnabled() && live.length) {
    try {
      events = events.concat(await tmEventsFor(live));
    } catch (e) {
      console.error(e);
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return NextResponse.json({ events, updatedAt: new Date().toISOString() });
}
