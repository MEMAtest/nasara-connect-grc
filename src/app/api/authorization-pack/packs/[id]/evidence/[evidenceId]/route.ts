import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getEvidenceItem } from "@/lib/authorization-pack-db";

const storageRoot = path.join(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id, evidenceId } = await params;
    const item = await getEvidenceItem({ packId: id, evidenceId });
    if (!item || !item.file_path) {
      return NextResponse.json({ error: "Evidence file not found" }, { status: 404 });
    }

    if (!item.file_path.startsWith(storageRoot)) {
      return NextResponse.json({ error: "Invalid evidence path" }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(item.file_path);
    const filename = path.basename(item.file_path);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": item.file_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
