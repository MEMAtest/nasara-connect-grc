import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BLOG_POSTS } from "@/lib/seo/marketing-data";

export const metadata: Metadata = {
  title: "FCA Compliance Blog",
  description:
    "Regulatory insights, compliance checklists, and governance guidance for FCA-regulated firms.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "FCA Compliance Blog",
    description:
      "Regulatory insights, compliance checklists, and governance guidance for FCA-regulated firms.",
    url: "/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Blog & Insights
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Regulatory Insights</h1>
          <p className="mt-4 text-lg text-slate-300">
            Practical guidance for FCA authorisation, SM&CR, Consumer Duty, and safeguarding.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Card key={post.slug} className="border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{post.seoDescription}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Read article
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
