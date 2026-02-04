/**
 * SMCR Workflows API Routes
 * GET /api/smcr/firms/:firmId/workflows - List all workflows
 * POST /api/smcr/firms/:firmId/workflows - Create a new workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createWorkflow,
  getFirm,
  getWorkflows,
  initSmcrDatabase,
  CreateWorkflowInput,
} from '@/lib/smcr-database';
import { createNotification } from "@/lib/server/notifications-store";
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/workflows`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const workflows = await getWorkflows(firmId);
    return NextResponse.json(workflows);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR workflows', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch workflows', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('POST', `/api/smcr/firms/${firmId}/workflows`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      templateId,
      name,
      summary,
      ownerPersonId,
      ownerName,
      dueDate,
      steps,
      successCriteria,
      triggerEvent,
    } = body;

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }

    const input: CreateWorkflowInput = {
      firm_id: firmId,
      template_id: templateId,
      name,
      summary,
      owner_person_id: ownerPersonId,
      owner_name: ownerName,
      due_date: dueDate,
      steps: steps || [],
      success_criteria: successCriteria,
      trigger_event: triggerEvent,
    };

    const workflow = await createWorkflow(input);
    try {
      await createNotification({
        organizationId: auth.organizationId,
        title: "SMCR workflow created",
        message: `Workflow "${workflow.name}" created for SMCR oversight.`,
        severity: "info",
        source: "smcr",
        link: "/smcr/workflows",
        metadata: { firmId, workflowId: workflow.id },
      });
    } catch {
      // Non-blocking notification failures
    }
    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR workflow', { firmId });
    return NextResponse.json(
      { error: 'Failed to create workflow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
