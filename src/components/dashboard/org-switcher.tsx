"use client";

import { useOrganization } from "@/components/organization-provider";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function OrgSwitcher() {
  const { organizations, organizationId, organizationName, switchOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Don't render if user only has 1 org
  if (organizations.length <= 1) return null;

  return (
    <div ref={ref} className="relative px-6 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left text-sm transition hover:bg-white/15"
      >
        <Building2 className="h-4 w-4 shrink-0 text-teal-200/70" />
        <span className="flex-1 truncate text-teal-50 font-medium">
          {organizationName || "Organization"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-teal-200/50 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-6 right-6 top-full z-50 mt-1 rounded-lg border border-white/10 bg-teal-900 py-1 shadow-xl">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                if (org.id !== organizationId) {
                  void switchOrganization(org.id);
                }
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-white/10",
                org.id === organizationId ? "text-teal-50" : "text-teal-100/70"
              )}
            >
              <span className="flex-1 truncate">{org.name}</span>
              {org.id === organizationId && (
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
