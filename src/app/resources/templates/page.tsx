import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_TEMPLATES } from "@/lib/seo/marketing-data";
import {
  FileText,
  CheckSquare,
  Shield,
  BarChart3,
  ArrowRight,
  Users,
  ClipboardList,
} from "lucide-react";

export const metadata: Metadata = {
  title: "FCA Compliance Templates",
  description:
    "Downloadable templates for complaints, Consumer Duty MI, vulnerable customers, and compliance monitoring aligned to FCA expectations.",
  alternates: { canonical: "/resources/templates" },
  openGraph: {
    title: "FCA Compliance Templates",
    description:
      "Downloadable templates for complaints, Consumer Duty MI, vulnerable customers, and compliance monitoring aligned to FCA expectations.",
    url: "/resources/templates",
  },
};

// Template-specific metadata for enhanced cards
const TEMPLATE_META: Record<
  string,
  {
    icon: typeof FileText;
    itemCount: number;
    categories: string[];
    highlight: string;
  }
> = {
  "complaints-response-pack": {
    icon: FileText,
    itemCount: 12,
    categories: ["Documents", "Checklists", "Governance"],
    highlight: "DISP-aligned response letters",
  },
  "consumer-duty-mi-pack": {
    icon: BarChart3,
    itemCount: 12,
    categories: ["Reporting", "Governance", "Checklists"],
    highlight: "Board-ready outcome tracking",
  },
  "vulnerable-customers-framework-pack": {
    icon: Users,
    itemCount: 14,
    categories: ["Documents", "Checklists", "Governance", "Reporting"],
    highlight: "TEXAS model vulnerability indicators",
  },
  "compliance-monitoring-plan-pack": {
    icon: ClipboardList,
    itemCount: 15,
    categories: ["Documents", "Checklists", "Governance", "Reporting"],
    highlight: "Full CMP lifecycle toolkit",
  },
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Templates", path: "/resources/templates" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Templates
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">FCA Compliance Template Packs</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
            Structured template packs for governance reporting, complaints handling, Consumer Duty MI,
            vulnerable customer frameworks, and compliance monitoring. Each pack includes detailed
            templates with implementation guidance.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {RESOURCE_TEMPLATES.map((template) => {
            const meta = TEMPLATE_META[template.slug];
            const Icon = meta?.icon || FileText;
            return (
              <Link
                key={template.slug}
                href={`/resources/templates/${template.slug}`}
                className="group"
              >
                <Card className="h-full border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {template.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">{template.seoDescription}</p>
                    </div>
                  </div>

                  {meta && (
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      {/* Highlight */}
                      <div className="flex items-center gap-2 mb-4">
                        <CheckSquare className="h-4 w-4 text-teal-400" />
                        <span className="text-sm text-teal-300">{meta.highlight}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                          {meta.itemCount} templates
                        </Badge>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.categories.map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="text-xs border-slate-700 text-slate-400"
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Interactive pack view with checklist mode
                    </span>
                    <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Need custom templates?</h2>
          <p className="mt-3 text-slate-300">
            Our team can help adapt these templates to your specific regulatory requirements and firm structure.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a walkthrough</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
