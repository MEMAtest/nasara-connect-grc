import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isModuleEnabledForOrg } from "@/lib/module-access";

function shouldEnforceModuleAccess(): boolean {
  if (process.env.ENFORCE_MODULE_ACCESS === "true") return true;
  if (process.env.ENFORCE_MODULE_ACCESS === "false") return false;
  return process.env.NODE_ENV === "production";
}

/**
 * Server layout guard for ALL /registers/* routes.
 *
 * This wraps both the registers hub and sub-routes like /registers/complaints.
 * Because "registers" and "complaints" are separate modules, we allow entry
 * if the org has access to EITHER module. The complaints sub-directory has
 * its own nested layout.tsx that specifically enforces the "complaints" module.
 */
export default async function RegistersLayout({ children }: { children: ReactNode }) {
  const authDisabled = process.env.AUTH_DISABLED === "true" || process.env.AUTH_DISABLED === "1";
  if (authDisabled) return <>{children}</>;

  const { auth } = await import("@/auth");
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const { getOrganizationEnabledModules } = await import(
    "@/lib/server/organization-store"
  );
  const enabledModules = await getOrganizationEnabledModules(
    session.user.organizationId,
  );

  const hasRegisters = isModuleEnabledForOrg(enabledModules, "registers");
  const hasComplaints = isModuleEnabledForOrg(enabledModules, "complaints");

  if (!hasRegisters && !hasComplaints) {
    if (!shouldEnforceModuleAccess()) return <>{children}</>;
    redirect("/dashboard?module_blocked=registers");
  }

  return <>{children}</>;
}
