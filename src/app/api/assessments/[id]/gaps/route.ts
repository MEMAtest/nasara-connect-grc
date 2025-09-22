import { NextRequest, NextResponse } from 'next/server';
import { getGapAnalysis, initializeGapAnalysis, updateGapStatus } from '@/lib/database';

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
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('gap-analysis-fetch-failed', error, { assessmentId });
    } else {
      console.error('Error fetching gap analysis:', error);
    }
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
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('gap-status-update-failed', error, { assessmentId, gapId, status });
    } else {
      console.error('Error updating gap status:', error);
    }
    return NextResponse.json({ error: 'Failed to update gap status' }, { status: 500 });
  }
}