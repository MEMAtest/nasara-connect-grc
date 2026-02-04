/**
 * Training Module Progress API Routes
 * GET /api/training/modules - Get all module progress for current user
 * POST /api/training/modules - Update a specific module's progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { logError, logApiRequest } from '@/lib/logger';
import {
  initTrainingDatabase,
  getAllModuleProgress,
  updateModuleProgress,
  getUserProgress,
  updateUserProgress,
  logActivity,
} from '@/lib/training-database';

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/training/modules');

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const modules = await getAllModuleProgress(auth.userEmail);

    return NextResponse.json({ modules });
  } catch (error) {
    logError(error, 'Failed to fetch module progress');
    return NextResponse.json(
      { error: 'Failed to fetch modules', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/training/modules');

  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const body = await request.json();
    const {
      moduleId,
      pathwayId,
      status,
      progressPercentage,
      score,
      maxScore,
      timeSpent,
      attempts,
    } = body;

    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (pathwayId !== undefined) updates.pathway_id = pathwayId;
    if (status !== undefined) updates.status = status;
    if (progressPercentage !== undefined) updates.progress_percentage = progressPercentage;
    if (score !== undefined) updates.score = score;
    if (maxScore !== undefined) updates.max_score = maxScore;
    if (timeSpent !== undefined) updates.time_spent = timeSpent;
    if (attempts !== undefined) updates.attempts = attempts;

    const moduleProgress = await updateModuleProgress(auth.userEmail, moduleId, updates);

    // If module completed, update overall progress and log activity
    if (status === 'completed') {
      const userProgress = await getUserProgress(auth.userEmail);
      if (userProgress) {
        await updateUserProgress(auth.userEmail, {
          completed_lessons: userProgress.completed_lessons + 1,
          total_points: userProgress.total_points + (score || 10),
          weekly_progress: userProgress.weekly_progress + (score || 10),
        });
      }
      await logActivity(auth.userEmail, score || 10, 1, timeSpent || 0);
    } else if (timeSpent) {
      // Log activity for time spent even if not completed
      await logActivity(auth.userEmail, 0, 0, timeSpent);
    }

    return NextResponse.json(moduleProgress);
  } catch (error) {
    logError(error, 'Failed to update module progress');
    return NextResponse.json(
      { error: 'Failed to update module', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
