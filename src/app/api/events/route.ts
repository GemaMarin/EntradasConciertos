import { NextRequest, NextResponse } from "next/server";
import type { Artist, ConcertEvent } from "@/lib/types";
import { demoEventsFor } from "@/lib/demo-events";
import { ticketmasterEnabled, tmEventsFor } from "@/lib/ticketmaster";

export async function POST(req: NextRequest) {
  const { artists = [], cities = ["madrid"] } = (await req.json()) as { artists?: Artist[]; cities?: string[] };
  const live = ticketmasterEnabled();
  let events: ConcertEvent[] = live ? await tmEventsFor(artists, cities) : demoEventsFor(artists, cities);
  // Quitamos duplicados (un mismo concierto con dos artistas seguidos)
  events = [...new Map(events.map((e) => [e.id, e])).values()];
  events.sort((a, b) => a.date.localeCompare(b.date));
  return NextResponse.json({ events, mode: live ? "live" : "demo", updatedAt: new Date().toISOString() });
}
