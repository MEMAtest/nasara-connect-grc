import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SOLUTION_PAGES } from "@/lib/seo/marketing-data";
import { MarketingDetailPage } from "@/components/marketing/MarketingDetailPage";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SOLUTION_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = SOLUTION_PAGES.find((item) => item.slug === slug);
  if (!page) {
    return {
      title: "Solution",
      description: "Nasara Connect compliance solution.",
    };
  }

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/solutions/${page.slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: `/solutions/${page.slug}`,
    },
  };
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = SOLUTION_PAGES.find((item) => item.slug === slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: page.title, path: `/solutions/${page.slug}` },
        ]}
      />
      <MarketingDetailPage page={page} variant="solution" />
    </>
  );
}
