import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import {
  getOrganizationEnabledModules,
  getOrganizationMemberByUserId,
} from "@/lib/server/organization-store";

/**
 * GET /api/organization/context
 *
 * Returns the authenticated user's enabled modules and confirmed role.
 * Called once on mount by OrganizationProvider.
 */
export async function GET() {
  const { auth, error } = await requireAuth();
  if (error) return error;

  const [enabledModules, member] = await Promise.all([
    getOrganizationEnabledModules(auth.organizationId),
    auth.userId
      ? getOrganizationMemberByUserId(auth.organizationId, auth.userId)
      : null,
  ]);

  return NextResponse.json({
    enabledModules: enabledModules ?? [],
    role: member?.role ?? "viewer",
  });
}
