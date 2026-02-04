import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getRisksForOrganization, createRisk } from "@/lib/server/risk-database";
import { recordTrigger } from "@/lib/policies/policyTriggers";
import type { RiskFormValues } from "@/app/(dashboard)/risk-assessment/lib/riskValidation";
import type { RiskRecord } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { organizationId } = await params;
    if (organizationId !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const risks = await getRisksForOrganization(organizationId);
    return NextResponse.json(risks);
  } catch (error) {
    console.error("Error fetching risks:", error);
    return NextResponse.json({ error: "Failed to fetch risks" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> },
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { organizationId } = await params;
    if (organizationId !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
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
      keyRiskIndicators: (payload.keyRiskIndicators ?? []) as RiskRecord["keyRiskIndicators"],
      controlCount: 0,
      controlEffectiveness: 0,
      status: "open",
      reviewFrequency: payload.reviewFrequency ?? "quarterly",
    };

    const created = await createRisk(organizationId, risk);
    const inherentScore = (risk.likelihood ?? 0) * (risk.impact ?? 0);
    if (inherentScore >= 15) {
      // Wrap in try-catch to prevent trigger failures from breaking risk creation
      try {
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
      } catch (triggerError) {
        console.error("Failed to record policy trigger (non-blocking):", triggerError);
      }
    }
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating risk:", error);
    return NextResponse.json({ error: "Failed to create risk" }, { status: 500 });
  }
}
