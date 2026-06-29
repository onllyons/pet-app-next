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
    __happyPawsGoogleMapsReady?: () => void;
    gm_authFailure?: () => void;
  }
}

type ListingCategory =
  | "parks"
  | "restaurants"
  | "condos"
  | "vets"
  | "homes"
  | "hotels"
  | "trainers"
  | "pet_food"
  | "groomers"
  | "events";

type CategoryFilter = "all" | ListingCategory;

type ListingKind = "place" | "building" | "vendor" | "event";

type PlaceRow = {
  id: string;
  post_category: "parks" | "restaurants" | "events" | null;
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
  phone?: string | null;
  website_url?: string | null;
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

type VendorRow = {
  id: string;
  company_name: string;
  company_type: string | null;
  country_name: string | null;
  city: string | null;
  administrative_area: string | null;
  formatted_address: string | null;
  google_maps_url: string | null;
  business_photo_paths: string[] | string | null;
};

type CommunityEventRow = {
  id: string;
  title: string;
  location_label: string | null;
  google_maps_url: string | null;
  description: string | null;
  image_path: string | null;
  media_paths: string[] | null;
  likes_count: number | null;
  created_at: string | null;
};

type HomeSourceRow = {
  id: string;
  label: string;
  icon_name: string | null;
  url_template: string;
  country_code: string | null;
  country_name: string | null;
  city: string | null;
  administrative_area: string | null;
  sort_order: number | null;
};

type MapListing = {
  id: string;
  kind: ListingKind;
  category: ListingCategory;
  filterCategories: ListingCategory[];
  title: string;
  subtitle: string;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviews: number | null;
  mapsUrl: string | null;
  searchText: string;
};

type LoadedFindData = {
  listings: MapListing[];
  homeSources: HomeSourceRow[];
};

const bangkokCenter = { lat: 13.7563, lng: 100.5018 };
const bangkokSearchLabel = "Bangkok, Thailand";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);
const hasGoogleMapsConfig = Boolean(googleMapsApiKey);
const isDevelopment = process.env.NODE_ENV !== "production";

const primaryFilterKeys: ListingCategory[] = [
  "parks",
  "restaurants",
  "condos",
  "vets",
  "homes",
];

const secondaryFilterKeys: ListingCategory[] = [
  "hotels",
  "trainers",
  "pet_food",
  "groomers",
  "events",
];

const categoryMeta: Record<
  CategoryFilter,
  { label: string; color: string; short: string; icon: CategoryIcon }
> = {
  all: { label: "All", color: "#2563EB", short: "A", icon: "paw" },
  parks: { label: "Parks", color: "#22C55E", short: "P", icon: "tree" },
  restaurants: { label: "Restaurants", color: "#E76124", short: "R", icon: "fork" },
  condos: { label: "Condos", color: "#64748B", short: "C", icon: "building" },
  vets: { label: "Vets", color: "#2F6BFF", short: "V", icon: "medical" },
  homes: { label: "Homes", color: "#176B57", short: "H", icon: "home" },
  hotels: { label: "Pet hotels", color: "#5B8CFF", short: "H", icon: "bed" },
  trainers: { label: "Trainers", color: "#14B8A6", short: "T", icon: "school" },
  pet_food: { label: "Pet food", color: "#F59E0B", short: "F", icon: "store" },
  groomers: { label: "Groomers", color: "#E05AA6", short: "G", icon: "scissors" },
  events: { label: "Events", color: "#8A4EF8", short: "E", icon: "calendar" },
};

type CategoryIcon =
  | "paw"
  | "tree"
  | "fork"
  | "building"
  | "medical"
  | "home"
  | "bed"
  | "school"
  | "store"
  | "scissors"
  | "calendar";

const fallbackHomeSources: HomeSourceRow[] = [
  {
    id: "fallback:google",
    label: "Google Search",
    icon_name: "search",
    url_template: "https://www.google.com/search?q={query}",
    country_code: "TH",
    country_name: "Thailand",
    city: "Bangkok",
    administrative_area: null,
    sort_order: 10,
  },
  {
    id: "fallback:facebook",
    label: "Facebook Groups",
    icon_name: "people",
    url_template: "https://www.facebook.com/search/groups?q={query}",
    country_code: "TH",
    country_name: "Thailand",
    city: "Bangkok",
    administrative_area: null,
    sort_order: 20,
  },
  {
    id: "fallback:renthub",
    label: "Rental Search",
    icon_name: "home",
    url_template: "https://www.google.com/search?q=pet+friendly+condos+{query}",
    country_code: "TH",
    country_name: "Thailand",
    city: "Bangkok",
    administrative_area: null,
    sort_order: 30,
  },
];

function logMapDiagnostic(message: string, details?: Record<string, unknown>) {
  if (!isDevelopment) {
    return;
  }

  console.info("[HappyPaws find map]", message, details ?? {});
}

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (window.__happyPawsGoogleMapsPromise) {
    return timeoutGoogleMaps(window.__happyPawsGoogleMapsPromise);
  }

  window.__happyPawsGoogleMapsPromise = new Promise<GoogleMapsNamespace>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-happypaws-google-maps='true']",
    );
    existingScript?.remove();

    const timeout = window.setTimeout(() => {
      reject(new Error("Google Maps did not finish loading."));
    }, 12000);

    const previousAuthFailure = window.gm_authFailure;
    const settle = (handler: () => void) => {
      window.clearTimeout(timeout);
      handler();
    };

    window.__happyPawsGoogleMapsReady = () => {
      settle(() => {
        if (window.google?.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps loaded without the maps API."));
        }
      });
    };

    window.gm_authFailure = () => {
      settle(() => {
        reject(new Error("Google Maps rejected this browser key."));
        previousAuthFailure?.();
      });
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=__happyPawsGoogleMapsReady`;
    script.async = true;
    script.defer = true;
    script.dataset.happypawsGoogleMaps = "true";
    script.onerror = () => {
      settle(() => reject(new Error("Failed to load Google Maps.")));
    };
    document.head.appendChild(script);
  }).catch((error) => {
    window.__happyPawsGoogleMapsPromise = undefined;
    throw error;
  });

  return timeoutGoogleMaps(window.__happyPawsGoogleMapsPromise);
}

function timeoutGoogleMaps(promise: Promise<GoogleMapsNamespace>) {
  return Promise.race([
    promise,
    new Promise<GoogleMapsNamespace>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error("Google Maps did not finish loading."));
      }, 12000);
    }),
  ]);
}

async function fetchSupabaseRows<T>(tableName: string, params: Record<string, string>) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing public data configuration.");
  }

  const url = new URL(`/rest/v1/${tableName}`, supabaseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`${tableName} request failed with ${response.status}.`);
    }

    return (await response.json()) as T[];
  } finally {
    window.clearTimeout(timeout);
  }
}

async function safeFetchSupabaseRows<T>(tableName: string, params: Record<string, string>) {
  try {
    return await fetchSupabaseRows<T>(tableName, params);
  } catch (error) {
    logMapDiagnostic(`${tableName} skipped`, {
      message: error instanceof Error ? error.message : "Unknown request failure.",
    });
    return [];
  }
}

function isFiniteCoordinate(latitude: unknown, longitude: unknown) {
  return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() || null;
}

function makeSearchText(parts: Array<string | null | undefined>) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function firstPublicImage(value: string[] | string | null | undefined) {
  if (!value) {
    return null;
  }

  const candidates = Array.isArray(value) ? value : [value];
  return (
    candidates.find((candidate) => /^https?:\/\//i.test(candidate.trim()))?.trim() ?? null
  );
}

function areaSubtitle(parts: Array<string | null | undefined>, fallback: string) {
  return parts.map(normalizeText).filter(Boolean).join(", ") || fallback;
}

function normalizePlace(row: PlaceRow): MapListing | null {
  if (!row.post_category || !["parks", "restaurants", "events"].includes(row.post_category)) {
    return null;
  }

  const category = row.post_category as ListingCategory;
  const hasCoordinates = isFiniteCoordinate(row.location_latitude, row.location_longitude);
  const title = normalizeText(row.title) ?? "Pet friendly place";
  const subtitle =
    normalizeText(row.primary_category) ??
    normalizeText(row.secondary_category) ??
    normalizeText(row.location_label) ??
    categoryMeta[category].label;

  return {
    id: `place:${row.id}`,
    kind: "place",
    category,
    filterCategories: [category],
    title,
    subtitle,
    imageUrl: firstPublicImage(row.image_url),
    latitude: hasCoordinates ? Number(row.location_latitude) : null,
    longitude: hasCoordinates ? Number(row.location_longitude) : null,
    rating: row.average_rating === null ? null : Number(row.average_rating),
    reviews: row.reviews_count,
    mapsUrl: row.google_maps_url,
    searchText: makeSearchText([
      title,
      subtitle,
      row.location_label,
      row.primary_category,
      row.secondary_category,
      row.phone,
      row.website_url,
    ]),
  };
}

function normalizeBuilding(row: BuildingRow): MapListing | null {
  if (!isFiniteCoordinate(row.location_latitude, row.location_longitude)) {
    return null;
  }

  const title = normalizeText(row.building_name) ?? "Pet friendly condo";
  const subtitle = areaSubtitle(
    [row.city, row.administrative_area, row.country_name],
    row.formatted_address ?? "Pet friendly stay",
  );

  return {
    id: `building:${row.id}`,
    kind: "building",
    category: "condos",
    filterCategories: ["condos", "homes"],
    title,
    subtitle,
    imageUrl: firstPublicImage(row.external_image_url),
    latitude: Number(row.location_latitude),
    longitude: Number(row.location_longitude),
    rating: null,
    reviews: null,
    mapsUrl: row.google_maps_url,
    searchText: makeSearchText([
      title,
      subtitle,
      row.formatted_address,
      row.city,
      row.administrative_area,
      row.country_name,
    ]),
  };
}

function getVendorCategory(companyType: string | null): ListingCategory | null {
  switch (companyType) {
    case "veterinarian":
      return "vets";
    case "pet_hotel":
      return "hotels";
    case "trainer":
      return "trainers";
    case "pet_food":
      return "pet_food";
    case "groomer":
      return "groomers";
    default:
      return null;
  }
}

function normalizeVendor(row: VendorRow): MapListing | null {
  const category = getVendorCategory(row.company_type);
  if (!category) {
    return null;
  }

  const title = normalizeText(row.company_name) ?? categoryMeta[category].label;
  const subtitle = areaSubtitle(
    [row.city, row.administrative_area, row.country_name],
    row.formatted_address ?? categoryMeta[category].label,
  );

  return {
    id: `vendor:${row.id}`,
    kind: "vendor",
    category,
    filterCategories: [category],
    title,
    subtitle,
    imageUrl: firstPublicImage(row.business_photo_paths),
    latitude: null,
    longitude: null,
    rating: null,
    reviews: null,
    mapsUrl: row.google_maps_url,
    searchText: makeSearchText([
      title,
      subtitle,
      row.company_type,
      row.city,
      row.administrative_area,
      row.country_name,
      row.formatted_address,
    ]),
  };
}

function normalizeCommunityEvent(row: CommunityEventRow): MapListing | null {
  const title = normalizeText(row.title) ?? "Pet event";
  const subtitle =
    normalizeText(row.location_label) ??
    normalizeText(row.description) ??
    "Community event";

  return {
    id: `event:${row.id}`,
    kind: "event",
    category: "events",
    filterCategories: ["events"],
    title,
    subtitle,
    imageUrl: firstPublicImage(row.media_paths) ?? firstPublicImage(row.image_path),
    latitude: null,
    longitude: null,
    rating: null,
    reviews: row.likes_count,
    mapsUrl: row.google_maps_url,
    searchText: makeSearchText([title, subtitle, row.description, row.location_label]),
  };
}

function isBangkokHomeSource(row: HomeSourceRow) {
  const countryCode = normalizeText(row.country_code)?.toUpperCase();
  const countryName = normalizeText(row.country_name)?.toLowerCase();
  const city = normalizeText(row.city)?.toLowerCase();

  const countryMatches =
    !countryCode ||
    countryCode === "TH" ||
    !countryName ||
    countryName.includes("thailand");
  const cityMatches = !city || city.includes("bangkok");

  return countryMatches && cityMatches;
}

async function loadFindData(): Promise<LoadedFindData> {
  const [places, buildings, vendors, events, homeSources] = await Promise.all([
    safeFetchSupabaseRows<PlaceRow>("imported_place_public_listings", {
      select:
        "id,post_category,title,location_label,google_maps_url,primary_category,secondary_category,location_latitude,location_longitude,reviews_count,average_rating,image_url,phone,website_url",
      location_latitude: "not.is.null",
      location_longitude: "not.is.null",
      order: "updated_at.desc",
      limit: "160",
    }),
    safeFetchSupabaseRows<BuildingRow>("building_public_listings", {
      select:
        "id,building_name,country_name,city,administrative_area,formatted_address,google_maps_url,location_latitude,location_longitude,external_image_url",
      location_latitude: "not.is.null",
      location_longitude: "not.is.null",
      order: "updated_at.desc",
      limit: "80",
    }),
    safeFetchSupabaseRows<VendorRow>("vendor_public_listings", {
      select:
        "id,company_name,company_type,country_name,city,administrative_area,formatted_address,google_maps_url,business_photo_paths",
      order: "updated_at.desc",
      limit: "80",
    }),
    safeFetchSupabaseRows<CommunityEventRow>("community_posts", {
      select:
        "id,title,location_label,google_maps_url,description,image_path,media_paths,likes_count,created_at",
      post_category: "eq.events",
      status: "eq.approved",
      order: "created_at.desc",
      limit: "80",
    }),
    safeFetchSupabaseRows<HomeSourceRow>("building_listing_search_sources_public", {
      select:
        "id,label,icon_name,url_template,country_code,country_name,city,administrative_area,sort_order",
      order: "sort_order.asc",
      limit: "80",
    }),
  ]);

  const listings = [
    ...places.map(normalizePlace),
    ...buildings.map(normalizeBuilding),
    ...vendors.map(normalizeVendor),
    ...events.map(normalizeCommunityEvent),
  ].filter((listing): listing is MapListing => listing !== null);

  const relevantHomeSources = homeSources.filter(isBangkokHomeSource);

  return {
    listings,
    homeSources: relevantHomeSources.length > 0 ? relevantHomeSources : fallbackHomeSources,
  };
}

function createMarkerIcon(
  maps: GoogleMapsNamespace,
  color: string,
  label: string,
  selected: boolean,
) {
  const size = selected ? 52 : 44;
  const svg = `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity=".22"/>
      </filter>
      <path filter="url(#shadow)" d="M${size / 2} ${size + 5}c-5-8-18-18-18-34C${size / 2 - 18} 10 ${size / 2 - 8} 2 ${size / 2} 2s18 8 18 19c0 16-13 26-18 34Z" fill="${color}"/>
      <circle cx="${size / 2}" cy="${size / 2 - 6}" r="${selected ? 17 : 14}" fill="white" opacity=".96"/>
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
      listing.filterCategories.forEach((category) => {
        counts[category] += 1;
      });
      return counts;
    },
    {
      parks: 0,
      restaurants: 0,
      condos: 0,
      vets: 0,
      homes: 0,
      hotels: 0,
      trainers: 0,
      pet_food: 0,
      groomers: 0,
      events: 0,
    } satisfies Record<ListingCategory, number>,
  );
}

function CategorySymbol({
  icon,
  className = "h-5 w-5",
}: {
  icon: CategoryIcon;
  className?: string;
}) {
  if (icon === "tree") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2.5 5.4 9.3h3.2l-4.8 5.4h5.1l-3.3 4.8h5.1V22h2.6v-2.5h5.1l-3.3-4.8h5.1l-4.8-5.4h3.2L12 2.5Z" />
      </svg>
    );
  }

  if (icon === "fork") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7 2h1.5v8.2c0 1.2-.7 2.2-1.8 2.7V22H4.5v-9.1A3 3 0 0 1 2.7 10V2h1.5v7h1V2h1.6v7H7V2Zm9.8 0c2.4 1.3 3.8 4.1 3.8 7.4 0 2.7-.9 4.9-2.5 5.8V22h-2.3v-6.8h-2.9V9.1c0-3.2 1.5-5.9 3.9-7.1Z" />
      </svg>
    );
  }

  if (icon === "building") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M4 21V4.8C4 3.8 4.8 3 5.8 3h8.4c1 0 1.8.8 1.8 1.8V8h2.2c1 0 1.8.8 1.8 1.8V21h-6v-4h-4v4H4Zm3-13h2.2V5.8H7V8Zm4 0h2.2V5.8H11V8Zm-4 4h2.2V9.8H7V12Zm4 0h2.2V9.8H11V12Zm5 0h2v-2h-2v2Zm0 4h2v-2h-2v2Z" />
      </svg>
    );
  }

  if (icon === "medical") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M9.8 3.5h4.4v5.7h5.7v4.4h-5.7v5.9H9.8v-5.9H4.1V9.2h5.7V3.5Z" />
      </svg>
    );
  }

  if (icon === "home") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M3.2 11.5 12 4l8.8 7.5-1.5 1.8-1.1-.9V21h-5v-5.3h-2.4V21h-5v-8.6l-1.1.9-1.5-1.8Z" />
      </svg>
    );
  }

  if (icon === "bed") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M4 5.5h2.2v6.2H20c1.1 0 2 .9 2 2V20h-2.2v-2.5H4.2V20H2V5.5h2Zm4 1h4.8c1.4 0 2.5 1.1 2.5 2.5v1.2H8V6.5Z" />
      </svg>
    );
  }

  if (icon === "school") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 3 2.6 8l9.4 5 7-3.7v5.3h2V8L12 3Zm-5.6 9.1v4.1c0 1.7 2.5 3.4 5.6 3.4s5.6-1.7 5.6-3.4v-4.1L12 15.1l-5.6-3Z" />
      </svg>
    );
  }

  if (icon === "store") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M5 3h14l1.4 5.4c.4 1.6-.8 3.1-2.4 3.1-.9 0-1.7-.4-2.2-1.1-.4.7-1.2 1.1-2.1 1.1s-1.7-.4-2.2-1.1c-.4.7-1.2 1.1-2.1 1.1s-1.7-.4-2.2-1.1c-.5.7-1.3 1.1-2.2 1.1-1.6 0-2.8-1.5-2.4-3.1L5 3Zm-.8 9.8c.3.1.6.2.9.2.9 0 1.7-.3 2.3-.9.6.6 1.3.9 2.2.9s1.6-.3 2.2-.9c.6.6 1.3.9 2.2.9s1.6-.3 2.2-.9c.6.6 1.4.9 2.3.9.3 0 .6 0 .9-.1V21H4.2v-8.2Z" />
      </svg>
    );
  }

  if (icon === "scissors") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M6.3 14.1a3.4 3.4 0 1 0 2.9 1.7l2.2-2.2 2.2 2.2a3.4 3.4 0 1 0 1.3-1.3l-2.2-2.2 6.7-6.7-1.5-1.5-6.7 6.7-2.2-2.2a3.4 3.4 0 1 0-1.3 1.3l2.2 2.2-2.2 2.2a3.3 3.3 0 0 0-1.4-.2Zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11.4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM6.3 7.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7 2h2v2h6V2h2v2h1.5C19.9 4 21 5.1 21 6.5v12c0 1.4-1.1 2.5-2.5 2.5h-13C4.1 21 3 19.9 3 18.5v-12C3 5.1 4.1 4 5.5 4H7V2Zm12 8H5v8.2c0 .4.3.8.8.8h12.5c.4 0 .8-.3.8-.8V10Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M8.3 10.1c1.2-.3 1.8-1.8 1.4-3.5C9.3 4.9 8.1 3.8 6.9 4.1c-1.2.3-1.8 1.8-1.4 3.5.4 1.7 1.6 2.8 2.8 2.5Zm7.4 0c1.2.3 2.4-.8 2.8-2.5.4-1.7-.2-3.2-1.4-3.5-1.2-.3-2.4.8-2.8 2.5-.4 1.7.2 3.2 1.4 3.5ZM4.8 14c1.1-.4 1.5-1.9.9-3.4-.6-1.5-1.9-2.4-3-2-1.1.4-1.5 1.9-.9 3.4.6 1.5 1.9 2.4 3 2Zm14.4 0c1.1.4 2.4-.5 3-2 .6-1.5.2-3-1-3.4-1.1-.4-2.4.5-3 2-.6 1.5-.1 3 1 3.4Zm-2.4 6c1.4 0 2.2-1.1 1.8-2.5-.7-2.5-3.3-5.2-6.6-5.2s-5.9 2.7-6.6 5.2c-.4 1.4.4 2.5 1.8 2.5 1.6 0 2.7-.9 4.8-.9s3.2.9 4.8.9Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="m12 2.8 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.7l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 2.8Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="m20 20-4.8-4.8m2.3-5.7a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function openHomeSource(source: HomeSourceRow) {
  const url = source.url_template.replace(
    "{query}",
    encodeURIComponent(`${bangkokSearchLabel} pet friendly homes`),
  );
  window.open(url, "_blank", "noopener,noreferrer");
}

function readableCategoryLabel(category: ListingCategory) {
  return categoryMeta[category].label;
}

export function RealFindMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const mapsRef = useRef<GoogleMapsNamespace | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [listings, setListings] = useState<MapListing[]>([]);
  const [homeSources, setHomeSources] = useState<HomeSourceRow[]>(fallbackHomeSources);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [moreFiltersVisible, setMoreFiltersVisible] = useState(false);
  const [mapLoadState, setMapLoadState] = useState<"loading" | "ready" | "error">(
    hasGoogleMapsConfig ? "loading" : "error",
  );
  const [dataLoadState, setDataLoadState] = useState<"loading" | "ready" | "error">(
    hasSupabaseConfig ? "loading" : "error",
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const categoryCounts = useMemo(() => getCategoryCounts(listings), [listings]);
  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      if (selectedCategory === "all" && listing.category === "events") {
        return false;
      }

      if (
        selectedCategory !== "all" &&
        !listing.filterCategories.includes(selectedCategory)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return listing.searchText.includes(normalizedSearch);
    });
  }, [listings, normalizedSearch, selectedCategory]);
  const visibleMapListings = useMemo(
    () =>
      visibleListings.filter(
        (listing) =>
          listing.latitude !== null &&
          listing.longitude !== null &&
          isFiniteCoordinate(listing.latitude, listing.longitude),
      ),
    [visibleListings],
  );
  const featuredListings = useMemo(
    () =>
      [...visibleListings]
        .sort((first, second) => {
          const firstHasImage = first.imageUrl ? 1 : 0;
          const secondHasImage = second.imageUrl ? 1 : 0;
          if (firstHasImage !== secondHasImage) {
            return secondHasImage - firstHasImage;
          }

          return (second.rating ?? 0) - (first.rating ?? 0);
        })
        .slice(0, 7),
    [visibleListings],
  );

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return;
    }

    let cancelled = false;
    const statusTimer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      setDataLoadState("loading");
    }, 0);

    loadFindData()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setListings(data.listings);
        setHomeSources(data.homeSources);
        setDataLoadState("ready");
        logMapDiagnostic("Find listings loaded", {
          listings: data.listings.length,
          homeSources: data.homeSources.length,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setDataLoadState("error");
        logMapDiagnostic("Find listings failed", {
          message: error instanceof Error ? error.message : "Unknown request failure.",
        });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(statusTimer);
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!hasGoogleMapsConfig || !googleMapsApiKey) {
      return;
    }

    let cancelled = false;
    const statusTimer = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      setMapLoadState("loading");
    }, 0);

    loadGoogleMaps(googleMapsApiKey)
      .then((maps) => {
        if (cancelled) {
          return;
        }

        mapsRef.current = maps;
        setMapLoadState("ready");
        logMapDiagnostic("Google Maps loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setMapLoadState("error");
        logMapDiagnostic("Google Maps failed", {
          message: error instanceof Error ? error.message : "Unknown map failure.",
        });
      });

    return () => {
      cancelled = true;
      window.clearTimeout(statusTimer);
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!mapsRef.current || !mapElementRef.current || mapRef.current) {
      return;
    }

    mapRef.current = new mapsRef.current.maps.Map(mapElementRef.current, {
      center: bangkokCenter,
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
  }, [mapLoadState]);

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

    if (visibleMapListings.length === 0) {
      map.setCenter(bangkokCenter);
      map.setZoom(11);
      return;
    }

    const bounds = new maps.maps.LatLngBounds();
    visibleMapListings.slice(0, 120).forEach((listing) => {
      if (listing.latitude === null || listing.longitude === null) {
        return;
      }

      const meta = categoryMeta[listing.category];
      const position = { lat: listing.latitude, lng: listing.longitude };
      const marker = new maps.maps.Marker({
        map,
        position,
        title: listing.title,
        icon: createMarkerIcon(
          maps,
          meta.color,
          meta.short,
          selectedListingId === listing.id,
        ),
      });

      marker.addListener("click", () => {
        setSelectedListingId(listing.id);
        map.panTo(position);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (visibleMapListings.length === 1) {
      const listing = visibleMapListings[0];
      if (listing.latitude !== null && listing.longitude !== null) {
        map.setCenter({ lat: listing.latitude, lng: listing.longitude });
        map.setZoom(15);
      }
    } else {
      map.fitBounds(bounds, 54);
    }
  }, [selectedListingId, visibleMapListings]);

  function selectCategory(category: CategoryFilter) {
    setSelectedCategory(category);
    setSelectedListingId(null);
    if (secondaryFilterKeys.includes(category as ListingCategory)) {
      setMoreFiltersVisible(true);
    }
  }

  function focusListing(listing: MapListing) {
    setSelectedListingId(listing.id);

    if (listing.latitude === null || listing.longitude === null) {
      return;
    }

    mapRef.current?.panTo({ lat: listing.latitude, lng: listing.longitude });
    mapRef.current?.setZoom(15);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedListingId(null);
  }

  function retryLiveMap() {
    markersRef.current.forEach((marker) => {
      mapsRef.current?.maps.event.clearInstanceListeners(marker);
      marker.setMap(null);
    });
    markersRef.current = [];
    mapRef.current = null;
    mapsRef.current = null;
    setListings([]);
    setHomeSources(fallbackHomeSources);
    setSelectedListingId(null);
    setDataLoadState(hasSupabaseConfig ? "loading" : "error");
    setMapLoadState(hasGoogleMapsConfig ? "loading" : "error");
    setLoadAttempt((current) => current + 1);
  }

  const allCount = listings.filter((listing) => listing.category !== "events").length;
  const activeMeta = selectedCategory === "all" ? categoryMeta.all : categoryMeta[selectedCategory];
  const mapIsEmpty =
    mapLoadState === "ready" &&
    dataLoadState === "ready" &&
    visibleMapListings.length === 0 &&
    visibleListings.length > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_310px]">
      <aside className="space-y-4 rounded-[1.5rem] bg-slate-50 p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <label className="sr-only" htmlFor="places-search">
            Search places
          </label>
          <input
            id="places-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Bangkok..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-blue-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-blue-950">Filters</h3>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-extrabold text-blue-600"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FilterChip
            category="all"
            count={allCount}
            selectedCategory={selectedCategory}
            onSelect={selectCategory}
          />
          {primaryFilterKeys.map((category) => (
            <FilterChip
              key={category}
              category={category}
              count={categoryCounts[category]}
              selectedCategory={selectedCategory}
              onSelect={selectCategory}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMoreFiltersVisible((value) => !value)}
          className="flex w-full items-center justify-between rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-black text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
        >
          <span>More filters</span>
          <span className="text-lg leading-none">{moreFiltersVisible ? "−" : "+"}</span>
        </button>

        {moreFiltersVisible ? (
          <div className="grid grid-cols-2 gap-2">
            {secondaryFilterKeys.map((category) => (
              <FilterChip
                key={category}
                category={category}
                count={categoryCounts[category]}
                selectedCategory={selectedCategory}
                onSelect={selectCategory}
              />
            ))}
          </div>
        ) : null}

        {selectedCategory === "homes" ? (
          <div className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <CategorySymbol icon="home" className="h-5 w-5" />
              </span>
              <div>
                <p className="font-black text-blue-950">Find pet-friendly homes</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Open trusted external searches for Bangkok apartments and condos.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {homeSources.slice(0, 4).map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => openHomeSource(source)}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs font-black text-blue-800 transition hover:bg-green-50 hover:text-green-800"
                >
                  <span>{source.label}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="relative min-h-[430px] overflow-hidden rounded-[1.5rem] border border-blue-100 bg-[#EDF5EF]">
        <div ref={mapElementRef} className="absolute inset-0" />

        <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl bg-white/95 px-4 py-3 shadow-lg shadow-blue-950/10 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">
            Bangkok
          </p>
          <p className="text-sm font-black text-blue-950">{activeMeta.label}</p>
        </div>

        {mapLoadState === "loading" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="max-w-md rounded-2xl bg-white px-5 py-4 text-sm font-bold text-blue-950 shadow-lg">
              Loading map...
            </div>
          </div>
        ) : null}

        {mapLoadState === "ready" && dataLoadState === "loading" ? (
          <div className="absolute inset-x-4 top-4 z-20 flex justify-center">
            <div className="rounded-2xl bg-white px-4 py-3 text-xs font-bold text-blue-950 shadow-lg">
              Loading places...
            </div>
          </div>
        ) : null}

        {mapIsEmpty ? (
          <div className="absolute inset-x-4 bottom-4 z-20 flex justify-center">
            <div className="max-w-sm rounded-2xl bg-white px-4 py-3 text-center text-xs font-bold leading-5 text-slate-600 shadow-lg">
              These results are shown in the list until map coordinates are available.
            </div>
          </div>
        ) : null}

        {mapLoadState === "error" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 p-6">
            <div className="max-w-md rounded-3xl border border-blue-100 bg-white p-6 text-center shadow-xl shadow-blue-950/10">
              <p className="text-lg font-black text-blue-950">Map could not load</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The places list is still available. Please try the map again in a moment.
              </p>
              <button
                type="button"
                onClick={retryLiveMap}
                className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
              >
                Retry map
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <aside className="rounded-[1.5rem] bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-blue-950">Live listings</h3>
            <p className="text-xs font-semibold text-slate-500">
              {selectedCategory === "all"
                ? "Popular nearby"
                : readableCategoryLabel(selectedCategory)}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-blue-600">
            {visibleListings.length}
          </span>
        </div>
        <div className="max-h-[390px] space-y-3 overflow-y-auto pr-1">
          {featuredListings.length > 0 ? (
            featuredListings.map((listing) => (
              <ListingButton
                key={listing.id}
                listing={listing}
                selected={selectedListingId === listing.id}
                onSelect={focusListing}
              />
            ))
          ) : (
            <p className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600">
              {dataLoadState === "error"
                ? "Nearby places are temporarily unavailable."
                : dataLoadState === "loading"
                  ? "Loading nearby places..."
                  : "No listings match this search yet."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function FilterChip({
  category,
  count,
  selectedCategory,
  onSelect,
}: {
  category: CategoryFilter;
  count: number;
  selectedCategory: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}) {
  const meta = categoryMeta[category];
  const selected = selectedCategory === category;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`flex min-h-14 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/15"
          : "border-slate-200 bg-white text-blue-950 hover:border-blue-200"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-white/15" : "bg-slate-50"
        }`}
        style={{ color: selected ? "white" : meta.color }}
      >
        <CategorySymbol icon={meta.icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-black">{meta.label}</span>
        <span className={selected ? "text-xs font-bold text-blue-100" : "text-xs font-bold text-slate-400"}>
          {count}
        </span>
      </span>
    </button>
  );
}

function ListingButton({
  listing,
  selected,
  onSelect,
}: {
  listing: MapListing;
  selected: boolean;
  onSelect: (listing: MapListing) => void;
}) {
  const meta = categoryMeta[listing.category];
  const hasMapPoint = listing.latitude !== null && listing.longitude !== null;

  return (
    <button
      type="button"
      onClick={() => onSelect(listing)}
      className={`group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${
        selected ? "bg-white shadow-md" : "hover:bg-white"
      }`}
    >
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-blue-50 shadow-sm">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Listing thumbnails are external public/imported URLs.
          <img
            src={listing.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-white"
            style={{ backgroundColor: meta.color }}
          >
            <CategorySymbol icon={meta.icon} className="h-6 w-6" />
          </span>
        )}
        <span
          className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white"
          style={{ backgroundColor: meta.color }}
        >
          <CategorySymbol icon={meta.icon} className="h-3 w-3" />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-blue-700">
          {listing.title}
        </span>
        <span className="block truncate text-xs font-semibold text-slate-500">
          {listing.subtitle}
        </span>
        <span className="mt-1 flex items-center gap-1 text-xs font-black text-slate-600">
          {listing.rating ? (
            <>
              <span className="text-orange-400">
                <StarIcon />
              </span>
              <span>{listing.rating.toFixed(1)}</span>
              {listing.reviews ? (
                <span className="font-semibold text-slate-400">({listing.reviews})</span>
              ) : null}
            </>
          ) : (
            <span className="text-slate-400">
              {hasMapPoint ? readableCategoryLabel(listing.category) : "Listed nearby"}
            </span>
          )}
        </span>
      </span>
      <span
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md sm:flex"
        style={{ backgroundColor: meta.color }}
      >
        <CategorySymbol icon={meta.icon} className="h-4 w-4" />
      </span>
    </button>
  );
}
