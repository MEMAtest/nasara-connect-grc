import { NextRequest, NextResponse } from "next/server";
import { listReviewQueue, updateReviewGate } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const body = await request.json();
    const gateId = body.gateId as string | undefined;
    const state = body.state as string | undefined;

    if (!gateId || !state) {
      return NextResponse.json({ error: "gateId and state are required" }, { status: 400 });
    }

    await updateReviewGate({
      gateId,
      state,
      reviewerId: body.reviewerId ?? null,
      notes: body.notes ?? null,
      clientNotes: body.clientNotes ?? null,
    });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review gate", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
