import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_GUIDES } from "@/lib/seo/marketing-data";

export const metadata: Metadata = {
  title: "FCA Compliance Guides",
  description:
    "Step-by-step FCA compliance guides covering authorisation, monitoring plans, safeguarding, and governance.",
  alternates: { canonical: "/resources/guides" },
  openGraph: {
    title: "FCA Compliance Guides",
    description:
      "Step-by-step FCA compliance guides covering authorisation, monitoring plans, safeguarding, and governance.",
    url: "/resources/guides",
  },
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Guides", path: "/resources/guides" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Guides
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">FCA Compliance Guides</h1>
          <p className="mt-4 text-lg text-slate-300">
            Practical playbooks for authorisation, monitoring, safeguarding, and governance.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {RESOURCE_GUIDES.map((guide) => (
            <Card key={guide.slug} className="border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">{guide.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{guide.seoDescription}</p>
              <Button asChild className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600">
                <Link href={`/resources/guides/${guide.slug}`}>Read guide</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
