import { NextRequest, NextResponse } from "next/server";
import { getPack, syncPackFromTemplate } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { requireRole } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const syncResult = await syncPackFromTemplate(id);

    return NextResponse.json({
      status: "ok",
      message: "Pack synced successfully",
      sectionsCreated: syncResult.addedSections,
      evidenceAdded: syncResult.addedEvidence,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sync pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
