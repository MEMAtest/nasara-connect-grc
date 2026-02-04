/**
 * SMCR Person Training API Routes
 * GET /api/smcr/people/:personId/training - List training items
 * POST /api/smcr/people/:personId/training - Create training items
 * PATCH /api/smcr/people/:personId/training - Update a training item
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createTrainingItem,
  getFirm,
  getPerson,
  getTrainingItems,
  initSmcrDatabase,
  updateTrainingItem,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('GET', `/api/smcr/people/${personId}/training`);

  try {
    const { auth, error } = await requireRole("member");
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

    const items = await getTrainingItems(personId);
    return NextResponse.json(items);
  } catch (error) {
    logError(error, 'Failed to fetch training items', { personId });
    return NextResponse.json(
      { error: 'Failed to fetch training items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('POST', `/api/smcr/people/${personId}/training`);

  try {
    const { auth, error } = await requireRole("member");
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

    const body = await request.json();
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [body];

    if (!items.length) {
      return NextResponse.json({ error: 'Training items are required' }, { status: 400 });
    }

    const created = await Promise.all(
      items.map((item: { moduleId?: string; module_id?: string; title?: string; required?: boolean; roleContext?: string; role_context?: string; status?: string; dueDate?: string; due_date?: string; completedDate?: string; completed_date?: string }) =>
        createTrainingItem({
          person_id: personId,
          module_id: item.moduleId ?? item.module_id ?? '',
          title: item.title ?? '',
          required: item.required,
          role_context: item.roleContext ?? item.role_context,
          status: item.status,
          due_date: item.dueDate ?? item.due_date,
          completed_date: item.completedDate ?? item.completed_date,
        })
      )
    );

    return NextResponse.json(created.length === 1 ? created[0] : created, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create training item', { personId });
    return NextResponse.json(
      { error: 'Failed to create training item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('PATCH', `/api/smcr/people/${personId}/training`);

  try {
    const { auth, error } = await requireRole("member");
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

    const body = await request.json();
    const { id, status, dueDate, completedDate, required, roleContext, title } = body ?? {};

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Training item ID is required' }, { status: 400 });
    }

    const items = await getTrainingItems(personId);
    const exists = items.find((item) => item.id === id);
    if (!exists) {
      return NextResponse.json({ error: 'Training item not found' }, { status: 404 });
    }

    const updated = await updateTrainingItem(id, {
      status: status ?? undefined,
      due_date: dueDate ?? undefined,
      completed_date: completedDate ?? undefined,
      required: required ?? undefined,
      role_context: roleContext ?? undefined,
      title: title ?? undefined,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, 'Failed to update training item', { personId });
    return NextResponse.json(
      { error: 'Failed to update training item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
