import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, FileText, Activity, Users } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Security & Data Protection",
  description:
    "Review Nasara Connect security controls, audit logging, and governance features built for FCA-regulated firms.",
  alternates: { canonical: "/security" },
  openGraph: {
    title: "Security & Data Protection",
    description:
      "Review Nasara Connect security controls, audit logging, and governance features built for FCA-regulated firms.",
    url: "/security",
  },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Security", path: "/security" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Security & Data Protection
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Security built for regulated teams</h1>
          <p className="mt-4 text-lg text-slate-300">
            Nasara Connect provides governance-grade controls, audit trails, and access management
            designed for FCA-regulated firms.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">
                Request a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-200">
              <Link href="/contact">Contact security</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <Lock className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Access controls</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Role-based permissions, MFA-ready authentication, and approval workflows for sensitive actions.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Audit-ready logging</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Immutable activity trails, approvals, and evidence logs across policies, monitoring, and workflows.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <FileText className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Data governance</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Clear retention policies, exportable evidence packs, and secure document handling.
            </p>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Monitoring & response</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Continuous monitoring for system health, audit exports, and exception tracking.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Incident response and escalation workflows are documented for regulated teams.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <Users className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Vendor oversight</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Third-party controls, data processing transparency, and regulatory readiness for audits.
            </p>
            <Button asChild variant="outline" className="mt-4 border-slate-700 text-slate-200">
              <Link href="/resources/guides/compliance-monitoring-plan-template">View compliance guide</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
