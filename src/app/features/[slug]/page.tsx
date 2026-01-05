import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURE_PAGES } from "@/lib/seo/marketing-data";
import { MarketingDetailPage } from "@/components/marketing/MarketingDetailPage";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FEATURE_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = FEATURE_PAGES.find((item) => item.slug === slug);
  if (!page) {
    return {
      title: "Feature",
      description: "Nasara Connect feature overview.",
    };
  }

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/features/${page.slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: `/features/${page.slug}`,
    },
  };
}

export default async function FeatureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = FEATURE_PAGES.find((item) => item.slug === slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
          { name: page.title, path: `/features/${page.slug}` },
        ]}
      />
      <MarketingDetailPage page={page} variant="feature" />
    </>
  );
}
