"use client";

import { useOrganization } from "@/components/organization-provider";
import { useCallback } from "react";
import { isModuleEnabledForOrg } from "@/lib/module-access-shared";

/**
 * Client hook for checking module access.
 * Reads `enabledModules` from the OrganizationProvider context.
 * Delegates to `isModuleEnabledForOrg` for consistent checking logic.
 */
export function useModuleAccess() {
  const { enabledModules, isModuleAccessLoading } = useOrganization();

  const isModuleEnabled = useCallback(
    (moduleId: string): boolean => isModuleEnabledForOrg(enabledModules, moduleId),
    [enabledModules],
  );

  return {
    enabledModules: enabledModules ?? [],
    isModuleEnabled,
    isLoading: isModuleAccessLoading,
  };
}
