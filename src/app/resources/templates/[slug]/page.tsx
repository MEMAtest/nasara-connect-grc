import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
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
        "PSD and non-PSD timelines with escalation triggers",
        "FOS referral wording and signposting requirements",
        "Root cause analysis prompts and tracking fields",
        "Redress calculation guidance and templates",
        "Quality assurance checklists for response review",
        "Vulnerable customer consideration prompts",
      ];
    case "consumer-duty-mi-pack":
      return [
        "Outcome metrics and targets across all four Duty areas",
        "Fair value assessment fields with pricing comparators",
        "Governance summary tables for board and committee reporting",
        "Board-ready reporting layout with RAG status indicators",
        "Customer segmentation analysis templates",
        "Complaints and feedback trend tracking",
        "Product governance MI integration",
        "Consumer understanding measurement frameworks",
      ];
    default:
      return ["FCA-aligned formatting", "Editable sections", "Audit-ready evidence prompts"];
  }
}

function getTemplateFeatures(slug: string) {
  switch (slug) {
    case "complaints-response-pack":
      return {
        overview: "A comprehensive pack of response letter templates designed for FCA-regulated firms handling customer complaints under the Dispute Resolution (DISP) rules. Each template includes the required regulatory language, appropriate timelines, and guidance notes to ensure consistent, compliant responses.",
        keyBenefits: [
          "Reduce response drafting time with pre-approved templates",
          "Ensure regulatory compliance with built-in DISP requirements",
          "Maintain consistency across your complaints handling team",
          "Streamline quality assurance with standardised formats",
        ],
        includedItems: [
          "Acknowledgment letter (within 5 business days)",
          "Holding letter for complex complaints",
          "Final response - upheld complaint",
          "Final response - partially upheld complaint",
          "Final response - not upheld complaint",
          "Summary resolution communication",
          "FOS referral letter with required signposting",
          "Goodwill gesture letter",
        ],
        whoIsThisFor: [
          "Complaints handling teams in banks and building societies",
          "Consumer credit firms and lenders",
          "Insurance companies and brokers",
          "Investment firms with retail customers",
          "Payment service providers and EMIs",
        ],
      };
    case "consumer-duty-mi-pack":
      return {
        overview: "A structured MI pack designed to evidence Consumer Duty compliance through outcome-focused metrics. The template provides a framework for tracking, analysing, and reporting on customer outcomes across products and services, with board-ready summary views.",
        keyBenefits: [
          "Demonstrate Consumer Duty compliance to the FCA",
          "Identify outcome gaps before they become issues",
          "Provide clear governance reporting to board and committees",
          "Track fair value across product portfolios",
        ],
        includedItems: [
          "Executive summary dashboard template",
          "Products and services outcome tracker",
          "Price and value assessment matrix",
          "Consumer understanding metrics template",
          "Consumer support performance tracker",
          "Vulnerable customer outcome analysis",
          "Quarterly trend analysis template",
          "Annual board report structure",
        ],
        whoIsThisFor: [
          "Compliance teams responsible for Consumer Duty implementation",
          "Product governance functions",
          "Board members and committee chairs",
          "Risk and conduct oversight teams",
          "MI and reporting analysts",
        ],
      };
    default:
      return {
        overview: "A practical compliance template designed for FCA-regulated firms, featuring editable sections and audit-ready formatting.",
        keyBenefits: [
          "Save time with pre-built structures",
          "Ensure regulatory alignment",
          "Maintain audit-ready documentation",
        ],
        includedItems: [
          "Core template sections",
          "Guidance notes",
          "Example entries",
        ],
        whoIsThisFor: [
          "Compliance professionals",
          "Regulatory teams",
          "Governance functions",
        ],
      };
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
  const features = getTemplateFeatures(template.slug);

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
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources/templates">Back to templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">Overview</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">{features.overview}</p>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Key Benefits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.keyBenefits.map((benefit, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-slate-300">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">What&apos;s Included</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {features.includedItems.map((item, index) => (
              <li key={index} className="flex items-center gap-3 text-slate-300">
                <svg className="h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Template Sections Detail */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">Template Sections</h2>
          <ul className="mt-6 space-y-3">
            {highlights.map((item, index) => (
              <li key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-4 text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Who This Template Is For</h2>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <ul className="space-y-4">
              {features.whoIsThisFor.map((audience, index) => (
                <li key={index} className="flex items-center gap-3 text-slate-300">
                  <svg className="h-5 w-5 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {audience}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Ready to streamline your compliance?</h2>
          <p className="mt-3 text-slate-300">Get access to this template and explore how Nasara Connect can help your team.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request access</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      {TEMPLATE_LINKS[template.slug] && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white">Related Workflows</h2>
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

      <Footer />
    </div>
  );
}
