"use client";

import { useEffect, useState } from "react";

type VendorTypeCode =
  | "pet_hotel"
  | "veterinarian"
  | "pet_food"
  | "trainer"
  | "groomer"
  | "other";

type VendorTypeCountMap = Partial<Record<VendorTypeCode, number>>;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const appVendorTypes: Array<{
  code: VendorTypeCode;
  label: string;
  description: string;
}> = [
  {
    code: "pet_hotel",
    label: "Pet hotel",
    description: "Boarding and daycare",
  },
  {
    code: "veterinarian",
    label: "Veterinarian",
    description: "Clinics and mobile vets",
  },
  {
    code: "pet_food",
    label: "Pet food",
    description: "Food and treats",
  },
  {
    code: "trainer",
    label: "Trainer",
    description: "Training and walking",
  },
  {
    code: "groomer",
    label: "Groomer",
    description: "Grooming and bathing",
  },
  {
    code: "other",
    label: "Other",
    description: "Pet-friendly businesses",
  },
];

function PawIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M8.3 10.1c1.2-.3 1.8-1.8 1.4-3.5C9.3 4.9 8.1 3.8 6.9 4.1c-1.2.3-1.8 1.8-1.4 3.5.4 1.7 1.6 2.8 2.8 2.5Zm7.4 0c1.2.3 2.4-.8 2.8-2.5.4-1.7-.2-3.2-1.4-3.5-1.2-.3-2.4.8-2.8 2.5-.4 1.7.2 3.2 1.4 3.5ZM4.8 14c1.1-.4 1.5-1.9.9-3.4-.6-1.5-1.9-2.4-3-2-1.1.4-1.5 1.9-.9 3.4.6 1.5 1.9 2.4 3 2Zm14.4 0c1.1.4 2.4-.5 3-2 .6-1.5.2-3-1-3.4-1.1-.4-2.4.5-3 2-.6 1.5-.1 3 1 3.4Zm-2.4 6c1.4 0 2.2-1.1 1.8-2.5-.7-2.5-3.3-5.2-6.6-5.2s-5.9 2.7-6.6 5.2c-.4 1.4.4 2.5 1.8 2.5 1.6 0 2.7-.9 4.8-.9s3.2.9 4.8.9Z" />
    </svg>
  );
}

function parseContentRangeCount(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

async function fetchVendorTypeCount(code: VendorTypeCode) {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  const url = new URL("/rest/v1/vendor_public_listings", supabaseUrl);
  url.searchParams.set("select", "id");
  url.searchParams.set("company_type", `eq.${code}`);
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "count=exact",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Vendor type count failed with ${response.status}.`);
    }

    const headerCount = parseContentRangeCount(response.headers.get("content-range"));
    if (headerCount !== null) {
      return headerCount;
    }

    const rows = (await response.json()) as unknown[];
    return rows.length;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function VendorTypesList() {
  const [counts, setCounts] = useState<VendorTypeCountMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      appVendorTypes.map(async (type) => {
        const count = await fetchVendorTypeCount(type.code);
        return [type.code, count] as const;
      }),
    )
      .then((entries) => {
        if (cancelled) {
          return;
        }

        setCounts(
          entries.reduce<VendorTypeCountMap>((nextCounts, [code, count]) => {
            if (count !== null) {
              nextCounts[code] = count;
            }
            return nextCounts;
          }, {}),
        );
      })
      .catch((error: unknown) => {
        console.info("[HappyPaws vendor types]", error);
        if (!cancelled) {
          setCounts(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {appVendorTypes.map((type) => {
        const count = counts?.[type.code];

        return (
          <div key={type.code} className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <PawIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-extrabold leading-4 text-blue-950">
                {type.label}
              </span>
              <span className="mt-0.5 block truncate text-[11px] leading-4 text-slate-500">
                {type.description}
              </span>
            </span>
            {typeof count === "number" ? (
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black leading-4 text-blue-700">
                {count}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
