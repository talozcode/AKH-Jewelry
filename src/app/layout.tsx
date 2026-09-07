import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akh-jewelry.vercel.app"),
  title: {
    default: "AKH — Sculptural Handcrafted Jewelry",
    template: "%s | AKH Jewelry",
  },
  description:
    "AKH is an independent jewelry studio making sculptural pieces in limited quantities, shaped by material, meaning and instinct.",
  openGraph: {
    title: "AKH — Sculptural Handcrafted Jewelry",
    description:
      "Sculptural pieces handcrafted in limited quantities, shaped by natural materials, personal symbolism and the character of each stone.",
    siteName: "AKH Jewelry",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-ivory text-ink antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
