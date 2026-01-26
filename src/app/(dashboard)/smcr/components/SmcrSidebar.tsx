"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DashboardIcon,
  PeopleIcon,
  SmfIcon,
  CertificationIcon,
  FitnessProprietyIcon,
  ConductRulesIcon,
  WorkflowsIcon,
  OrgChartIcon,
} from "./SmcrIcons";

interface NavItem {
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/smcr", Icon: DashboardIcon },
  { label: "People", href: "/smcr/people", Icon: PeopleIcon },
  { label: "SMFs", href: "/smcr/smfs", Icon: SmfIcon },
  { label: "Certifications", href: "/smcr/certifications", Icon: CertificationIcon },
  { label: "F&P", href: "/smcr/fitness-propriety", Icon: FitnessProprietyIcon },
  { label: "Conduct Rules", href: "/smcr/conduct-rules", Icon: ConductRulesIcon },
  { label: "Workflows", href: "/smcr/workflows", Icon: WorkflowsIcon },
  { label: "Org Chart", href: "/smcr/org-chart", Icon: OrgChartIcon },
];

export function SmcrSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element before opening
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the sidebar when opened
      sidebarRef.current?.focus();
    } else if (previousActiveElement.current) {
      // Return focus to toggle button when closed
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Toggle button - always visible on the right edge */}
      <Button
        ref={toggleButtonRef}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="smcr-sidebar"
        aria-label={isOpen ? "Close SM&CR navigation" : "Open SM&CR navigation"}
        className={cn(
          "fixed top-20 z-40 h-10 shadow-md border-slate-300 bg-white hover:bg-teal-50 transition-all duration-300",
          isOpen ? "right-[225px]" : "right-4"
        )}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4 mr-1" />
        ) : (
          <ChevronLeft className="h-4 w-4 mr-1" />
        )}
        <span className="text-xs font-medium">SM&CR</span>
      </Button>

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 transition-opacity"
          onClick={handleClose}
          aria-label="Close sidebar overlay"
          role="presentation"
        />
      )}

      {/* Sidebar panel - slides in from the right */}
      <aside
        ref={sidebarRef}
        id="smcr-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="SM&CR Module Navigation"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-56 border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 focus:outline-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              SM&CR Module
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close sidebar"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-2 overflow-y-auto" aria-label="SM&CR navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/smcr" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.Icon
                    size={24}
                    className="flex-shrink-0 transition-transform group-hover:scale-105"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export function SmcrSidebarMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      sidebarRef.current?.focus();
    } else if (previousActiveElement.current) {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Mobile toggle - bottom right */}
      <Button
        ref={toggleButtonRef}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 md:hidden shadow-lg bg-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="smcr-sidebar-mobile"
        aria-label={isOpen ? "Close SM&CR navigation" : "Open SM&CR navigation"}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        SM&CR
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={handleClose}
          aria-label="Close sidebar overlay"
          role="presentation"
        />
      )}

      {/* Mobile sidebar - slides from right */}
      <aside
        ref={sidebarRef}
        id="smcr-sidebar-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="SM&CR Module Navigation"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 md:hidden focus:outline-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <span className="text-sm font-semibold text-slate-900">SM&CR Navigation</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close sidebar"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-2 overflow-y-auto" aria-label="SM&CR navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/smcr" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.Icon size={28} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

// Floating Quick Tip component - positioned on the bottom-right, above the AI assistant button
export function SmcrQuickTip() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the tip before (resets after 24 hours)
    if (typeof window !== "undefined") {
      const dismissedAt = localStorage.getItem("smcr-quick-tip-dismissed-at");
      if (dismissedAt) {
        const dismissedTime = parseInt(dismissedAt, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - dismissedTime < twentyFourHours) {
          setIsDismissed(true);
          setIsVisible(false);
        } else {
          // Reset after 24 hours
          localStorage.removeItem("smcr-quick-tip-dismissed-at");
        }
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("smcr-quick-tip-dismissed-at", Date.now().toString());
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 right-5 z-40 max-w-xs hidden md:block">
      <div className="rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 p-3 shadow-lg border border-teal-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-teal-800">Quick Tip</p>
              <p className="mt-1 text-xs text-teal-600">
                Use keyboard shortcuts to navigate: Press 1-8 while holding Alt to jump to sections.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-teal-500 hover:text-teal-700 hover:bg-teal-100 -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
