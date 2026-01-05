/**
 * Training Progress API Routes
 * GET /api/training/progress - Get current user's training progress
 * PUT /api/training/progress - Update user's training progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSessionIdentity, isAuthDisabled } from '@/lib/auth-utils';
import { logError, logApiRequest } from '@/lib/logger';
import {
  initTrainingDatabase,
  getUserProgress,
  updateUserProgress,
  logActivity,
} from '@/lib/training-database';

export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/training/progress');

  try {
    const session = isAuthDisabled() ? null : await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const progress = await getUserProgress(identity.email);

    if (!progress) {
      return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 });
    }

    return NextResponse.json(progress);
  } catch (error) {
    logError(error, 'Failed to fetch training progress');
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  logApiRequest('PUT', '/api/training/progress');

  try {
    const session = isAuthDisabled() ? null : await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const body = await request.json();
    const {
      completedPathways,
      totalPathways,
      completedLessons,
      totalLessons,
      weeklyGoal,
      weeklyProgress,
      pointsEarned,
      lessonsCompleted,
      timeSpent,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {};
    if (completedPathways !== undefined) updates.completed_pathways = completedPathways;
    if (totalPathways !== undefined) updates.total_pathways = totalPathways;
    if (completedLessons !== undefined) updates.completed_lessons = completedLessons;
    if (totalLessons !== undefined) updates.total_lessons = totalLessons;
    if (weeklyGoal !== undefined) updates.weekly_goal = weeklyGoal;
    if (weeklyProgress !== undefined) updates.weekly_progress = weeklyProgress;

    const progress = await updateUserProgress(identity.email, updates);

    // Log activity if points/lessons/time are provided
    if (pointsEarned || lessonsCompleted || timeSpent) {
      await logActivity(
        identity.email,
        pointsEarned || 0,
        lessonsCompleted || 0,
        timeSpent || 0
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    logError(error, 'Failed to update training progress');
    return NextResponse.json(
      { error: 'Failed to update progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
