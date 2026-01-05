import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_TEMPLATES } from "@/lib/seo/marketing-data";

type PageProps = { params: Promise<{ slug: string }> };

const TEMPLATE_LINKS: Record<
  string,
  {
    feature: { label: string; href: string };
    solution: { label: string; href: string };
    audience: { label: string; href: string };
  }
> = {
  "complaints-response-pack": {
    feature: { label: "Policy Management", href: "/features/policy-management" },
    solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
    audience: { label: "Consumer Finance", href: "/audience/consumer" },
  },
  "consumer-duty-mi-pack": {
    feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
    solution: { label: "Consumer Duty", href: "/solutions/consumer-duty" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
};

function getTemplateHighlights(slug: string) {
  switch (slug) {
    case "complaints-response-pack":
      return [
        "Acknowledgment and holding response templates",
        "Final response letters aligned to DISP",
        "PSD and non-PSD timelines",
        "FOS referral wording",
      ];
    case "consumer-duty-mi-pack":
      return [
        "Outcome metrics and targets",
        "Fair value assessment fields",
        "Governance summary tables",
        "Board-ready reporting layout",
      ];
    default:
      return ["FCA-aligned formatting", "Editable sections", "Audit-ready evidence prompts"];
  }
}

export function generateStaticParams() {
  return RESOURCE_TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = RESOURCE_TEMPLATES.find((item) => item.slug === slug);
  if (!template) {
    return {
      title: "Template",
      description: "Nasara Connect compliance template.",
    };
  }

  return {
    title: template.seoTitle,
    description: template.seoDescription,
    alternates: { canonical: `/resources/templates/${template.slug}` },
    openGraph: {
      title: template.seoTitle,
      description: template.seoDescription,
      url: `/resources/templates/${template.slug}`,
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = RESOURCE_TEMPLATES.find((item) => item.slug === slug);
  if (!template) {
    notFound();
  }

  const highlights = getTemplateHighlights(template.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Templates", path: "/resources/templates" },
          { name: template.title, path: `/resources/templates/${template.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Template
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{template.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{template.seoDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a walkthrough</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-200">
              <Link href="/resources/templates">Back to templates</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-semibold text-white">Template sections</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {highlights.map((item) => (
              <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {TEMPLATE_LINKS[template.slug] && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white">Related workflows</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { kind: "Feature", ...TEMPLATE_LINKS[template.slug].feature },
                { kind: "Solution", ...TEMPLATE_LINKS[template.slug].solution },
                { kind: "Audience", ...TEMPLATE_LINKS[template.slug].audience },
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
    </div>
  );
}
