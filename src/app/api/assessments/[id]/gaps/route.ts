import { NextRequest, NextResponse } from 'next/server';
import { getGapAnalysis, initializeGapAnalysis, updateGapStatus } from '@/lib/database';
import { logError } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
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
    const { id: assessmentId } = await params;
    const { gapId, status } = await request.json();

    if (!assessmentId || !gapId || !status) {
      return NextResponse.json({ error: 'Assessment ID, gap ID, and status are required' }, { status: 400 });
    }

    if (!['identified', 'in-progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    await updateGapStatus(gapId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to update gap status');
    return NextResponse.json({ error: 'Failed to update gap status' }, { status: 500 });
  }
}