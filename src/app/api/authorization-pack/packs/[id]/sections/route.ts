import { NextRequest, NextResponse } from "next/server";
import { getSections } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sections = await getSections(id);
    return NextResponse.json({ sections });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load sections", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
