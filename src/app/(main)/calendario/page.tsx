"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, CalendarX2, Ticket } from "lucide-react";
import { useEvents, useNow, useSales } from "@/lib/hooks";
import { useSheet } from "@/lib/store";
import { countdown, dayKey, formatLong, formatMonthYear, formatTime, saleState } from "@/lib/dates";
import type { ConcertEvent, SaleItem } from "@/lib/types";
import { PageTitle, EmptyState } from "@/components/Section";
import { EventRow } from "@/components/EventRow";
import { artistGradient } from "@/lib/colors";

type Filter = "all" | "concerts" | "sales";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "concerts", label: "Conciertos" },
  { id: "sales", label: "Ventas" },
];
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

type DayItems = { concerts: ConcertEvent[]; sales: SaleItem[] };

export default function CalendarPage() {
  const now = useNow(1000);
  const { events } = useEvents();
  const { all } = useSales(events, now);
  const todayKey = dayKey(now);
  const [ym, setYm] = useState(() => {
    const [y, m] = todayKey.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [dir, setDir] = useState(1);

  const byDay = useMemo(() => {
    const map = new Map<string, DayItems>();
    const get = (k: string) => map.get(k) ?? (map.set(k, { concerts: [], sales: [] }), map.get(k)!);
    if (filter !== "sales") events.forEach((e) => get(dayKey(e.date)).concerts.push(e));
    if (filter !== "concerts") all.forEach((i) => get(dayKey(i.sale.start)).sales.push(i));
    return map;
  }, [events, all, filter]);

  const monthPrefix = `${ym.y}-${String(ym.m + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(ym.y, ym.m, 1)).getUTCDay() + 6) % 7;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const agendaKeys = [...byDay.keys()]
    .filter((k) => (selected ? k === selected : k.startsWith(monthPrefix)))
    .filter((k) => byDay.get(k)!.concerts.length + byDay.get(k)!.sales.length > 0)
    .sort();

  const move = (d: number) => {
    setDir(d);
    setSelected(null);
    setYm(({ y, m }) => {
      const n = m + d;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });
  };

  return (
    <main>
      <PageTitle title="Calendario" />

      {/* Filtro */}
      <div className="mx-5 mt-5 flex rounded-full bg-surface p-1 ring-1 ring-line">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
              filter === f.id ? "text-ink" : "text-muted"
            }`}
          >
            {filter === f.id && (
              <motion.span layoutId="cal-filter" className="absolute inset-0 rounded-full bg-surface-3" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Mes */}
      <div className="mx-5 mt-4 rounded-[28px] bg-surface p-4 ring-1 ring-line">
        <div className="mb-3 flex items-center justify-between">
          <button aria-label="Mes anterior" onClick={() => move(-1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
            <ChevronLeft size={18} />
          </button>
          <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            {formatMonthYear(new Date(Date.UTC(ym.y, ym.m, 15)))}
          </p>
          <button aria-label="Mes siguiente" onClick={() => move(1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-faint">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={monthPrefix}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-7 gap-y-1"
          >
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const k = `${monthPrefix}-${String(d).padStart(2, "0")}`;
              const items = byDay.get(k);
              const hasConcert = !!items?.concerts.length;
              const hasSale = !!items?.sales.length;
              const isSel = selected === k;
              const isToday = k === todayKey;
              return (
                <button
                  key={k}
                  onClick={() => setSelected(isSel ? null : k)}
                  className="flex flex-col items-center py-1"
                >
                  <span
                    className={`tabular flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-semibold transition-colors ${
                      isSel
                        ? "bg-ink text-black"
                        : hasConcert
                          ? "bg-accent/18 text-ink"
                          : isToday
                            ? "text-accent ring-1 ring-accent/60"
                            : k < todayKey
                              ? "text-faint"
                              : "text-ink"
                    }`}
                  >
                    {d}
                  </span>
                  <span className="mt-1 flex h-1.5 gap-1">
                    {hasConcert && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    {hasSale && <span className="h-1.5 w-1.5 rounded-full bg-sale" />}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
        <div className="mt-3 flex justify-center gap-5 border-t border-line pt-3 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Concierto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sale" /> Salida a la venta
          </span>
        </div>
      </div>

      {/* Agenda */}
      <div className="mt-7 space-y-6">
        {agendaKeys.length === 0 ? (
          <EmptyState
            icon={<CalendarX2 size={22} />}
            title={selected ? "Nada este día" : "Nada este mes"}
            text="Prueba con otro mes o sigue a más artistas."
          />
        ) : (
          agendaKeys.map((k) => {
            const it = byDay.get(k)!;
            return (
              <div key={k}>
                <p className="mb-2.5 px-5 text-[13px] font-semibold tracking-wide text-muted uppercase">
                  {k === todayKey ? "Hoy · " : ""}
                  {formatLong(k + "T12:00:00Z").split(" de 20")[0]}
                </p>
                <div className="space-y-2.5 px-5">
                  {it.sales.map((s) => (
                    <SaleRow key={s.sale.id} item={s} now={now} />
                  ))}
                  {it.concerts.map((e) => (
                    <EventRow key={e.id} event={e} now={now} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

function SaleRow({ item, now }: { item: SaleItem; now: Date }) {
  const open = useSheet((s) => s.open);
  const { sale, event } = item;
  const state = saleState(sale, now);
  const cd = countdown(sale.start, now);
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={() => open(event)}
      className="flex w-full items-center gap-3.5 rounded-3xl bg-sale/[0.07] p-2.5 pr-4 text-left ring-1 ring-sale/20"
    >
      <div
        className="grain relative flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[18px]"
        style={{ background: artistGradient(event.hue) }}
      >
        <Ticket size={22} className="relative text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-wide text-sale uppercase">
          {sale.kind === "presale" ? "Preventa" : "Salen entradas"} · {formatTime(sale.start)}
        </p>
        <p className="truncate text-[16px] font-semibold tracking-tight">{event.artistName}</p>
        <p className="truncate text-[13px] text-muted">{sale.name}</p>
      </div>
      <span className={`tabular shrink-0 text-[13px] font-bold ${state === "upcoming" ? (cd.urgent ? "text-accent" : "text-ink") : "text-faint"}`}>
        {state === "upcoming" ? cd.label : state === "open" ? "Abierta" : "Cerrada"}
      </span>
    </motion.button>
  );
}
