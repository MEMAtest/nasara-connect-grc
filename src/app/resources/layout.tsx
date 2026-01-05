import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FCA Compliance Resources: Guides, Templates & Tools",
  description:
    "Practical FCA compliance guides, templates, and toolkits covering authorisation, SM&CR, Consumer Duty, and monitoring.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "FCA Compliance Resources: Guides, Templates & Tools",
    description:
      "Practical FCA compliance guides, templates, and toolkits covering authorisation, SM&CR, Consumer Duty, and monitoring.",
    url: "/resources",
  },
};

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return children;
}
