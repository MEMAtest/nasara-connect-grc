/**
 * SMCR Group Entity API Routes
 * PATCH /api/smcr/group-entities/:entityId - Update group entity
 * DELETE /api/smcr/group-entities/:entityId - Delete group entity
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGroupEntity,
  updateGroupEntity,
  deleteGroupEntity,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params;
  logApiRequest('PATCH', `/api/smcr/group-entities/${entityId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getGroupEntity(entityId);
    if (!existing) {
      return NextResponse.json({ error: 'Group entity not found' }, { status: 404 });
    }
    if (existing.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.type !== undefined) updates.type = body.type;
    if (body.parentId !== undefined) updates.parent_id = body.parentId;
    if (body.ownershipPercent !== undefined) updates.ownership_percent = body.ownershipPercent;
    if (body.country !== undefined) updates.country = body.country;
    if (body.linkedFirmId !== undefined) updates.linked_firm_id = body.linkedFirmId;
    if (body.linkedProjectId !== undefined) updates.linked_project_id = body.linkedProjectId;
    if (body.linkedProjectName !== undefined) updates.linked_project_name = body.linkedProjectName;
    if (body.regulatoryStatus !== undefined) updates.regulatory_status = body.regulatoryStatus;
    if (body.isExternal !== undefined) updates.is_external = body.isExternal;

    const updated = await updateGroupEntity(entityId, updates);
    return NextResponse.json(updated);
  } catch (error) {
    logError(error, 'Failed to update group entity', { entityId });
    return NextResponse.json(
      { error: 'Failed to update group entity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  const { entityId } = await params;
  logApiRequest('DELETE', `/api/smcr/group-entities/${entityId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getGroupEntity(entityId);
    if (!existing) {
      return NextResponse.json({ error: 'Group entity not found' }, { status: 404 });
    }
    if (existing.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await deleteGroupEntity(entityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to delete group entity', { entityId });
    return NextResponse.json(
      { error: 'Failed to delete group entity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
