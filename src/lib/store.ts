"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artist, ConcertEvent, EventStatus } from "./types";

type State = {
  onboarded: boolean;
  name: string;
  artists: Artist[];
  /** ids de ciudades (ver lib/cities.ts) */
  cities: string[];
  status: Record<string, EventStatus>;
  /** Copia de los conciertos marcados (para verlos aunque dejes de seguir al artista) */
  saved: Record<string, ConcertEvent>;
  /** ids de salidas a la venta con recordatorio */
  reminders: Record<string, true>;

  setName: (n: string) => void;
  completeOnboarding: () => void;
  toggleArtist: (a: Artist) => void;
  removeArtist: (id: string) => void;
  toggleCity: (id: string) => void;
  setStatus: (event: ConcertEvent, s: EventStatus | null) => void;
  /** Sustituye datos con lo que viene de la nube */
  hydrateFromCloud: (d: Partial<Pick<State, "artists" | "cities" | "status" | "saved" | "name" | "onboarded">>) => void;
  toggleReminder: (saleId: string) => void;
  setReminders: (ids: string[]) => void;
  reset: () => void;
};

export const useApp = create<State>()(
  persist(
    (set) => ({
      onboarded: false,
      name: "",
      artists: [],
      cities: ["madrid"],
      status: {},
      saved: {},
      reminders: {},
      setName: (name) => set({ name }),
      completeOnboarding: () => set({ onboarded: true }),
      toggleArtist: (a) =>
        set((s) => ({
          artists: s.artists.some((x) => x.id === a.id)
            ? s.artists.filter((x) => x.id !== a.id)
            : [...s.artists, a],
        })),
      removeArtist: (id) => set((s) => ({ artists: s.artists.filter((x) => x.id !== id) })),
      toggleCity: (id) =>
        set((s) => {
          if (!s.cities.includes(id)) return { cities: [...s.cities, id] };
          // siempre al menos una ciudad
          return s.cities.length > 1 ? { cities: s.cities.filter((c) => c !== id) } : {};
        }),
      setStatus: (event, st) =>
        set((s) => {
          const status = { ...s.status };
          const saved = { ...s.saved };
          if (st) {
            status[event.id] = st;
            saved[event.id] = event;
          } else {
            delete status[event.id];
            delete saved[event.id];
          }
          return { status, saved };
        }),
      hydrateFromCloud: (d) => set(d),
      toggleReminder: (saleId) =>
        set((s) => {
          const reminders = { ...s.reminders };
          if (reminders[saleId]) delete reminders[saleId];
          else reminders[saleId] = true;
          return { reminders };
        }),
      setReminders: (ids) =>
        set((s) => ({ reminders: { ...s.reminders, ...Object.fromEntries(ids.map((i) => [i, true as const])) } })),
      reset: () =>
        set({ onboarded: false, artists: [], cities: ["madrid"], status: {}, saved: {}, reminders: {}, name: "" }),
    }),
    { name: "entradas-conciertos", version: 3 },
  ),
);

/** Evento seleccionado (hoja de detalle) — estado de UI, no persistente */
export const useSheet = create<{ event: ConcertEvent | null; open: (e: ConcertEvent) => void; close: () => void }>(
  (set) => ({
    event: null,
    open: (event) => set({ event }),
    close: () => set({ event: null }),
  }),
);
