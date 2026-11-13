"use client";

import { sb } from "./supabase";
import type { Artist, ConcertEvent, EventStatus } from "./types";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_private: boolean;
  cities: string[];
  artists: Artist[];
};

export type Attendance = {
  user_id: string;
  event_id: string;
  status: EventStatus;
  event: ConcertEvent;
  event_date: string;
  created_at: string;
  profile?: Profile;
};

export type FollowRow = { follower_id: string; following_id: string; status: "accepted" | "pending" };

const db = () => {
  const c = sb();
  if (!c) throw new Error("Supabase no configurado");
  return c;
};

export async function signInWithGoogle(next = "/perfil") {
  await db().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}${next}` },
  });
}

export const signOut = () => db().auth.signOut();

export async function getProfile(id: string): Promise<Profile | null> {
  const { data } = await db().from("profiles").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data } = await db().from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle();
  return data;
}

export async function updateProfile(id: string, patch: Partial<Omit<Profile, "id">>) {
  const { error } = await db()
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function searchProfiles(q: string, excludeId?: string): Promise<Profile[]> {
  const term = q.replace(/[%,()]/g, "").trim();
  if (term.length < 2) return [];
  let query = db()
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .limit(20);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return data ?? [];
}

// ---------- Seguir ----------
export async function myFollows(uid: string) {
  const { data } = await db().from("follows").select("*").or(`follower_id.eq.${uid},following_id.eq.${uid}`);
  const rows = (data ?? []) as FollowRow[];
  return {
    following: rows.filter((r) => r.follower_id === uid),
    followers: rows.filter((r) => r.following_id === uid),
  };
}

export async function follow(uid: string, target: string) {
  const { error } = await db().from("follows").insert({ follower_id: uid, following_id: target });
  if (error) throw error;
}
export async function unfollow(uid: string, target: string) {
  await db().from("follows").delete().eq("follower_id", uid).eq("following_id", target);
}
export async function acceptFollower(uid: string, follower: string) {
  await db().from("follows").update({ status: "accepted" }).eq("follower_id", follower).eq("following_id", uid);
}
export async function removeFollower(uid: string, follower: string) {
  await db().from("follows").delete().eq("follower_id", follower).eq("following_id", uid);
}

export async function countsFor(id: string) {
  const c = db();
  const [a, b] = await Promise.all([
    c.from("follows").select("*", { count: "exact", head: true }).eq("following_id", id).eq("status", "accepted"),
    c.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", id).eq("status", "accepted"),
  ]);
  return { followers: a.count ?? 0, following: b.count ?? 0 };
}

export async function profilesByIds(ids: string[]): Promise<Profile[]> {
  if (!ids.length) return [];
  const { data } = await db().from("profiles").select("*").in("id", ids);
  return data ?? [];
}

// ---------- Asistencia ----------
export async function myAttendance(uid: string): Promise<Attendance[]> {
  const { data } = await db().from("attendance").select("*").eq("user_id", uid);
  return data ?? [];
}

export async function setAttendance(uid: string, event: ConcertEvent, status: EventStatus | null) {
  const c = db();
  if (!status) {
    await c.from("attendance").delete().eq("user_id", uid).eq("event_id", event.id);
    return;
  }
  const { error } = await c.from("attendance").upsert({
    user_id: uid,
    event_id: event.id,
    status,
    event,
    event_date: event.date,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Conciertos próximos de la gente a la que sigo */
export async function friendsPlans(uid: string): Promise<Attendance[]> {
  const { following } = await myFollows(uid);
  const ids = following.filter((f) => f.status === "accepted").map((f) => f.following_id);
  if (!ids.length) return [];
  const { data } = await db()
    .from("attendance")
    .select("*, profile:profiles(*)")
    .in("user_id", ids)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(200);
  return data ?? [];
}

/** Quién (de los que puedo ver) va a un concierto concreto */
export async function attendeesOf(eventId: string): Promise<Attendance[]> {
  const { data } = await db().from("attendance").select("*, profile:profiles(*)").eq("event_id", eventId).limit(50);
  return data ?? [];
}

export async function attendanceOf(userId: string): Promise<Attendance[]> {
  const { data } = await db()
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: true });
  return data ?? [];
}
