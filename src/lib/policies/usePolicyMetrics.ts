"use client";

import { useEffect, useState } from "react";

export interface PolicyMetrics {
  totalPolicies: number;
  overduePolicies: number;
  policyGaps: number;
  completionRate: number;
  reviewsDueSoon: number;
  underReview: number;
  lastUpdated: string;
}

const DEFAULT_METRICS: PolicyMetrics = {
  totalPolicies: 18,
  overduePolicies: 2,
  policyGaps: 3,
  completionRate: 72,
  reviewsDueSoon: 4,
  underReview: 1,
  lastUpdated: new Date().toISOString(),
};

interface UsePolicyMetricsState {
  metrics: PolicyMetrics;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePolicyMetrics(organizationId?: string): UsePolicyMetricsState {
  const [metrics, setMetrics] = useState<PolicyMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = organizationId
        ? `/api/organizations/${organizationId}/policies/metrics`
        : "/api/policies/metrics";
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to load policy metrics");
      }
      const data = (await response.json()) as PolicyMetrics;
      setMetrics({ ...DEFAULT_METRICS, ...data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setMetrics(DEFAULT_METRICS);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
