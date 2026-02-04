import { NextRequest, NextResponse } from "next/server";
import { getPack, getSections } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { requireRole } from "@/lib/rbac";

export async function GET(
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

    const sections = await getSections(id);

    // Transform to expected format
    const formattedSections = sections.map((s) => ({
      id: s.id,
      section_key: s.section_key,
      title: s.title || "Section",
      display_order: s.display_order || 0,
      status: s.status,
      narrativeCompletion: s.narrativeCompletion || 0,
      evidenceCompletion: s.evidenceCompletion || 0,
      reviewCompletion: s.reviewCompletion || 0,
    }));

    return NextResponse.json({ sections: formattedSections });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load sections", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
