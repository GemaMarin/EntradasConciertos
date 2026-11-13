"use client";

import { motion } from "motion/react";
import { ChevronRight, Ticket, Star } from "lucide-react";
import type { ConcertEvent } from "@/lib/types";
import { formatDayNum, formatMonthShort, formatTime, formatWeekdayShort, saleState } from "@/lib/dates";
import { useApp, useSheet } from "@/lib/store";
import { artistGradient } from "@/lib/colors";

export function EventRow({ event, now, subtitle }: { event: ConcertEvent; now: Date; subtitle?: React.ReactNode }) {
  const open = useSheet((s) => s.open);
  const status = useApp((s) => s.status[event.id]);
  const multiCity = useApp((s) => s.cities.length > 1);
  const nextSale = event.sales.find((s) => saleState(s, now) === "upcoming");
  const openSale = event.sales.find((s) => saleState(s, now) === "open");

  return (
    <motion.button
      layout="position"
      whileTap={{ scale: 0.985 }}
      onClick={() => open(event)}
      className="flex w-full items-center gap-3.5 rounded-3xl bg-surface p-2.5 pr-3.5 text-left ring-1 ring-line transition-colors hover:bg-surface-2"
    >
      <div
        className="grain relative flex h-[62px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px] text-white"
        style={{ background: artistGradient(event.hue) }}
      >
        <span className="relative text-[10px] font-semibold tracking-wider opacity-85">{formatMonthShort(event.date)}</span>
        <span className="relative font-[family-name:var(--font-display)] text-[1.55rem] leading-none font-extrabold">
          {formatDayNum(event.date)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold tracking-tight">{event.artistName}</p>
        <p className="truncate text-[13px] text-muted">
          {formatWeekdayShort(event.date)} {formatTime(event.date)} · {multiCity ? event.city : event.venue}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {subtitle ??
            (status === "going" ? (
              <Pill tone="ok" icon={<Ticket size={11} />}>Tengo entrada</Pill>
            ) : openSale ? (
              <Pill tone="ok">{openSale.kind === "presale" ? "Preventa abierta" : "A la venta"}</Pill>
            ) : nextSale ? (
              <Pill tone="sale">{nextSale.kind === "presale" ? "Preventa" : "Venta"} pronto</Pill>
            ) : (
              <Pill tone="neutral">Agotado / cerrado</Pill>
            ))}
          {status === "interested" && <Pill tone="neutral" icon={<Star size={11} />}>Me interesa</Pill>}
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-faint" />
    </motion.button>
  );
}

export function Pill({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "sale" | "neutral" | "accent";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const tones = {
    ok: "bg-ok/12 text-ok",
    sale: "bg-sale/12 text-sale",
    accent: "bg-accent/14 text-accent",
    neutral: "bg-surface-3 text-muted",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
