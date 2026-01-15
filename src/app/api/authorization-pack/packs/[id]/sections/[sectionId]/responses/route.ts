import { NextRequest, NextResponse } from "next/server";
import { getPack, getSectionWorkspace, savePromptResponse } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id, sectionId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const workspace = await getSectionWorkspace(id, sectionId);
    if (!workspace) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    const body = await request.json();
    const promptId = body.promptId as string | undefined;
    const value = body.value as string | undefined;

    if (!promptId || value === undefined) {
      return NextResponse.json({ error: "promptId and value are required" }, { status: 400 });
    }

    if (!isValidUUID(promptId)) {
      return NextResponse.json({ error: "Invalid prompt ID format" }, { status: 400 });
    }

    const promptIds = new Set(workspace.prompts.map((prompt: { id: string }) => prompt.id));
    if (!promptIds.has(promptId)) {
      return NextResponse.json({ error: "Prompt does not belong to this section" }, { status: 400 });
    }

    await savePromptResponse({
      sectionInstanceId: sectionId,
      promptId,
      value,
      updatedBy: auth.userId || null,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
