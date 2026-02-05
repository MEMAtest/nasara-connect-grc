import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getOrganizationMemberByUserId } from "@/lib/server/organization-store";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";

/**
 * POST /api/user/switch-organization
 *
 * Sets the nasara-active-org cookie to switch the user's active organization.
 * Validates that the user is a member of the target org.
 */
export async function POST(request: NextRequest) {
  const { success, headers: rlHeaders } = await checkRateLimit(request, { requests: 10, window: "60 s" });
  if (!success) return rateLimitExceeded(rlHeaders);

  const { auth, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const organizationId = typeof body?.organizationId === "string" ? body.organizationId.trim() : "";

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
  }

  if (!auth.userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 400 });
  }

  const member = await getOrganizationMemberByUserId(organizationId, auth.userId);
  if (!member) {
    return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
  }

  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true, organizationId });

  response.cookies.set("nasara-active-org", organizationId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
