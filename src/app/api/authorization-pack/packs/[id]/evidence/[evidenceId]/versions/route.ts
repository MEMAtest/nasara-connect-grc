import { NextRequest, NextResponse } from "next/server";
import { listEvidenceVersions } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id, evidenceId } = await params;
    const versions = await listEvidenceVersions({ packId: id, evidenceId });
    return NextResponse.json({ versions });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load evidence versions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
