/**
 * Training Dashboard Statistics API Routes
 * GET /api/training/stats - Get organization-wide training statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSessionIdentity } from '@/lib/auth-utils';
import { logError, logApiRequest } from '@/lib/logger';
import {
  initTrainingDatabase,
  getDashboardStats,
} from '@/lib/training-database';

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/training/stats');

  try {
    const session = await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const stats = await getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    logError(error, 'Failed to fetch training stats');
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
