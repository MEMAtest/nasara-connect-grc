/**
 * SMCR Single Person API Routes
 * GET /api/smcr/people/:personId - Get person by ID
 * PATCH /api/smcr/people/:personId - Update person
 * DELETE /api/smcr/people/:personId - Delete person
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getFirm,
  getPerson,
  updatePerson,
  deletePerson,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('GET', `/api/smcr/people/${personId}`);

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initSmcrDatabase();

    const person = await getPerson(personId);

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    const firm = await getFirm(person.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(person);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR person', { personId });
    return NextResponse.json(
      { error: 'Failed to fetch person', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('PATCH', `/api/smcr/people/${personId}`);

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initSmcrDatabase();

    const body = await request.json();

    // Convert camelCase to snake_case for database
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.department !== undefined) updates.department = body.department;
    if (body.title !== undefined) updates.title = body.title;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.lineManager !== undefined) updates.line_manager = body.lineManager;
    if (body.startDate !== undefined) updates.start_date = body.startDate;
    if (body.hireDate !== undefined) updates.hire_date = body.hireDate;
    if (body.endDate !== undefined) updates.end_date = body.endDate;
    if (body.assessmentStatus !== undefined) updates.assessment_status = body.assessmentStatus;
    if (body.lastAssessment !== undefined) updates.last_assessment = body.lastAssessment;
    if (body.nextAssessment !== undefined) updates.next_assessment = body.nextAssessment;
    if (body.trainingCompletion !== undefined) updates.training_completion = body.trainingCompletion;
    if (body.irn !== undefined) updates.irn = body.irn;
    if (body.fcaVerification !== undefined) updates.fca_verification = body.fcaVerification;

    const existing = await getPerson(personId);
    if (!existing) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const person = await updatePerson(personId, updates);

    return NextResponse.json(person);
  } catch (error) {
    logError(error, 'Failed to update SMCR person', { personId });
    return NextResponse.json(
      { error: 'Failed to update person', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('DELETE', `/api/smcr/people/${personId}`);

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getPerson(personId);
    if (!existing) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }
    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await deletePerson(personId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to delete SMCR person', { personId });
    return NextResponse.json(
      { error: 'Failed to delete person', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
