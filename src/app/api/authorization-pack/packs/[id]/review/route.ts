import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

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

    // Get sections and build review queue from section statuses
    const sections = await getPackSections(id);

    const review = sections.map((s) => ({
      id: s.id,
      section_instance_id: s.id,
      section_title: s.template?.name || "Section",
      stage: s.status === "approved" ? "approved" : s.status === "review" ? "in-review" : "pending",
      state: s.status === "approved" ? "approved" : "pending",
      reviewer_role: "consultant",
      reviewer_id: s.reviewed_by,
      reviewed_at: s.approved_at,
      notes: null,
      client_notes: null,
    }));

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load review queue", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Review gate updates not yet implemented with new schema
    return NextResponse.json({ status: "ok", message: "Review updates coming soon" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review gate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
