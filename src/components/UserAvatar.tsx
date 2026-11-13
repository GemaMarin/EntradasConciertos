import { artistGradient, hashHue, initials } from "@/lib/colors";

export function UserAvatar({
  user,
  size = 40,
  className = "",
}: {
  user: { display_name?: string; username?: string; avatar_url?: string | null } | null;
  size?: number;
  className?: string;
}) {
  const name = user?.display_name || user?.username || "?";
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size, background: artistGradient(hashHue(name)) }}
    >
      {user?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-bold text-white" style={{ fontSize: size * 0.38 }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export function AvatarStack({
  users,
  size = 26,
  max = 4,
}: {
  users: { id: string; display_name?: string; username?: string; avatar_url?: string | null }[];
  size?: number;
  max?: number;
}) {
  return (
    <div className="flex -space-x-2">
      {users.slice(0, max).map((u) => (
        <UserAvatar key={u.id} user={u} size={size} className="ring-2 ring-surface" />
      ))}
      {users.length > max && (
        <span
          className="flex items-center justify-center rounded-full bg-surface-3 text-[11px] font-bold text-muted ring-2 ring-surface"
          style={{ width: size, height: size }}
        >
          +{users.length - max}
        </span>
      )}
    </div>
  );
}
