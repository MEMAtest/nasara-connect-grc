import { NextRequest, NextResponse } from 'next/server';
import { createAssessment, getAssessments, initDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'default-org';

    const assessments = await getAssessments(organizationId);
    return NextResponse.json(assessments);
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('assessments-fetch-failed', error);
    } else {
      console.error('Error fetching assessments:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize database if needed
    await initDatabase();

    const body = await request.json();
    const { name, description, businessType, permissions, organizationId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Assessment name is required' },
        { status: 400 }
      );
    }

    const assessment = await createAssessment({
      name,
      description,
      business_type: businessType,
      target_permissions: permissions,
      organization_id: organizationId || 'default-org'
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('assessment-creation-failed', error);
    } else {
      console.error('Error creating assessment:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}