"use client";

import { FormEvent, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bell,
  Building2,
  ChevronRight,
  Menu,
  Search,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const breadcrumbsMap: Record<string, string> = {
  "": "Dashboard",
  "authorization-pack": "Authorization Pack",
  "risk-assessment": "Risk Assessment",
  "compliance-framework": "Compliance Framework",
  "payments": "Payments",
  training: "Training Library",
  "regulatory-news": "Regulatory News",
  "ai-chat": "AI Assistant",
};

export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const segments = pathname?.split("/").filter(Boolean) ?? [];
    if (segments.length === 0) {
      return [breadcrumbsMap[""], "Overview"];
    }
    const mapped = segments.map((segment) => breadcrumbsMap[segment] ?? segment);
    return ["Dashboard", ...mapped];
  }, [pathname]);

  const pageTitle = crumbs[crumbs.length - 1] ?? "Dashboard";

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = formData.get("query")?.toString();
    // Placeholder: integrate with real search endpoint when available.
    // In production, replace with actual search functionality
    if (process.env.NODE_ENV !== 'production') {
      console.debug("Search submitted", value);
    }
    // TODO: Implement real search functionality
  };

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

          <div className="flex flex-col">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500">
              {crumbs.map((crumb, index) => (
                <div key={crumb} className="flex items-center gap-1">
                  {index !== 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
                  <span className={cn("capitalize", index === crumbs.length - 1 && "text-slate-700 font-semibold")}>{crumb}</span>
                </div>
              ))}
            </nav>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:border-teal-300 focus-within:ring-2 focus-within:ring-teal-200 md:flex">
            <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              name="query"
              type="search"
              placeholder="Search modules, tasks..."
              className="w-44 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none lg:w-64"
            />
          </form>

          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-600 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-400"
                  aria-label="View notifications"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white shadow-lg">
                    3
                  </span>
                  <span className="absolute -top-2 -right-2 h-7 w-7 animate-ping rounded-full bg-rose-500/40" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6} className="text-xs font-medium text-slate-600">
                New notifications
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 rounded-full px-2.5 py-1.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Avatar className="h-9 w-9 border border-teal-100 shadow-sm">
                  <AvatarImage src="https://i.pravatar.cc/100?img=12" alt="Regina Miles" />
                  <AvatarFallback className="bg-teal-600 text-white">RM</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="font-semibold">Regina Miles</span>
                  <span className="text-xs text-slate-500">Nasara Connect</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
              <DropdownMenuLabel className="text-sm font-semibold text-slate-700">regina.miles@nasara.co</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Team Settings</DropdownMenuItem>
                <DropdownMenuItem>Notifications</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600 focus:text-rose-600">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
