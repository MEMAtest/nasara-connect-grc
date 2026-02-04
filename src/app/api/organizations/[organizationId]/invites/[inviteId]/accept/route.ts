import { NextRequest, NextResponse } from "next/server";
import { deriveUserIdFromEmail, requireAuth } from "@/lib/auth-utils";
import { acceptOrganizationInvite, getOrganizationInvite, upsertUser } from "@/lib/server/organization-store";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; inviteId: string }> }
) {
  const { organizationId, inviteId } = await params;

  const { success, headers: rlHeaders } = await checkRateLimit(request, { requests: 5, window: "60 s" });
  if (!success) return rateLimitExceeded(rlHeaders);

  const { auth, error } = await requireAuth();
  if (error) return error;

  if (!auth.userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invite = await getOrganizationInvite(organizationId, inviteId);
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.accepted_at) {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 409 });
  }

  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  if (invite.email.toLowerCase() !== auth.userEmail.toLowerCase()) {
    return NextResponse.json({ error: "Invite does not match user" }, { status: 403 });
  }

  const userId = auth.userId ?? await deriveUserIdFromEmail(auth.userEmail);
  await upsertUser({
    id: userId,
    email: auth.userEmail,
    name: auth.userName ?? auth.userEmail,
  });

  const accepted = await acceptOrganizationInvite({
    organizationId: organizationId,
    inviteId,
    userId,
  });

  if (!accepted) {
    return NextResponse.json({ error: "Invite could not be accepted" }, { status: 400 });
  }

  return NextResponse.json(accepted);
}
