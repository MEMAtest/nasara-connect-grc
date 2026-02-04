/**
 * SMCR Person Documents API Routes
 * GET /api/smcr/people/:personId/documents - List documents for a person
 * POST /api/smcr/people/:personId/documents - Upload a document for a person
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createSmcrDocument,
  getFirm,
  getPerson,
  getSmcrDocuments,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { storeSmcrDocument } from '@/lib/smcr-document-storage';
import { validateFileUpload, sanitizeFilename } from '@/lib/file-upload-security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('GET', `/api/smcr/people/${personId}/documents`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const person = await getPerson(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const firm = await getFirm(person.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const documents = await getSmcrDocuments(personId);
    return NextResponse.json(documents);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR documents', { personId });
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  const { personId } = await params;
  logApiRequest('POST', `/api/smcr/people/${personId}/documents`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const person = await getPerson(personId);
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const firm = await getFirm(person.firm_id);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const category = formData.get('category');
    const notes = formData.get('notes');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: 'File validation failed', details: validation.error }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey } = await storeSmcrDocument(
      `people/${personId}`,
      safeName,
      buffer,
      file.type || 'application/octet-stream'
    );

    const document = await createSmcrDocument({
      person_id: personId,
      category: category.trim(),
      name: safeName,
      type: file.type || 'application/octet-stream',
      size: file.size,
      file_path: storageKey,
      notes: typeof notes === 'string' ? notes : undefined,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to upload SMCR document', { personId });
    return NextResponse.json(
      { error: 'Failed to upload document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
