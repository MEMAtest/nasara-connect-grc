/**
 * SMCR Fitness & Propriety Assessments API Routes
 * GET /api/smcr/firms/:firmId/assessments - List all assessments
 * POST /api/smcr/firms/:firmId/assessments - Create a new assessment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createFitnessAssessment,
  getFirm,
  getFitnessAssessments,
  initSmcrDatabase,
  CreateAssessmentInput,
} from '@/lib/smcr-database';
import { createNotification } from "@/lib/server/notifications-store";
import { logError, logApiRequest } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/assessments`);

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const assessments = await getFitnessAssessments(firmId);
    return NextResponse.json(assessments);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR assessments', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('POST', `/api/smcr/firms/${firmId}/assessments`);

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      personId,
      personName,
      personRole,
      assessmentDate,
      nextDueDate,
      reviewer,
      responses,
    } = body;

    if (!personId) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    if (!personName) {
      return NextResponse.json({ error: 'Person name is required' }, { status: 400 });
    }

    const input: CreateAssessmentInput = {
      firm_id: firmId,
      person_id: personId,
      person_name: personName,
      person_role: personRole,
      assessment_date: assessmentDate,
      next_due_date: nextDueDate,
      reviewer,
      responses,
    };

    const assessment = await createFitnessAssessment(input);
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "SMCR assessment logged",
        message: `Fitness & propriety assessment created for ${personName}.`,
        severity: "info",
        source: "smcr",
        link: "/smcr/fitness-propriety",
        metadata: { firmId, assessmentId: assessment.id, personId },
      });
    } catch {
      // Non-blocking notification failures
    }
    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR assessment', { firmId });
    return NextResponse.json(
      { error: 'Failed to create assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
