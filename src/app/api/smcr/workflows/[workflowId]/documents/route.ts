/**
 * SMCR Workflow Documents API Routes
 * GET /api/smcr/workflows/:workflowId/documents - List workflow documents
 * POST /api/smcr/workflows/:workflowId/documents - Upload workflow document
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createWorkflowDocument,
  getFirm,
  getWorkflow,
  getWorkflowDocuments,
  initSmcrDatabase,
} from '@/lib/smcr-database';
import { logApiRequest, logError } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { storeSmcrDocument } from '@/lib/smcr-document-storage';
import { validateFileUpload, sanitizeFilename } from '@/lib/file-upload-security';
import { checkRateLimit, rateLimitExceeded } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  logApiRequest('GET', `/api/smcr/workflows/${workflowId}/documents`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const workflow = await getWorkflow(workflowId);
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

    const documents = await getWorkflowDocuments(workflowId);
    return NextResponse.json(documents);
  } catch (error) {
    logError(error, 'Failed to fetch workflow documents', { workflowId });
    return NextResponse.json(
      { error: 'Failed to fetch workflow documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  logApiRequest('POST', `/api/smcr/workflows/${workflowId}/documents`);

  const { success: rlOk, headers: rlHeaders } = await checkRateLimit(request, { requests: 20, window: "60 s" });
  if (!rlOk) return rateLimitExceeded(rlHeaders);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const workflow = await getWorkflow(workflowId);
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

    const formData = await request.formData();
    const file = formData.get('file');
    const stepId = formData.get('stepId');
    const summary = formData.get('summary');
    const status = formData.get('status');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (typeof stepId !== 'string' || stepId.trim().length === 0) {
      return NextResponse.json({ error: 'Step ID is required' }, { status: 400 });
    }

    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: 'File validation failed', details: validation.error }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey } = await storeSmcrDocument(
      `workflows/${workflowId}`,
      safeName,
      buffer,
      file.type || 'application/octet-stream'
    );

    const document = await createWorkflowDocument({
      firm_id: workflow.firm_id,
      workflow_id: workflowId,
      step_id: stepId.trim(),
      name: safeName,
      type: file.type || 'application/octet-stream',
      size: file.size,
      file_path: storageKey,
      summary: typeof summary === 'string' ? summary : undefined,
      status: typeof status === 'string' ? status : undefined,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to upload workflow document', { workflowId });
    return NextResponse.json(
      { error: 'Failed to upload workflow document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
