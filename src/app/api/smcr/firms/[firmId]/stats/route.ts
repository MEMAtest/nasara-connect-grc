/**
 * SMCR Dashboard Statistics API Route
 * GET /api/smcr/firms/:firmId/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, getFirm, initSmcrDatabase } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/stats`);

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

    const stats = await getDashboardStats(firmId);
    return NextResponse.json(stats);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR dashboard stats', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
