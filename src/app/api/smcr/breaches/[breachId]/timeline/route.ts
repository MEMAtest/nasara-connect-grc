/**
 * SMCR Breach Timeline API
 * POST /api/smcr/breaches/:breachId/timeline
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { initSmcrDatabase, getBreach, updateBreach, getFirm } from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ breachId: string }> }
) {
  const { breachId } = await params;
  logApiRequest("POST", `/api/smcr/breaches/${breachId}/timeline`);

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

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Timeline entry is required" }, { status: 400 });
    }

    const timeline = Array.isArray(breach.timeline) ? breach.timeline : [];
    const entry = {
      ...body,
      id: body.id ?? `timeline-${crypto.randomUUID()}`,
      created_at: body.created_at ?? new Date().toISOString(),
    };
    const updated = await updateBreach(breachId, { timeline: [...timeline, entry] });

    return NextResponse.json(updated);
  } catch (error) {
    logError(error, "Failed to append breach timeline", { breachId });
    return NextResponse.json(
      { error: "Failed to update breach timeline", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
