"use client";

import { useEffect, useMemo, useState } from "react";
import type { CmpControlDetail, ControlFrequency, RagStatus } from "@/data/cmp/types";

export interface CmpFilterState {
  rag: RagStatus | "all";
  frequency: ControlFrequency | "all";
  dutyOutcome: string | "all";
  search: string;
}

export const DEFAULT_CMP_FILTERS: CmpFilterState = {
  rag: "all",
  frequency: "all",
  dutyOutcome: "all",
  search: "",
};

export function filterControls(controls: CmpControlDetail[], filters: CmpFilterState): CmpControlDetail[] {
  return controls.filter((control) => {
    const matchesRag = filters.rag === "all" || control.ragStatus === filters.rag;
    const matchesFrequency = filters.frequency === "all" || control.frequency === filters.frequency;
    const matchesDuty = filters.dutyOutcome === "all" || control.dutyOutcome === filters.dutyOutcome;
    const matchesSearch = filters.search
      ? [control.id, control.title, control.owner, control.objective]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
      : true;
    return matchesRag && matchesFrequency && matchesDuty && matchesSearch;
  });
}

interface UseCmpControlsOptions {
  organizationId: string;
}

interface UseCmpControlsResult {
  controls: CmpControlDetail[];
  filteredControls: CmpControlDetail[];
  isLoading: boolean;
  error: string | null;
  filters: CmpFilterState;
  setFilters: (next: CmpFilterState) => void;
  refresh: () => Promise<void>;
}

export function useCmpControls({ organizationId }: UseCmpControlsOptions): UseCmpControlsResult {
  const [controls, setControls] = useState<CmpControlDetail[]>([]);
  const [filters, setFilters] = useState<CmpFilterState>(DEFAULT_CMP_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchControls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchControls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/cmp/controls`);
      if (!response.ok) {
        throw new Error("Unable to load CMP controls");
      }
      const data = (await response.json()) as CmpControlDetail[];
      setControls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredControls = useMemo(() => filterControls(controls, filters), [controls, filters]);

  const refresh = async () => {
    await fetchControls();
  };

  return {
    controls,
    filteredControls,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
