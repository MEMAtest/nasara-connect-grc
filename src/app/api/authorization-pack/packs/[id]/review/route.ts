import { NextRequest, NextResponse } from "next/server";
import { getPack, listReviewQueue, updateReviewGate } from "@/lib/authorization-pack-db";
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

    const review = await listReviewQueue(id);

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

    const body = await request.json();
    const gateId = body.gateId as string | undefined;
    const state = body.state as string | undefined;
    const notes = body.notes as string | undefined;
    const clientNotes = body.clientNotes as string | undefined;

    if (!gateId || !state) {
      return NextResponse.json({ error: "gateId and state are required" }, { status: 400 });
    }
    if (!isValidUUID(gateId)) {
      return NextResponse.json({ error: "Invalid gate ID format" }, { status: 400 });
    }

    await updateReviewGate({
      gateId,
      state,
      reviewerId: auth.userId || null,
      notes,
      clientNotes,
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review gate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
