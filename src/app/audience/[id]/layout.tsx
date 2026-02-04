import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AUDIENCE_PAGES } from "@/lib/seo/marketing-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const page = AUDIENCE_PAGES.find((item) => item.slug === id);
  const title = page?.seoTitle ?? "Audience";
  const description =
    page?.seoDescription ??
    "Compliance solutions tailored for FCA-regulated firms across fintech, banking, and investment sectors.";

  return {
    title,
    description,
    alternates: { canonical: `/audience/${id}` },
    openGraph: {
      title,
      description,
      url: `/audience/${id}`,
    },
  };
}

export default function AudienceDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
