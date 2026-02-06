import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { recordCmpTest } from "@/lib/server/cmp-store";
import type { NewTestExecutionPayload } from "@/data/cmp/types";

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
  const payload = (await request.json()) as Partial<NewTestExecutionPayload>;
  if (!payload?.tester || !payload?.reviewer || !payload?.stepId || !payload?.testedAt || !payload?.result || !payload?.sampleSize) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const exec = await recordCmpTest(organizationId, controlId, payload as NewTestExecutionPayload);
  if (!exec) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  return NextResponse.json(exec, { status: 201 });
}
