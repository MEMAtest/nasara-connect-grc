/**
 * SMCR Single Firm API Routes
 * GET /api/smcr/firms/:firmId - Get firm by ID
 * PATCH /api/smcr/firms/:firmId - Update firm metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirm, initSmcrDatabase, updateFirm } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(firm);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR firm', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch firm', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('PATCH', `/api/smcr/firms/${firmId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getFirm(firmId);

    if (!existing) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (existing.organization_id && existing.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.authorizationProjectId !== undefined) updates.authorization_project_id = body.authorizationProjectId;
    if (body.authorizationProjectName !== undefined) updates.authorization_project_name = body.authorizationProjectName;

    const firm = await updateFirm(firmId, updates);
    return NextResponse.json(firm);
  } catch (error) {
    logError(error, 'Failed to update SMCR firm', { firmId });
    return NextResponse.json(
      { error: 'Failed to update firm', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
