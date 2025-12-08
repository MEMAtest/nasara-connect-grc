import { NextResponse } from "next/server";
import { updateRiskKris } from "@/lib/server/risk-database";
import type { RiskKeyRiskIndicator } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  try {
    const { organizationId, riskId } = await params;
    const payload = (await request.json()) as RiskKeyRiskIndicator[];
    const updated = await updateRiskKris(organizationId, riskId, payload ?? []);
    if (!updated) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating KRIs:", error);
    return NextResponse.json({ error: "Failed to update KRIs" }, { status: 500 });
  }
}
