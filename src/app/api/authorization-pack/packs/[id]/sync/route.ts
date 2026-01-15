import { NextRequest, NextResponse } from "next/server";
import { syncPackFromTemplate } from "@/lib/authorization-pack-db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await syncPackFromTemplate(id);
    return NextResponse.json({ status: "ok", ...result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sync pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
