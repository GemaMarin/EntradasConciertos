"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artist, ConcertEvent, EventStatus } from "./types";

type State = {
  onboarded: boolean;
  name: string;
  artists: Artist[];
  status: Record<string, EventStatus>;
  /** ids de salidas a la venta con recordatorio */
  reminders: Record<string, true>;

  setName: (n: string) => void;
  completeOnboarding: () => void;
  toggleArtist: (a: Artist) => void;
  removeArtist: (id: string) => void;
  setStatus: (eventId: string, s: EventStatus | null) => void;
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
      status: {},
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
      setStatus: (eventId, st) =>
        set((s) => {
          const status = { ...s.status };
          if (st) status[eventId] = st;
          else delete status[eventId];
          return { status };
        }),
      toggleReminder: (saleId) =>
        set((s) => {
          const reminders = { ...s.reminders };
          if (reminders[saleId]) delete reminders[saleId];
          else reminders[saleId] = true;
          return { reminders };
        }),
      setReminders: (ids) =>
        set((s) => ({ reminders: { ...s.reminders, ...Object.fromEntries(ids.map((i) => [i, true as const])) } })),
      reset: () => set({ onboarded: false, artists: [], status: {}, reminders: {}, name: "" }),
    }),
    { name: "entradas-conciertos", version: 1 },
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
