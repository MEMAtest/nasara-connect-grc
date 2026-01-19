import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_GUIDES } from "@/lib/seo/marketing-data";

type PageProps = { params: Promise<{ slug: string }> };

const RELATED_LINKS: Record<
  string,
  {
    feature: { label: string; href: string };
    solution: { label: string; href: string };
    audience: { label: string; href: string };
  }
> = {
  "fca-authorisation-checklist": {
    feature: { label: "Authorization Pack", href: "/features/authorization-pack" },
    solution: { label: "FCA Authorisation", href: "/solutions/fca-authorisation" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
  "compliance-monitoring-plan-template": {
    feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
    solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
  "safeguarding-reconciliation-guide": {
    feature: { label: "Safeguarding", href: "/features/safeguarding" },
    solution: { label: "Safeguarding", href: "/solutions/safeguarding" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
};

function getHighlights(slug: string) {
  switch (slug) {
    case "fca-authorisation-checklist":
      return [
        "Governance and ownership evidence",
        "Policies, procedures, and controls",
        "Capital and financial resources planning",
        "Application pitfalls that delay approvals",
      ];
    case "compliance-monitoring-plan-template":
      return [
        "Scope, cadence, and ownership",
        "Testing workflows and evidence capture",
        "Reporting to board committees",
        "Remediation tracking",
      ];
    case "safeguarding-reconciliation-guide":
      return [
        "Daily reconciliation steps",
        "Safeguarding control design",
        "Exception handling playbooks",
        "Evidence for audits",
      ];
    default:
      return ["Regulatory expectations", "Evidence collection", "Governance reporting", "Practical checklists"];
  }
}

export function generateStaticParams() {
  return RESOURCE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = RESOURCE_GUIDES.find((item) => item.slug === slug);
  if (!guide) {
    return {
      title: "Guide",
      description: "Nasara Connect compliance guide.",
    };
  }

  return {
    title: guide.seoTitle,
    description: guide.seoDescription,
    alternates: { canonical: `/resources/guides/${guide.slug}` },
    openGraph: {
      title: guide.seoTitle,
      description: guide.seoDescription,
      url: `/resources/guides/${guide.slug}`,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = RESOURCE_GUIDES.find((item) => item.slug === slug);
  if (!guide) {
    notFound();
  }

  const highlights = getHighlights(guide.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides", path: "/resources/guides" },
          { name: guide.title, path: `/resources/guides/${guide.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Guide
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{guide.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{guide.seoDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a walkthrough</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources">Back to resources</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold text-white">What you will cover</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {highlights.map((item) => (
              <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {RELATED_LINKS[guide.slug] && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white">Related workflows</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { kind: "Feature", ...RELATED_LINKS[guide.slug].feature },
                { kind: "Solution", ...RELATED_LINKS[guide.slug].solution },
                { kind: "Audience", ...RELATED_LINKS[guide.slug].audience },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <Card className="border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/60 transition-colors">
                    <span className="text-xs uppercase tracking-wide text-slate-400">{item.kind}</span>
                    <h3 className="mt-2 text-base font-semibold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Explore the {item.kind.toLowerCase()} workflow.
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
