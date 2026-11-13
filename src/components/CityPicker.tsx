"use client";

import { motion } from "motion/react";
import { Check, MapPin } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { useApp } from "@/lib/store";

export function CityPicker() {
  const cities = useApp((s) => s.cities);
  const toggle = useApp((s) => s.toggleCity);
  return (
    <div className="flex flex-wrap gap-2">
      {CITIES.map((c) => {
        const on = cities.includes(c.id);
        return (
          <motion.button
            key={c.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => toggle(c.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[14px] font-semibold ring-1 transition-colors ${
              on ? "bg-ink text-black ring-ink" : "bg-surface text-muted ring-line"
            }`}
          >
            {on ? <Check size={14} strokeWidth={3} /> : <MapPin size={14} />}
            {c.name}
          </motion.button>
        );
      })}
    </div>
  );
}

export function citiesLabel(ids: string[]) {
  const names = ids.map((id) => CITIES.find((c) => c.id === id)?.name ?? id);
  if (names.length <= 2) return names.join(" y ");
  return `${names[0]} y ${names.length - 1} más`;
}
