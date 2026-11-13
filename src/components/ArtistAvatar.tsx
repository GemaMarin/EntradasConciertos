import type { Artist } from "@/lib/types";
import { artistGradient, initials } from "@/lib/colors";

export function ArtistAvatar({
  artist,
  size = 56,
  className = "",
}: {
  artist: Pick<Artist, "name" | "hue" | "imageUrl">;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`grain relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: artistGradient(artist.hue) }}
    >
      {artist.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artist.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] font-extrabold tracking-tight text-white/95"
          style={{ fontSize: size * 0.36 }}
        >
          {initials(artist.name)}
        </span>
      )}
    </div>
  );
}
