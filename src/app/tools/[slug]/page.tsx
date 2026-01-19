import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { TOOLS } from "@/lib/seo/marketing-data";

type PageProps = { params: Promise<{ slug: string }> };

const TOOL_DETAILS: Record<
  string,
  {
    summary: string;
    highlights: string[];
    steps: string[];
    outcomes: string[];
  }
> = {
  "smcr-responsibilities-map": {
    summary:
      "Build a responsibilities map aligned to FCA expectations with clear accountability, approval workflows, and evidence trails.",
    highlights: [
      "Role-to-responsibility mapping with approvals.",
      "Version history and audit-ready sign-offs.",
      "Exportable map for governance packs and regulators.",
    ],
    steps: [
      "Capture senior manager roles and responsibilities.",
      "Align shared responsibilities with approvals.",
      "Generate map outputs and evidence packs.",
    ],
    outcomes: ["Clear accountability", "SM&CR-ready evidence", "Faster governance approvals"],
  },
};

const TOOL_LINKS: Record<
  string,
  {
    feature: { label: string; href: string };
    solution: { label: string; href: string };
    audience: { label: string; href: string };
  }
> = {
  "smcr-responsibilities-map": {
    feature: { label: "SM&CR Management", href: "/features/smcr-management" },
    solution: { label: "SM&CR", href: "/solutions/smcr" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
};

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    return {
      title: "Tool",
      description: "Nasara Connect compliance tool.",
    };
  }

  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url: `/tools/${tool.slug}`,
    },
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = TOOLS.find((item) => item.slug === slug);
  if (!tool) {
    notFound();
  }

  const details = TOOL_DETAILS[tool.slug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: tool.title, path: `/tools/${tool.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Tool
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{tool.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{tool.seoDescription}</p>
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

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-semibold text-white">Overview</h2>
            <p className="mt-3 text-sm text-slate-300">{details?.summary ?? tool.seoDescription}</p>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.highlights ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">How it works</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.steps ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Outcomes</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.outcomes ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {TOOL_LINKS[tool.slug] && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold text-white">Related workflows</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { kind: "Feature", ...TOOL_LINKS[tool.slug].feature },
                { kind: "Solution", ...TOOL_LINKS[tool.slug].solution },
                { kind: "Audience", ...TOOL_LINKS[tool.slug].audience },
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
