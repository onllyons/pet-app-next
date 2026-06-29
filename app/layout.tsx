import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { MarketingNavbar } from "./components/marketing-home";
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

const browserBootProbe = `
(function () {
  var firstError = null;

  function formatError(eventType, value) {
    if (!value) return eventType + ": unknown error";
    if (value.message) return eventType + ": " + value.message;
    if (value.reason) {
      if (value.reason.message) return eventType + ": " + value.reason.message;
      return eventType + ": " + String(value.reason);
    }
    if (value.target) {
      var target = value.target;
      var source = target.src || target.href || target.currentSrc || target.tagName || "resource";
      return eventType + ": failed to load " + source;
    }
    return eventType + ": " + String(value);
  }

  function setStatus(message, isError) {
    var node = document.getElementById("hp-live-map-hydration-status");
    if (!node) return;
    node.textContent = message;
  }

  function recordError(message) {
    if (!firstError) {
      firstError = message;
    }
    console.error("[HappyPaws page boot]", message);
    setStatus("We could not load this section. Please refresh the page and try again.", true);
  }

  function markBrowserReady() {
    window.__happyPawsBrowserBooted = true;
    setStatus(
      "Loading map preview...",
      false
    );
  }

  window.addEventListener("error", function (event) {
    recordError(formatError("Browser error", event));
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    recordError(formatError("Promise error", event));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markBrowserReady);
  } else {
    markBrowserReady();
  }

  window.setTimeout(function () {
    if (!window.__happyPawsLiveMapHydrated) {
      if (firstError) {
        console.error("[HappyPaws page boot] First captured error:", firstError);
        setStatus(
          "We could not load this section. Please refresh the page and try again.",
          true
        );
        return;
      }

      setStatus(
        "This section is taking longer than expected to load. Please refresh the page and try again.",
        true
      );
    }
  }, 8000);
})();
`;

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
        <Script id="happy-paws-browser-boot" strategy="beforeInteractive">
          {browserBootProbe}
        </Script>
        <div className="flex min-h-full flex-col">
          <MarketingNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
