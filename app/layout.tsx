import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pet-buddy.pet"),
  title: {
    default: "PetBuddy",
    template: "%s | PetBuddy",
  },
  description:
    "PetBuddy informational site with verification, privacy, terms, and data deletion pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <div className="flex min-h-full flex-col">
          <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
              <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
                PetBuddy
              </Link>
              <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm text-slate-600 sm:gap-6">
                <Link className="transition hover:text-slate-950" href="/">
                  Home
                </Link>
                <Link
                  className="transition hover:text-slate-950"
                  href="/privacy-policy"
                >
                  Privacy
                </Link>
                <Link
                  className="transition hover:text-slate-950"
                  href="/terms-of-service"
                >
                  Terms
                </Link>
                <Link
                  className="transition hover:text-slate-950"
                  href="/delete-data"
                >
                  Delete Data
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 sm:px-8 md:flex-row md:items-center md:justify-between">
              <p>© 2026 PetBuddy. Placeholder informational website for pet-buddy.pet.</p>
              <div className="flex flex-wrap gap-4">
                <Link className="transition hover:text-slate-950" href="/privacy-policy">
                  Privacy Policy
                </Link>
                <Link className="transition hover:text-slate-950" href="/terms-of-service">
                  Terms of Service
                </Link>
                <Link className="transition hover:text-slate-950" href="/delete-data">
                  Delete Data
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
