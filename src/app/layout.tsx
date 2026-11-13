import type { Metadata, Viewport } from "next";
import { Geist, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SyncManager } from "@/components/SyncManager";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["500", "700", "800"] });

export const metadata: Metadata = {
  title: "Primera Fila · Que no se te escape ni una entrada",
  description: "Los conciertos de tus artistas en tu ciudad y el día exacto en que salen las entradas.",
  applicationName: "Primera Fila",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Primera Fila", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#08080c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${display.variable} h-full antialiased`}>
      <body className="ambient min-h-full">
        <SyncManager />
        {children}
      </body>
    </html>
  );
}
