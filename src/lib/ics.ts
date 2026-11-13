import type { SaleItem } from "./types";
import { formatLong, formatTime } from "./dates";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");

function vevent({ sale, event }: SaleItem): string {
  const start = new Date(sale.start);
  const end = new Date(start.getTime() + 30 * 60_000);
  const title = `🎟️ ${sale.kind === "presale" ? "Preventa" : "Salen entradas"}: ${event.artistName}`;
  const desc = `${sale.name} para ${event.artistName} en ${event.venue} (${formatLong(event.date)}, ${formatTime(
    event.date,
  )}).\nComprar: ${event.ticketUrl}`;
  return [
    "BEGIN:VEVENT",
    `UID:${sale.id}@entradas-conciertos`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(desc)}`,
    `URL:${event.ticketUrl}`,
    `LOCATION:${esc(event.vendor)}`,
    // Aviso el día antes y 15 minutos antes
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc("Mañana " + title)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc("En 15 min " + title)}`,
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

export function buildIcs(items: SaleItem[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Entradas Conciertos//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Salidas a la venta",
    ...items.map(vevent),
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(items: SaleItem[], filename = "entradas.ics") {
  const blob = new Blob([buildIcs(items)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
