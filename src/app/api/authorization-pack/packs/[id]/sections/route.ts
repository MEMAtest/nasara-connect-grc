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

    const sections = await getPackSections(id);

    // Transform to expected format
    const formattedSections = sections.map((s) => ({
      id: s.id,
      section_key: s.template?.code || s.id,
      title: s.template?.name || "Section",
      display_order: s.template?.order_index || 0,
      status: s.status,
      narrativeCompletion: s.progress_percentage || 0,
      evidenceCompletion: 0,
      reviewCompletion: s.status === "approved" ? 100 : 0,
    }));

    return NextResponse.json({ sections: formattedSections });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load sections", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
