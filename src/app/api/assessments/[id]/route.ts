import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/database';
import { logError } from '@/lib/logger';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const assessment = await getAssessment(id);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    if (!assessment.organization_id || assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
