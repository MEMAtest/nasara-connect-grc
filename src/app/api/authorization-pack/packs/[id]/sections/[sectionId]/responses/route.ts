import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPack, getSectionWorkspace, savePromptResponse } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { checkRateLimit, handleApiError, rateLimitExceeded, validateRequest } from "@/lib/api-utils";
import { requireRole } from "@/lib/rbac";

const SavePromptResponseSchema = z.object({
  promptId: z.string().uuid(),
  value: z.unknown(),
  version: z.number().int().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

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

    const body = await validateRequest(request, SavePromptResponseSchema);
    const promptId = body.promptId;
    let value: string;
    if (typeof body.value === "string") {
      value = body.value;
    } else if (body.value === null || body.value === undefined) {
      value = "";
    } else {
      value = JSON.stringify(body.value);
    }
    const expectedVersion = body.version;

    const promptIds = new Set(workspace.prompts.map((prompt: { id: string }) => prompt.id));
    if (!promptIds.has(promptId)) {
      return NextResponse.json({ error: "Prompt does not belong to this section" }, { status: 400 });
    }

    await savePromptResponse({
      sectionInstanceId: sectionId,
      promptId,
      value,
      updatedBy: auth.userId || null,
      expectedVersion,
    });

    return NextResponse.json({ status: "ok" }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
