import { NextResponse } from "next/server";
import {
  deleteRisk,
  getRisksForOrganization,
  upsertRisk,
} from "@/lib/server/risk-store";
import type { RiskFormValues } from "@/app/(dashboard)/risk-assessment/lib/riskValidation";
import type { RiskRecord } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  const { organizationId, riskId } = await params;
  const payload = (await request.json()) as Partial<RiskFormValues>;
  const existing = getRisksForOrganization(organizationId).find(
    (risk) => risk.id === riskId || risk.riskId === riskId,
  );
  if (!existing) {
    return NextResponse.json({ error: "Risk not found" }, { status: 404 });
  }

  const updated: RiskRecord = {
    ...existing,
    ...payload,
    residualLikelihood: payload.residualLikelihood ?? payload.likelihood ?? existing.residualLikelihood,
    residualImpact: payload.residualImpact ?? payload.impact ?? existing.residualImpact,
    keyRiskIndicators: payload.keyRiskIndicators ?? existing.keyRiskIndicators ?? [],
  };

  const result = upsertRisk(organizationId, updated);
  return NextResponse.json(result);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  const { organizationId, riskId } = await params;
  deleteRisk(organizationId, riskId);
  return NextResponse.json({ success: true });
}
