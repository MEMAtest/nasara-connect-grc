import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import type { MarketingPage } from "@/lib/seo/marketing-data";
import { FEATURE_PAGES, SOLUTION_PAGES, RESOURCE_GUIDES } from "@/lib/seo/marketing-data";

type DetailVariant = "feature" | "solution";

export function MarketingDetailPage({
  page,
  variant,
}: {
  page: MarketingPage;
  variant: DetailVariant;
}) {
  const relatedFeatures = FEATURE_PAGES.filter((item) => item.slug !== page.slug).slice(0, 3);
  const relatedSolutions = SOLUTION_PAGES.filter((item) => item.slug !== page.slug).slice(0, 3);
  const relatedResources = RESOURCE_GUIDES.slice(0, 2);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navigation variant="solid" />

      <section className="relative px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            {variant === "feature" ? "Platform Feature" : "Compliance Solution"}
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{page.h1}</h1>
          <p className="mt-4 text-lg text-slate-300">{page.summary}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {page.outcomes.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href={page.ctaHref}>{page.ctaLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {page.highlights.map((item) => (
            <Card key={item.title} className="border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-white">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {page.steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
                <h3 className="text-base font-semibold text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-white">Who it helps</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {page.audiences.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-white">Related features</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {relatedFeatures.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/features/${item.slug}`} className="hover:text-emerald-300">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-white">Related solutions</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {relatedSolutions.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/solutions/${item.slug}`} className="hover:text-emerald-300">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-lg font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {relatedResources.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/resources/guides/${item.slug}`} className="hover:text-emerald-300">
                      {item.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/resources" className="hover:text-emerald-300">
                    View all resources
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
