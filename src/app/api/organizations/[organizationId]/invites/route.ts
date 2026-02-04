import { NextRequest, NextResponse } from "next/server";
import { requireRole, type OrganizationRole } from "@/lib/rbac";
import {
  createOrganizationInvite,
  getOrganizationMemberByEmail,
  listOrganizationInvites,
} from "@/lib/server/organization-store";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";

const ROLE_VALUES: OrganizationRole[] = ["owner", "admin", "member", "viewer"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const { error } = await requireRole("admin", organizationId);
  if (error) return error;

  const invites = await listOrganizationInvites(organizationId);
  return NextResponse.json(invites);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  const { success, headers: rlHeaders } = await checkRateLimit(request, { requests: 10, window: "60 s" });
  if (!success) return rateLimitExceeded(rlHeaders);

  const { auth, error } = await requireRole("admin", organizationId);
  if (error) return error;

  const body = await request.json();
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body?.role as OrganizationRole;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!ROLE_VALUES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existingMember = await getOrganizationMemberByEmail(organizationId, email);
  if (existingMember) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await createOrganizationInvite({
    organizationId: organizationId,
    email,
    role,
    invitedBy: auth.userId ?? null,
    expiresAt,
  });

  return NextResponse.json(invite, { status: 201 });
}
