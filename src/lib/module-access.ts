import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Module registry — single source of truth for gatable modules
// ---------------------------------------------------------------------------

export type ModuleId =
  | "authPack"
  | "policies"
  | "smcr"
  | "riskAssessment"
  | "complianceFramework"
  | "reportingPack"
  | "training"
  | "registers"
  | "complaints"
  | "regulatoryNews"
  | "payments"
  | "aiChat"
  | "grcHub";

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  pageRoutes: string[];
  apiRoutes: string[];
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // Order matters: most-specific routes first for correct matching
  {
    id: "complaints",
    label: "Complaints",
    pageRoutes: ["/registers/complaints"],
    apiRoutes: ["/api/registers/complaints", "/api/complaints"],
  },
  {
    id: "authPack",
    label: "Authorisation Pack",
    pageRoutes: ["/authorization-pack"],
    apiRoutes: ["/api/authorization-pack"],
  },
  {
    id: "policies",
    label: "Policy Management",
    pageRoutes: ["/policies"],
    apiRoutes: ["/api/policies"],
  },
  {
    id: "smcr",
    label: "Governance & People",
    pageRoutes: ["/smcr"],
    apiRoutes: ["/api/smcr"],
  },
  {
    id: "riskAssessment",
    label: "Risk Assessment",
    pageRoutes: ["/risk-assessment"],
    apiRoutes: ["/api/organizations/*/risks", "/api/assessments"],
  },
  {
    id: "complianceFramework",
    label: "Compliance Framework",
    pageRoutes: ["/compliance-framework"],
    apiRoutes: ["/api/compliance-framework"],
  },
  {
    id: "reportingPack",
    label: "Reporting Pack",
    pageRoutes: ["/reporting"],
    apiRoutes: ["/api/reporting"],
  },
  {
    id: "training",
    label: "Training Library",
    pageRoutes: ["/training-library"],
    apiRoutes: ["/api/training"],
  },
  {
    id: "registers",
    label: "Registers",
    pageRoutes: ["/registers"],
    apiRoutes: ["/api/registers"],
  },
  {
    id: "regulatoryNews",
    label: "Regulatory News",
    pageRoutes: ["/regulatory-news"],
    apiRoutes: ["/api/regulatory-news"],
  },
  {
    id: "payments",
    label: "Payments",
    pageRoutes: ["/payments"],
    apiRoutes: ["/api/payments"],
  },
  {
    id: "aiChat",
    label: "AI Assistant",
    pageRoutes: ["/ai-chat"],
    apiRoutes: ["/api/ai"],
  },
  {
    id: "grcHub",
    label: "GRC Control Panel",
    pageRoutes: ["/grc-hub"],
    apiRoutes: ["/api/grc-hub"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a module ID is enabled given the org's enabled list.
 * Supports wildcard `["*"]`. Fail-closed: null/empty → nothing enabled.
 */
export function isModuleEnabledForOrg(
  enabledModules: string[] | null | undefined,
  moduleId: string,
): boolean {
  // null/undefined means module access hasn't been configured yet — allow all
  if (enabledModules === null || enabledModules === undefined) return true;
  // Explicit empty array means everything disabled
  if (enabledModules.length === 0) return false;
  if (enabledModules.includes("*")) return true;
  return enabledModules.includes(moduleId);
}

/**
 * Look up the human-readable label for a module ID.
 */
export function getModuleLabel(moduleId: string): string {
  const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
  return mod?.label ?? moduleId;
}

/**
 * Return all module labels for an enabled list (resolves wildcard).
 */
export function getEnabledModuleLabels(
  enabledModules: string[] | null | undefined,
): string[] {
  if (!enabledModules || enabledModules.length === 0) return [];
  if (enabledModules.includes("*")) return MODULE_REGISTRY.map((m) => m.label);
  return enabledModules
    .map((id) => MODULE_REGISTRY.find((m) => m.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

// ---------------------------------------------------------------------------
// Server-side layout guard (Layer 2)
// ---------------------------------------------------------------------------

/**
 * Server-only function for per-module layout files.
 * Checks whether the current user's organisation has access to a module.
 * Redirects to the dashboard with a query param if blocked.
 *
 * Usage in a module layout.tsx:
 *   import { requireModuleAccess } from "@/lib/module-access";
 *   export default async function Layout({ children }) {
 *     await requireModuleAccess("riskAssessment");
 *     return <>{children}</>;
 *   }
 */
export async function requireModuleAccess(moduleId: ModuleId): Promise<void> {
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

  if (!isModuleEnabledForOrg(enabledModules, moduleId)) {
    redirect(`/?module_blocked=${moduleId}`);
  }
}

// ---------------------------------------------------------------------------
// API route wrapper (Layer 3)
// ---------------------------------------------------------------------------

/**
 * Higher-order function that wraps a Next.js route handler with module
 * access enforcement. The inner handler only runs if the module is enabled
 * for the caller's organisation.
 *
 * Usage:
 *   export const GET = withModuleAccess("riskAssessment", async (req, ctx) => {
 *     // handler logic
 *   });
 */
export function withModuleAccess<
  TReq extends Request,
  TCtx,
>(
  moduleId: ModuleId,
  handler: (req: TReq, ctx: TCtx) => Promise<Response>,
) {
  return async (req: TReq, ctx: TCtx): Promise<Response> => {
    // Lazy imports to keep this module light for client-side tree-shaking
    const { NextResponse } = await import("next/server");
    const { requireAuth } = await import("@/lib/auth-utils");
    const { getOrganizationEnabledModules } = await import(
      "@/lib/server/organization-store"
    );

    const { auth: authResult, error } = await requireAuth();
    if (error) return error;

    const enabledModules = await getOrganizationEnabledModules(
      authResult.organizationId,
    );

    if (!isModuleEnabledForOrg(enabledModules, moduleId)) {
      return NextResponse.json(
        { error: "Module not enabled for this organization" },
        { status: 403 },
      );
    }

    return handler(req, ctx);
  };
}
