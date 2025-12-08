import { NextResponse } from "next/server";
import {
  deleteRisk,
  getRiskById,
  updateRisk,
} from "@/lib/server/risk-database";
import type { RiskFormValues } from "@/app/(dashboard)/risk-assessment/lib/riskValidation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  try {
    const { organizationId, riskId } = await params;
    const payload = (await request.json()) as Partial<RiskFormValues>;

    const existing = await getRiskById(organizationId, riskId);
    if (!existing) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 });
    }

    const updates = {
      ...payload,
      residualLikelihood: payload.residualLikelihood ?? payload.likelihood ?? existing.residualLikelihood,
      residualImpact: payload.residualImpact ?? payload.impact ?? existing.residualImpact,
      keyRiskIndicators: payload.keyRiskIndicators ?? existing.keyRiskIndicators ?? [],
    };

    const result = await updateRisk(organizationId, riskId, updates);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating risk:", error);
    return NextResponse.json({ error: "Failed to update risk" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  try {
    const { organizationId, riskId } = await params;
    await deleteRisk(organizationId, riskId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting risk:", error);
    return NextResponse.json({ error: "Failed to delete risk" }, { status: 500 });
  }
}
