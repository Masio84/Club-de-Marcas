import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Club de Marcas | Outlet Premium",
  description: "El club exclusivo de marcas premium en México. Tenis, Relojes, Gorras, Lentes y más con envíos gratis y seguridad garantizada.",
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="es-MX" className={`${inter.variable} h-full`}>
      <body className="font-sans antialiased bg-light-grey text-navy min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
