"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

interface OrganizationContextValue {
  organizationId: string;
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Modules enabled for this organisation. Empty while loading. */
  enabledModules: string[];
  /** True until the /api/organization/context call resolves. */
  isModuleAccessLoading: boolean;
  /** Role confirmed by the API (freshest source). Null until loaded. */
  confirmedRole: string | null;
  /** True if the context fetch failed and modules may be incomplete. */
  contextFetchFailed: boolean;
  /** Manually retry the context fetch. */
  retryContextFetch: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = session?.user;

  const organizationId = user?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const userEmail = user?.email ?? null;
  const userName = user?.name ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = Boolean(userEmail);

  // Module access + confirmed role (fetched from API)
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [confirmedRole, setConfirmedRole] = useState<string | null>(null);
  const [isModuleAccessLoading, setIsModuleAccessLoading] = useState(true);
  const [contextFetchFailed, setContextFetchFailed] = useState(false);

  const fetchContext = useCallback(async () => {
    setIsModuleAccessLoading(true);
    setContextFetchFailed(false);

    try {
      const res = await fetch("/api/organization/context");
      if (!res.ok) throw new Error(`Context fetch failed: ${res.status}`);
      const data = await res.json();
      setEnabledModules(Array.isArray(data.enabledModules) ? data.enabledModules : []);
      setConfirmedRole(typeof data.role === "string" ? data.role : null);
    } catch {
      // Retry once after 2 seconds
      try {
        await new Promise((r) => setTimeout(r, 2000));
        const retryRes = await fetch("/api/organization/context");
        if (!retryRes.ok) throw new Error(`Retry failed: ${retryRes.status}`);
        const retryData = await retryRes.json();
        setEnabledModules(Array.isArray(retryData.enabledModules) ? retryData.enabledModules : []);
        setConfirmedRole(typeof retryData.role === "string" ? retryData.role : null);
      } catch {
        // Both attempts failed — fail-closed for modules, role falls back to JWT
        setEnabledModules([]);
        setConfirmedRole(null);
        setContextFetchFailed(true);
      }
    } finally {
      setIsModuleAccessLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      void fetchContext();
    }
  }, [isAuthenticated, isLoading, fetchContext]);

  return (
    <OrganizationContext.Provider
      value={{
        organizationId,
        userEmail,
        userName,
        isLoading,
        isAuthenticated,
        enabledModules,
        isModuleAccessLoading,
        confirmedRole,
        contextFetchFailed,
        retryContextFetch: fetchContext,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}
