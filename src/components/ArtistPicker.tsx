"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, Search, X } from "lucide-react";
import { slug } from "@/lib/catalog";
import { hashHue } from "@/lib/colors";
import type { Artist } from "@/lib/types";
import { useApp } from "@/lib/store";
import { ArtistAvatar } from "./ArtistAvatar";

export function ArtistPicker({ hideSelected = false }: { hideSelected?: boolean }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const selected = useApp((s) => s.artists);
  const toggle = useApp((s) => s.toggleArtist);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/artists?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.artists);
        setLoading(false);
      } catch {}
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Un artista puede venir del catálogo y de Deezer: comparamos también por nombre
  const ids = new Set(selected.map((a) => a.id));
  const names = new Set(selected.map((a) => slug(a.name)));
  const isOn = (a: Artist) => ids.has(a.id) || names.has(slug(a.name));
  const list = hideSelected ? results.filter((a) => !isOn(a)) : results;
  const exact = results.some((a) => slug(a.name) === slug(q));
  const custom: Artist | null =
    q.trim().length >= 2 && !exact && !loading
      ? { id: `custom-${slug(q)}`, name: q.trim(), genres: [], hue: hashHue(q.trim()), source: "custom" }
      : null;

  return (
    <div>
      <div className="relative mx-5">
        <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca un grupo o un género"
          className="w-full rounded-2xl bg-surface py-3.5 pr-11 pl-11 text-[16px] ring-1 ring-line outline-none placeholder:text-faint focus:ring-accent/60"
        />
        {q && (
          <button aria-label="Borrar" onClick={() => setQ("")} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-surface-3 p-1 text-muted">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 px-5 sm:grid-cols-4">
        <AnimatePresence initial={false}>
          {list.map((a) => {
            const on = isOn(a);
            return (
              <motion.button
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => toggle(on ? selected.find((x) => x.id === a.id || slug(x.name) === slug(a.name))! : a)}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <ArtistAvatar
                    artist={a}
                    size={84}
                    className={`transition-all duration-300 ${on ? "ring-[3px] ring-accent ring-offset-[3px] ring-offset-bg" : "opacity-90"}`}
                  />
                  <AnimatePresence>
                    {on && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white ring-[3px] ring-bg"
                      >
                        <Check size={15} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className={`line-clamp-2 text-center text-[13px] leading-tight font-semibold ${on ? "text-ink" : "text-muted"}`}>
                  {a.name}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      {loading && results.length === 0 && (
        <div className="mt-5 grid animate-pulse grid-cols-3 gap-x-3 gap-y-5 px-5 sm:grid-cols-4">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-[84px] w-[84px] rounded-full bg-surface-2" />
              <div className="h-3 w-16 rounded bg-surface-2" />
            </div>
          ))}
        </div>
      )}
      {custom && !isOn(custom) && (
        <div className="mx-5 mt-6 flex items-center gap-3 rounded-3xl border border-dashed border-line p-3.5">
          <p className="min-w-0 flex-1 text-[13px] text-muted">
            ¿No aparece? Síguelo igualmente y te avisaremos si anuncia conciertos.
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(custom)}
            className="flex max-w-[55%] shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-black"
          >
            <Plus size={15} /> <span className="truncate">Seguir a «{custom.name}»</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
