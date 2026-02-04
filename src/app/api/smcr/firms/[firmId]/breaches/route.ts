/**
 * SMCR Breaches API Routes
 * GET /api/smcr/firms/:firmId/breaches
 * POST /api/smcr/firms/:firmId/breaches
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initSmcrDatabase,
  getFirm,
  getBreaches,
  createBreach,
} from "@/lib/smcr-database";
import { logError, logApiRequest } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest("GET", `/api/smcr/firms/${firmId}/breaches`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const breaches = await getBreaches(firmId);
    return NextResponse.json({ breaches });
  } catch (error) {
    logError(error, "Failed to fetch SMCR breaches", { firmId });
    return NextResponse.json(
      { error: "Failed to fetch breaches", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ firmId: string }> }
) {
  const { firmId } = await params;
  logApiRequest("POST", `/api/smcr/firms/${firmId}/breaches`);

  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initSmcrDatabase();

    const firm = await getFirm(firmId);
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }
    if (firm.organization_id && firm.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.severity || !body.status) {
      return NextResponse.json({ error: "severity and status are required" }, { status: 400 });
    }

    const breach = await createBreach({
      firm_id: firmId,
      person_id: body.person_id,
      rule_id: body.rule_id,
      severity: body.severity,
      status: body.status,
      timeline: Array.isArray(body.timeline) ? body.timeline : [],
      details:
        body.details && typeof body.details === "object"
          ? body.details
          : typeof body === "object"
            ? body
            : {},
    });

    return NextResponse.json(breach, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create SMCR breach", { firmId });
    return NextResponse.json(
      { error: "Failed to create breach", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
