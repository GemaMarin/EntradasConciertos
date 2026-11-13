"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Lock, Ticket, Star, History } from "lucide-react";
import type { Attendance, Profile } from "@/lib/social";
import { attendanceOf, countsFor } from "@/lib/social";
import { useApp, useSheet } from "@/lib/store";
import { formatDayNum, formatMonthShort, formatShort } from "@/lib/dates";
import { artistGradient } from "@/lib/colors";
import { UserAvatar } from "./UserAvatar";
import { ArtistAvatar } from "./ArtistAvatar";
import { EmptyState } from "./Section";
import { citiesLabel } from "./CityPicker";

type Tab = "next" | "past";

export function ProfileView({
  profile,
  canSee,
  actions,
  refreshKey,
}: {
  profile: Profile;
  canSee: boolean;
  actions?: React.ReactNode;
  refreshKey?: string;
}) {
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [items, setItems] = useState<Attendance[] | null>(null);
  const [tab, setTab] = useState<Tab>("next");
  const open = useSheet((s) => s.open);
  const myStatus = useApp((s) => s.status);

  useEffect(() => {
    countsFor(profile.id).then(setCounts);
    if (canSee) attendanceOf(profile.id).then(setItems);
  }, [profile.id, canSee, refreshKey, myStatus]);

  const now = new Date().toISOString();
  const upcoming = (items ?? []).filter((a) => a.event_date >= now);
  const past = (items ?? []).filter((a) => a.event_date < now && a.status === "going").reverse();
  const list = tab === "next" ? upcoming : past;

  return (
    <div>
      <div className="flex flex-col items-center px-5 pt-[calc(var(--safe-top)+2rem)] text-center">
        <UserAvatar user={profile} size={96} className="ring-4 ring-surface-2" />
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-[1.9rem] leading-none font-extrabold tracking-tight">
          {profile.display_name || profile.username}
        </h1>
        <p className="mt-1.5 flex items-center gap-1 text-[14px] text-muted">
          @{profile.username} {profile.is_private && <Lock size={12} />}
        </p>
        <div className="mt-5 flex gap-8">
          <Stat n={counts.followers} label="Seguidores" />
          <Stat n={counts.following} label="Siguiendo" />
          <Stat n={canSee ? past.length : 0} label="Conciertos" />
        </div>
        {actions && <div className="mt-5 flex w-full justify-center gap-2">{actions}</div>}
      </div>

      {!canSee ? (
        <div className="mt-10">
          <EmptyState icon={<Lock size={22} />} title="Perfil privado" text="Síguele y, cuando acepte, verás a qué conciertos va." />
        </div>
      ) : (
        <>
          {profile.artists?.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 px-5 text-[13px] font-semibold tracking-wide text-muted uppercase">
                Escucha · {citiesLabel(profile.cities)}
              </p>
              <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-5">
                {profile.artists.slice(0, 20).map((a) => (
                  <div key={a.id} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
                    <ArtistAvatar artist={a} size={60} />
                    <span className="line-clamp-1 text-center text-[11px] font-semibold text-muted">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mx-5 mt-8 flex rounded-full bg-surface p-1 ring-1 ring-line">
            {(
              [
                ["next", "Próximos"],
                ["past", "Ha ido"],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex-1 rounded-full py-2 text-[13px] font-semibold ${tab === id ? "text-ink" : "text-muted"}`}
              >
                {tab === id && <motion.span layoutId={`ptab-${profile.id}`} className="absolute inset-0 rounded-full bg-surface-3" />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2.5 px-5">
            {items === null ? (
              [0, 1].map((i) => <div key={i} className="h-[82px] animate-pulse rounded-3xl bg-surface" />)
            ) : list.length === 0 ? (
              <EmptyState
                icon={tab === "next" ? <Ticket size={22} /> : <History size={22} />}
                title={tab === "next" ? "Sin planes todavía" : "Aún no hay conciertos pasados"}
                text={
                  tab === "next"
                    ? "Los conciertos marcados con «Tengo entrada» o «Me interesa» aparecerán aquí."
                    : "Aquí quedarán los conciertos a los que ha ido. Pronto, con fotos."
                }
              />
            ) : (
              list.map((a) => (
                <motion.button
                  key={a.event_id}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => open(a.event)}
                  className="flex w-full items-center gap-3.5 rounded-3xl bg-surface p-2.5 pr-3.5 text-left ring-1 ring-line"
                >
                  <div
                    className="grain relative flex h-[62px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px] text-white"
                    style={{ background: artistGradient(a.event.hue) }}
                  >
                    <span className="relative text-[10px] font-semibold tracking-wider opacity-85">{formatMonthShort(a.event.date)}</span>
                    <span className="relative font-[family-name:var(--font-display)] text-[1.55rem] leading-none font-extrabold">
                      {formatDayNum(a.event.date)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold tracking-tight">{a.event.artistName}</p>
                    <p className="truncate text-[13px] text-muted">
                      {formatShort(a.event.date)} · {a.event.venue}
                    </p>
                    <span
                      className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        a.status === "going" ? "bg-ok/12 text-ok" : "bg-surface-3 text-muted"
                      }`}
                    >
                      {a.status === "going" ? <Ticket size={11} /> : <Star size={11} />}
                      {a.status === "going" ? "Tiene entrada" : "Le interesa"}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="tabular font-[family-name:var(--font-display)] text-xl font-extrabold">{n}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </div>
  );
}
