import { NextResponse } from "next/server";
import { getRisksForOrganization, createRisk } from "@/lib/server/risk-store";
import { recordTrigger } from "@/lib/policies/policyTriggers";
import type { RiskFormValues } from "@/app/(dashboard)/risk-assessment/lib/riskValidation";
import type { RiskRecord } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
  const risks = getRisksForOrganization(organizationId);
  return NextResponse.json(risks);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  const { organizationId } = await params;
  const payload = (await request.json()) as Partial<RiskFormValues>;
  if (!payload?.title || !payload.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const risk: RiskRecord = {
    id: crypto.randomUUID(),
    riskId: `RA-${Math.floor(Date.now() / 1000)}`,
    title: payload.title,
    description: payload.description,
    category: payload.category ?? "operational",
    subCategory: payload.subCategory,
    likelihood: payload.likelihood ?? 3,
    impact: payload.impact ?? 3,
    residualLikelihood: payload.residualLikelihood ?? payload.likelihood ?? 3,
    residualImpact: payload.residualImpact ?? payload.impact ?? 3,
    velocity: payload.velocity ?? "medium",
    businessUnit: payload.businessUnit,
    process: payload.process,
    riskOwner: payload.riskOwner ?? "Unassigned",
    regulatoryCategory: payload.regulatoryCategory ?? [],
    reportableToFCA: payload.reportableToFCA ?? false,
    consumerDutyRelevant: payload.consumerDutyRelevant ?? false,
    keyRiskIndicators: payload.keyRiskIndicators ?? [],
    controlCount: 0,
    controlEffectiveness: 0,
    status: "open",
    reviewFrequency: payload.reviewFrequency ?? "quarterly",
  };

  const created = createRisk(organizationId, risk);
  const inherentScore = (risk.likelihood ?? 0) * (risk.impact ?? 0);
  if (inherentScore >= 15) {
    await recordTrigger(organizationId, {
      id: crypto.randomUUID(),
      policyId: null,
      reason: "high_risk_trigger",
      metadata: {
        riskId: created.id,
        riskTitle: created.title,
        inherentScore,
      },
    });
  }
  return NextResponse.json(created, { status: 201 });
}
