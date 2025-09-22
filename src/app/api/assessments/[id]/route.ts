import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessment = await getAssessment(id);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('assessment-fetch-failed', error, { assessmentId: id });
    } else {
      console.error('Error fetching assessment:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}