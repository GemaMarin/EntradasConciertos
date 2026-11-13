"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

/** Cliente de Supabase, o null si aún no está configurado (modo local) */
export function sb(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

export const cloudEnabled = () => Boolean(url && key);
