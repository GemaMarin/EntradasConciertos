import { Suspense } from "react";
import { AppShell, Splash } from "@/components/AppShell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Splash />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
