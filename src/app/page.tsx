import type { Metadata } from "next";
import LandingPageClient from "@/components/landing/LandingPageClient";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Governance, Risk & Compliance Platform for FCA-Regulated Firms",
  description:
    "Unify governance, risk, and compliance with workflows for SM&CR, policies, monitoring, and evidence. Stay audit-ready with Nasara Connect.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Governance, Risk & Compliance Platform for FCA-Regulated Firms",
    description:
      "Unify governance, risk, and compliance with workflows for SM&CR, policies, monitoring, and evidence. Stay audit-ready with Nasara Connect.",
    url: "/",
  },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }]} />
      <LandingPageClient />
    </>
  );
}
