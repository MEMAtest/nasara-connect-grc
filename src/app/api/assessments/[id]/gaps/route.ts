import { NextRequest, NextResponse } from 'next/server';
import { getGapAnalysis, initializeGapAnalysis, updateGapStatus, getAssessment } from '@/lib/database';
import { logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { checkRateLimit, rateLimitExceeded } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { id: assessmentId } = await params;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const gaps = await getGapAnalysis(assessmentId);

    // If no gaps exist, initialize with standard FCA gaps
    if (gaps.length === 0) {
      await initializeGapAnalysis(assessmentId);
      const newGaps = await getGapAnalysis(assessmentId);
      return NextResponse.json(newGaps);
    }

    return NextResponse.json(gaps);
  } catch (error) {
    logError(error, 'Failed to fetch gap analysis');
    return NextResponse.json({ error: 'Failed to fetch gap analysis' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { success: rlOk, headers: rlHeaders } = await checkRateLimit(request, { requests: 30, window: "60 s" });
    if (!rlOk) return rateLimitExceeded(rlHeaders);

    const { id: assessmentId } = await params;
    const { gapId, status } = await request.json();

    if (!assessmentId || !gapId || !status) {
      return NextResponse.json({ error: 'Assessment ID, gap ID, and status are required' }, { status: 400 });
    }

    if (!['identified', 'in-progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await updateGapStatus(gapId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to update gap status');
    return NextResponse.json({ error: 'Failed to update gap status' }, { status: 500 });
  }
}
