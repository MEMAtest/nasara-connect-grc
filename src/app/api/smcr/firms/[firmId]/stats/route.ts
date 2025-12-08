/**
 * SMCR Dashboard Statistics API Route
 * GET /api/smcr/firms/:firmId/stats - Get dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, initSmcrDatabase } from '@/lib/smcr-database';
import { logError, logApiRequest } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/stats`);

  try {
    await initSmcrDatabase();

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
