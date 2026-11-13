"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { useHydrated } from "@/lib/hooks";
import { BottomNav } from "./BottomNav";
import { EventSheet } from "./EventSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const onboarded = useApp((s) => s.onboarded);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !onboarded) router.replace("/bienvenida");
  }, [hydrated, onboarded, router]);

  if (!hydrated || !onboarded) return <Splash />;

  return (
    <div className="relative z-10 mx-auto min-h-dvh w-full max-w-xl pb-32">
      {children}
      <BottomNav />
      <EventSheet />
    </div>
  );
}

export function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" className="h-16 w-16 animate-pulse rounded-2xl" />
    </div>
  );
}
