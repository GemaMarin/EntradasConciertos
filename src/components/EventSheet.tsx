"use client";

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect } from "react";
import {
  Bell,
  BellRing,
  CalendarPlus,
  Check,
  ExternalLink,
  MapPin,
  Share2,
  Star,
  Ticket,
  X,
} from "lucide-react";
import { useApp, useSheet } from "@/lib/store";
import { useNow } from "@/lib/hooks";
import { countdown, formatLong, formatShort, formatTime, saleState } from "@/lib/dates";
import { downloadIcs } from "@/lib/ics";
import type { ConcertEvent, EventStatus, Sale } from "@/lib/types";
import { Poster } from "./Poster";
import { FriendsGoing } from "./FriendsGoing";

export function EventSheet() {
  const event = useSheet((s) => s.event);
  const close = useSheet((s) => s.close);

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [event, close]);

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <SheetBody key={event.id} event={event} close={close} />
        </>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ event, close }: { event: ConcertEvent; close: () => void }) {
  const controls = useDragControls();
  const now = useNow(1000);
  const status = useApp((s) => s.status[event.id]);
  const setStatus = useApp((s) => s.setStatus);
  const setReminders = useApp((s) => s.setReminders);
  const upcomingSales = event.sales.filter((s) => saleState(s, now) === "upcoming");

  const share = async () => {
    const text = `${event.artistName} en ${event.venue} · ${formatLong(event.date)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.artistName, text, url: event.ticketUrl });
      } catch {}
    } else {
      await navigator.clipboard?.writeText(`${text} — ${event.ticketUrl}`);
    }
  };

  const toggle = (s: EventStatus) => setStatus(event, status === s ? null : s);

  return (
    <motion.div
      role="dialog"
      aria-modal
      aria-label={event.artistName}
      className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-xl overflow-hidden rounded-t-[32px] bg-surface shadow-2xl ring-1 ring-line"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 320 }}
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120 || info.velocity.y > 600) close();
      }}
    >
      <div className="no-scrollbar max-h-[92dvh] overflow-y-auto pb-[calc(var(--safe-bottom)+1.5rem)]">
        <div onPointerDown={(e) => controls.start(e)} className="touch-none">
          <Poster event={event} className="h-[240px]">
            <div className="flex h-full flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <div className="mx-auto h-1.5 w-10 rounded-full bg-white/50" />
              </div>
              <div>
                {event.tour && <p className="mb-1 text-[13px] font-medium text-white/80">{event.tour}</p>}
                <h2 className="font-[family-name:var(--font-display)] text-[2.6rem] leading-[0.95] font-extrabold tracking-tight text-white">
                  {event.artistName}
                </h2>
              </div>
            </div>
          </Poster>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <IconBtn label="Compartir" onClick={share}>
            <Share2 size={17} />
          </IconBtn>
          <IconBtn label="Cerrar" onClick={close}>
            <X size={18} />
          </IconBtn>
        </div>

        <div className="space-y-6 px-5 pt-5">
          {/* Fecha y lugar */}
          <div className="space-y-3">
            <InfoLine icon={<CalendarPlus size={18} />} title={formatLong(event.date)} sub={`${formatTime(event.date)} h`} />
            <InfoLine
              icon={<MapPin size={18} />}
              title={event.venue}
              sub={event.city}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + " " + event.city)}`}
            />
          </div>

          {/* Mi estado */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatusBtn active={status === "interested"} onClick={() => toggle("interested")} icon={<Star size={17} />}>
              Me interesa
            </StatusBtn>
            <StatusBtn active={status === "going"} onClick={() => toggle("going")} icon={<Ticket size={17} />} tone="ok">
              Tengo entrada
            </StatusBtn>
          </div>

          <FriendsGoing eventId={event.id} />

          {/* Línea temporal de ventas */}
          <div>
            <h3 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">Venta de entradas</h3>
            {event.sales.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay fecha de venta anunciada.</p>
            ) : (
              <ol className="relative space-y-2.5">
                {event.sales.map((s) => (
                  <SaleStep key={s.id} sale={s} now={now} />
                ))}
              </ol>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-2.5">
            {upcomingSales.length > 0 && (
              <button
                onClick={() => {
                  downloadIcs(
                    upcomingSales.map((sale) => ({ sale, event })),
                    `entradas-${event.artistName.toLowerCase().replace(/\W+/g, "-")}.ics`,
                  );
                  setReminders(upcomingSales.map((s) => s.id));
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-surface-3 py-4 font-semibold transition-colors active:bg-surface-2"
              >
                <CalendarPlus size={18} /> Añadir aviso a mi calendario
              </button>
            )}
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-2 py-4 font-semibold text-white shadow-[0_10px_40px_-10px] shadow-accent/60"
            >
              Ver entradas en {event.vendor} <ExternalLink size={16} />
            </a>
            {event.priceFrom && (
              <p className="text-center text-xs text-muted">Desde {event.priceFrom} € (aprox.)</p>
            )}
          </div>

          {event.source === "demo" && (
            <p className="rounded-2xl bg-surface-2 px-4 py-3 text-xs leading-relaxed text-muted">
              Datos de ejemplo: las fechas son ficticias mientras conectamos las fuentes reales (Ticketmaster, etc.).
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SaleStep({ sale, now }: { sale: Sale; now: Date }) {
  const state = saleState(sale, now);
  const reminded = useApp((s) => !!s.reminders[sale.id]);
  const toggleReminder = useApp((s) => s.toggleReminder);
  const cd = countdown(sale.start, now);

  return (
    <li
      className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${
        state === "open" ? "bg-ok/8 ring-ok/25" : state === "upcoming" ? "bg-surface-2 ring-line" : "bg-surface-2/50 ring-line opacity-55"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          state === "open" ? "bg-ok text-black" : state === "upcoming" ? "bg-sale/15 text-sale" : "bg-surface-3 text-faint"
        }`}
      >
        {state === "ended" ? <Check size={18} /> : <Ticket size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{sale.name}</p>
        <p className="text-[13px] text-muted">
          {formatShort(sale.start)} · {formatTime(sale.start)} h
          {state === "open" && <span className="font-semibold text-ok"> · ¡Abierta!</span>}
          {state === "ended" && " · Finalizada"}
        </p>
      </div>
      {state === "upcoming" && (
        <div className="flex shrink-0 items-center gap-2">
          <span className={`tabular text-[13px] font-bold ${cd.urgent ? "text-accent" : "text-ink"}`}>{cd.label}</span>
          <button
            aria-label={reminded ? "Quitar recordatorio" : "Recordarme"}
            onClick={() => toggleReminder(sale.id)}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              reminded ? "bg-ink text-black" : "bg-surface-3 text-ink"
            }`}
          >
            {reminded ? <BellRing size={16} /> : <Bell size={16} />}
          </button>
        </div>
      )}
    </li>
  );
}

function InfoLine({ icon, title, sub, href }: { icon: React.ReactNode; title: string; sub?: string; href?: string }) {
  const body = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">{icon}</div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        {sub && <p className="text-[13px] text-muted">{sub}</p>}
      </div>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
      {body}
    </a>
  ) : (
    <div className="flex items-center gap-3">{body}</div>
  );
}

function StatusBtn({
  active,
  onClick,
  icon,
  children,
  tone = "accent",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  tone?: "accent" | "ok";
}) {
  const activeCls = tone === "ok" ? "bg-ok text-black ring-ok" : "bg-ink text-black ring-ink";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold ring-1 transition-colors ${
        active ? activeCls : "bg-surface-2 text-ink ring-line"
      }`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md"
    >
      {children}
    </button>
  );
}
