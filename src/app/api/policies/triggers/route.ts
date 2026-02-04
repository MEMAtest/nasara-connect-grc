
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getTriggers, recordTrigger } from "@/lib/policies/policyTriggers";

export async function GET() {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const triggers = await getTriggers(auth.organizationId);
  return NextResponse.json(triggers);
}

export async function POST(request: Request) {
  const { auth, error } = await requireRole("member");
  if (error) return error;
  const body = await request.json();
  await recordTrigger(auth.organizationId, {
    id: crypto.randomUUID(),
    policyId: body.policyId ?? null,
    reason: body.reason,
    metadata: body.metadata ?? null,
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
