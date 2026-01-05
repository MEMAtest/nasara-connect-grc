import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/landing/Navigation";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const moduleLinks = [
  {
    title: "SM&CR Management",
    description: "Map responsibilities, track certifications, and evidence conduct rules training.",
    href: "/features/smcr-management",
  },
  {
    title: "Compliance Monitoring",
    description: "Design CMP schedules, run tests, and produce board-ready reporting packs.",
    href: "/features/compliance-monitoring",
  },
  {
    title: "Policy Management",
    description: "Manage policy lifecycle, approvals, attestations, and evidence trails.",
    href: "/features/policy-management",
  },
  {
    title: "Risk Assessment",
    description: "Centralise risk registers, controls testing, and remediation tracking.",
    href: "/features/risk-assessment",
  },
  {
    title: "Consumer Duty",
    description: "Evidence outcomes, MI, and fair value assessments in one workflow.",
    href: "/solutions/consumer-duty",
  },
  {
    title: "Safeguarding",
    description: "Automate daily reconciliation and audit-ready safeguarding evidence.",
    href: "/solutions/safeguarding",
  },
];

const evidenceHighlights = [
  {
    title: "Governance trail",
    description: "Record approvals, ownership, and decision history across policies and controls.",
  },
  {
    title: "Risk & control evidence",
    description: "Link risks, controls, testing, and remediation in a single source of truth.",
  },
  {
    title: "Board reporting",
    description: "Generate governance packs with outcomes, MI, and compliance status updates.",
  },
];

const audiences = [
  "FCA-regulated fintechs and payments firms",
  "Banks, credit unions, and building societies",
  "Investment managers and advisory firms",
  "Insurance brokers and intermediaries",
  "Compliance and risk leadership teams",
];

export const metadata: Metadata = {
  title: "Governance, Risk & Compliance Platform for FCA-Regulated Firms",
  description:
    "Unify governance, risk, and compliance workflows with Nasara Connect. Manage SM&CR, policies, CMP, and evidence in one FCA-ready platform.",
  alternates: { canonical: "/grc-platform" },
  openGraph: {
    title: "Governance, Risk & Compliance Platform for FCA-Regulated Firms",
    description:
      "Unify governance, risk, and compliance workflows with Nasara Connect. Manage SM&CR, policies, CMP, and evidence in one FCA-ready platform.",
    url: "/grc-platform",
  },
};

export default function GrcPlatformPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Governance, Risk & Compliance", path: "/grc-platform" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Governance, Risk &amp; Compliance
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Governance, Risk &amp; Compliance platform for FCA-regulated firms
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Nasara Connect unifies governance, risk, and compliance workflows so your team can
            evidence oversight, reduce regulatory gaps, and stay audit-ready.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a demo</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-200">
              <Link href="/features">Explore platform features</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Governance control</h2>
            <p className="mt-2 text-sm text-slate-400">
              Align ownership, approvals, and accountability across policies, training, and oversight.
            </p>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Risk visibility</h2>
            <p className="mt-2 text-sm text-slate-400">
              Connect risk registers, controls testing, and remediation in one integrated workflow.
            </p>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-white">Compliance evidence</h2>
            <p className="mt-2 text-sm text-slate-400">
              Capture monitoring evidence, attestations, and reporting packs aligned to FCA expectations.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-white">
            Modules mapped to governance, risk, and compliance outcomes
          </h2>
            <p className="text-slate-400">
              Each workflow ties directly to FCA outcomes and provides evidence for audits and board reporting.
            </p>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {moduleLinks.map((module) => (
              <Link key={module.title} href={module.href} className="block">
                <Card className="h-full border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/50 transition-all">
                  <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                  <p className="mt-3 text-sm text-slate-400">{module.description}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-emerald-400">
                    Explore module
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold text-white">Evidence &amp; audit readiness</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {evidenceHighlights.map((item) => (
              <Card key={item.title} className="border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-white">Who it&apos;s for</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {audiences.map((item) => (
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

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <Card className="border-slate-800 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white">
            Ready to unify your governance, risk, and compliance workflows?
          </h2>
            <p className="mt-3 text-slate-400">
              See how Nasara Connect brings governance, risk, and compliance together for FCA teams.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
                <Link href="/request-demo">Request a demo</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-700 text-slate-200">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
