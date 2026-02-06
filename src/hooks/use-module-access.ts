"use client";

import { useOrganization } from "@/components/organization-provider";
import { useCallback, useMemo } from "react";
import { isModuleEnabledForOrg } from "@/lib/module-access-shared";

/**
 * Client hook for checking module access.
 * Reads `enabledModules` from the OrganizationProvider context.
 * Delegates to `isModuleEnabledForOrg` for consistent checking logic.
 */
export function useModuleAccess() {
  const { enabledModules, isModuleAccessLoading } = useOrganization();

  const forceAllModulesEnabled = useMemo(() => {
    // Dev and localhost should always show everything (no locked cards / hidden nav).
    if (process.env.NODE_ENV !== "production") return true;
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  }, []);

  const isModuleEnabled = useCallback(
    (moduleId: string): boolean => isModuleEnabledForOrg(enabledModules, moduleId),
    [enabledModules],
  );

  if (forceAllModulesEnabled) {
    return {
      enabledModules: null as string[] | null,
      isModuleEnabled: () => true,
      isLoading: false,
    };
  }

  return {
    enabledModules,
    isModuleEnabled,
    isLoading: isModuleAccessLoading,
  };
}
