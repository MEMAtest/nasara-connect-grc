/**
 * SMCR Single Firm API Routes
 * GET /api/smcr/firms/:firmId - Get firm by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirm, initSmcrDatabase } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}`);

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

    return NextResponse.json(firm);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR firm', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch firm', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
