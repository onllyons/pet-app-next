"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

function buildDeepLink(token: string) {
  return `petapp:///building-invite?token=${encodeURIComponent(token)}`;
}

function subscribeToLocation() {
  return () => {};
}

function getSearchSnapshot() {
  return window.location.search;
}

function getHrefSnapshot() {
  return window.location.href;
}

function getServerSnapshot() {
  return "";
}

export default function BuildingInvitePage() {
  const [copied, setCopied] = useState(false);
  const search = useSyncExternalStore(
    subscribeToLocation,
    getSearchSnapshot,
    getServerSnapshot,
  );
  const href = useSyncExternalStore(
    subscribeToLocation,
    getHrefSnapshot,
    getServerSnapshot,
  );

  const token = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("token") ?? "";
  }, [search]);
  const deepLink = useMemo(() => buildDeepLink(token), [token]);
  const fullWebUrl = useMemo(() => (href ? new URL(href).toString() : ""), [href]);

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(() => {
      window.location.href = deepLink;
    }, 400);

    return () => window.clearTimeout(timer);
  }, [deepLink, token]);

  async function handleCopy() {
    const value = fullWebUrl || window.location.href;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt("Copy invite link", value);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f5f8ff_55%,_#eaf1ff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto w-full max-w-2xl rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
          PetBuddy
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Building invitation
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Open this invitation in the mobile app to join the building. If the app
          is already installed, we try to open it automatically.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Token
          </p>
          <p className="mt-2 break-all font-mono text-sm text-slate-800">
            {token || "Missing token"}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={deepLink}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            Open App
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {copied ? "Copied" : "Copy Link"}
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <p className="font-semibold">If the app does not open</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Install the Pet App on this device first.</li>
            <li>Then tap Open App again or use the invite from your phone browser.</li>
            <li>If you are on desktop, open the link on a mobile device.</li>
          </ul>
        </div>

        <p className="mt-6 text-sm leading-7 text-slate-500">
          Web fallback URL: {fullWebUrl || "Loading..."}
        </p>
      </section>
    </main>
  );
}
