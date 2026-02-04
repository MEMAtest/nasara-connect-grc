/**
 * Training Dashboard Statistics API Routes
 * GET /api/training/stats - Get organization-wide training statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from "@/lib/rbac";
import { logError, logApiRequest } from '@/lib/logger';
import {
  initTrainingDatabase,
  getDashboardStats,
} from '@/lib/training-database';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/training/stats');

  try {
    const { error } = await requireRole("member");
    if (error) return error;

    await initTrainingDatabase();

    const stats = await getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    logError(error, 'Failed to fetch training stats');
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
