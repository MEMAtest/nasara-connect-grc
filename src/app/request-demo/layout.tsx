import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Request a Demo",
  description:
    "Request a guided demo of Nasara Connect and see how FCA compliance workflows are delivered end-to-end.",
  alternates: { canonical: "/request-demo" },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Request a Demo",
    description:
      "Request a guided demo of Nasara Connect and see how FCA compliance workflows are delivered end-to-end.",
    url: "/request-demo",
  },
};

export default function RequestDemoLayout({ children }: { children: ReactNode }) {
  return children;
}
