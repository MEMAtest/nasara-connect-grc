import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/auth-utils";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";
import { pool } from "@/lib/database";
import { initOrganizationTables } from "@/lib/server/organization-store";

/**
 * GET /api/invites/[inviteId]
 *
 * Public invite lookup — requires auth but NOT org membership.
 * Returns invite details so the invite acceptance page can display them.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const { inviteId } = await params;

  const { success, headers: rlHeaders } = await checkRateLimit(request, { requests: 30, window: "60 s" });
  if (!success) return rateLimitExceeded(rlHeaders);

  const auth = await authenticateApiRequest();
  if (!auth.authenticated) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  await initOrganizationTables();

  const { rows } = await pool.query<{
    id: string;
    organization_id: string;
    organization_name: string;
    email: string;
    role: string;
    expires_at: Date | null;
    accepted_at: Date | null;
  }>(
    `SELECT i.id, i.organization_id, o.name AS organization_name, i.email, i.role, i.expires_at, i.accepted_at
     FROM organization_invites i
     JOIN organizations o ON o.id = i.organization_id
     WHERE i.id = $1`,
    [inviteId]
  );

  const invite = rows[0];
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const emailMatch = auth.userEmail
    ? auth.userEmail.toLowerCase() === invite.email.toLowerCase()
    : false;

  return NextResponse.json({
    id: invite.id,
    organizationName: invite.organization_name,
    organizationId: invite.organization_id,
    role: invite.role,
    expiresAt: invite.expires_at,
    acceptedAt: invite.accepted_at,
    email: invite.email,
    emailMatch,
  });
}
