import { NextRequest, NextResponse } from 'next/server';
import { saveAssessmentResponse, getAssessmentResponses, updateSectionProgress, getAssessment } from '@/lib/database';
import { getQuestionsBySection } from '@/app/(dashboard)/authorization-pack/lib/questionBank';
import { logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const assessment = await getAssessment(id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (!assessment.organization_id || assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const responses = await getAssessmentResponses(id);

    // Filter by section if provided
    const filteredResponses = section
      ? responses.filter(r => r.section === section)
      : responses;

    return NextResponse.json(filteredResponses);
  } catch (error) {
    logError(error, 'Failed to fetch assessment responses');
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
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
    const body = await request.json();
    const { questionId, section, value, score, notes } = body;

    if (!questionId || !section || value === undefined || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (!assessment.organization_id || assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Save the response
    await saveAssessmentResponse({
      assessment_id: assessmentId,
      question_id: questionId,
      section,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      score,
      notes
    });

    // Update section progress
    const sectionQuestions = getQuestionsBySection(section);
    const responses = await getAssessmentResponses(assessmentId);
    const sectionResponses = responses.filter(r => r.section === section);

    const sectionScore = sectionResponses.reduce((sum, r) => sum + r.score, 0);
    const maxSectionScore = sectionQuestions.reduce((sum, q) => sum + (q.weight * 3), 0); // Max 3 points per question

    await updateSectionProgress({
      assessment_id: assessmentId,
      section_id: section,
      completed_questions: sectionResponses.length,
      total_questions: sectionQuestions.length,
      score: sectionScore,
      max_score: maxSectionScore
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to save assessment response');
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}
