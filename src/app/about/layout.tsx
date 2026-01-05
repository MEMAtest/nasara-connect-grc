import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Nasara Connect",
  description:
    "Learn about Nasara Connect and our mission to help FCA-regulated firms stay compliant and audit-ready.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Nasara Connect",
    description:
      "Learn about Nasara Connect and our mission to help FCA-regulated firms stay compliant and audit-ready.",
    url: "/about",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
