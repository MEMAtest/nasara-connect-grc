import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact Nasara Connect",
  description:
    "Request a demo or speak to our team about FCA compliance workflows, authorisation support, and governance tooling.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Nasara Connect",
    description:
      "Request a demo or speak to our team about FCA compliance workflows, authorisation support, and governance tooling.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
