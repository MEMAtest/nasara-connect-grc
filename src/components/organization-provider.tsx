"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

interface OrganizationContextValue {
  organizationId: string;
  userEmail: string | null;
  userName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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

  return (
    <OrganizationContext.Provider
      value={{
        organizationId,
        userEmail,
        userName,
        isLoading,
        isAuthenticated,
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
