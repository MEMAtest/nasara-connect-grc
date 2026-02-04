import { NextResponse } from "next/server";
import { isAuthDisabled, requireAuth } from "@/lib/auth-utils";
import { getOrganizationMemberByUserId, type OrganizationMemberRecord, type OrganizationRole } from "@/lib/server/organization-store";

const ROLE_ORDER: OrganizationRole[] = ["viewer", "member", "admin", "owner"];

function hasRequiredRole(role: OrganizationRole, minimum: OrganizationRole): boolean {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(minimum);
}

export async function requireRole(
  minimum: OrganizationRole,
  organizationId?: string
): Promise<{
  auth: Awaited<ReturnType<typeof requireAuth>>["auth"];
  role?: OrganizationRole;
  member?: OrganizationMemberRecord;
  error?: NextResponse;
}> {
  const { auth, error } = await requireAuth();
  if (error) {
    return { auth, error };
  }

  if (isAuthDisabled()) {
    return { auth, role: "owner" };
  }

  const targetOrganizationId = organizationId ?? auth.organizationId;
  if (!auth.userId) {
    return {
      auth,
      error: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  const member = await getOrganizationMemberByUserId(targetOrganizationId, auth.userId);
  if (!member) {
    return {
      auth,
      error: NextResponse.json({ error: "Membership required" }, { status: 403 }),
    };
  }

  if (!hasRequiredRole(member.role, minimum)) {
    return {
      auth,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { auth, role: member.role, member };
}

export type { OrganizationRole };
