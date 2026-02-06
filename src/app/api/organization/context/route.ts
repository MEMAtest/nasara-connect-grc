import { NextResponse } from "next/server";
import { isAuthDisabled, requireAuth } from "@/lib/auth-utils";
import {
  getOrganizationEnabledModules,
  getOrganizationMemberByUserId,
  listOrganizationsForUser,
} from "@/lib/server/organization-store";

/**
 * GET /api/organization/context
 *
 * Returns the authenticated user's enabled modules, confirmed role,
 * and the list of organizations the user belongs to.
 * Called once on mount by OrganizationProvider.
 */
export async function GET() {
  const { auth, error } = await requireAuth();
  if (error) return error;

  const [enabledModules, member, organizations] = await Promise.all([
    getOrganizationEnabledModules(auth.organizationId),
    auth.userId
      ? getOrganizationMemberByUserId(auth.organizationId, auth.userId)
      : null,
    auth.userId ? listOrganizationsForUser(auth.userId) : [],
  ]);

  const role = isAuthDisabled() ? "owner" : member?.role ?? "viewer";
  const organizationsWithFallback =
    isAuthDisabled() && organizations.length === 0
      ? [
          {
            id: auth.organizationId,
            name: "Demo Organization",
            domain: "nasara.local",
            role,
          },
        ]
      : organizations;

  return NextResponse.json({
    enabledModules,
    role,
    organizations: organizationsWithFallback,
    activeOrganizationId: auth.organizationId,
  });
}
