import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AUDIENCE_PAGES } from "@/lib/seo/marketing-data";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const page = AUDIENCE_PAGES.find((item) => item.slug === params.id);
  const title = page?.seoTitle ?? "Audience";
  const description =
    page?.seoDescription ??
    "Compliance solutions tailored for FCA-regulated firms across fintech, banking, and investment sectors.";

  return {
    title,
    description,
    alternates: { canonical: `/audience/${params.id}` },
    openGraph: {
      title,
      description,
      url: `/audience/${params.id}`,
    },
  };
}

export default function AudienceDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
