import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getCmpControl } from "@/lib/server/cmp-store";
import { checkRateLimit, rateLimitExceeded } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;

  const { success: rlOk, headers: rlHeaders } = await checkRateLimit(request, { requests: 60, window: "60 s" });
  if (!rlOk) return rateLimitExceeded(rlHeaders);

  const { organizationId, controlId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const control = await getCmpControl(organizationId, controlId);
  if (!control) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  return NextResponse.json(control);
}
