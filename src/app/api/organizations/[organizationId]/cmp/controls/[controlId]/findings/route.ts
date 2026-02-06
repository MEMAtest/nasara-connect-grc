import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { recordCmpFinding } from "@/lib/server/cmp-store";
import type { NewFindingPayload } from "@/data/cmp/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const { organizationId, controlId } = await params;
  if (organizationId !== auth.organizationId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  const payload = (await request.json()) as Partial<NewFindingPayload>;
  if (!payload?.title || !payload?.severity || !payload?.dueDate || !payload?.owner || !payload?.rootCause || !payload?.businessImpact || !payload?.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const finding = await recordCmpFinding(organizationId, controlId, payload as NewFindingPayload);
  if (!finding) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  return NextResponse.json(finding, { status: 201 });
}
