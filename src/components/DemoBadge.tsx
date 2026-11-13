"use client";

import { useEvents } from "@/lib/hooks";

export function DemoBadge() {
  const { events } = useEvents();
  if (events.length && events.every((e) => e.source !== "demo")) return null;
  return (
    <span className="mb-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted uppercase ring-1 ring-line">
      Demo
    </span>
  );
}
