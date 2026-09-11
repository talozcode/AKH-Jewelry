import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Caveat } from "next/font/google";
import "./globals.css";

// Editorial headline serif per the AKH design brief (Cormorant Garamond,
// with EB Garamond as the named alternative). Deliberately not the
// handwritten logo font - that stays scoped to the wordmark only.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Casual handwritten mark for the "akh." wordmark, matching the brand's
// real packaging (see CLAUDE.md) rather than a typeset logo.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akh-jewelry.vercel.app"),
  title: {
    default: "AKH - Objects of Light",
    template: "%s | AKH Jewelry",
  },
  description:
    "AKH is an independent jewelry studio. Jewelry shaped by transformation, time and the beauty of imperfection.",
  openGraph: {
    title: "AKH - Objects of Light",
    description:
      "Jewelry shaped by transformation, time and the beauty of imperfection.",
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="flex min-h-screen flex-col bg-ivory text-ink antialiased">{children}</body>
    </html>
  );
}
