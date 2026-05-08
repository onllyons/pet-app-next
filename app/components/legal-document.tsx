import Link from "next/link";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  intro: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export function LegalDocument({
  eyebrow,
  title,
  intro,
  effectiveDate,
  sections,
}: LegalDocumentProps) {
  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:px-8 sm:py-20">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          {eyebrow}
        </p>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            {intro}
          </p>
        </div>
        <p className="text-sm text-slate-500">Effective date: {effectiveDate}</p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
        <p>
          This page contains placeholder legal content for PetBuddy and should
          be reviewed with your legal team before production use.
        </p>
        <p className="mt-2">
          Related pages:{" "}
          <Link className="font-medium text-sky-700 hover:text-sky-800" href="/">
            Home
          </Link>
          ,{" "}
          <Link
            className="font-medium text-sky-700 hover:text-sky-800"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          ,{" "}
          <Link
            className="font-medium text-sky-700 hover:text-sky-800"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
          ,{" "}
          <Link
            className="font-medium text-sky-700 hover:text-sky-800"
            href="/delete-data"
          >
            Delete Data
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
