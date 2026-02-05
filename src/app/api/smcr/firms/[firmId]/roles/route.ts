/**
 * SMCR Role Assignments API Routes
 * GET /api/smcr/firms/:firmId/roles - List all role assignments
 * POST /api/smcr/firms/:firmId/roles - Create a new role assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createRoleAssignment,
  getFirm,
  getRoleAssignments,
  initSmcrDatabase,
  CreateRoleInput,
} from '@/lib/smcr-database';
import { createNotification } from "@/lib/server/notifications-store";
import { logError, logApiRequest } from '@/lib/logger';
import { requireRole } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/api-utils";
import { pool } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('GET', `/api/smcr/firms/${firmId}/roles`);

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

    const roles = await getRoleAssignments(firmId);
    return NextResponse.json(roles);
  } catch (error) {
    logError(error, 'Failed to fetch SMCR role assignments', { firmId });
    return NextResponse.json(
      { error: 'Failed to fetch roles', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest('POST', `/api/smcr/firms/${firmId}/roles`);

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
      personId,
      functionId,
      functionType,
      functionLabel,
      entity,
      startDate,
      endDate,
      assessmentDate,
      approvalStatus,
      notes,
    } = body;

    if (!personId) {
      return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
    }

    if (!functionId) {
      return NextResponse.json({ error: 'Function ID is required' }, { status: 400 });
    }

    if (!functionType || !['SMF', 'CF'].includes(functionType)) {
      return NextResponse.json({ error: 'Function type must be SMF or CF' }, { status: 400 });
    }

    if (!startDate) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 });
    }

    const input: CreateRoleInput = {
      firm_id: firmId,
      person_id: personId,
      function_id: functionId,
      function_type: functionType,
      function_label: functionLabel,
      entity,
      start_date: startDate,
      end_date: endDate,
      assessment_date: assessmentDate,
      approval_status: approvalStatus,
      notes,
    };

    const role = await createRoleAssignment(input);
    try {
      await createNotification({
        organizationId: auth.organizationId,
        recipientEmail: auth.userEmail ?? null,
        title: "SMCR role assigned",
        message: `${role.function_label || role.function_id} assigned to ${role.person_id}.`,
        severity: "info",
        source: "smcr",
        link: "/smcr/smfs",
        metadata: { firmId, roleId: role.id, personId },
      });
    } catch {
      // Non-blocking notification failures
    }

    await logAuditEvent(pool, {
      entityType: 'smcr_role',
      entityId: role.id,
      action: 'created',
      actorId: auth.userId ?? 'unknown',
      organizationId: auth.organizationId,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    logError(error, 'Failed to create SMCR role assignment', { firmId });
    return NextResponse.json(
      { error: 'Failed to create role', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
