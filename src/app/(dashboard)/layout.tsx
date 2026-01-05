import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
