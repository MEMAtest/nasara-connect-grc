import { redirect } from "next/navigation";

// Re-export all client-safe code from shared module
export * from "./module-access-shared";

// Import for use in this file
import {
  type ModuleId,
  isModuleEnabledForOrg,
} from "./module-access-shared";

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
