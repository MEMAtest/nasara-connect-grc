import { NextRequest, NextResponse } from "next/server";
import { savePromptResponse } from "@/lib/authorization-pack-db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const body = await request.json();
    const promptId = body.promptId as string | undefined;
    const value = body.value as string | undefined;

    if (!promptId || value === undefined) {
      return NextResponse.json({ error: "promptId and value are required" }, { status: 400 });
    }

    await savePromptResponse({
      sectionInstanceId: sectionId,
      promptId,
      value,
      updatedBy: body.updatedBy ?? null,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
