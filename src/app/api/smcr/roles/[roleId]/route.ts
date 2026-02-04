/**
 * SMCR Role Assignment API Routes
 * PATCH /api/smcr/roles/:roleId - Update role assignment
 * DELETE /api/smcr/roles/:roleId - Delete role assignment
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initSmcrDatabase,
  getRoleAssignment,
  updateRoleAssignment,
  deleteRoleAssignment,
  getFirm,
} from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  logApiRequest("PATCH", `/api/smcr/roles/${roleId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getRoleAssignment(roleId);
    if (!existing) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    if (body.function_label !== undefined) updates.function_label = body.function_label;
    if (body.entity !== undefined) updates.entity = body.entity;
    if (body.start_date !== undefined) updates.start_date = body.start_date;
    if (body.end_date !== undefined) updates.end_date = body.end_date;
    if (body.assessment_date !== undefined) updates.assessment_date = body.assessment_date;
    if (body.approval_status !== undefined) updates.approval_status = body.approval_status;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updated = await updateRoleAssignment(roleId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to update SMCR role", { roleId });
    return NextResponse.json(
      { error: "Failed to update role", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  logApiRequest("DELETE", `/api/smcr/roles/${roleId}`);

  try {
    const { auth, error } = await requireRole("admin");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getRoleAssignment(roleId);
    if (!existing) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteRoleAssignment(roleId);

    await logAuditEvent(pool, {
      entityType: 'smcr_role',
      entityId: roleId,
      action: 'deleted',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete SMCR role", { roleId });
    return NextResponse.json(
      { error: "Failed to delete role", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
