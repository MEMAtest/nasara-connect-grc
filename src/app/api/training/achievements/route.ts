/**
 * Training Achievements/Badges API Routes
 * GET /api/training/achievements - Get all badges for current user
 * POST /api/training/achievements - Award a new badge
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from "@/lib/rbac";
import { logError, logApiRequest } from '@/lib/logger';
import {
  initTrainingDatabase,
  getUserBadges,
  awardBadge,
} from '@/lib/training-database';

// Badge definitions for the training module
const AVAILABLE_BADGES = {
  'first-lesson': {
    name: 'First Steps',
    description: 'Complete your first training lesson',
    icon: 'star',
    rarity: 'common',
  },
  'streak-7': {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'flame',
    rarity: 'uncommon',
  },
  'streak-30': {
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'crown',
    rarity: 'rare',
  },
  'pathway-complete': {
    name: 'Pathway Pioneer',
    description: 'Complete your first learning pathway',
    icon: 'map',
    rarity: 'uncommon',
  },
  'all-pathways': {
    name: 'Compliance Champion',
    description: 'Complete all available learning pathways',
    icon: 'trophy',
    rarity: 'legendary',
  },
  'perfect-score': {
    name: 'Perfect Score',
    description: 'Achieve 100% on any assessment',
    icon: 'check-circle',
    rarity: 'rare',
  },
  'quick-learner': {
    name: 'Quick Learner',
    description: 'Complete 5 modules in a single day',
    icon: 'zap',
    rarity: 'uncommon',
  },
  'knowledge-seeker': {
    name: 'Knowledge Seeker',
    description: 'Complete 25 training modules',
    icon: 'book-open',
    rarity: 'rare',
  },
  'early-bird': {
    name: 'Early Bird',
    description: 'Complete a lesson before 7 AM',
    icon: 'sunrise',
    rarity: 'common',
  },
  'night-owl': {
    name: 'Night Owl',
    description: 'Complete a lesson after 10 PM',
    icon: 'moon',
    rarity: 'common',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  logApiRequest('GET', '/api/training/achievements');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const earnedBadges = await getUserBadges(auth.userEmail);

    // Map earned badges and include all available badges with earned status
    const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id));

    const allBadges = Object.entries(AVAILABLE_BADGES).map(([id, badge]) => ({
      id,
      ...badge,
      earned: earnedBadgeIds.has(id),
      earnedAt: earnedBadges.find(b => b.badge_id === id)?.earned_at || null,
    }));

    return NextResponse.json({
      earned: earnedBadges,
      all: allBadges,
      earnedCount: earnedBadges.length,
      totalCount: Object.keys(AVAILABLE_BADGES).length,
    });
  } catch (error) {
    logError(error, 'Failed to fetch achievements');
    return NextResponse.json(
      { error: 'Failed to fetch achievements', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest('POST', '/api/training/achievements');

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    if (!auth.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initTrainingDatabase();

    const body = await request.json();
    const { badgeId } = body;

    if (!badgeId) {
      return NextResponse.json({ error: 'badgeId is required' }, { status: 400 });
    }

    const badgeDefinition = AVAILABLE_BADGES[badgeId as keyof typeof AVAILABLE_BADGES];
    if (!badgeDefinition) {
      return NextResponse.json({ error: 'Invalid badge ID' }, { status: 400 });
    }

    const badge = await awardBadge(
      auth.userEmail,
      badgeId,
      badgeDefinition.name,
      badgeDefinition.description,
      badgeDefinition.icon,
      badgeDefinition.rarity
    );

    if (!badge) {
      return NextResponse.json({
        message: 'Badge already earned',
        alreadyEarned: true,
      });
    }

    return NextResponse.json({
      message: 'Badge awarded successfully',
      badge,
      alreadyEarned: false,
    });
  } catch (error) {
    logError(error, 'Failed to award badge');
    return NextResponse.json(
      { error: 'Failed to award badge', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
