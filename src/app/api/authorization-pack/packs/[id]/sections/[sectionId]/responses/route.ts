import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSection, updatePackSection } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function POST(
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
    const promptId = body.promptId as string | undefined;
    const value = body.value as string | undefined;

    if (!promptId || value === undefined) {
      return NextResponse.json({ error: "promptId and value are required" }, { status: 400 });
    }

    // Validate promptId format (should be a simple identifier)
    if (!/^[a-zA-Z0-9_-]+$/.test(promptId)) {
      return NextResponse.json({ error: "Invalid promptId format" }, { status: 400 });
    }

    // Update narrative content with the new response
    const currentContent = section.narrative_content || {};
    const updatedContent = {
      ...currentContent,
      [promptId]: value,
    };

    await updatePackSection(sectionId, {
      narrative_content: updatedContent,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
