import { NextRequest, NextResponse } from "next/server";
import { getPack, getPackReadiness } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const readiness = await getPackReadiness(id);
    return NextResponse.json({ pack, readiness });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
