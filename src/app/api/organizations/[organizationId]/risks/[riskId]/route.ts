import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  deleteRisk,
  getRiskById,
  updateRisk,
} from "@/lib/server/risk-database";
import type { RiskFormValues } from "@/app/(dashboard)/risk-assessment/lib/riskValidation";
import type { RiskRecord } from "@/app/(dashboard)/risk-assessment/lib/riskConstants";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ organizationId: string; riskId: string }> },
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { organizationId, riskId } = await params;
    if (organizationId !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const payload = (await request.json()) as Partial<RiskFormValues>;

    const existing = await getRiskById(organizationId, riskId);
    if (!existing) {
      return NextResponse.json({ error: "Risk not found" }, { status: 404 });
    }

    const updates = {
      ...payload,
      residualLikelihood: payload.residualLikelihood ?? payload.likelihood ?? existing.residualLikelihood,
      residualImpact: payload.residualImpact ?? payload.impact ?? existing.residualImpact,
      keyRiskIndicators: (payload.keyRiskIndicators ?? existing.keyRiskIndicators ?? []) as RiskRecord["keyRiskIndicators"],
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
    const { auth, error } = await requireRole("admin");
    if (error) return error;
    const { organizationId, riskId } = await params;
    if (organizationId !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    await deleteRisk(organizationId, riskId);

    await logAuditEvent(pool, {
      entityType: 'risk',
      entityId: riskId,
      action: 'deleted',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting risk:", error);
    return NextResponse.json({ error: "Failed to delete risk" }, { status: 500 });
  }
}
