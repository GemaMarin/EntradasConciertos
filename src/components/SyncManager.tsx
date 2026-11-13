"use client";

import { useEffect } from "react";
import { sb } from "@/lib/supabase";
import { useApp } from "@/lib/store";
import { useSession } from "@/lib/session";
import { getProfile, myAttendance, setAttendance, updateProfile } from "@/lib/social";
import type { Artist, ConcertEvent, EventStatus } from "@/lib/types";

/**
 * Sincroniza el estado local (artistas, ciudades, conciertos marcados) con la nube
 * cuando hay sesión iniciada. Sin Supabase configurado, no hace nada.
 */
export function SyncManager() {
  useEffect(() => {
    const client = sb();
    const session = useSession.getState();
    if (!client) {
      session.set({ ready: true });
      return;
    }

    let uid: string | null = null;
    let applying = false;
    let profileTimer: ReturnType<typeof setTimeout> | undefined;

    async function onSignedIn(userId: string) {
      if (uid === userId) return;
      uid = userId;
      const [profile, att] = await Promise.all([getProfile(userId), myAttendance(userId)]);
      if (!profile) return;
      const local = useApp.getState();

      // Unimos lo local con lo de la nube
      const byId = new Map<string, Artist>();
      [...(profile.artists ?? []), ...local.artists].forEach((a) => byId.set(a.id, a));
      const artists = [...byId.values()];
      const cities = local.onboarded ? [...new Set([...profile.cities, ...local.cities])] : profile.cities;
      const status: Record<string, EventStatus> = { ...local.status };
      const saved: Record<string, ConcertEvent> = { ...local.saved };
      att.forEach((a) => {
        status[a.event_id] = a.status;
        saved[a.event_id] = a.event;
      });

      applying = true;
      useApp.getState().hydrateFromCloud({
        artists,
        cities,
        status,
        saved,
        name: local.name || profile.display_name.split(" ")[0] || "",
        onboarded: local.onboarded || artists.length > 0,
      });
      applying = false;

      // Subimos lo que solo estaba en el dispositivo
      const cloudIds = new Set(att.map((a) => a.event_id));
      await Promise.all(
        Object.entries(local.status)
          .filter(([id]) => !cloudIds.has(id) && local.saved[id])
          .map(([id, st]) => setAttendance(userId, local.saved[id], st)),
      );
      await updateProfile(userId, { artists, cities });
      useSession.getState().set({ profile: { ...profile, artists, cities } });
    }

    const { data: sub } = client.auth.onAuthStateChange((_event, s) => {
      const user = s?.user ?? null;
      useSession.getState().set({ user, ready: true, ...(user ? {} : { profile: null }) });
      if (user) setTimeout(() => onSignedIn(user.id), 0);
      else uid = null;
    });

    // Cambios locales → nube
    const unsub = useApp.subscribe((state, prev) => {
      if (!uid || applying) return;
      const me = uid;
      if (state.artists !== prev.artists || state.cities !== prev.cities) {
        clearTimeout(profileTimer);
        profileTimer = setTimeout(() => {
          const { artists, cities } = useApp.getState();
          updateProfile(me, { artists, cities }).catch(console.error);
        }, 800);
      }
      if (state.status !== prev.status) {
        const ids = new Set([...Object.keys(state.status), ...Object.keys(prev.status)]);
        ids.forEach((id) => {
          if (state.status[id] === prev.status[id]) return;
          const ev = state.saved[id] ?? prev.saved[id];
          if (ev) setAttendance(me, ev, state.status[id] ?? null).catch(console.error);
        });
      }
    });

    return () => {
      sub.subscription.unsubscribe();
      unsub();
      clearTimeout(profileTimer);
    };
  }, []);

  return null;
}
