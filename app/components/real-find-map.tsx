"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type GoogleLatLng = { lat: number; lng: number };

type GoogleLatLngBounds = {
  extend: (position: GoogleLatLng) => void;
};

type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
  setCenter: (position: GoogleLatLng) => void;
  setZoom: (zoom: number) => void;
  panTo: (position: GoogleLatLng) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
  addListener: (eventName: "click", handler: () => void) => void;
};

type GoogleMapsNamespace = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    LatLngBounds: new () => GoogleLatLngBounds;
    Point: new (x: number, y: number) => unknown;
    Size: new (width: number, height: number) => unknown;
    event: {
      clearInstanceListeners: (instance: unknown) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    __happyPawsGoogleMapsPromise?: Promise<GoogleMapsNamespace>;
  }
}

type PlaceRow = {
  id: string;
  post_category: "parks" | "restaurants";
  title: string;
  location_label: string | null;
  google_maps_url: string | null;
  primary_category: string | null;
  secondary_category: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  reviews_count: number | null;
  average_rating: number | null;
  image_url: string | null;
};

type BuildingRow = {
  id: string;
  building_name: string;
  country_name: string | null;
  city: string | null;
  administrative_area: string | null;
  formatted_address: string | null;
  google_maps_url: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  external_image_url: string | null;
};

type MapListing = {
  id: string;
  category: "parks" | "restaurants" | "condos";
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  reviews: number | null;
  mapsUrl: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;
const hasRequiredMapConfig = Boolean(supabaseUrl && supabaseKey && googleMapsApiKey);
const missingConfigurationMessage =
  "Configure public Supabase and Google Maps keys to show the live map.";

const categoryMeta = {
  all: { label: "All", color: "#2563EB", short: "A" },
  parks: { label: "Parks", color: "#16A34A", short: "P" },
  restaurants: { label: "Restaurants", color: "#EA580C", short: "R" },
  condos: { label: "Condos", color: "#7C3AED", short: "C" },
} as const;

type CategoryFilter = keyof typeof categoryMeta;

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__happyPawsGoogleMapsPromise) {
    return window.__happyPawsGoogleMapsPromise;
  }

  window.__happyPawsGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.happypawsGoogleMaps = "true";
    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps loaded without the maps API."));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return window.__happyPawsGoogleMapsPromise;
}

async function fetchSupabaseRows<T>(tableName: string, params: Record<string, string>) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase public configuration.");
  }

  const url = new URL(`/rest/v1/${tableName}`, supabaseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase ${tableName} request failed with ${response.status}.`);
  }

  return (await response.json()) as T[];
}

function isFiniteCoordinate(latitude: unknown, longitude: unknown) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function normalizePlace(row: PlaceRow): MapListing | null {
  if (!isFiniteCoordinate(row.location_latitude, row.location_longitude)) {
    return null;
  }

  return {
    id: `place:${row.id}`,
    category: row.post_category,
    title: row.title,
    subtitle: row.primary_category ?? row.secondary_category ?? row.location_label ?? "Pet friendly place",
    latitude: Number(row.location_latitude),
    longitude: Number(row.location_longitude),
    rating: row.average_rating === null ? null : Number(row.average_rating),
    reviews: row.reviews_count,
    mapsUrl: row.google_maps_url,
  };
}

function normalizeBuilding(row: BuildingRow): MapListing | null {
  if (!isFiniteCoordinate(row.location_latitude, row.location_longitude)) {
    return null;
  }

  return {
    id: `building:${row.id}`,
    category: "condos",
    title: row.building_name,
    subtitle: [row.city, row.administrative_area, row.country_name].filter(Boolean).join(", ") || row.formatted_address || "Pet friendly stay",
    latitude: Number(row.location_latitude),
    longitude: Number(row.location_longitude),
    rating: null,
    reviews: null,
    mapsUrl: row.google_maps_url,
  };
}

async function loadListings() {
  const [places, buildings] = await Promise.all([
    fetchSupabaseRows<PlaceRow>("imported_place_public_listings", {
      select:
        "id,post_category,title,location_label,google_maps_url,primary_category,secondary_category,location_latitude,location_longitude,reviews_count,average_rating,image_url",
      location_latitude: "not.is.null",
      location_longitude: "not.is.null",
      order: "updated_at.desc",
      limit: "160",
    }),
    fetchSupabaseRows<BuildingRow>("building_public_listings", {
      select:
        "id,building_name,country_name,city,administrative_area,formatted_address,google_maps_url,location_latitude,location_longitude,external_image_url",
      location_latitude: "not.is.null",
      location_longitude: "not.is.null",
      order: "updated_at.desc",
      limit: "80",
    }),
  ]);

  return [
    ...places.map(normalizePlace).filter((item): item is MapListing => item !== null),
    ...buildings.map(normalizeBuilding).filter((item): item is MapListing => item !== null),
  ];
}

function createMarkerIcon(maps: GoogleMapsNamespace, color: string, label: string, selected: boolean) {
  const size = selected ? 52 : 44;
  const svg = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity=".22"/>
      </filter>
      <path filter="url(#shadow)" d="M${size / 2} ${size + 5}c-5-8-18-18-18-34C${size / 2 - 18} 10 ${size / 2 - 8} 2 ${size / 2} 2s18 8 18 19c0 16-13 26-18 34Z" fill="${color}"/>
      <circle cx="${size / 2}" cy="${size / 2 - 6}" r="${selected ? 17 : 14}" fill="white" opacity=".95"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${selected ? 17 : 15}" font-weight="800" fill="${color}">${label}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.maps.Size(size, size + 8),
    anchor: new maps.maps.Point(size / 2, size + 5),
  };
}

function getCategoryCounts(listings: MapListing[]) {
  return listings.reduce(
    (counts, listing) => {
      counts[listing.category] += 1;
      return counts;
    },
    { parks: 0, restaurants: 0, condos: 0 },
  );
}

export function RealFindMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const mapsRef = useRef<GoogleMapsNamespace | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [listings, setListings] = useState<MapListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingState, setLoadingState] = useState<"loading" | "ready" | "error">(
    hasRequiredMapConfig ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    hasRequiredMapConfig ? null : missingConfigurationMessage,
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const categoryCounts = useMemo(() => getCategoryCounts(listings), [listings]);
  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      if (selectedCategory !== "all" && listing.category !== selectedCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return `${listing.title} ${listing.subtitle}`.toLowerCase().includes(normalizedSearch);
    });
  }, [listings, normalizedSearch, selectedCategory]);
  const popularListings = useMemo(
    () =>
      [...visibleListings]
        .sort((first, second) => (second.rating ?? 0) - (first.rating ?? 0))
        .slice(0, 4),
    [visibleListings],
  );

  useEffect(() => {
    if (!hasRequiredMapConfig || !googleMapsApiKey) {
      return;
    }

    let cancelled = false;

    Promise.all([loadGoogleMaps(googleMapsApiKey), loadListings()])
      .then(([maps, nextListings]) => {
        if (cancelled) {
          return;
        }

        mapsRef.current = maps;
        setListings(nextListings);
        setLoadingState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setLoadingState("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to load map data.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsRef.current || !mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = new mapsRef.current.maps.Map(mapElementRef.current, {
      center: { lat: 13.7563, lng: 100.5018 },
      zoom: 11,
      clickableIcons: false,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
  }, [loadingState]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;

    if (!maps || !map) {
      return;
    }

    markersRef.current.forEach((marker) => {
      maps.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current = [];

    if (visibleListings.length === 0) {
      return;
    }

    const bounds = new maps.maps.LatLngBounds();
    visibleListings.slice(0, 120).forEach((listing) => {
      const meta = categoryMeta[listing.category];
      const position = { lat: listing.latitude, lng: listing.longitude };
      const marker = new maps.maps.Marker({
        map,
        position,
        title: listing.title,
        icon: createMarkerIcon(maps, meta.color, meta.short, selectedListingId === listing.id),
      });

      marker.addListener("click", () => {
        setSelectedListingId(listing.id);
        map.panTo(position);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (visibleListings.length === 1) {
      map.setCenter({ lat: visibleListings[0].latitude, lng: visibleListings[0].longitude });
      map.setZoom(15);
    } else {
      map.fitBounds(bounds, 54);
    }
  }, [selectedListingId, visibleListings]);

  function focusListing(listing: MapListing) {
    setSelectedListingId(listing.id);
    mapRef.current?.panTo({ lat: listing.latitude, lng: listing.longitude });
    mapRef.current?.setZoom(15);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
      <aside className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
        <label className="sr-only" htmlFor="places-search">
          Search places
        </label>
        <input
          id="places-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search places..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-blue-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-blue-950">Filters</h3>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-xs font-extrabold text-blue-600"
          >
            Clear all
          </button>
        </div>

        {(["all", "parks", "restaurants", "condos"] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
              selectedCategory === category
                ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/15"
                : "border-slate-200 bg-white text-blue-950 hover:border-blue-200"
            }`}
          >
            <span>{categoryMeta[category].label}</span>
            <span className={selectedCategory === category ? "text-blue-100" : "text-slate-500"}>
              {category === "all" ? listings.length : categoryCounts[category]}
            </span>
          </button>
        ))}

        <p className="rounded-2xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
          Live data from the same Supabase public map listings used by the app.
        </p>
      </aside>

      <div className="relative min-h-[420px] overflow-hidden rounded-[1.5rem] border border-blue-100 bg-[#EDF5EF]">
        <div ref={mapElementRef} className="absolute inset-0" />

        {loadingState === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-blue-950 shadow-lg">
              Loading live map...
            </div>
          </div>
        ) : null}

        {loadingState === "error" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 p-6">
            <div className="max-w-md rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-xl shadow-blue-950/10">
              <p className="text-lg font-black text-blue-950">Live map is not configured yet</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {errorMessage}
              </p>
              <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-left text-xs leading-5 text-slate-600">
                Required env vars: <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</strong>,{" "}
                <strong>NEXT_PUBLIC_SUPABASE_URL</strong>, and{" "}
                <strong>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</strong>.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="rounded-[1.5rem] bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-black text-blue-950">Popular nearby</h3>
          <span className="text-sm font-extrabold text-blue-600">{visibleListings.length} live</span>
        </div>
        <div className="space-y-4">
          {popularListings.length > 0 ? (
            popularListings.map((listing) => {
              const meta = categoryMeta[listing.category];
              return (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => focusListing(listing)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${
                    selectedListingId === listing.id ? "bg-white shadow-md" : "hover:bg-white"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-blue-700">
                      {listing.title}
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-500">
                      {listing.subtitle}
                    </span>
                  </span>
                  <span className="text-xs font-black text-orange-500">
                    {listing.rating ? listing.rating.toFixed(1) : meta.short}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              No live places match this filter yet.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
