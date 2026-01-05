import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compliance Software for FCA-Regulated Firms",
  description:
    "Compliance solutions tailored for fintech, banks, investment firms, insurance, crypto, and consumer finance.",
  alternates: { canonical: "/audience" },
  openGraph: {
    title: "Compliance Software for FCA-Regulated Firms",
    description:
      "Compliance solutions tailored for fintech, banks, investment firms, insurance, crypto, and consumer finance.",
    url: "/audience",
  },
};

export default function AudienceLayout({ children }: { children: ReactNode }) {
  return children;
}
