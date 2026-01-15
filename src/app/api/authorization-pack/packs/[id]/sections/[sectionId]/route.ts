import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSection, updatePackSection } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id, sectionId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const section = await getPackSection(sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Verify section belongs to the pack
    if (section.pack_id !== id) {
      return NextResponse.json({ error: "Section does not belong to this pack" }, { status: 403 });
    }

    return NextResponse.json({
      id: section.id,
      pack_id: section.pack_id,
      section_key: section.template?.code || section.id,
      title: section.template?.name || "Section",
      status: section.status,
      progress_percentage: section.progress_percentage || 0,
      narrative_content: section.narrative_content || {},
      guidance_text: section.template?.guidance_text || null,
      regulatory_reference: section.template?.regulatory_reference || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id, sectionId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const section = await getPackSection(sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    if (section.pack_id !== id) {
      return NextResponse.json({ error: "Section does not belong to this pack" }, { status: 403 });
    }

    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['status', 'narrative_content', 'progress_percentage'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await updatePackSection(sectionId, updates);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
