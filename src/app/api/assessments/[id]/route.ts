import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/database';
import { logError } from '@/lib/logger';

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
    logError(error, 'Failed to fetch assessment', { assessmentId: 'unknown' });
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}