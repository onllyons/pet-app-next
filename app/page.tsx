import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-8 sm:py-20">
      <section className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            PetBuddy
          </p>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Simple pet account support pages for verification and trust.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              PetBuddy is a lightweight companion site for app verification,
              policy review, and account support. This static Next.js site is
              designed to deploy cleanly on Vercel with no authentication, no
              backend, and no operational overhead.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Review Privacy Policy
            </Link>
            <Link
              href="/delete-data"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Delete Data Information
            </Link>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-slate-50 p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Website</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                pet-buddy.pet
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Use case</p>
              <p className="mt-1 text-base leading-7 text-slate-700">
                Facebook and Google app verification, basic legal disclosures,
                and support guidance for users requesting account-related
                actions.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Contact</p>
              <p className="mt-1 text-base text-slate-700">
                privacy@pet-buddy.pet
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Privacy-first placeholder content
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Structured legal copy is included so your team can quickly revise
            real policies without rebuilding the site.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Static and deployment-friendly
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The site uses only static informational pages, making it fast,
            lightweight, and suitable for straightforward Vercel deployment.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Clear account support path
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The delete-data page explains how users can request deletion or
            revoke app permissions in a format reviewers expect to see.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-sky-50 p-8 sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Quick links
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
              Use the pages below for review, verification, and future legal
              editing.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/privacy-policy"
              className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/delete-data"
              className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline"
            >
              Delete Data
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
