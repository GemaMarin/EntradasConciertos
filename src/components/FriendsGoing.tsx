"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { attendeesOf, type Attendance } from "@/lib/social";
import { useSession } from "@/lib/session";
import { useFollowing } from "@/lib/following";
import { useApp } from "@/lib/store";
import { UserAvatar } from "./UserAvatar";

/** "Quién va": amigos (gente que sigues) que han marcado este concierto */
export function FriendsGoing({ eventId }: { eventId: string }) {
  const uid = useSession((s) => s.user?.id);
  const following = useFollowing((s) => s.following);
  const load = useFollowing((s) => s.load);
  const mine = useApp((s) => s.status[eventId]);
  const [list, setList] = useState<Attendance[]>([]);

  useEffect(() => {
    if (!uid) return;
    load(uid);
    attendeesOf(eventId).then(setList).catch(() => setList([]));
  }, [uid, eventId, load, mine]);

  const friends = list.filter((a) => a.user_id !== uid && following[a.user_id] === "accepted" && a.profile);
  const others = list.filter((a) => a.user_id !== uid && following[a.user_id] !== "accepted").length;
  if (!uid || (friends.length === 0 && others === 0)) return null;

  return (
    <div>
      <h3 className="mb-3 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">Quién va</h3>
      <div className="space-y-2">
        {friends.map((a) => (
          <Link
            key={a.user_id}
            href={`/u/${a.profile!.username}`}
            className="flex items-center gap-3 rounded-2xl bg-surface-2 p-2.5 ring-1 ring-line"
          >
            <UserAvatar user={a.profile!} size={36} />
            <span className="min-w-0 flex-1 truncate font-semibold">{a.profile!.display_name || a.profile!.username}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                a.status === "going" ? "bg-ok/12 text-ok" : "bg-surface-3 text-muted"
              }`}
            >
              {a.status === "going" ? "Tiene entrada" : "Le interesa"}
            </span>
          </Link>
        ))}
        {others > 0 && (
          <p className="px-1 text-[13px] text-muted">
            {friends.length ? "Y " : ""}
            {others} {others === 1 ? "persona más" : "personas más"} de Primera Fila
          </p>
        )}
      </div>
    </div>
  );
}
