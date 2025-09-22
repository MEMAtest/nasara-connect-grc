import { NextResponse } from "next/server";
import { updateRiskKris } from "@/lib/server/risk-store";
import type { RiskKeyRiskIndicator } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  const { organizationId, riskId } = await params;
  const payload = (await request.json()) as RiskKeyRiskIndicator[];
  const updated = updateRiskKris(organizationId, riskId, payload ?? []);
  if (!updated) {
    return NextResponse.json({ error: "Risk not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
