/**
 * SMCR Document Download/Delete API Routes
 * GET /api/smcr/documents/:documentId - Download a person/workflow document
 * DELETE /api/smcr/documents/:documentId - Delete a person/workflow document
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  deleteSmcrDocument,
  deleteWorkflowDocument,
  getFirm,
  getPerson,
  getSmcrDocument,
  getWorkflow,
  getWorkflowDocument,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { readSmcrDocument, removeSmcrDocument } from '@/lib/smcr-document-storage';

function isWorkflowDocumentId(documentId: string) {
  return documentId.startsWith('wdoc-');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  logApiRequest('GET', `/api/smcr/documents/${documentId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const workflowDoc = isWorkflowDocumentId(documentId)
      ? await getWorkflowDocument(documentId)
      : null;
    const personDoc = workflowDoc ? null : await getSmcrDocument(documentId);

    if (!workflowDoc && !personDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (workflowDoc) {
      const workflow = await getWorkflow(workflowDoc.workflow_id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      const firm = await getFirm(workflow.firm_id);
      if (!firm) {
        return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
      }
      if (firm.organization_id && firm.organization_id !== auth.organizationId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (!workflowDoc.file_path) {
        return NextResponse.json({ error: 'Document not available' }, { status: 404 });
      }

      const stored = await readSmcrDocument(workflowDoc.file_path);
      if (!stored) {
        return NextResponse.json({ error: 'Document not available' }, { status: 404 });
      }

      const headers = new Headers();
      headers.set('Content-Type', workflowDoc.type || stored.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${workflowDoc.name}"`);
      if (stored.contentLength) {
        headers.set('Content-Length', String(stored.contentLength));
      }

      return new NextResponse(stored.buffer as unknown as BodyInit, { headers });
    }

    if (!personDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const person = await getPerson(personDoc.person_id);
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

    if (!personDoc.file_path) {
      return NextResponse.json({ error: 'Document not available' }, { status: 404 });
    }

    const stored = await readSmcrDocument(personDoc.file_path);
    if (!stored) {
      return NextResponse.json({ error: 'Document not available' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', personDoc.type || stored.contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${personDoc.name}"`);
    if (stored.contentLength) {
      headers.set('Content-Length', String(stored.contentLength));
    }

    return new NextResponse(stored.buffer as unknown as BodyInit, { headers });
  } catch (error) {
    logError(error, 'Failed to fetch SMCR document', { documentId });
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  logApiRequest('DELETE', `/api/smcr/documents/${documentId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const workflowDoc = isWorkflowDocumentId(documentId)
      ? await getWorkflowDocument(documentId)
      : null;
    const personDoc = workflowDoc ? null : await getSmcrDocument(documentId);

    if (!workflowDoc && !personDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (workflowDoc) {
      const workflow = await getWorkflow(workflowDoc.workflow_id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      const firm = await getFirm(workflow.firm_id);
      if (!firm) {
        return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
      }
      if (firm.organization_id && firm.organization_id !== auth.organizationId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (workflowDoc.file_path) {
        await removeSmcrDocument(workflowDoc.file_path);
      }
      await deleteWorkflowDocument(documentId);
      return NextResponse.json({ success: true });
    }

    if (!personDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const person = await getPerson(personDoc.person_id);
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

    if (personDoc.file_path) {
      await removeSmcrDocument(personDoc.file_path);
    }
    await deleteSmcrDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Failed to delete SMCR document', { documentId });
    return NextResponse.json(
      { error: 'Failed to delete document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
