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
        "Governance structure and board composition requirements",
        "Policies, procedures, and controls documentation",
        "Capital adequacy and financial resources planning",
        "Business model articulation and regulatory narrative",
        "Senior management arrangements and SM&CR readiness",
        "Systems and controls framework evidence",
        "Consumer protection and fair treatment considerations",
        "Application pitfalls that commonly delay approvals",
      ];
    case "compliance-monitoring-plan-template":
      return [
        "Monitoring scope, cadence, and ownership assignment",
        "Risk-based prioritisation methodology",
        "Testing workflows and evidence capture processes",
        "Reporting to board and governance committees",
        "Issue escalation and remediation tracking",
        "Quality assurance and oversight controls",
        "Regulatory change management integration",
        "Annual review and continuous improvement",
      ];
    case "safeguarding-reconciliation-guide":
      return [
        "Daily reconciliation process and timing requirements",
        "Safeguarding account structure and management",
        "Break identification and classification protocols",
        "Exception handling and resolution playbooks",
        "Audit evidence and documentation standards",
        "Regulatory reporting and disclosure requirements",
        "Technology and automation considerations",
        "Governance oversight and escalation paths",
      ];
    default:
      return ["Regulatory expectations", "Evidence collection", "Governance reporting", "Practical checklists"];
  }
}

function getGuideFeatures(slug: string) {
  switch (slug) {
    case "fca-authorisation-checklist":
      return {
        overview: "A comprehensive guide to preparing your FCA authorisation application. This checklist covers all key areas the FCA assesses, from governance and ownership through to systems, controls, and consumer protection. Designed to help applicants avoid common pitfalls and reduce time to authorisation.",
        keyTopics: [
          "Understanding the FCA's assessment criteria and expectations",
          "Building a compelling regulatory business plan",
          "Demonstrating adequate governance and oversight",
          "Meeting capital and financial resources requirements",
          "Preparing for the assessment interview",
        ],
        chapters: [
          { title: "Scoping Your Application", description: "Identify the regulated activities and permissions you need based on your business model." },
          { title: "Governance Framework", description: "Structure your board, committees, and reporting lines to meet FCA expectations." },
          { title: "Senior Management", description: "Prepare SM&CR documentation including Statements of Responsibilities." },
          { title: "Policies and Procedures", description: "Develop the core policies required for your regulated activities." },
          { title: "Financial Resources", description: "Calculate capital requirements and demonstrate ongoing adequacy." },
          { title: "Systems and Controls", description: "Document your operational, technology, and financial crime controls." },
          { title: "Consumer Protection", description: "Address Consumer Duty requirements and customer outcome considerations." },
          { title: "Application Submission", description: "Navigate the Connect portal and manage the assessment process." },
        ],
        whoIsThisFor: [
          "Fintech founders preparing for FCA authorisation",
          "Compliance consultants supporting application projects",
          "Existing firms applying for variation of permission",
          "Legal teams advising on regulatory strategy",
          "Investors conducting regulatory due diligence",
        ],
      };
    case "compliance-monitoring-plan-template":
      return {
        overview: "A practical framework for building and running an effective Compliance Monitoring Plan (CMP). This guide helps compliance teams design monitoring activities that provide genuine assurance, create defensible evidence, and support governance reporting across the firm.",
        keyTopics: [
          "Establishing your compliance monitoring universe",
          "Risk-based prioritisation of monitoring activities",
          "Designing effective testing procedures",
          "Evidence capture and documentation standards",
          "Governance reporting and board engagement",
        ],
        chapters: [
          { title: "Monitoring Universe", description: "Map regulatory obligations to business activities requiring monitoring." },
          { title: "Risk Assessment", description: "Prioritise monitoring activities based on inherent risk and control effectiveness." },
          { title: "Testing Design", description: "Create monitoring procedures that generate meaningful compliance evidence." },
          { title: "Execution Framework", description: "Establish cadence, ownership, and quality assurance processes." },
          { title: "Evidence Management", description: "Document monitoring work to support audit and regulatory engagement." },
          { title: "Issue Tracking", description: "Manage findings through classification, remediation, and escalation." },
          { title: "Governance Reporting", description: "Present monitoring results to committees and the board effectively." },
          { title: "Continuous Improvement", description: "Review and enhance your CMP based on experience and regulatory change." },
        ],
        whoIsThisFor: [
          "Compliance monitoring teams",
          "Second line oversight functions",
          "Risk and compliance managers",
          "Internal audit teams reviewing compliance",
          "Board members overseeing compliance effectiveness",
        ],
      };
    case "safeguarding-reconciliation-guide":
      return {
        overview: "An operational guide to safeguarding reconciliation for electronic money institutions and payment service providers. This guide covers the daily reconciliation process, common causes of breaks, resolution procedures, and the evidence required to demonstrate compliance to the FCA.",
        keyTopics: [
          "Understanding safeguarding regulatory requirements",
          "Establishing robust reconciliation processes",
          "Identifying and resolving reconciliation breaks",
          "Maintaining audit-ready documentation",
          "Governance oversight of safeguarding controls",
        ],
        chapters: [
          { title: "Regulatory Framework", description: "Understand EMD2 and PSR safeguarding requirements for your firm." },
          { title: "Account Structure", description: "Design safeguarding account arrangements that meet regulatory expectations." },
          { title: "Daily Reconciliation", description: "Implement processes to identify breaks within required timeframes." },
          { title: "Break Classification", description: "Categorise breaks by cause and priority for appropriate resolution." },
          { title: "Resolution Procedures", description: "Address different break types through defined operational processes." },
          { title: "Automation Options", description: "Evaluate technology solutions for reconciliation efficiency." },
          { title: "Evidence and Records", description: "Maintain documentation that demonstrates control effectiveness." },
          { title: "Governance and Reporting", description: "Report safeguarding status to appropriate oversight forums." },
        ],
        whoIsThisFor: [
          "Safeguarding officers at EMIs and PIs",
          "Finance and treasury teams",
          "Compliance teams with safeguarding oversight",
          "Internal auditors reviewing safeguarding controls",
          "Operations managers responsible for reconciliation",
        ],
      };
    default:
      return {
        overview: "A practical compliance guide for FCA-regulated firms, covering regulatory expectations and evidence requirements.",
        keyTopics: [
          "Understanding regulatory expectations",
          "Building compliant processes",
          "Evidence and documentation",
        ],
        chapters: [
          { title: "Introduction", description: "Overview of the regulatory context." },
          { title: "Requirements", description: "Key compliance obligations." },
          { title: "Implementation", description: "Practical guidance for compliance." },
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
  const features = getGuideFeatures(guide.slug);

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

      {/* Overview Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">Overview</h2>
          <p className="mt-4 text-slate-300 leading-relaxed">{features.overview}</p>
        </div>
      </section>

      {/* Key Topics Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Key Topics Covered</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.keyTopics.map((topic, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-sm">{topic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide Chapters Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">Guide Contents</h2>
          <div className="mt-6 space-y-4">
            {features.chapters.map((chapter, index) => (
              <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{chapter.title}</h3>
                    <p className="mt-1 text-slate-400 text-sm">{chapter.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-white mb-6">What You&apos;ll Learn</h2>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <ul className="grid gap-3 md:grid-cols-2">
              {highlights.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-300">
                  <svg className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Who This Guide Is For</h2>
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
          <h2 className="text-2xl font-semibold text-white">Ready to put this guide into practice?</h2>
          <p className="mt-3 text-slate-300">See how Nasara Connect can help you implement these practices with structured workflows and evidence capture.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a demo</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      {RELATED_LINKS[guide.slug] && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-white">Related Workflows</h2>
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
