"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./social";

type SessionState = {
  ready: boolean;
  user: User | null;
  profile: Profile | null;
  set: (p: Partial<Omit<SessionState, "set">>) => void;
};

export const useSession = create<SessionState>((set) => ({
  ready: false,
  user: null,
  profile: null,
  set: (p) => set(p),
}));
