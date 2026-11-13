"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarPlus, Flame, Mic2, Plus, Ticket } from "lucide-react";
import { useApp, useSheet } from "@/lib/store";
import { useEvents, useNow, useSales } from "@/lib/hooks";
import { dayKey, formatLong, formatTime } from "@/lib/dates";
import { downloadIcs } from "@/lib/ics";
import { PageTitle, Section, EmptyState } from "@/components/Section";
import { SaleCard } from "@/components/SaleCard";
import { EventRow } from "@/components/EventRow";
import { DemoBadge } from "@/components/DemoBadge";
import { citiesLabel } from "@/components/CityPicker";
import { MapPin } from "lucide-react";

export default function Home() {
  const now = useNow(1000);
  const name = useApp((s) => s.name);
  const artists = useApp((s) => s.artists);
  const cities = useApp((s) => s.cities);
  const status = useApp((s) => s.status);
  const setReminders = useApp((s) => s.setReminders);
  const openSheet = useSheet((s) => s.open);
  const { events, loading } = useEvents();
  const { upcoming, onSale } = useSales(events, now);

  const today = dayKey(now);
  const todaySales = upcoming.filter((i) => dayKey(i.sale.start) === today);
  const going = events.filter((e) => status[e.id] === "going" && new Date(e.date) > now);
  const onSaleNotGoing = onSale.filter((e) => status[e.id] !== "going");

  return (
    <main>
      <PageTitle eyebrow={formatLong(now).split(" de 20")[0]} title={name ? `Hola, ${name}` : "Primera Fila"} right={<DemoBadge />} />
      <Link
        href="/artistas#ciudades"
        className="mx-5 mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold text-muted ring-1 ring-line"
      >
        <MapPin size={13} className="text-accent" /> {citiesLabel(cities)}
      </Link>

      {loading && events.length === 0 ? (
        <Skeleton />
      ) : artists.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={<Mic2 size={22} />}
            title="Aún no sigues a nadie"
            text="Añade tus grupos favoritos y te avisaremos de sus conciertos en tu ciudad."
            action={<PrimaryLink href="/artistas">Añadir artistas</PrimaryLink>}
          />
        </div>
      ) : (
        <>
          {todaySales.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => openSheet(todaySales[0].event)}
              className="mx-5 mt-6 flex w-[calc(100%-2.5rem)] items-center gap-3.5 rounded-3xl bg-gradient-to-r from-accent to-accent-2 p-4 text-left text-white shadow-[0_16px_50px_-16px] shadow-accent"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <Flame size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold tracking-wide uppercase opacity-85">Hoy salen entradas</p>
                <p className="truncate font-semibold">
                  {todaySales
                    .slice(0, 2)
                    .map((i) => `${i.event.artistName} · ${formatTime(i.sale.start)}`)
                    .join("  ·  ")}
                </p>
              </div>
            </motion.button>
          )}

          <Section
            title={
              <>
                Salen a la <span className="text-gradient">venta</span>
              </>
            }
            action={
              upcoming.length > 0 && (
                <button
                  onClick={() => {
                    downloadIcs(upcoming, "salidas-a-la-venta.ics");
                    setReminders(upcoming.map((i) => i.sale.id));
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-ink ring-1 ring-line"
                >
                  <CalendarPlus size={14} /> Todas al calendario
                </button>
              )
            }
          >
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Ticket size={22} />}
                title="Nada a la vista"
                text="Ninguno de tus artistas tiene fechas de venta anunciadas. Te avisaremos en cuanto salgan."
              />
            ) : (
              <div className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-px-5 px-5 pb-2">
                {upcoming.slice(0, 15).map((item) => (
                  <SaleCard key={item.sale.id} item={item} now={now} />
                ))}
              </div>
            )}
          </Section>

          {going.length > 0 && (
            <Section title="Tus próximos conciertos">
              <List>
                {going.map((e) => (
                  <EventRow key={e.id} event={e} now={now} />
                ))}
              </List>
            </Section>
          )}

          {onSaleNotGoing.length > 0 && (
            <Section title="Ya a la venta">
              <List>
                {onSaleNotGoing.slice(0, 6).map((e) => (
                  <EventRow key={e.id} event={e} now={now} />
                ))}
              </List>
            </Section>
          )}

          <Section
            title="Todos los conciertos"
            action={
              <Link href="/calendario" className="text-[14px] font-semibold text-accent">
                Ver calendario
              </Link>
            }
          >
            {events.length === 0 ? (
              <EmptyState
                icon={<Ticket size={22} />}
                title="Sin conciertos en tus ciudades"
                text="De momento tus artistas no tienen fechas anunciadas aquí. Prueba a seguir a más."
                action={<PrimaryLink href="/artistas">Seguir más artistas</PrimaryLink>}
              />
            ) : (
              <List>
                {events.slice(0, 5).map((e) => (
                  <EventRow key={e.id} event={e} now={now} />
                ))}
              </List>
            )}
          </Section>
        </>
      )}
    </main>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2.5 px-5">{children}</div>;
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-black"
    >
      <Plus size={16} /> {children}
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="mt-9 animate-pulse">
      <div className="mx-5 mb-4 h-6 w-48 rounded-lg bg-surface-2" />
      <div className="flex gap-3.5 overflow-hidden px-5">
        {[0, 1].map((i) => (
          <div key={i} className="h-[230px] w-[78vw] max-w-[320px] shrink-0 rounded-[28px] bg-surface" />
        ))}
      </div>
      <div className="mt-9 space-y-2.5 px-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[82px] rounded-3xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
