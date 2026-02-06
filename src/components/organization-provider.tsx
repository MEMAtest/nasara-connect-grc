"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

interface OrgListItem {
  id: string;
  name: string;
  domain: string;
  role: string;
}

interface OrganizationContextValue {
  organizationId: string;
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Modules enabled for this organisation. Null means "all enabled". */
  enabledModules: string[] | null;
  /** True until the /api/organization/context call resolves. */
  isModuleAccessLoading: boolean;
  /** Role confirmed by the API (freshest source). Null until loaded. */
  confirmedRole: string | null;
  /** True if the context fetch failed and modules may be incomplete. */
  contextFetchFailed: boolean;
  /** Manually retry the context fetch. */
  retryContextFetch: () => void;
  /** All organizations the user belongs to. */
  organizations: OrgListItem[];
  /** Name of the currently active organization. */
  organizationName: string | null;
  /** Switch to a different organization (sets cookie + reloads). */
  switchOrganization: (orgId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const user = session?.user;

  const organizationId = user?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const userEmail = user?.email ?? null;
  const userName = user?.name ?? null;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Module access + confirmed role (fetched from API)
  const [enabledModules, setEnabledModules] = useState<string[] | null>(null);
  const [confirmedRole, setConfirmedRole] = useState<string | null>(null);
  const [isModuleAccessLoading, setIsModuleAccessLoading] = useState(true);
  const [contextFetchFailed, setContextFetchFailed] = useState(false);
  const [organizations, setOrganizations] = useState<OrgListItem[]>([]);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    setIsModuleAccessLoading(true);
    setContextFetchFailed(false);

    try {
      const res = await fetch("/api/organization/context");
      if (!res.ok) throw new Error(`Context fetch failed: ${res.status}`);
      const data = await res.json();
      setEnabledModules(data.enabledModules === null ? null : Array.isArray(data.enabledModules) ? data.enabledModules : null);
      setConfirmedRole(typeof data.role === "string" ? data.role : null);
      setOrganizations(Array.isArray(data.organizations) ? data.organizations : []);
      const activeOrg = Array.isArray(data.organizations)
        ? data.organizations.find((o: OrgListItem) => o.id === (data.activeOrganizationId || organizationId))
        : null;
      setOrganizationName(activeOrg?.name ?? null);
    } catch {
      // Retry once after 2 seconds
      try {
        await new Promise((r) => setTimeout(r, 2000));
        const retryRes = await fetch("/api/organization/context");
        if (!retryRes.ok) throw new Error(`Retry failed: ${retryRes.status}`);
        const retryData = await retryRes.json();
        setEnabledModules(retryData.enabledModules === null ? null : Array.isArray(retryData.enabledModules) ? retryData.enabledModules : null);
        setConfirmedRole(typeof retryData.role === "string" ? retryData.role : null);
        setOrganizations(Array.isArray(retryData.organizations) ? retryData.organizations : []);
        const retryActiveOrg = Array.isArray(retryData.organizations)
          ? retryData.organizations.find((o: OrgListItem) => o.id === (retryData.activeOrganizationId || organizationId))
          : null;
        setOrganizationName(retryActiveOrg?.name ?? null);
      } catch {
        // Both attempts failed — fail-closed for modules, role falls back to JWT
        // In dev, keep the UI usable even if the context endpoint is unavailable.
        setEnabledModules(process.env.NODE_ENV === "production" ? [] : null);
        setConfirmedRole(null);
        setContextFetchFailed(true);
      }
    } finally {
      setIsModuleAccessLoading(false);
    }
  }, [organizationId]);

  const switchOrganization = useCallback(async (orgId: string) => {
    const res = await fetch("/api/user/switch-organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId }),
    });
    if (res.ok) {
      // Full page reload to refresh JWT with new org
      window.location.reload();
    }
  }, []);

  const shouldFetchContext = useMemo(() => {
    if (isAuthenticated) return true;

    // When auth is disabled in dev, NextAuth may still report "unauthenticated".
    // If we're on any dashboard/protected route, attempt to fetch org context anyway.
    const protectedPrefixes = [
      "/dashboard",
      "/grc-hub",
      "/authorization-pack",
      "/risk-assessment",
      "/smcr",
      "/policies",
      "/compliance-framework",
      "/reporting",
      "/registers",
      "/training-library",
      "/regulatory-news",
      "/payments",
      "/ai-chat",
      "/settings",
      "/support",
      "/admin",
      "/notifications",
      "/logout",
      "/invites",
    ];

    return protectedPrefixes.some((p) => (pathname ?? "/").startsWith(p));
  }, [isAuthenticated, pathname]);

  const lastContextFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!shouldFetchContext) {
      // Avoid leaving module UI in a perpetual "loading" state on public pages.
      setIsModuleAccessLoading(false);
      return;
    }

    // Fetch once per org + auth status, even across client navigations.
    const key = `${status}:${organizationId}`;
    if (lastContextFetchKeyRef.current === key) return;
    lastContextFetchKeyRef.current = key;

    void fetchContext();
  }, [fetchContext, isLoading, organizationId, shouldFetchContext, status]);

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
        organizations,
        organizationName,
        switchOrganization,
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
