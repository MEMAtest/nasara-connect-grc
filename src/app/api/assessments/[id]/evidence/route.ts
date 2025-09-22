import { NextRequest, NextResponse } from 'next/server';
import { getEvidenceDocuments, initializeEvidenceDocuments, updateEvidenceDocument } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 });
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
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('evidence-documents-fetch-failed', error, { assessmentId });
    } else {
      console.error('Error fetching evidence documents:', error);
    }
    return NextResponse.json({ error: 'Failed to fetch evidence documents' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const { documentId, ...updates } = await request.json();

    if (!assessmentId || !documentId) {
      return NextResponse.json({ error: 'Assessment ID and document ID are required' }, { status: 400 });
    }

    // Handle file upload status changes
    if (updates.status === 'uploaded' && !updates.uploaded_at) {
      updates.uploaded_at = new Date();
    }

    await updateEvidenceDocument(documentId, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error for production monitoring - replace with proper logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Replace with proper logging service (e.g., Winston, DataDog, etc.)
      // logError('evidence-document-update-failed', error, { assessmentId, documentId });
    } else {
      console.error('Error updating evidence document:', error);
    }
    return NextResponse.json({ error: 'Failed to update evidence document' }, { status: 500 });
  }
}