import { NextRequest, NextResponse } from 'next/server';
import { getEvidenceDocuments, initializeEvidenceDocuments, updateEvidenceDocument, getAssessment } from '@/lib/database';
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
    if (!assessment.organization_id || assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const documents = await getEvidenceDocuments(assessmentId);

    // If no documents exist, initialize with standard FCA documents
    if (documents.length === 0) {
      await initializeEvidenceDocuments(assessmentId);
      const newDocuments = await getEvidenceDocuments(assessmentId);
      return NextResponse.json(newDocuments);
    }

    return NextResponse.json(documents);
  } catch (error) {
    logError(error, 'Failed to fetch evidence documents');
    return NextResponse.json({ error: 'Failed to fetch evidence documents' }, { status: 500 });
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
    const { documentId, ...updates } = await request.json();

    if (!assessmentId || !documentId) {
      return NextResponse.json({ error: 'Assessment ID and document ID are required' }, { status: 400 });
    }

    const assessment = await getAssessment(assessmentId);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    if (!assessment.organization_id || assessment.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle file upload status changes
    if (updates.status === 'uploaded' && !updates.uploaded_at) {
      updates.uploaded_at = new Date();
    }

    await updateEvidenceDocument(documentId, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to update evidence document');
    return NextResponse.json({ error: 'Failed to update evidence document' }, { status: 500 });
  }
}
