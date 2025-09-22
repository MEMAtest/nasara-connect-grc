import { NextRequest, NextResponse } from 'next/server';
import { saveAssessmentResponse, getAssessmentResponses, updateSectionProgress } from '@/lib/database';
import { getQuestionsBySection, getSectionSummary } from '@/app/(dashboard)/authorization-pack/lib/questionBank';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const responses = await getAssessmentResponses(id);

    // Filter by section if provided
    const filteredResponses = section
      ? responses.filter(r => r.section === section)
      : responses;

    return NextResponse.json(filteredResponses);
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('assessment-responses-fetch-failed', error, { assessmentId: id });
    } else {
      console.error('Error fetching assessment responses:', error);
    }
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
    const { id: assessmentId } = await params;
    const body = await request.json();
    const { questionId, section, value, score, notes } = body;

    if (!questionId || !section || value === undefined || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('assessment-response-save-failed', error, { assessmentId, questionId, section });
    } else {
      console.error('Error saving assessment response:', error);
    }
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}