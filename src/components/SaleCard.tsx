"use client";

import { motion } from "motion/react";
import { Bell, BellRing } from "lucide-react";
import type { SaleItem } from "@/lib/types";
import { countdown, formatShort, formatTime, relativeDay } from "@/lib/dates";
import { useApp, useSheet } from "@/lib/store";
import { Poster } from "./Poster";

/** Tarjeta grande del carrusel "Salen a la venta" */
export function SaleCard({ item, now }: { item: SaleItem; now: Date }) {
  const { sale, event } = item;
  const open = useSheet((s) => s.open);
  const reminded = useApp((s) => !!s.reminders[sale.id]);
  const toggleReminder = useApp((s) => s.toggleReminder);
  const cd = countdown(sale.start, now);
  const rel = relativeDay(sale.start, now);

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => open(event)}
      className="w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-surface text-left ring-1 ring-line"
    >
      <Poster event={event} className="h-[150px]">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md ${
                sale.kind === "presale" ? "bg-white/20 text-white" : "bg-sale text-black"
              }`}
            >
              {sale.kind === "presale" ? "Preventa" : "Venta general"}
            </span>
            <span
              role="button"
              tabIndex={0}
              aria-label={reminded ? "Quitar recordatorio" : "Recordarme"}
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(sale.id);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                reminded ? "bg-white text-black" : "bg-black/30 text-white"
              }`}
            >
              {reminded ? <BellRing size={17} /> : <Bell size={17} />}
            </span>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-[1.7rem] leading-[1.05] font-extrabold tracking-tight text-white drop-shadow">
              {event.artistName}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-white/80">
              {event.venue} · {formatShort(event.date)}
            </p>
          </div>
        </div>
      </Poster>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">{sale.name}</p>
          <p className="truncate text-[15px] font-semibold">
            {rel} · {formatTime(sale.start)}
            {rel !== "Hoy" && rel !== "Mañana" && <span className="font-normal text-muted"> · {formatShort(sale.start)}</span>}
          </p>
        </div>
        <div
          className={`tabular shrink-0 rounded-2xl px-3 py-2 text-right text-sm font-bold ${
            cd.urgent ? "bg-accent/15 text-accent" : "bg-surface-2 text-ink"
          }`}
        >
          {cd.label}
        </div>
      </div>
    </motion.button>
  );
}
