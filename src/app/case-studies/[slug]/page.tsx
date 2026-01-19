import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { CASE_STUDIES } from "@/lib/seo/marketing-data";

type PageProps = { params: Promise<{ slug: string }> };

const CASE_STUDY_DETAILS: Record<
  string,
  {
    summary: string;
    challenges: string[];
    solution: string[];
    outcomes: string[];
    modules: string[];
  }
> = {
  "emi-authorisation-pack": {
    summary:
      "A payments-focused EMI needed a structured authorisation pack that would satisfy FCA expectations without slowing product launch timelines.",
    challenges: [
      "Fragmented ownership of FCA-required documentation.",
      "Unclear approval workflow for policies and governance packs.",
      "Difficulty evidencing readiness across controls and procedures.",
    ],
    solution: [
      "Built a guided authorisation pack with readiness checkpoints.",
      "Aligned policy drafts and governance approvals in a shared workflow.",
      "Mapped evidence packs to FCA submission requirements.",
    ],
    outcomes: [
      "Submission-ready authorisation pack with clear ownership.",
      "Reduced rework through gap analysis and checkpoints.",
      "Audit-friendly evidence trail for governance decisions.",
    ],
    modules: ["Authorization Pack", "Policy Management", "Compliance Monitoring"],
  },
  "smcr-implementation": {
    summary:
      "A mid-size firm needed to implement SM&CR responsibilities mapping, certification tracking, and conduct rules evidence.",
    challenges: [
      "Disjointed Statements of Responsibilities and accountability gaps.",
      "Manual certification tracking across teams and roles.",
      "Limited visibility into conduct rules training evidence.",
    ],
    solution: [
      "Structured SoR workflows with responsibilities mapping.",
      "Automated certification renewal reminders and approvals.",
      "Centralised conduct rules attestations with audit trails.",
    ],
    outcomes: [
      "Clear accountability across senior managers and functions.",
      "Consistent certification evidence with renewal coverage.",
      "Board-ready SM&CR reporting packs.",
    ],
    modules: ["SM&CR Management", "Training Library", "Policy Management"],
  },
  "cmp-automation": {
    summary:
      "A compliance monitoring team needed to scale testing and reporting for their annual monitoring plan.",
    challenges: [
      "Manual scheduling and tracking of monitoring tests.",
      "Inconsistent evidence capture across functions.",
      "Delayed board reporting and remediation follow-up.",
    ],
    solution: [
      "Built a CMP workflow with structured tests and cadences.",
      "Centralised evidence capture for testing outcomes.",
      "Generated reporting packs for governance committees.",
    ],
    outcomes: [
      "Consistent monitoring delivery with clear ownership.",
      "Faster remediation tracking and issue visibility.",
      "Governance-ready reporting with audit trails.",
    ],
    modules: ["Compliance Monitoring", "Risk Assessment", "Evidence Library"],
  },
};

const MODULE_LINKS: Record<string, string> = {
  "Authorization Pack": "/features/authorization-pack",
  "Policy Management": "/features/policy-management",
  "Compliance Monitoring": "/features/compliance-monitoring",
  "SM&CR Management": "/features/smcr-management",
  "Training Library": "/features/training-library",
  "Risk Assessment": "/features/risk-assessment",
};

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) {
    return {
      title: "Case Study",
      description: "Nasara Connect case study.",
    };
  }

  return {
    title: study.seoTitle,
    description: study.seoDescription,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      title: study.seoTitle,
      description: study.seoDescription,
      url: `/case-studies/${study.slug}`,
    },
  };
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) {
    notFound();
  }

  const details = CASE_STUDY_DETAILS[study.slug];
  const related = CASE_STUDIES.filter((item) => item.slug !== study.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
          { name: study.title, path: `/case-studies/${study.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Case Study
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{study.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{study.seoDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a demo</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/case-studies">Back to case studies</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl font-semibold text-white">Overview</h2>
            <p className="mt-3 text-sm text-slate-300">{details?.summary ?? study.seoDescription}</p>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Challenges</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.challenges ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Solution delivered</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.solution ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
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
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Modules used</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {(details?.modules ?? []).map((item) => (
                <li key={item} className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  {MODULE_LINKS[item] ? (
                    <Link href={MODULE_LINKS[item]} className="hover:text-emerald-300">
                      {item}
                    </Link>
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-white">Related case studies</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/case-studies/${item.slug}`} className="hover:text-emerald-300">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
}
