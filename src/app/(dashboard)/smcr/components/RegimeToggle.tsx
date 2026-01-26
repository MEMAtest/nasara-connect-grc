"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type RegimeFilter = "smcr" | "psd" | "all";

const STORAGE_KEY = "smcr-regime-filter";

interface RegimeToggleProps {
  value?: RegimeFilter;
  onChange?: (regime: RegimeFilter) => void;
  showCounts?: {
    smcr?: number;
    psd?: number;
  };
}

export function RegimeToggle({ value, onChange, showCounts }: RegimeToggleProps) {
  const [regime, setRegime] = useState<RegimeFilter>("all");
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted to prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize from localStorage on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["smcr", "psd", "all"].includes(stored)) {
      setRegime(stored as RegimeFilter);
    }
  }, []);

  // Sync with external value if provided
  useEffect(() => {
    if (value !== undefined && value !== regime) {
      setRegime(value);
    }
  }, [value, regime]);

  const handleChange = (newRegime: RegimeFilter) => {
    setRegime(newRegime);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newRegime);
    }
    onChange?.(newRegime);
  };

  // Render a consistent initial state during SSR
  const displayRegime = isMounted ? regime : "all";

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleChange("smcr")}
        className={cn(
          "h-8 px-3 gap-1.5 rounded-md transition-all",
          displayRegime === "smcr"
            ? "bg-white shadow-sm text-slate-900"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        )}
      >
        <Shield className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">SM&CR</span>
        {showCounts?.smcr !== undefined && (
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-5 px-1.5 text-[10px]",
              displayRegime === "smcr" ? "bg-teal-100 text-teal-700" : "bg-slate-200"
            )}
          >
            {showCounts.smcr}
          </Badge>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleChange("psd")}
        className={cn(
          "h-8 px-3 gap-1.5 rounded-md transition-all",
          displayRegime === "psd"
            ? "bg-white shadow-sm text-slate-900"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        )}
      >
        <CreditCard className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">PSD</span>
        {showCounts?.psd !== undefined && (
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-5 px-1.5 text-[10px]",
              displayRegime === "psd" ? "bg-blue-100 text-blue-700" : "bg-slate-200"
            )}
          >
            {showCounts.psd}
          </Badge>
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleChange("all")}
        className={cn(
          "h-8 px-3 gap-1.5 rounded-md transition-all",
          displayRegime === "all"
            ? "bg-white shadow-sm text-slate-900"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">All</span>
      </Button>
    </div>
  );
}

// Hook to use regime filter state (SSR-safe)
export function useRegimeFilter(): [RegimeFilter, (regime: RegimeFilter) => void] {
  const [regime, setRegime] = useState<RegimeFilter>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["smcr", "psd", "all"].includes(stored)) {
      setRegime(stored as RegimeFilter);
    }
  }, []);

  const setRegimeWithPersist = (newRegime: RegimeFilter) => {
    setRegime(newRegime);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newRegime);
    }
  };

  return [regime, setRegimeWithPersist];
}
