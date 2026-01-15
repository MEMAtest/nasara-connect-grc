import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections, deleteAuthorizationPack } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

// Calculate readiness from sections
function calculateReadiness(sections: { status: string; progress_percentage: number }[]) {
  if (!sections || sections.length === 0) {
    return { overall: 0, narrative: 0, evidence: 0, review: 0 };
  }
  const total = sections.length;
  const narrative = Math.round(sections.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / total);
  const approved = sections.filter((s) => s.status === "approved").length;
  const review = Math.round((approved / total) * 100);
  const evidence = Math.round((narrative + review) / 2);
  const overall = Math.round(narrative * 0.4 + evidence * 0.3 + review * 0.3);
  return { overall, narrative, evidence, review };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sections = await getPackSections(id);
    const readiness = calculateReadiness(sections);

    return NextResponse.json({
      pack: {
        id: pack.id,
        name: pack.name,
        status: pack.status,
        target_submission_date: pack.target_submission_date,
        created_at: pack.created_at,
        updated_at: pack.updated_at,
        template_type: pack.template_name,
        template_name: pack.template_name,
      },
      readiness,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const deleted = await deleteAuthorizationPack(id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete pack" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Pack deleted successfully" });
  } catch (error) {
    logError(error, "Failed to delete authorization pack");
    return NextResponse.json(
      { error: "Failed to delete pack" },
      { status: 500 }
    );
  }
}
