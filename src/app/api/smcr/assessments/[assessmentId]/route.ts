/**
 * SMCR Fitness Assessment API Routes
 * GET /api/smcr/assessments/:assessmentId
 * PATCH /api/smcr/assessments/:assessmentId
 * DELETE /api/smcr/assessments/:assessmentId
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initSmcrDatabase,
  getFitnessAssessment,
  updateFitnessAssessment,
  deleteFitnessAssessment,
  getFirm,
} from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;
  logApiRequest("GET", `/api/smcr/assessments/${assessmentId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const assessment = await getFitnessAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const firm = await getFirm(assessment.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(assessment);
  } catch (error) {
    logError(error, "Failed to fetch SMCR assessment", { assessmentId });
    return NextResponse.json(
      { error: "Failed to fetch assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;
  logApiRequest("PATCH", `/api/smcr/assessments/${assessmentId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getFitnessAssessment(assessmentId);
    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.assessment_date !== undefined) updates.assessment_date = body.assessment_date;
    if (body.next_due_date !== undefined) updates.next_due_date = body.next_due_date;
    if (body.reviewer !== undefined) updates.reviewer = body.reviewer;
    if (body.overall_determination !== undefined) updates.overall_determination = body.overall_determination;
    if (body.conditions !== undefined) updates.conditions = body.conditions;
    if (body.responses !== undefined) updates.responses = body.responses;

    const updated = await updateFitnessAssessment(assessmentId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to update SMCR assessment", { assessmentId });
    return NextResponse.json(
      { error: "Failed to update assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;
  logApiRequest("DELETE", `/api/smcr/assessments/${assessmentId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getFitnessAssessment(assessmentId);
    if (!existing) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteFitnessAssessment(assessmentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete SMCR assessment", { assessmentId });
    return NextResponse.json(
      { error: "Failed to delete assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
