import type { ConcertEvent } from "@/lib/types";
import { artistGradient } from "@/lib/colors";

/** Fondo tipo cartel de concierto: degradado del artista + grano + imagen si existe */
export function Poster({
  event,
  className = "",
  children,
}: {
  event: Pick<ConcertEvent, "hue" | "imageUrl" | "artistName">;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`grain relative overflow-hidden ${className}`} style={{ background: artistGradient(event.hue) }}>
      {event.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {!event.imageUrl && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.18em] -left-[0.04em] select-none font-[family-name:var(--font-display)] text-[5.5rem] leading-none font-extrabold tracking-tighter whitespace-nowrap text-white/[0.08]"
        >
          {event.artistName}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
