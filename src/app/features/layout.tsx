import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FCA Compliance Software Features",
  description:
    "Explore modules for FCA authorisation, SM&CR, risk assessment, policy management, compliance monitoring, training, and AI guidance.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "FCA Compliance Software Features",
    description:
      "Explore modules for FCA authorisation, SM&CR, risk assessment, policy management, compliance monitoring, training, and AI guidance.",
    url: "/features",
  },
};

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return children;
}
