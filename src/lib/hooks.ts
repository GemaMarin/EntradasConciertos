"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useApp } from "./store";
import type { ConcertEvent, SaleItem } from "./types";
import { saleState } from "./dates";
import { create } from "zustand";

/** true cuando el estado guardado en el dispositivo ya está cargado */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useApp.persist.onFinishHydration(cb),
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}

/** Reloj que se actualiza cada `ms` */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

type EventsState = {
  events: ConcertEvent[];
  loading: boolean;
  key: string;
  updatedAt?: string;
  load: (key: string, body: string) => Promise<void>;
};
const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: true,
  key: "",
  load: async (key, body) => {
    if (get().key === key) return;
    set({ key, loading: true });
    try {
      const res = await fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" } });
      const data = await res.json();
      if (get().key === key) set({ events: data.events, updatedAt: data.updatedAt, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

/** Conciertos en Madrid de los artistas que sigues */
export function useEvents() {
  const artists = useApp((s) => s.artists);
  const { events, loading, load, updatedAt } = useEventsStore();
  const key = artists.map((a) => a.id).sort().join(",");
  useEffect(() => {
    load(key, JSON.stringify({ artists }));
  }, [key, artists, load]);
  return { events, loading, updatedAt };
}

/** Todas las salidas a la venta, aplanadas y ordenadas */
export function useSales(events: ConcertEvent[], now: Date) {
  // recalculamos cada minuto, no cada segundo
  const minute = Math.floor(now.getTime() / 60_000);
  return useMemo(() => {
    const now = new Date(minute * 60_000);
    const all: SaleItem[] = events.flatMap((event) => event.sales.map((sale) => ({ sale, event })));
    all.sort((a, b) => a.sale.start.localeCompare(b.sale.start));
    const upcoming = all.filter((i) => saleState(i.sale, now) === "upcoming");
    // Concierto "ya a la venta": alguna venta abierta y ninguna futura
    const onSale = events.filter(
      (e) => e.sales.some((s) => saleState(s, now) === "open") && new Date(e.date) > now,
    );
    return { all, upcoming, onSale };
  }, [events, minute]);
}
