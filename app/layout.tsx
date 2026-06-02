import { Bricolage_Grotesque, Archivo } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Domain Finder",
  description:
    "A Porkbun-powered domain finder for projects, apps, and tiny bets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${archivo.variable}`}>
      <body className="bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
