export const TZ = "Europe/Madrid";

const fmt = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: TZ, ...opts });

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "2026-11-13" en hora de Madrid */
export function dayKey(d: Date | string): string {
  const parts = fmt({ year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(d));
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export const formatTime = (d: string | Date) => fmt({ hour: "2-digit", minute: "2-digit" }).format(new Date(d));
/** "sáb, 14 mar" */
export const formatShort = (d: string | Date) =>
  cap(fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(d)).replace(/\./g, ""));
/** "Sábado, 14 de marzo de 2027" */
export const formatLong = (d: string | Date) =>
  cap(fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(d)));
export const formatMonthYear = (d: Date) => cap(fmt({ month: "long", year: "numeric" }).format(d));
export const formatDayNum = (d: string | Date) => fmt({ day: "numeric" }).format(new Date(d));
export const formatMonthShort = (d: string | Date) =>
  fmt({ month: "short" }).format(new Date(d)).replace(".", "").toUpperCase();
export const formatWeekdayShort = (d: string | Date) =>
  fmt({ weekday: "short" }).format(new Date(d)).replace(".", "").toUpperCase();

/** "Hoy", "Mañana", "En 5 días", "En 3 meses" */
export function relativeDay(target: string | Date, now: Date): string {
  const a = new Date(dayKey(now) + "T00:00:00Z").getTime();
  const b = new Date(dayKey(target) + "T00:00:00Z").getTime();
  const days = Math.round((b - a) / 86_400_000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  if (days === -1) return "Ayer";
  if (days < 0) return `Hace ${-days} días`;
  if (days < 7) return `En ${days} días`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `En ${w} ${w === 1 ? "semana" : "semanas"}`;
  }
  const m = Math.round(days / 30);
  return `En ${m} ${m === 1 ? "mes" : "meses"}`;
}

/** Cuenta atrás compacta: "2 d 4 h", "3 h 12 min", "45 s" */
export function countdown(target: string | Date, now: Date): { label: string; urgent: boolean } {
  let s = Math.max(0, Math.floor((new Date(target).getTime() - now.getTime()) / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const urgent = d === 0 && h < 24;
  if (d > 0) return { label: `${d} d ${h} h`, urgent };
  if (h > 0) return { label: `${h} h ${m} min`, urgent };
  if (m > 0) return { label: `${m} min ${s} s`, urgent };
  return { label: `${s} s`, urgent };
}

export type SaleState = "upcoming" | "open" | "ended";
export function saleState(sale: { start: string; end?: string }, now: Date): SaleState {
  const t = now.getTime();
  if (new Date(sale.start).getTime() > t) return "upcoming";
  if (sale.end && new Date(sale.end).getTime() < t) return "ended";
  return "open";
}
