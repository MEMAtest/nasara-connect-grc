"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ModuleSidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface ModuleSidebarProps {
  /** Navigation items to display */
  items: ModuleSidebarItem[];
  /** Accent color for active item highlighting */
  accentColor?: "teal" | "blue" | "purple" | "amber";
}

const accentColorClasses = {
  teal: {
    activeBg: "bg-teal-50/80",
    activeText: "text-teal-700",
    mobileButton: "bg-teal-600 hover:bg-teal-700 text-white",
  },
  blue: {
    activeBg: "bg-blue-50/80",
    activeText: "text-blue-700",
    mobileButton: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  purple: {
    activeBg: "bg-purple-50/80",
    activeText: "text-purple-700",
    mobileButton: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  amber: {
    activeBg: "bg-amber-50/80",
    activeText: "text-amber-700",
    mobileButton: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

/**
 * ModuleSidebar - A minimal, clean sticky right sidebar for module navigation
 *
 * Desktop: Always visible sticky sidebar on the right (~140px)
 * Mobile: Hidden by default, opens as overlay with bottom-right toggle button
 */
export function ModuleSidebar({ items, accentColor = "teal" }: ModuleSidebarProps) {
  const pathname = usePathname();
  const colors = accentColorClasses[accentColor];

  return (
    <>
      {/* Desktop: Always visible sticky sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[140px] h-[calc(100vh-4rem)] sticky top-16 border-l border-slate-100 pt-4"
        aria-label="Module navigation"
      >
        {/* Navigation - starts immediately, no header */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto" aria-label="Module navigation">
          {items.map((item) => {
            const basePath = items[0]?.href || "";
            const isActive =
              pathname === item.href ||
              (item.href !== basePath && pathname?.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium",
                  "transition-all duration-150",
                  isActive
                    ? cn(colors.activeBg, colors.activeText, "font-semibold")
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: Overlay sidebar with toggle */}
      <ModuleSidebarMobile items={items} accentColor={accentColor} />
    </>
  );
}

/**
 * Mobile version of the module sidebar
 * Shows a floating button that opens a full-height overlay
 */
function ModuleSidebarMobile({ items, accentColor = "teal" }: ModuleSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const colors = accentColorClasses[accentColor];

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
      {/* Mobile toggle button - bottom right */}
      <Button
        ref={toggleButtonRef}
        size="sm"
        className={cn(
          "fixed bottom-4 right-4 z-50 lg:hidden shadow-lg rounded-full px-4",
          colors.mobileButton
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="module-sidebar-mobile"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm"
          onClick={handleClose}
          aria-label="Close sidebar overlay"
          role="presentation"
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        ref={sidebarRef}
        id="module-sidebar-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-64 transform bg-white shadow-xl transition-transform duration-300 lg:hidden focus:outline-none",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-end border-b border-slate-100 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close sidebar"
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Module navigation">
            {items.map((item) => {
              const basePath = items[0]?.href || "";
              const isActive =
                pathname === item.href ||
                (item.href !== basePath && pathname?.startsWith(item.href));

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                    "transition-all duration-150",
                    isActive
                      ? cn(colors.activeBg, colors.activeText, "font-semibold")
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default ModuleSidebar;
