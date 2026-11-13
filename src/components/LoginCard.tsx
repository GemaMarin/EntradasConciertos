"use client";

import { motion } from "motion/react";
import { cloudEnabled } from "@/lib/supabase";
import { signInWithGoogle } from "@/lib/social";

export function GoogleButton({ next, label = "Continuar con Google" }: { next?: string; label?: string }) {
  const enabled = cloudEnabled();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={!enabled}
      onClick={() => signInWithGoogle(next)}
      className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-black disabled:opacity-40"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </motion.button>
  );
}

export function LoginCard({ title, text, next }: { title: string; text: string; next?: string }) {
  return (
    <div className="mx-5 overflow-hidden rounded-[28px] bg-surface p-6 ring-1 ring-line">
      <p className="font-[family-name:var(--font-display)] text-2xl leading-tight font-extrabold tracking-tight">{title}</p>
      <p className="mt-2 mb-6 text-[15px] text-muted">{text}</p>
      <GoogleButton next={next} />
      {!cloudEnabled() && (
        <p className="mt-3 text-center text-xs text-faint">Las cuentas se activarán en cuanto conectemos la base de datos.</p>
      )}
    </div>
  );
}
