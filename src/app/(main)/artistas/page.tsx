"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X, Music, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/store";
import { useEvents, useNow } from "@/lib/hooks";
import { formatShort, saleState } from "@/lib/dates";
import { PageTitle, Section } from "@/components/Section";
import { ArtistAvatar } from "@/components/ArtistAvatar";
import { ArtistPicker } from "@/components/ArtistPicker";
import { Pill } from "@/components/EventRow";

export default function ArtistsPage() {
  const now = useNow(60_000);
  const artists = useApp((s) => s.artists);
  const remove = useApp((s) => s.removeArtist);
  const reset = useApp((s) => s.reset);
  const { events } = useEvents();
  const [adding, setAdding] = useState(false);

  return (
    <main>
      <PageTitle
        eyebrow={`Sigues a ${artists.length} ${artists.length === 1 ? "artista" : "artistas"}`}
        title="Artistas"
        right={
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setAdding((v) => !v)}
            className={`mb-0.5 flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              adding ? "bg-surface-3 text-ink" : "bg-ink text-black"
            }`}
          >
            {adding ? <X size={17} /> : <Plus size={17} />} {adding ? "Cerrar" : "Añadir"}
          </motion.button>
        }
      />

      <AnimatePresence initial={false}>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6 pb-2">
              <ArtistPicker hideSelected />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Section title="Siguiendo">
        <div className="space-y-2 px-5">
          <AnimatePresence initial={false}>
            {artists.map((a) => {
              const evs = events.filter((e) => e.artistId === a.id);
              const nextSale = evs
                .flatMap((e) => e.sales)
                .filter((s) => saleState(s, now) === "upcoming")
                .sort((x, y) => x.start.localeCompare(y.start))[0];
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3.5 rounded-3xl bg-surface p-2.5 pr-3 ring-1 ring-line"
                >
                  <ArtistAvatar artist={a} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold tracking-tight">{a.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {evs.length === 0 ? (
                        <Pill tone="neutral">Sin fechas en Madrid</Pill>
                      ) : (
                        <Pill tone="accent">
                          {evs.length} {evs.length === 1 ? "concierto" : "conciertos"}
                        </Pill>
                      )}
                      {nextSale && <Pill tone="sale">Venta {formatShort(nextSale.start)}</Pill>}
                    </div>
                  </div>
                  <button
                    aria-label={`Dejar de seguir a ${a.name}`}
                    onClick={() => remove(a.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-3 hover:text-ink"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Section>

      <Section title="Conectar">
        <div className="mx-5 flex items-center gap-3.5 rounded-3xl bg-surface p-4 ring-1 ring-line">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1ed760] text-black">
            <Music size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Importar desde Spotify</p>
            <p className="text-[13px] text-muted">Tus artistas más escuchados, automáticamente.</p>
          </div>
          <Pill tone="neutral">Pronto</Pill>
        </div>
      </Section>

      <div className="mt-10 flex justify-center">
        <button
          onClick={() => confirm("¿Borrar todos tus datos y empezar de cero?") && reset()}
          className="flex items-center gap-1.5 text-[13px] text-faint"
        >
          <RotateCcw size={13} /> Empezar de cero
        </button>
      </div>
    </main>
  );
}
