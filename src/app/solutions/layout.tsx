import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compliance Solutions for FCA-Regulated Firms",
  description:
    "Outcome-focused solutions for FCA authorisation, SM&CR, Consumer Duty, safeguarding, CASS, and operational resilience.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "Compliance Solutions for FCA-Regulated Firms",
    description:
      "Outcome-focused solutions for FCA authorisation, SM&CR, Consumer Duty, safeguarding, CASS, and operational resilience.",
    url: "/solutions",
  },
};

export default function SolutionsLayout({ children }: { children: ReactNode }) {
  return children;
}
