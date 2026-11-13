"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRing, CalendarDays, Music, Ticket } from "lucide-react";
import { useApp } from "@/lib/store";
import { ArtistPicker } from "@/components/ArtistPicker";
import { CityPicker } from "@/components/CityPicker";
import { artistGradient } from "@/lib/colors";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Welcome() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { name, setName, artists, completeOnboarding } = useApp();

  const finish = () => {
    completeOnboarding();
    router.replace("/");
  };

  return (
    <div className="relative z-10 mx-auto min-h-dvh w-full max-w-xl">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="s0"
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex min-h-dvh flex-col px-6 pt-[calc(var(--safe-top)+3rem)] pb-[calc(var(--safe-bottom)+1.5rem)]"
          >
            <FloatingTickets />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.15 }} className="mt-auto">
              <p className="mb-3 text-sm font-semibold tracking-wide text-accent uppercase">Primera Fila</p>
              <h1 className="font-[family-name:var(--font-display)] text-[3.1rem] leading-[0.95] font-extrabold tracking-tight">
                Que no se te <span className="text-gradient">escape</span> ni una entrada.
              </h1>
              <ul className="mt-7 space-y-3.5 text-[15px] text-muted">
                <Feature icon={<CalendarDays size={18} />}>Los conciertos de tus grupos en tu ciudad</Feature>
                <Feature icon={<Ticket size={18} />}>El día y la hora exacta en que salen las entradas</Feature>
                <Feature icon={<BellRing size={18} />}>Avisos en tu calendario para llegar a tiempo</Feature>
              </ul>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-semibold text-black"
            >
              Empezar <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease }}
            className="flex min-h-dvh flex-col px-6 pt-[calc(var(--safe-top)+3rem)] pb-[calc(var(--safe-bottom)+1.5rem)]"
          >
            <Steps current={0} />
            <h1 className="mt-8 font-[family-name:var(--font-display)] text-[2.3rem] leading-none font-extrabold tracking-tight">
              ¿Cómo te llamas?
            </h1>
            <p className="mt-2 text-muted">Solo para saludarte. Puedes dejarlo vacío.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setStep(2)}
              placeholder="Tu nombre"
              className="mt-8 w-full border-b-2 border-line bg-transparent pb-3 font-[family-name:var(--font-display)] text-3xl font-bold outline-none placeholder:text-surface-3 focus:border-accent"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(2)}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-semibold text-black"
            >
              Continuar <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease }}
            className="flex min-h-dvh flex-col px-6 pt-[calc(var(--safe-top)+3rem)] pb-[calc(var(--safe-bottom)+1.5rem)]"
          >
            <Steps current={1} />
            <h1 className="mt-8 font-[family-name:var(--font-display)] text-[2.3rem] leading-none font-extrabold tracking-tight">
              ¿Dónde quieres ir a conciertos?
            </h1>
            <p className="mt-2 mb-7 text-muted">Elige una o varias ciudades. Puedes cambiarlas cuando quieras.</p>
            <CityPicker />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(3)}
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[16px] font-semibold text-black max-sm:mt-10"
            >
              Continuar <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease }}
            className="pt-[calc(var(--safe-top)+3rem)] pb-40"
          >
            <div className="px-6">
              <Steps current={2} />
              <h1 className="mt-8 font-[family-name:var(--font-display)] text-[2.3rem] leading-none font-extrabold tracking-tight">
                ¿A quién quieres seguir?
              </h1>
              <p className="mt-2 text-muted">Busca a tus grupos y artistas favoritos. Podrás cambiarlos cuando quieras.</p>
              <button
                disabled
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1ed760]/10 py-3.5 text-[15px] font-semibold text-[#1ed760] ring-1 ring-[#1ed760]/25"
              >
                <Music size={18} /> Conectar con Spotify · Pronto
              </button>
            </div>
            <div className="mt-6">
              <ArtistPicker />
            </div>

            <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl bg-gradient-to-t from-bg via-bg/95 to-transparent px-6 pt-10 pb-[calc(var(--safe-bottom)+1.25rem)]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={artists.length === 0}
                onClick={finish}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-2 py-4 text-[16px] font-semibold text-white shadow-[0_12px_40px_-12px] shadow-accent transition-opacity disabled:opacity-40 disabled:shadow-none"
              >
                {artists.length === 0
                  ? "Elige al menos uno"
                  : `Seguir a ${artists.length} ${artists.length === 1 ? "artista" : "artistas"}`}
                {artists.length > 0 && <ArrowRight size={18} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink">{icon}</span>
      {children}
    </li>
  );
}

function Steps({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
          <motion.div
            className="h-full bg-ink"
            initial={false}
            animate={{ width: i <= current ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease }}
          />
        </div>
      ))}
    </div>
  );
}

const TICKETS = [
  { name: "VETUSTA", hue: 340, x: "4%", y: 0, r: -9 },
  { name: "ROSALÍA", hue: 20, x: "44%", y: 34, r: 7 },
  { name: "LEIVA", hue: 265, x: "12%", y: 150, r: 4 },
];

function FloatingTickets() {
  return (
    <div className="relative h-[260px]">
      {TICKETS.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 40, rotate: 0 }}
          animate={{ opacity: 1, y: [t.y, t.y - 8, t.y], rotate: t.r }}
          transition={{
            opacity: { duration: 0.6, delay: 0.1 * i },
            rotate: { duration: 0.8, ease, delay: 0.1 * i },
            y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: 0.1 * i },
          }}
          className="grain absolute flex h-[92px] w-[200px] items-end overflow-hidden rounded-[22px] p-4 shadow-2xl"
          style={{ left: t.x, top: 0, background: artistGradient(t.hue) }}
        >
          <span className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-bg" />
          <span className="absolute top-3 bottom-3 right-12 border-r-2 border-dashed border-black/25" />
          <span className="relative font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-white">
            {t.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
