import type { Metadata } from "next";
import { Manrope, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Club de Marcas | Outlet Premium",
  description: "El club exclusivo de marcas premium en Aguascalientes. Tenis, Relojes, Gorras, Lentes y más con envíos gratis y seguridad garantizada.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="es-MX" className={`${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full`}>
      <body className="font-sans antialiased bg-bg-base text-text-primary min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
