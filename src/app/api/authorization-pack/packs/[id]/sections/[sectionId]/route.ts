import { NextRequest, NextResponse } from "next/server";
import { getPack, getSectionWorkspace, resetReviewGates, updateSectionState } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function GET(
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

    return NextResponse.json(workspace);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load section workspace", details: error instanceof Error ? error.message : "Unknown error" },
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

    const body = await request.json().catch(() => ({}));
    const status = body.status as string | undefined;
    const reviewState = body.reviewState as string | undefined;
    const ownerId = body.ownerId as string | null | undefined;
    const dueDateRaw = body.dueDate as string | null | undefined;
    const dueDate = dueDateRaw === "" ? null : dueDateRaw;
    const resetReview = Boolean(body.resetReview);

    if (
      status === undefined &&
      reviewState === undefined &&
      ownerId === undefined &&
      dueDate === undefined &&
      !resetReview
    ) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await updateSectionState({
      sectionId,
      status,
      reviewState,
      ownerId,
      dueDate,
    });

    if (resetReview) {
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
