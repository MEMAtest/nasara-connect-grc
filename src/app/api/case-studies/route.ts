import { NextRequest, NextResponse } from 'next/server';
import {
  getCaseStudies,
  createCaseStudy,
  initDatabase,
  seedCaseStudies,
  CaseStudy,
} from '@/lib/database';
import { requireAuth } from '@/lib/auth-utils';

// GET: Fetch all case studies (published only for public, all for admin)
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    // Initialize database and seed if needed
    await initDatabase();
    await seedCaseStudies();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // TODO: Add auth check for admin access to unpublished case studies
    const caseStudies = await getCaseStudies(!all);
    return NextResponse.json(caseStudies);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching case studies:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    );
  }
}

// POST: Create a new case study (admin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAuth();
    if (error) return error;
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      iconKey,
      metrics,
      beforeAfter,
      industry,
      category,
      displayName,
      sortOrder,
      isPublished,
      featured,
    } = body;

    if (!title || !displayName) {
      return NextResponse.json(
        { error: 'Title and display name are required' },
        { status: 400 }
      );
    }

    const created = await createCaseStudy({
      title,
      subtitle,
      description,
      iconKey,
      metrics,
      beforeAfter,
      industry,
      category,
      displayName,
      sortOrder,
      isPublished,
      featured,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating case study:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    );
  }
}
