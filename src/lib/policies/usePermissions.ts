"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import type { FirmPermissions, PolicyRequirement } from "./permissions";
import { DEFAULT_PERMISSIONS, getRequiredPolicies } from "./permissions";

interface UsePermissionsOptions {
  organizationId?: string;
}

interface PermissionState {
  permissions: FirmPermissions;
  requiredPolicies: PolicyRequirement[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePermissions(options?: UsePermissionsOptions): PermissionState {
  const [permissions, setPermissions] = useState<FirmPermissions>(DEFAULT_PERMISSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const organizationId = options?.organizationId ?? DEFAULT_ORGANIZATION_ID;

  useEffect(() => {
    void fetchPermissions(organizationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const fetchPermissions = async (targetOrganizationId: string = organizationId) => {
    setIsLoading(true);
    setError(null);
    try {
      if (targetOrganizationId) {
        const response = await fetch(`/api/organizations/${targetOrganizationId}/permissions`);
        if (!response.ok) {
          throw new Error("Failed to load permissions");
        }
        const data = (await response.json()) as FirmPermissions;
        setPermissions(data ?? DEFAULT_PERMISSIONS);
      } else {
        setPermissions(DEFAULT_PERMISSIONS);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setPermissions(DEFAULT_PERMISSIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const requiredPolicies = getRequiredPolicies(permissions);

  return {
    permissions,
    requiredPolicies,
    isLoading,
    error,
    refresh: () => fetchPermissions(organizationId),
  };
}
