import { NextResponse } from "next/server";
import { recordCmpFinding } from "@/lib/server/cmp-store";
import { createNotification } from "@/lib/server/notifications-store";
import type { NewFindingPayload } from "@/data/cmp/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; controlId: string }> },
) {
  const { organizationId, controlId } = await params;
  const payload = (await request.json()) as Partial<NewFindingPayload>;
  if (!payload?.title || !payload?.severity || !payload?.dueDate || !payload?.owner || !payload?.rootCause || !payload?.businessImpact || !payload?.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const finding = await recordCmpFinding(organizationId, controlId, payload as NewFindingPayload);
  if (!finding) {
    return NextResponse.json({ error: "Control not found" }, { status: 404 });
  }
  try {
    const severity =
      payload.severity === "critical" || payload.severity === "high"
        ? "critical"
        : payload.severity === "medium"
        ? "warning"
        : "info";
    await createNotification({
      organizationId,
      title: "CMP finding raised",
      message: `${payload.title} (owner: ${payload.owner}, due ${payload.dueDate})`,
      severity,
      source: "cmp",
      link: `/compliance-framework/monitoring/${controlId}`,
      metadata: { controlId, findingId: finding.id, severity: payload.severity },
    });
  } catch {
    // Non-blocking notification failures
  }
  return NextResponse.json(finding, { status: 201 });
}
