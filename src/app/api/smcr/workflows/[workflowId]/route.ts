/**
 * SMCR Workflow API Routes
 * GET /api/smcr/workflows/:workflowId
 * PATCH /api/smcr/workflows/:workflowId
 * DELETE /api/smcr/workflows/:workflowId
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initSmcrDatabase,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getFirm,
} from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  logApiRequest("GET", `/api/smcr/workflows/${workflowId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const workflow = await getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const firm = await getFirm(workflow.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    logError(error, "Failed to fetch SMCR workflow", { workflowId });
    return NextResponse.json(
      { error: "Failed to fetch workflow", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  logApiRequest("PATCH", `/api/smcr/workflows/${workflowId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getWorkflow(workflowId);
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.status !== undefined) updates.status = body.status;
    if (body.steps !== undefined) updates.steps = body.steps;
    if (body.due_date !== undefined) updates.due_date = body.due_date;

    const updated = await updateWorkflow(workflowId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to update SMCR workflow", { workflowId });
    return NextResponse.json(
      { error: "Failed to update workflow", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  const { workflowId } = await params;
  logApiRequest("DELETE", `/api/smcr/workflows/${workflowId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getWorkflow(workflowId);
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteWorkflow(workflowId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete SMCR workflow", { workflowId });
    return NextResponse.json(
      { error: "Failed to delete workflow", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
