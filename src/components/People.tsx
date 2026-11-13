"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Clock, UserPlus } from "lucide-react";
import type { Profile } from "@/lib/social";
import { useSession } from "@/lib/session";
import { useFollowing } from "@/lib/following";
import { UserAvatar } from "./UserAvatar";

export function FollowButton({ target, small = false }: { target: Profile; small?: boolean }) {
  const me = useSession((s) => s.user?.id);
  const status = useFollowing((s) => s.following[target.id]);
  const doFollow = useFollowing((s) => s.follow);
  const doUnfollow = useFollowing((s) => s.unfollow);
  if (!me || me === target.id) return null;

  const base = `flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors ${
    small ? "px-3.5 py-2 text-[13px]" : "px-5 py-3 text-[15px]"
  }`;
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (status) doUnfollow(me, target.id);
        else doFollow(me, target.id, target.is_private);
      }}
      className={`${base} ${
        status === "accepted"
          ? "bg-surface-3 text-ink"
          : status === "pending"
            ? "bg-surface-3 text-muted"
            : "bg-gradient-to-r from-accent to-accent-2 text-white"
      }`}
    >
      {status === "accepted" ? (
        <>
          <Check size={15} /> Siguiendo
        </>
      ) : status === "pending" ? (
        <>
          <Clock size={15} /> Solicitado
        </>
      ) : (
        <>
          <UserPlus size={15} /> Seguir
        </>
      )}
    </motion.button>
  );
}

export function PersonRow({ person, right }: { person: Profile; right?: React.ReactNode }) {
  return (
    <Link
      href={`/u/${person.username}`}
      className="flex items-center gap-3 rounded-3xl bg-surface p-2.5 pr-3 ring-1 ring-line transition-colors hover:bg-surface-2"
    >
      <UserAvatar user={person} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold tracking-tight">{person.display_name || person.username}</p>
        <p className="truncate text-[13px] text-muted">@{person.username}</p>
      </div>
      {right ?? <FollowButton target={person} small />}
    </Link>
  );
}
