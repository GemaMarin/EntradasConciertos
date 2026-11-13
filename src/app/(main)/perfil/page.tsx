"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Pencil, Share2 } from "lucide-react";
import { useSession } from "@/lib/session";
import { signOut, updateProfile } from "@/lib/social";
import { useApp } from "@/lib/store";
import { ProfileView } from "@/components/ProfileView";
import { LoginCard } from "@/components/LoginCard";
import { PageTitle } from "@/components/Section";

export default function MyProfile() {
  const { user, profile, ready, set } = useSession();
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  if (!ready) return null;
  if (!user)
    return (
      <main>
        <PageTitle title="Tu perfil" />
        <div className="mt-8">
          <LoginCard
            title="Crea tu perfil"
            text="Guarda tus artistas y conciertos en tu cuenta, úsala en cualquier móvil y comparte tus planes con tus amigos."
            next="/perfil"
          />
        </div>
      </main>
    );
  if (!profile) return <main className="pt-20 text-center text-muted">Cargando…</main>;

  const share = async () => {
    const url = `${location.origin}/u/${profile.username}`;
    if (navigator.share) await navigator.share({ title: "Primera Fila", text: "Mira a qué conciertos voy 🎟️", url }).catch(() => {});
    else await navigator.clipboard?.writeText(url);
  };

  return (
    <main>
      <ProfileView
        profile={profile}
        canSee
        actions={
          <>
            <Btn onClick={() => setEditing((v) => !v)} icon={<Pencil size={15} />}>
              Editar
            </Btn>
            <Btn onClick={share} icon={<Share2 size={15} />}>
              Compartir
            </Btn>
          </>
        }
      />
      <AnimatePresence>
        {editing && <EditProfile onClose={() => setEditing(false)} onSaved={(p) => set({ profile: { ...profile, ...p } })} />}
      </AnimatePresence>
      <div className="mt-12 flex justify-center">
        <button
          onClick={async () => {
            await signOut();
            useApp.getState().reset();
            router.replace("/bienvenida");
          }}
          className="flex items-center gap-1.5 text-[13px] text-faint"
        >
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </main>
  );
}

function Btn({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 py-3 text-[14px] font-semibold ring-1 ring-line"
    >
      {icon}
      {children}
    </motion.button>
  );
}

function EditProfile({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (p: { display_name: string; username: string; is_private: boolean }) => void;
}) {
  const profile = useSession((s) => s.profile)!;
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [username, setUsername] = useState(profile.username);
  const [isPrivate, setIsPrivate] = useState(profile.is_private);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const u = username.toLowerCase().trim();
    if (!/^[a-z0-9_.]{3,24}$/.test(u)) return setError("Entre 3 y 24 caracteres: letras, números, «_» o «.»");
    setSaving(true);
    try {
      await updateProfile(profile.id, { display_name: displayName.trim(), username: u, is_private: isPrivate });
      onSaved({ display_name: displayName.trim(), username: u, is_private: isPrivate });
      onClose();
    } catch (e) {
      const msg = (e as { code?: string }).code === "23505" ? "Ese nombre de usuario ya está cogido" : "No se pudo guardar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-xl rounded-t-[32px] bg-surface p-6 pb-[calc(var(--safe-bottom)+1.5rem)] ring-1 ring-line"
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-surface-3" />
        <h2 className="mb-5 font-[family-name:var(--font-display)] text-xl font-bold">Editar perfil</h2>
        <label className="mb-1.5 block text-[13px] font-semibold text-muted">Nombre</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mb-4 w-full rounded-2xl bg-surface-2 px-4 py-3.5 text-[16px] ring-1 ring-line outline-none focus:ring-accent/60"
        />
        <label className="mb-1.5 block text-[13px] font-semibold text-muted">Usuario</label>
        <div className="mb-4 flex items-center rounded-2xl bg-surface-2 px-4 ring-1 ring-line focus-within:ring-accent/60">
          <span className="text-muted">@</span>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase());
              setError("");
            }}
            className="w-full bg-transparent py-3.5 pl-0.5 text-[16px] outline-none"
          />
        </div>
        <button
          onClick={() => setIsPrivate((v) => !v)}
          className="mb-5 flex w-full items-center justify-between rounded-2xl bg-surface-2 px-4 py-3.5 text-left ring-1 ring-line"
        >
          <span>
            <span className="block font-semibold">Perfil privado</span>
            <span className="text-[13px] text-muted">Solo quien apruebes verá tus conciertos</span>
          </span>
          <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${isPrivate ? "bg-accent" : "bg-surface-3"}`}>
            <motion.span
              className="absolute top-1 h-5 w-5 rounded-full bg-white"
              animate={{ left: isPrivate ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </button>
        {error && <p className="mb-3 text-sm text-accent">{error}</p>}
        <button
          disabled={saving}
          onClick={save}
          className="w-full rounded-2xl bg-ink py-4 font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </motion.div>
    </>
  );
}
