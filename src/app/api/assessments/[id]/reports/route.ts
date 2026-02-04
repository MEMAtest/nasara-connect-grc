import { NextRequest, NextResponse } from 'next/server';
import { getReports, initializeReports, updateReportStatus, getAssessment } from '@/lib/database';
import { logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

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

    const reports = await getReports(assessmentId);

    // If no reports exist, initialize with standard report types
    if (reports.length === 0) {
      await initializeReports(assessmentId);
      const newReports = await getReports(assessmentId);
      return NextResponse.json(newReports);
    }

    return NextResponse.json(reports);
  } catch (error) {
    logError(error, 'Failed to fetch reports', { assessmentId: 'unknown' });
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { id: assessmentId } = await params;
    const { reportId, status, filePath } = await request.json();

    if (!assessmentId || !reportId || !status) {
      return NextResponse.json({ error: 'Assessment ID, report ID, and status are required' }, { status: 400 });
    }

    if (!['pending', 'generating', 'completed', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await updateReportStatus(reportId, status, filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to update report status');
    return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { id: assessmentId } = await params;
    const { reportId } = await request.json();

    if (!assessmentId || !reportId) {
      return NextResponse.json({ error: 'Assessment ID and report ID are required' }, { status: 400 });
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Set status to generating
    await updateReportStatus(reportId, 'generating');

    // Simulate report generation (in real implementation, this would trigger actual report generation)
    setTimeout(async () => {
      try {
        // Simulate successful generation
        const filePath = `/reports/${assessmentId}/${reportId}.pdf`;
        await updateReportStatus(reportId, 'completed', filePath);
      } catch {
        await updateReportStatus(reportId, 'failed');
      }
    }, 2000);

    return NextResponse.json({ success: true, message: 'Report generation started' });
  } catch (error) {
    logError(error, 'Failed to generate report');
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
