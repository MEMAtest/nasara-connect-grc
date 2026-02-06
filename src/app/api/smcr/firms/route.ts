/**
 * SMCR Firms API Routes
 * GET /api/smcr/firms - List all firms
 * POST /api/smcr/firms - Create a new firm
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFirm, getFirms, initSmcrDatabase } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/smcr/firms');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firms = await getFirms(auth.organizationId);
    return NextResponse.json(firms);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR firms');
    return NextResponse.json(
      { error: 'Failed to fetch firms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/smcr/firms');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Firm name is required' },
        { status: 400 }
      );
    }

    const firm = await createFirm(name.trim(), auth.organizationId);

    await logAuditEvent(pool, {
      entityType: 'smcr_firm',
      entityId: firm.id,
      action: 'created',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json(firm, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR firm');
    return NextResponse.json(
      { error: 'Failed to create firm', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
