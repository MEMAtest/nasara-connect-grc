"use client";

import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Crown,
  Award,
  ClipboardCheck,
  Scale,
  FileText,
  GitBranch,
  Network,
  Search,
} from "lucide-react";
import { SmcrDataProvider } from "./context/SmcrDataContext";
import { ModuleSidebar, type ModuleSidebarItem } from "@/components/dashboard/ModuleSidebar";
import { SmcrQuickTip } from "./components/SmcrSidebar";

const smcrNavItems: ModuleSidebarItem[] = [
  { label: "Dashboard", href: "/smcr", icon: LayoutDashboard },
  { label: "People", href: "/smcr/people", icon: Users },
  { label: "SMFs", href: "/smcr/smfs", icon: Crown },
  { label: "Certs", href: "/smcr/certifications", icon: Award },
  { label: "F&P", href: "/smcr/fitness-propriety", icon: ClipboardCheck },
  { label: "Conduct", href: "/smcr/conduct-rules", icon: Scale },
  { label: "Forms", href: "/smcr/forms", icon: FileText },
  { label: "Workflows", href: "/smcr/workflows", icon: GitBranch },
  { label: "Org Chart", href: "/smcr/org-chart", icon: Network },
  { label: "FCA Reg.", href: "/smcr/fca-register", icon: Search },
];

export default function SmcrLayoutClient({ children }: { children: ReactNode }) {
  return (
    <SmcrDataProvider>
      <div className="flex min-h-screen">
        {/* Main content - takes remaining space */}
        <main className="flex-1 min-w-0 transition-all duration-300">
          {children}
        </main>

        {/* Module sidebar - sticky on the right */}
        <ModuleSidebar
          items={smcrNavItems}
          accentColor="teal"
        />

        {/* Quick Tip - floating */}
        <SmcrQuickTip />
      </div>
    </SmcrDataProvider>
  );
}
