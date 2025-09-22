import { NextRequest, NextResponse } from 'next/server';
import { getReports, initializeReports, updateReportStatus } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
    }

    const reports = await getReports(assessmentId);

    // If no reports exist, initialize with standard report types
    if (reports.length === 0) {
      await initializeReports(assessmentId);
      const newReports = await getReports(assessmentId);
      return NextResponse.json(newReports);
    }

    return NextResponse.json(reports);
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('reports-fetch-failed', error, { assessmentId });
    } else {
      console.error('Error fetching reports:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { reportId, status, filePath } = await request.json();

    if (!assessmentId || !reportId || !status) {
      return NextResponse.json({ error: 'Assessment ID, report ID, and status are required' }, { status: 400 });
    }

    if (!['pending', 'generating', 'completed', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    await updateReportStatus(reportId, status, filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('report-status-update-failed', error, { assessmentId, reportId, status });
    } else {
      console.error('Error updating report status:', error);
    }
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { reportId } = await request.json();

    if (!assessmentId || !reportId) {
      return NextResponse.json({ error: 'Assessment ID and report ID are required' }, { status: 400 });
    }

    // Set status to generating
    await updateReportStatus(reportId, 'generating');

    // Simulate report generation (in real implementation, this would trigger actual report generation)
    setTimeout(async () => {
      try {
        // Simulate successful generation
        const filePath = `/reports/${assessmentId}/${reportId}.pdf`;
        await updateReportStatus(reportId, 'completed', filePath);
      } catch (error) {
        await updateReportStatus(reportId, 'failed');
      }
    }, 2000);

    return NextResponse.json({ success: true, message: 'Report generation started' });
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('report-generation-failed', error, { assessmentId, reportId });
    } else {
      console.error('Error generating report:', error);
    }
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}