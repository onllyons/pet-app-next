import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MarketingNavbar, SiteFooter } from "./components/marketing-home";
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
  metadataBase: new URL("https://happypaws.pet"),
  title: {
    default: "HappyPaws",
    template: "%s | HappyPaws",
  },
  description:
    "HappyPaws helps pet parents discover pet-friendly places, trusted care, health records, events, and vets.",
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
      <body className="min-h-full bg-white text-slate-900">
        <div className="flex min-h-full flex-col">
          <MarketingNavbar />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
