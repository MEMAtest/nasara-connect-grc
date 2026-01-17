"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, ChevronRight, Menu } from "lucide-react";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CmpNotificationsBell } from "@/components/dashboard/CmpNotificationsBell";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const breadcrumbsMap: Record<string, string> = {
  "": "Dashboard",
  "grc-hub": "GRC Control Panel",
  "authorization-pack": "Authorization Pack",
  "risk-assessment": "Risk Assessment",
  "compliance-framework": "Framework Builder",
  builder: "Framework Builder",
  monitoring: "Monitoring Workflows",
  policies: "Policies",
  "payments": "Payments",
  register: "Policy register",
  wizard: "Policy wizard",
  mapping: "Policy coverage",
  clauses: "Clause library",
  edit: "Edit",
  training: "Training Library",
  "regulatory-news": "Regulatory News",
  "ai-chat": "AI Assistant",
  smcr: "SM&CR",
  people: "People",
  smfs: "SMF Assignments",
  certifications: "Certification Functions",
  "fitness-propriety": "Fitness & Propriety",
  "conduct-rules": "Conduct Rules",
  workflows: "Workflows",
  // Registers
  registers: "Registers",
  pep: "PEP Register",
  "third-party": "Third-Party Register",
  complaints: "Complaints Register",
  incidents: "Incident Register",
  conflicts: "Conflicts of Interest",
  "gifts-hospitality": "Gifts & Hospitality",
};

type BreadcrumbItem = {
  label: string;
  href: string;
};

const UUID_SEGMENT_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function labelForSegment(segment: string, previousSegment?: string) {
  if (UUID_SEGMENT_RE.test(segment)) {
    if (previousSegment === "policies") return "Policy";
    if (previousSegment === "cmp" || previousSegment === "monitoring") return "Control";
    return "Details";
  }
  return breadcrumbsMap[segment] ?? segment.replace(/-/g, " ");
}

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const crumbs = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    const items: BreadcrumbItem[] = [];

    items.push({ label: breadcrumbsMap[""], href: "/" });

    if (segments.length === 0) {
      return items;
    }

    let cumulativePath = "";
    segments.forEach((segment, index) => {
      const previousSegment = segments[index - 1];
      if (segment === "builder" && previousSegment === "compliance-framework") {
        return;
      }
      cumulativePath += `/${segment}`;
      const label = labelForSegment(segment, previousSegment);
      items.push({ label, href: cumulativePath });
    });

    return items;
  }, [pathname]);

  const pageTitle = crumbs[crumbs.length - 1]?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={onToggleSidebar}
            className="text-slate-600 hover:bg-slate-100 md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          <div className="hidden items-center gap-3 lg:flex">
            <Building2 className="h-6 w-6 text-teal-600" aria-hidden="true" />
            <Separator orientation="vertical" className="h-6 bg-slate-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Nasara Connect</p>
              <p className="text-sm font-medium text-slate-700">Governance &amp; Compliance Platform</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-400">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <div key={crumb.href} className="flex items-center gap-1.5">
                    {index !== 0 && (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
                    )}
                    {isLast ? (
                      <span className="text-slate-600 font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-slate-600 hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:rounded"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          <CmpNotificationsBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 rounded-full px-2.5 py-1.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Avatar className="h-9 w-9 border border-teal-100 shadow-sm">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || "User"} />
                  <AvatarFallback className="bg-teal-600 text-white">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="font-semibold">{session?.user?.name || "User"}</span>
                  <span className="text-xs text-slate-500">Nasara Connect</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <DropdownMenuLabel className="text-sm font-semibold text-slate-700">
                {session?.user?.email || "user@example.com"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Team Settings</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/logout" className="text-rose-600 focus:text-rose-600 cursor-pointer">
                  Sign out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
