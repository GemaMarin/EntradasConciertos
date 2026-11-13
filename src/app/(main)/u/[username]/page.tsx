"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProfileByUsername, type Profile } from "@/lib/social";
import { useSession } from "@/lib/session";
import { useFollowing } from "@/lib/following";
import { cloudEnabled } from "@/lib/supabase";
import { ProfileView } from "@/components/ProfileView";
import { FollowButton } from "@/components/People";
import { LoginCard } from "@/components/LoginCard";
import { EmptyState } from "@/components/Section";
import { UserX } from "lucide-react";

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user, ready } = useSession();
  const load = useFollowing((s) => s.load);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const status = useFollowing((s) => (profile ? s.following[profile.id] : undefined));

  useEffect(() => {
    if (!user) return;
    load(user.id);
    getProfileByUsername(decodeURIComponent(username)).then(setProfile);
  }, [user, username, load]);

  useEffect(() => {
    if (profile && user && profile.id === user.id) router.replace("/perfil");
  }, [profile, user, router]);

  const back = (
    <Link
      href="/amigos"
      aria-label="Volver"
      className="absolute top-[calc(var(--safe-top)+1rem)] left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line"
    >
      <ChevronLeft size={20} />
    </Link>
  );

  if (!ready) return null;
  if (!user || !cloudEnabled())
    return (
      <main className="relative pt-[calc(var(--safe-top)+5rem)]">
        {back}
        <LoginCard
          title={`@${decodeURIComponent(username)} te ha invitado`}
          text="Entra para seguirle y ver a qué conciertos va."
          next={`/u/${username}`}
        />
      </main>
    );
  if (profile === undefined) return <main className="relative">{back}</main>;
  if (profile === null)
    return (
      <main className="relative pt-[calc(var(--safe-top)+5rem)]">
        {back}
        <EmptyState icon={<UserX size={22} />} title="No encontramos ese perfil" text="Revisa el nombre de usuario." />
      </main>
    );

  const canSee = !profile.is_private || status === "accepted";
  return (
    <main className="relative">
      {back}
      <ProfileView profile={profile} canSee={canSee} refreshKey={status} actions={<FollowButton target={profile} />} />
    </main>
  );
}
