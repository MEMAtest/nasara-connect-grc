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
  totalPolicies: 0,
  overduePolicies: 0,
  policyGaps: 0,
  completionRate: 0,
  reviewsDueSoon: 0,
  underReview: 0,
  lastUpdated: new Date().toISOString(),
};

interface UsePolicyMetricsState {
  metrics: PolicyMetrics;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePolicyMetrics(): UsePolicyMetricsState {
  const [metrics, setMetrics] = useState<PolicyMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/policies/metrics");
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

  useEffect(() => {
    void fetchMetrics();
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
  };
}
