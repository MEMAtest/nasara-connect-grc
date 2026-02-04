/**
 * SMCR Group Entities API Routes
 * GET /api/smcr/group-entities - List all group entities
 * POST /api/smcr/group-entities - Create a new group entity
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createGroupEntity,
  getGroupEntities,
  initSmcrDatabase,
  CreateGroupEntityInput,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/smcr/group-entities');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const entities = await getGroupEntities(auth.organizationId);
    return NextResponse.json(entities);
  } catch (error) {
    logError(error, 'Failed to fetch group entities');
    return NextResponse.json(
      { error: 'Failed to fetch group entities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/smcr/group-entities');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const body = await request.json();
    const { name, type, parentId, ownershipPercent, country, linkedFirmId, linkedProjectId, linkedProjectName, regulatoryStatus, isExternal } = body ?? {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    const input: CreateGroupEntityInput = {
      organization_id: auth.organizationId,
      name: name.trim(),
      type: type.trim(),
      parent_id: parentId ?? undefined,
      ownership_percent: typeof ownershipPercent === 'number' ? ownershipPercent : undefined,
      country: country ?? undefined,
      linked_firm_id: linkedFirmId ?? undefined,
      linked_project_id: linkedProjectId ?? undefined,
      linked_project_name: linkedProjectName ?? undefined,
      regulatory_status: regulatoryStatus ?? undefined,
      is_external: typeof isExternal === 'boolean' ? isExternal : undefined,
    };

    const entity = await createGroupEntity(input);
    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create group entity');
    return NextResponse.json(
      { error: 'Failed to create group entity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
