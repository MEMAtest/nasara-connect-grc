/**
 * SMCR People API Routes
 * GET /api/smcr/firms/:firmId/people - List all people in firm
 * POST /api/smcr/firms/:firmId/people - Create a new person
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createPerson,
  getFirm,
  getPeople,
  initSmcrDatabase,
  CreatePersonInput,
} from '@/lib/smcr-database';
import { createNotification } from "@/lib/server/notifications-store";
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/people`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const people = await getPeople(firmId);
    return NextResponse.json(people);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR people', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch people', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('POST', `/api/smcr/firms/${firmId}/people`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, department, title, phone, address, lineManager, startDate, hireDate, endDate, isPsd, psdStatus, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Person name is required' },
        { status: 400 }
      );
    }

    const input: CreatePersonInput = {
      firm_id: firmId,
      name: name.trim(),
      email,
      department,
      title,
      phone,
      address,
      line_manager: lineManager,
      start_date: startDate,
      hire_date: hireDate,
      end_date: endDate,
      is_psd: typeof isPsd === 'boolean' ? isPsd : undefined,
      psd_status: typeof psdStatus === 'string' ? psdStatus : undefined,
      notes: typeof notes === 'string' ? notes : undefined,
    };

    const person = await createPerson(input);
    try {
      await createNotification({
        organizationId: auth.organizationId,
        recipientEmail: auth.userEmail ?? null,
        title: "SMCR person added",
        message: `${person.name} added to SMCR firm ${firmId}.`,
        severity: "info",
        source: "smcr",
        link: "/smcr/people",
        metadata: { firmId, personId: person.id },
      });
    } catch {
      // Non-blocking notification failures
    }

    await logAuditEvent(pool, {
      entityType: 'smcr_person',
      entityId: person.id,
      action: 'created',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR person', { firmId });
    return NextResponse.json(
      { error: 'Failed to create person', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
