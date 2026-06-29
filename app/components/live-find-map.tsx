"use client";

import { useEffect, useState } from "react";
import { RealFindMap } from "./real-find-map";

declare global {
  interface Window {
    __happyPawsLiveMapHydrated?: boolean;
  }
}

export function LiveFindMap() {
  const [isBrowserMounted, setIsBrowserMounted] = useState(false);

  useEffect(() => {
    window.__happyPawsLiveMapHydrated = true;
    const mountTimer = window.setTimeout(() => {
      setIsBrowserMounted(true);
    }, 0);

    return () => window.clearTimeout(mountTimer);
  }, []);

  if (!isBrowserMounted) {
    return (
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_310px]">
        <div className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
          <div className="h-12 rounded-2xl bg-white" />
          <div className="h-12 rounded-2xl bg-white" />
          <div className="h-12 rounded-2xl bg-white" />
        </div>
        <div className="flex min-h-[430px] items-center justify-center rounded-[1.5rem] border border-blue-100 bg-blue-50">
          <div className="max-w-md rounded-2xl bg-white px-5 py-4 text-sm font-bold text-blue-950 shadow-lg">
            Loading map preview...
            <p
              id="hp-live-map-hydration-status"
              className="mt-2 text-xs font-semibold leading-5 text-slate-500"
            >
              Loading map preview...
            </p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <div className="h-6 w-32 rounded-full bg-white" />
        </div>
      </div>
    );
  }

  return <RealFindMap />;
}
