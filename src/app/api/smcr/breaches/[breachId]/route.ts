/**
 * SMCR Breach API Routes
 * GET /api/smcr/breaches/:breachId
 * PATCH /api/smcr/breaches/:breachId
 * DELETE /api/smcr/breaches/:breachId
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initSmcrDatabase,
  getBreach,
  updateBreach,
  deleteBreach,
  getFirm,
} from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ breachId: string }> }
) {
  const { breachId } = await params;
  logApiRequest("GET", `/api/smcr/breaches/${breachId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const breach = await getBreach(breachId);
    if (!breach) {
      return NextResponse.json({ error: "Breach not found" }, { status: 404 });
    }

    const firm = await getFirm(breach.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(breach);
  } catch (error) {
    logError(error, "Failed to fetch SMCR breach", { breachId });
    return NextResponse.json(
      { error: "Failed to fetch breach", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ breachId: string }> }
) {
  const { breachId } = await params;
  logApiRequest("PATCH", `/api/smcr/breaches/${breachId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getBreach(breachId);
    if (!existing) {
      return NextResponse.json({ error: "Breach not found" }, { status: 404 });
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
    if (body.person_id !== undefined) updates.person_id = body.person_id;
    if (body.rule_id !== undefined) updates.rule_id = body.rule_id;
    if (body.severity !== undefined) updates.severity = body.severity;
    if (body.status !== undefined) updates.status = body.status;
    if (body.timeline !== undefined) updates.timeline = body.timeline;
    if (body.details !== undefined) updates.details = body.details;

    const updated = await updateBreach(breachId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Breach not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to update SMCR breach", { breachId });
    return NextResponse.json(
      { error: "Failed to update breach", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ breachId: string }> }
) {
  const { breachId } = await params;
  logApiRequest("DELETE", `/api/smcr/breaches/${breachId}`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const existing = await getBreach(breachId);
    if (!existing) {
      return NextResponse.json({ error: "Breach not found" }, { status: 404 });
    }

    const firm = await getFirm(existing.firm_id);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteBreach(breachId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete SMCR breach", { breachId });
    return NextResponse.json(
      { error: "Failed to delete breach", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
