import { NextResponse } from "next/server";
import { recordCmpTest } from "@/lib/server/cmp-store";
import { createNotification } from "@/lib/server/notifications-store";
import type { NewTestExecutionPayload } from "@/data/cmp/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { organizationId, controlId } = await params;
  const payload = (await request.json()) as Partial<NewTestExecutionPayload>;
  if (!payload?.tester || !payload?.reviewer || !payload?.stepId || !payload?.testedAt || !payload?.result || !payload?.sampleSize) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const exec = await recordCmpTest(organizationId, controlId, payload as NewTestExecutionPayload);
  if (!exec) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  try {
    const severity = payload.result === "fail" ? "critical" : payload.result === "partial" ? "warning" : "success";
    await createNotification({
      organizationId,
      title: "CMP test logged",
      message: `Control ${controlId} logged as ${payload.result} by ${payload.tester}.`,
      severity,
      source: "cmp",
      link: `/compliance-framework/monitoring/${controlId}`,
      metadata: { controlId, result: payload.result, stepId: payload.stepId },
    });
  } catch {
    // Non-blocking notification failures
  }
  return NextResponse.json(exec, { status: 201 });
}
