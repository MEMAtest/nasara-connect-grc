import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/landing/Navigation";
import { Card } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BLOG_POSTS } from "@/lib/seo/marketing-data";

type PageProps = { params: Promise<{ slug: string }> };

const BLOG_LINKS: Record<
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
  "smcr-responsibilities-map": {
    feature: { label: "SM&CR Management", href: "/features/smcr-management" },
    solution: { label: "SM&CR", href: "/solutions/smcr" },
    audience: { label: "Banks & Credit", href: "/audience/banks" },
  },
  "compliance-monitoring-plan": {
    feature: { label: "Compliance Monitoring", href: "/features/compliance-monitoring" },
    solution: { label: "Compliance Monitoring Plan", href: "/solutions/compliance-monitoring-plan" },
    audience: { label: "Investment Firms", href: "/audience/investment" },
  },
  "consumer-duty-evidence": {
    feature: { label: "Policy Management", href: "/features/policy-management" },
    solution: { label: "Consumer Duty", href: "/solutions/consumer-duty" },
    audience: { label: "Consumer Finance", href: "/audience/consumer" },
  },
  "safeguarding-reconciliation-controls": {
    feature: { label: "Safeguarding", href: "/features/safeguarding" },
    solution: { label: "Safeguarding", href: "/solutions/safeguarding" },
    audience: { label: "Fintech & Payments", href: "/audience/fintech" },
  },
  "crypto-financial-promotions": {
    feature: { label: "Financial Promotions", href: "/features/financial-promotions" },
    solution: { label: "Financial Promotions", href: "/solutions/financial-promotions-compliance" },
    audience: { label: "Crypto & Digital Assets", href: "/audience/crypto" },
  },
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) {
    return {
      title: "Blog",
      description: "Nasara Connect insights.",
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) {
    notFound();
  }

  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-3xl">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Compliance insight
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{post.seoDescription}</p>
          <div className="mt-6 text-sm text-slate-400">
            Published by Nasara Connect · Updated monthly
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-6 text-slate-300">
          <p>
            This article outlines the key steps, evidence, and governance expectations firms should
            consider when preparing for FCA reviews. Use the checklist to align teams around ownership,
            timelines, and supporting documentation.
          </p>
          <p>
            Focus on creating a single source of truth for regulatory obligations. Map policies to
            outcomes, track evidence, and ensure board-level oversight is documented.
          </p>
          <p>
            Nasara Connect helps teams coordinate workflows, capture approvals, and surface compliance gaps
            before they become audit findings.
          </p>
        </div>
      </section>

      {BLOG_LINKS[post.slug] && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold text-white">Related workflows</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { kind: "Feature", ...BLOG_LINKS[post.slug].feature },
                { kind: "Solution", ...BLOG_LINKS[post.slug].solution },
                { kind: "Audience", ...BLOG_LINKS[post.slug].audience },
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

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold text-white">Related articles</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="hover:text-emerald-300">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
