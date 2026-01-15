import { NextRequest, NextResponse } from "next/server";
import { getSectionWorkspace, resetReviewGates, updateSectionState } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const workspace = await getSectionWorkspace(id, sectionId);
    if (!workspace) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    return NextResponse.json(workspace);
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
    const { sectionId } = await params;
    const body = await request.json();
    await updateSectionState({
      sectionId,
      status: body.status ?? null,
      reviewState: body.reviewState ?? null,
      ownerId: body.ownerId ?? null,
      dueDate: body.dueDate ?? null,
    });
    if (body.resetReview) {
      await resetReviewGates(sectionId);
    }
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update section", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
