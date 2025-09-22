"use client";

import { useEffect, useMemo, useState } from "react";
import type { RiskFiltersState, RiskRecord } from "../lib/riskConstants";
import { DEFAULT_RISK_FILTERS } from "../lib/riskConstants";

export function filterRisksByState(risks: RiskRecord[], filters: RiskFiltersState): RiskRecord[] {
  return risks.filter((risk) => {
    const matchesCategory = filters.category === "all" || risk.category === filters.category;
    const matchesStatus = filters.status === "all" || risk.status === filters.status;
    const inherentScore = risk.likelihood * risk.impact;
    const matchesRiskLevel = (() => {
      if (filters.riskLevel === "all") return true;
      if (filters.riskLevel === "low") return inherentScore <= 6;
      if (filters.riskLevel === "medium") return inherentScore > 6 && inherentScore <= 14;
      return inherentScore > 14;
    })();
    const matchesSearch = filters.search
      ? [risk.riskId, risk.title, risk.description, risk.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
      : true;
    return matchesCategory && matchesStatus && matchesRiskLevel && matchesSearch;
  });
}

interface UseRiskDataOptions {
  organizationId: string;
}

interface RiskDataState {
  risks: RiskRecord[];
  filteredRisks: RiskRecord[];
  isLoading: boolean;
  error: string | null;
  filters: RiskFiltersState;
  setFilters: (filters: RiskFiltersState) => void;
  refresh: () => Promise<void>;
}

export function useRiskData({ organizationId }: UseRiskDataOptions): RiskDataState {
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [filters, setFilters] = useState<RiskFiltersState>(DEFAULT_RISK_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchRisks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/risks`);
      if (!response.ok) {
        throw new Error("Failed to fetch risks");
      }
      const data = (await response.json()) as RiskRecord[];
      setRisks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRisks = useMemo(() => filterRisksByState(risks, filters), [filters, risks]);

  const refresh = async () => {
    await fetchRisks();
  };

  return {
    risks,
    filteredRisks,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
