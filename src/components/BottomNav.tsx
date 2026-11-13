"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, Home, Mic2 } from "lucide-react";

const TABS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/artistas", label: "Artistas", icon: Mic2 },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(var(--safe-bottom)+12px)]">
      <div className="glass flex w-full max-w-sm items-center justify-around rounded-full p-1.5 shadow-[0_10px_40px_-8px_rgba(0,0,0,0.8)] ring-1 ring-line">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[13px] font-semibold transition-colors ${
                active ? "text-black" : "text-muted"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={18} className="relative" strokeWidth={2.2} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
