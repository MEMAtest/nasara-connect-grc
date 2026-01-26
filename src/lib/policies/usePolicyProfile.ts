"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

export interface PolicyFirmProfile {
  organizationId: string;
  firmProfile: Record<string, unknown>;
  governanceDefaults: Record<string, unknown>;
  linkedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface UsePolicyProfileOptions {
  organizationId?: string;
}

interface UsePolicyProfileState {
  profile: PolicyFirmProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (payload: {
    firmProfile?: Record<string, unknown>;
    governanceDefaults?: Record<string, unknown>;
    linkedProjectIds?: string[];
  }) => Promise<PolicyFirmProfile | null>;
}

export function usePolicyProfile(options?: UsePolicyProfileOptions): UsePolicyProfileState {
  const organizationId = options?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const [profile, setProfile] = useState<PolicyFirmProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/policy-profile`);
      if (response.status === 404) {
        setProfile(null);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load policy profile");
      }
      const data = (await response.json()) as PolicyFirmProfile;
      setProfile(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (payload: {
    firmProfile?: Record<string, unknown>;
    governanceDefaults?: Record<string, unknown>;
    linkedProjectIds?: string[];
  }) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/policy-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to save policy profile");
      }
      const data = (await response.json()) as PolicyFirmProfile;
      setProfile(data ?? null);
      return data ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      return null;
    }
  };

  useEffect(() => {
    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    save: saveProfile,
  };
}
