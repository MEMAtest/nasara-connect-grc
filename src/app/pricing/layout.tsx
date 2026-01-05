import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for FCA compliance workflows: authorisation packs, SM&CR, policies, monitoring, and training.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing",
    description:
      "Transparent pricing for FCA compliance workflows: authorisation packs, SM&CR, policies, monitoring, and training.",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
