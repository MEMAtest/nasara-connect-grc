
import { NextResponse } from "next/server";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { getTriggers, recordTrigger } from "@/lib/policies/policyTriggers";

export async function GET() {
  const triggers = await getTriggers(DEFAULT_ORGANIZATION_ID);
  return NextResponse.json(triggers);
}

export async function POST(request: Request) {
  const body = await request.json();
  await recordTrigger(DEFAULT_ORGANIZATION_ID, {
    id: crypto.randomUUID(),
    policyId: body.policyId ?? null,
    reason: body.reason,
    metadata: body.metadata ?? null,
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
