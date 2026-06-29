/* eslint-disable @next/next/no-img-element -- Static SVGs in /public are intentionally served directly for this export-only marketing site. */
import Link from "next/link";
import { RealFindMap } from "./real-find-map";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
];

const heroBullets = [
  "Dog friendly parks, restaurants and stays",
  "Pet sitters, walkers and trainers nearby",
  "Health records, reminders and vet visits",
  "Events, experiences and community",
];

type FeatureTone = "green" | "blue" | "orange" | "sky" | "purple";

const featureToneClasses: Record<FeatureTone, { icon: string; text: string }> = {
  green: { icon: "bg-green-600", text: "text-green-700" },
  blue: { icon: "bg-blue-600", text: "text-blue-700" },
  orange: { icon: "bg-orange-500", text: "text-orange-600" },
  sky: { icon: "bg-sky-500", text: "text-sky-700" },
  purple: { icon: "bg-violet-600", text: "text-violet-700" },
};

const features: Array<{
  title: string;
  body: string;
  cta: string;
  tone: FeatureTone;
}> = [
  {
    title: "Dog Friendly Places",
    body: "Discover parks, restaurants, cafes and stays that welcome pets.",
    cta: "Explore places",
    tone: "green",
  },
  {
    title: "Pet Sitters & Trainers",
    body: "Find trusted sitters, walkers and certified trainers near you.",
    cta: "Book care",
    tone: "blue",
  },
  {
    title: "Health & Records",
    body: "Store vaccines, medication notes, reminders and visit history.",
    cta: "View records",
    tone: "orange",
  },
  {
    title: "Tele Vet 24/7",
    body: "Talk to a licensed vet by video when your pet needs help.",
    cta: "Connect now",
    tone: "sky",
  },
  {
    title: "Events & Community",
    body: "Join local meetups, pet events and friendly community moments.",
    cta: "View events",
    tone: "purple",
  },
];

const vendorTypes = [
  "Parks & recreation",
  "Restaurants & cafes",
  "Pet friendly stays",
  "Pet care services",
  "Trainers & walkers",
  "Shops & boutiques",
  "Veterinary clinics",
  "Event organizers",
  "Experience providers",
];

const vendorBenefits = [
  "Reach pet parents actively looking for your services.",
  "Showcase your location, photos, reviews and offers.",
  "Build loyalty with repeat bookings and local discovery.",
  "Grow traffic from one pet-focused platform.",
];

function PawIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M8.3 10.1c1.2-.3 1.8-1.8 1.4-3.5C9.3 4.9 8.1 3.8 6.9 4.1c-1.2.3-1.8 1.8-1.4 3.5.4 1.7 1.6 2.8 2.8 2.5Zm7.4 0c1.2.3 2.4-.8 2.8-2.5.4-1.7-.2-3.2-1.4-3.5-1.2-.3-2.4.8-2.8 2.5-.4 1.7.2 3.2 1.4 3.5ZM4.8 14c1.1-.4 1.5-1.9.9-3.4-.6-1.5-1.9-2.4-3-2-1.1.4-1.5 1.9-.9 3.4.6 1.5 1.9 2.4 3 2Zm14.4 0c1.1.4 2.4-.5 3-2 .6-1.5.2-3-1-3.4-1.1-.4-2.4.5-3 2-.6 1.5-.1 3 1 3.4Zm-2.4 6c1.4 0 2.2-1.1 1.8-2.5-.7-2.5-3.3-5.2-6.6-5.2s-5.9 2.7-6.6 5.2c-.4 1.4.4 2.5 1.8 2.5 1.6 0 2.7-.9 4.8-.9s3.2.9 4.8.9Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function StoreBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a href="#" aria-label="Download HappyPaws on the App Store">
        <img
          src="/happypaws-app-store.svg"
          alt="Download on the App Store"
          width={166}
          height={50}
          className="h-11 w-auto"
        />
      </a>
      <a href="#" aria-label="Get HappyPaws on Google Play">
        <img
          src="/happypaws-google-play.svg"
          alt="Get it on Google Play"
          width={174}
          height={50}
          className="h-11 w-auto"
        />
      </a>
    </div>
  );
}

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="HappyPaws logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl object-cover"
          />
          <span className="text-2xl font-black tracking-tight text-blue-950">
            Happy<span className="text-blue-600">Paws</span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-sm font-semibold text-blue-950 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="#download"
          className="hidden items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
        >
          <PawIcon className="h-4 w-4" />
          Download App
        </a>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:pb-16 lg:pt-14">
      <div className="space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          <PawIcon className="h-4 w-4" />
          One app for everyday pet care
        </div>

        <div className="space-y-5">
          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-blue-950 sm:text-6xl lg:text-7xl">
            Everything for a{" "}
            <span className="text-blue-600">happier life</span> with your{" "}
            <span className="text-green-700">pet.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Find pet-friendly places, trusted care, health records, events and
            licensed vets in one premium platform built for pet parents.
          </p>
        </div>

        <ul className="grid max-w-2xl gap-3 text-sm font-semibold text-blue-950 sm:grid-cols-2">
          {heroBullets.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <PawIcon className="h-4 w-4" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <StoreBadges />
      </div>

      <div className="relative">
        <div className="absolute -right-6 top-10 hidden h-32 w-32 rounded-full bg-orange-100 blur-2xl lg:block" />
        <div className="absolute -left-6 bottom-8 hidden h-40 w-40 rounded-full bg-green-100 blur-2xl lg:block" />
        <img
          src="/happypaws-hero-pets.png"
          alt="Dog and cat enjoying a pet friendly city park"
          width={780}
          height={560}
          className="relative w-full rounded-[2.2rem]"
        />
      </div>
    </section>
  );
}

export function PlacesSection() {
  return (
    <section id="how-it-works" className="px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-950/5 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-600">
              Explore nearby
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
              Find dog friendly places near you
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            Visual preview only. Search, maps and filters will connect in a
            later product phase.
          </p>
        </div>

        <RealFindMap />
      </div>
    </section>
  );
}

export function FeatureCard({
  title,
  body,
  cta,
  tone,
}: {
  title: string;
  body: string;
  cta: string;
  tone: FeatureTone;
}) {
  const colors = featureToneClasses[tone];

  return (
    <article className="group rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-lg shadow-blue-950/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="mb-5 overflow-hidden rounded-[1.25rem] bg-blue-50">
        <div className="relative h-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.9),transparent_35%),linear-gradient(135deg,#dff3ff,#eaf8ee)]" />
          <div className={`absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${colors.icon}`}>
            <PawIcon className="h-7 w-7" />
          </div>
          <div className="absolute bottom-4 right-5 h-20 w-28 rounded-[1.3rem] bg-white/70" />
          <div className="absolute bottom-7 right-9 h-8 w-20 rounded-full bg-orange-200/80" />
        </div>
      </div>
      <h3 className={`text-lg font-black ${colors.text}`}>{title}</h3>
      <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{body}</p>
      <a
        href="#"
        className={`mt-5 inline-flex items-center gap-2 text-sm font-black ${colors.text}`}
      >
        {cta}
        <ArrowIcon />
      </a>
    </article>
  );
}

export function FeaturesGrid() {
  return (
    <section id="features" className="px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-600">
              Platform features
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
              One place for every pet moment
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-600">
            These cards are visual placeholders for the first public marketing
            phase. Product actions will be wired later.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function VendorSection() {
  return (
    <section className="bg-blue-50/70 px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-blue-600">
            Business partners
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-5xl">
            Partner with HappyPaws
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            Join pet friendly businesses growing reach, building loyalty and
            making everyday life easier for local pet parents.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-lg shadow-blue-950/5">
              <h3 className="text-xl font-black text-blue-950">Vendor types</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {vendorTypes.map((type) => (
                  <div key={type} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                      <PawIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-extrabold text-blue-950">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-lg shadow-blue-950/5">
              <h3 className="text-xl font-black text-blue-950">
                Business benefits
              </h3>
              <div className="mt-5 space-y-4">
                {vendorBenefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <PawIcon className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-6 text-slate-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-xl shadow-blue-950/10">
            <div className="relative overflow-hidden rounded-[1.35rem] bg-blue-950 p-6 text-white">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/30 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-400/20 blur-2xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold">
                  <PawIcon className="h-4 w-4" />
                  Vendor growth
                </span>
                <h3 className="mt-24 max-w-sm text-3xl font-black tracking-tight">
                  Ready to grow your pet friendly business?
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-blue-100">
                  Create a public business presence and connect with the pet
                  parents already searching for places, care and experiences.
                </p>
              </div>
            </div>
            <a
              href="#"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Sign Up Your Business
              <PawIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FooterCTA() {
  return (
    <section id="download" className="bg-blue-700 px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10">
            <PawIcon className="h-9 w-9" />
          </span>
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              More tail wags. Less stress.
            </h2>
            <p className="mt-2 text-blue-100">
              Download HappyPaws and enjoy every pet moment together.
            </p>
          </div>
        </div>
        <StoreBadges />
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-600 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p>Copyright 2026 HappyPaws. Public marketing and support website.</p>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-blue-700" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="transition hover:text-blue-700" href="/terms-of-service">
            Terms of Service
          </Link>
          <Link className="transition hover:text-blue-700" href="/delete-data">
            Delete Data
          </Link>
        </div>
      </div>
    </footer>
  );
}
