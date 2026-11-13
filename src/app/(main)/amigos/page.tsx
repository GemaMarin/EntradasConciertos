"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, Share2, Ticket, Star, X, Users } from "lucide-react";
import { useSession } from "@/lib/session";
import { useFollowing } from "@/lib/following";
import { useSheet } from "@/lib/store";
import {
  acceptFollower,
  friendsPlans,
  profilesByIds,
  removeFollower,
  searchProfiles,
  type Attendance,
  type Profile,
} from "@/lib/social";
import { formatDayNum, formatMonthShort, formatShort, formatTime } from "@/lib/dates";
import { artistGradient } from "@/lib/colors";
import { PageTitle, Section, EmptyState } from "@/components/Section";
import { LoginCard } from "@/components/LoginCard";
import { PersonRow } from "@/components/People";
import { AvatarStack } from "@/components/UserAvatar";
import type { ConcertEvent } from "@/lib/types";

export default function FriendsPage() {
  const { user, profile, ready } = useSession();

  if (!ready) return null;
  if (!user)
    return (
      <main>
        <PageTitle title="Amigos" />
        <div className="mt-8">
          <LoginCard
            title="Ve a qué conciertos van tus amigos"
            text="Crea tu perfil, sigue a tus amigos y entérate de quién ha comprado entradas para qué. Tus conciertos y artistas quedarán guardados en tu cuenta."
            next="/amigos"
          />
        </div>
      </main>
    );
  return <Friends uid={user.id} me={profile} />;
}

type Plan = { event: ConcertEvent; people: Attendance[] };

const firstName = (a: Attendance) => a.profile?.display_name?.split(" ")[0] || a.profile?.username || "Alguien";
const names = (list: Attendance[]) =>
  list.length === 1 ? firstName(list[0]) : `${firstName(list[0])} y ${list.length - 1} más`;

function Friends({ uid, me }: { uid: string; me: Profile | null }) {
  const load = useFollowing((s) => s.load);
  const following = useFollowing((s) => s.following);
  const followers = useFollowing((s) => s.followers);
  const open = useSheet((s) => s.open);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<Attendance[] | null>(null);
  const [requests, setRequests] = useState<Profile[]>([]);

  const acceptedKey = Object.entries(following)
    .filter(([, s]) => s === "accepted")
    .map(([id]) => id)
    .sort()
    .join(",");

  useEffect(() => {
    load(uid);
  }, [uid, load]);

  useEffect(() => {
    friendsPlans(uid)
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [uid, acceptedKey]);

  useEffect(() => {
    const pending = followers.filter((f) => f.status === "pending").map((f) => f.follower_id);
    profilesByIds(pending).then(setRequests);
  }, [followers]);

  useEffect(() => {
    const t = setTimeout(() => searchProfiles(q, uid).then(setResults), 250);
    return () => clearTimeout(t);
  }, [q, uid]);

  const grouped: Plan[] = useMemo(() => {
    const map = new Map<string, Plan>();
    (plans ?? []).forEach((a) => {
      const p = map.get(a.event_id) ?? { event: a.event, people: [] };
      p.people.push(a);
      map.set(a.event_id, p);
    });
    return [...map.values()].sort((a, b) => a.event.date.localeCompare(b.event.date));
  }, [plans]);

  const invite = async () => {
    const url = `${location.origin}/u/${me?.username ?? ""}`;
    const text = "Sígueme en Primera Fila y mira a qué conciertos voy 🎟️";
    if (navigator.share) await navigator.share({ title: "Primera Fila", text, url }).catch(() => {});
    else await navigator.clipboard?.writeText(`${text} ${url}`);
  };

  return (
    <main>
      <PageTitle
        title="Amigos"
        right={
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={invite}
            className="mb-0.5 flex h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-black"
          >
            <Share2 size={16} /> Invitar
          </motion.button>
        }
      />

      <div className="relative mx-5 mt-6">
        <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca por nombre o @usuario"
          className="w-full rounded-2xl bg-surface py-3.5 pr-11 pl-11 text-[16px] ring-1 ring-line outline-none placeholder:text-faint focus:ring-accent/60"
        />
        {q && (
          <button
            aria-label="Borrar"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-surface-3 p-1 text-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {q.trim().length >= 2 ? (
        <div className="mt-4 space-y-2 px-5">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Nadie con ese nombre todavía. ¡Invítale!</p>
          ) : (
            results.map((p) => <PersonRow key={p.id} person={p} />)
          )}
        </div>
      ) : (
        <>
          {requests.length > 0 && (
            <Section title="Solicitudes">
              <div className="space-y-2 px-5">
                {requests.map((p) => (
                  <PersonRow
                    key={p.id}
                    person={p}
                    right={
                      <div className="flex gap-1.5">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            await acceptFollower(uid, p.id);
                            load(uid, true);
                          }}
                          className="rounded-full bg-ink px-3.5 py-2 text-[13px] font-semibold text-black"
                        >
                          Aceptar
                        </button>
                        <button
                          aria-label="Rechazar"
                          onClick={async (e) => {
                            e.preventDefault();
                            await removeFollower(uid, p.id);
                            load(uid, true);
                          }}
                          className="rounded-full bg-surface-3 p-2 text-muted"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </Section>
          )}

          <Section title="Planes de tus amigos">
            {plans === null ? (
              <div className="space-y-2.5 px-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-[96px] animate-pulse rounded-3xl bg-surface" />
                ))}
              </div>
            ) : grouped.length === 0 ? (
              <EmptyState
                icon={<Users size={22} />}
                title={acceptedKey ? "Tus amigos aún no han marcado conciertos" : "Aún no sigues a nadie"}
                text={
                  acceptedKey
                    ? "Cuando alguien marque «Tengo entrada» o «Me interesa» lo verás aquí."
                    : "Busca a tus amigos arriba o invítales con un enlace."
                }
              />
            ) : (
              <div className="space-y-2.5 px-5">
                {grouped.map(({ event, people }) => {
                  const going = people.filter((p) => p.status === "going");
                  const interested = people.filter((p) => p.status === "interested");
                  return (
                    <motion.button
                      key={event.id}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => open(event)}
                      className="flex w-full items-center gap-3.5 rounded-3xl bg-surface p-2.5 pr-3.5 text-left ring-1 ring-line"
                    >
                      <div
                        className="grain relative flex h-[72px] w-[60px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[18px] text-white"
                        style={{ background: artistGradient(event.hue) }}
                      >
                        <span className="relative text-[10px] font-semibold tracking-wider opacity-85">
                          {formatMonthShort(event.date)}
                        </span>
                        <span className="relative font-[family-name:var(--font-display)] text-[1.6rem] leading-none font-extrabold">
                          {formatDayNum(event.date)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[16px] font-semibold tracking-tight">{event.artistName}</p>
                        <p className="truncate text-[13px] text-muted">
                          {formatShort(event.date)} {formatTime(event.date)} · {event.venue}
                        </p>
                        <div className="mt-1.5 flex flex-col gap-1 text-[12px] font-semibold">
                          {going.length > 0 && (
                            <span className="flex items-center gap-1 text-ok">
                              <Ticket size={12} /> {names(going)} {going.length === 1 ? "tiene entrada" : "tienen entrada"}
                            </span>
                          )}
                          {interested.length > 0 && (
                            <span className="flex items-center gap-1 text-muted">
                              <Star size={12} /> A {names(interested)} le interesa
                            </span>
                          )}
                        </div>
                      </div>
                      <AvatarStack users={people.flatMap((p) => (p.profile ? [p.profile] : []))} max={3} />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}
    </main>
  );
}
