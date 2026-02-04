import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { listBackLinks } from "@/lib/server/entity-link-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { organizationId, controlId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const links = await listBackLinks({ organizationId, toType: "control", toId: controlId });
  const policyLinks = links.filter((link) => link.fromType === "policy");
  return NextResponse.json({ links: policyLinks });
}
