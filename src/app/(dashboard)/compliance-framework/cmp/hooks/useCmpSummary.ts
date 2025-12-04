"use client";

import { useEffect, useState } from "react";
import type { CmpSummary } from "@/data/cmp/types";

interface UseCmpSummaryOptions {
  organizationId: string;
}

interface UseCmpSummaryResult {
  summary: CmpSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCmpSummary({ organizationId }: UseCmpSummaryOptions): UseCmpSummaryResult {
  const [summary, setSummary] = useState<CmpSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/cmp/summary`);
      if (!response.ok) {
        throw new Error("Unable to load CMP summary");
      }
      const data = (await response.json()) as CmpSummary;
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    summary,
    isLoading,
    error,
    refresh: fetchSummary,
  };
}
