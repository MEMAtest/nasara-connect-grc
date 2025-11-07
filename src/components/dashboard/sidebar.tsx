"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  BookOpenCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Settings,
  ShieldAlert,
  UserCog,
  Newspaper,
  Shield,
  CreditCard,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SidebarBadgeVariant = "info" | "warning" | "danger" | "success" | "neutral";

type NavigationItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  badge?: { text: string; variant: SidebarBadgeVariant };
};

type SidebarProps = {
  onNavigate?: () => void;
  onClose?: () => void;
  isMobile?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Authorization Pack",
    icon: FileCheck2,
    href: "/authorization-pack",
    badge: { text: "75%", variant: "warning" },
  },
  {
    label: "Risk Assessment",
    icon: ShieldAlert,
    href: "/risk-assessment",
    badge: { text: "3", variant: "danger" },
  },
  {
    label: "SM&CR Management",
    icon: Shield,
    href: "/smcr",
    badge: { text: "NEW", variant: "success" },
  },
  {
    label: "Policy Management",
    icon: FileText,
    href: "/policies",
    badge: { text: "5", variant: "info" },
  },
  {
    label: "Compliance Framework",
    icon: ClipboardList,
    href: "/compliance-framework",
  },
  {
    label: "Training Library",
    icon: BookOpenCheck,
    href: "/training-library",
    badge: { text: "+4", variant: "info" },
  },
  {
    label: "Regulatory News",
    icon: Newspaper,
    href: "/regulatory-news",
    badge: { text: "5", variant: "info" },
  },
  {
    label: "Payments",
    icon: CreditCard,
    href: "/payments",
    badge: { text: "NEW", variant: "success" },
  },
  {
    label: "AI Assistant",
    icon: MessageCircle,
    href: "/ai-chat",
  },
];

const badgeStyles: Record<SidebarBadgeVariant, string> = {
  info: "bg-sky-500 text-white",
  warning: "bg-amber-400 text-amber-950",
  danger: "bg-rose-500 text-white",
  success: "bg-emerald-500 text-white",
  neutral: "bg-slate-500 text-white",
};

const glowByPath: Record<string, string> = {
  "/": "shadow-[0_0_18px_rgba(20,184,166,0.45)]",
  "/authorization-pack": "shadow-[0_0_18px_rgba(245,158,11,0.45)]",
  "/risk-assessment": "shadow-[0_0_18px_rgba(244,63,94,0.45)]",
  "/smcr": "shadow-[0_0_18px_rgba(34,197,94,0.45)]",
  "/policies": "shadow-[0_0_18px_rgba(79,70,229,0.45)]",
  "/compliance-framework": "shadow-[0_0_18px_rgba(99,102,241,0.45)]",
  "/training-library": "shadow-[0_0_18px_rgba(249,115,22,0.45)]",
  "/regulatory-news": "shadow-[0_0_18px_rgba(244,63,94,0.45)]",
  "/payments": "shadow-[0_0_18px_rgba(34,197,94,0.45)]",
  "/ai-chat": "shadow-[0_0_18px_rgba(20,184,166,0.45)]",
};

export function Sidebar({ onNavigate, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  const activePath = useMemo(() => {
    if (!pathname) return "/";
    const exactMatch = navigationItems.find((item) => item.href === pathname);
    if (exactMatch) return exactMatch.href;
    const fallback = navigationItems.find((item) => pathname.startsWith(item.href) && item.href !== "/");
    return fallback?.href ?? "/";
  }, [pathname]);

  return (
    <aside
      className={cn(
        "relative flex h-full w-64 flex-col justify-between overflow-hidden bg-gradient-to-b from-teal-800 via-teal-900 to-[#022c22] text-teal-50 shadow-2xl",
        "ring-1 ring-white/5",
        isMobile ? "w-full max-w-xs" : "",
      )}
    >
      <div className="relative flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 pb-6 pt-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-teal-200/70">Nasara Connect</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Command Center</h2>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20"
              aria-label="Close sidebar"
            >
              <span className="sr-only">Close sidebar</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          )}
        </div>

        <nav aria-label="Primary" className="space-y-1 px-4">
          {navigationItems.map(({ label, icon: Icon, href, badge }) => {
            const isActive = activePath === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                  isActive
                    ? "bg-white/15 text-teal-50 shadow-lg"
                    : "text-teal-100/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition duration-200",
                    glowByPath[href] ?? "",
                    "group-hover:scale-[1.05] group-hover:border-white/25",
                    isActive ? "border-white/40" : "",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-semibold tracking-wide">{label}</span>
                {badge ? (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-wider", // extra small badge styling
                      "transition-transform duration-200",
                      badgeStyles[badge.variant],
                      "group-hover:scale-[1.04]",
                    )}
                  >
                    {badge.text}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
            <UserCog className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-none">Regina Miles</p>
            <p className="text-xs text-teal-100/70">Chief Compliance Officer</p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              onClick={onNavigate}
              className="group flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-200 hover:bg-white/25"
            >
              <Settings className="h-4 w-4 group-hover:rotate-6" aria-hidden="true" />
              Settings
            </Link>
            <Link
              href="/support"
              onClick={onNavigate}
              className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition duration-200 hover:border-white/30 hover:bg-white/15"
              aria-label="Get support"
            >
              <LifeBuoy className="h-5 w-5 group-hover:scale-110" aria-hidden="true" />
            </Link>
            <Link
              href="/logout"
              onClick={onNavigate}
              className="group flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white transition duration-200 hover:border-white/30 hover:bg-white/15"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5 group-hover:-translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <a
            href="/page"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-300 transition duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/20"
          >
            <Globe className="h-4 w-4 group-hover:rotate-12" aria-hidden="true" />
            Marketing Site
          </a>
        </div>
      </div>
    </aside>
  );
}
