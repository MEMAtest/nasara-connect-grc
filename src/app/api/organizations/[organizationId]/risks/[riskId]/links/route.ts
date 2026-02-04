import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { listBackLinks } from "@/lib/server/entity-link-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  const { auth, error } = await requireAuth();
  if (error) return error;
  const { organizationId, riskId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const links = await listBackLinks({ organizationId, toType: "risk", toId: riskId });
  const policyLinks = links.filter((link) => link.fromType === "policy");
  return NextResponse.json({ links: policyLinks });
}
