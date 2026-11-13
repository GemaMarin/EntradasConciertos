"use client";

import { create } from "zustand";
import { follow, myFollows, unfollow, type FollowRow } from "./social";

type FollowingState = {
  loadedFor: string | null;
  following: Record<string, FollowRow["status"]>;
  followers: FollowRow[];
  load: (uid: string, force?: boolean) => Promise<void>;
  follow: (uid: string, target: string, isPrivate: boolean) => Promise<void>;
  unfollow: (uid: string, target: string) => Promise<void>;
};

/** A quién sigo (y quién me sigue), cacheado en memoria */
export const useFollowing = create<FollowingState>((set, get) => ({
  loadedFor: null,
  following: {},
  followers: [],
  load: async (uid, force) => {
    if (!force && get().loadedFor === uid) return;
    const { following, followers } = await myFollows(uid);
    set({
      loadedFor: uid,
      following: Object.fromEntries(following.map((f) => [f.following_id, f.status])),
      followers,
    });
  },
  follow: async (uid, target, isPrivate) => {
    set((s) => ({ following: { ...s.following, [target]: isPrivate ? "pending" : "accepted" } }));
    try {
      await follow(uid, target);
    } catch (e) {
      console.error(e);
    }
  },
  unfollow: async (uid, target) => {
    set((s) => {
      const following = { ...s.following };
      delete following[target];
      return { following };
    });
    await unfollow(uid, target);
  },
}));
