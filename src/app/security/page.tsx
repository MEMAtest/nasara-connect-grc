import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, ShieldCheck, FileText, Activity, Users, Award, CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
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
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
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
            <Button asChild variant="outline" className="mt-4 border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources/guides/compliance-monitoring-plan-template">View compliance guide</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Award className="h-3 w-3 mr-1" />
              Certifications
            </Badge>
            <h2 className="text-3xl font-bold text-white">Industry-Recognised Security Standards</h2>
            <p className="mt-2 text-slate-400">
              Our commitment to security is validated by independent certification bodies.
            </p>
          </div>

          <Card className="border-slate-800 bg-gradient-to-br from-slate-900/80 to-emerald-950/30 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Cyber Essentials Badge */}
              <div className="flex-shrink-0">
                <Image
                  src="/cyber-essentials-badge.svg"
                  alt="Cyber Essentials Certified Badge"
                  width={200}
                  height={80}
                  className="w-auto h-auto max-w-[200px]"
                />
              </div>

              {/* Certification Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">Cyber Essentials Certified</h3>
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-slate-300 mb-4">
                  Mema Technology Solutions Ltd (trading as Nasara Connect) has been independently assessed
                  and certified as meeting the requirements of the Cyber Essentials scheme, demonstrating
                  our commitment to protecting against common cyber threats.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Certified</p>
                    <p className="text-sm font-semibold text-white mt-1">23 Jan 2026</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Valid Until</p>
                    <p className="text-sm font-semibold text-white mt-1">23 Jan 2027</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Scope</p>
                    <p className="text-sm font-semibold text-white mt-1">Whole Organisation</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Certification Body</p>
                    <p className="text-sm font-semibold text-white mt-1">Blunt Security</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-4">
                  Certificate Number: f79c8215-9502-4432-aee0-9abe6e6df599
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
