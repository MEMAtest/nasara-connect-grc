import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { CASE_STUDIES } from "@/lib/seo/marketing-data";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real examples of FCA-regulated firms using Nasara Connect to deliver authorisation, SM&CR, and monitoring outcomes.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "Case Studies",
    description:
      "Real examples of FCA-regulated firms using Nasara Connect to deliver authorisation, SM&CR, and monitoring outcomes.",
    url: "/case-studies",
  },
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Case Studies
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Customer outcomes</h1>
          <p className="mt-4 text-lg text-slate-300">
            See how compliance teams reduce regulatory risk and accelerate audit readiness.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {CASE_STUDIES.map((study) => (
            <Card key={study.slug} className="border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">{study.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{study.seoDescription}</p>
              <Link
                href={`/case-studies/${study.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Read case study
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
