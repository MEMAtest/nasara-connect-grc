import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { getEvidenceVersion } from "@/lib/authorization-pack-db";

const storageRoot = path.join(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; evidenceId: string; versionId: string }> }
) {
  try {
    const { id, evidenceId, versionId } = await params;
    const version = await getEvidenceVersion({ packId: id, evidenceId, versionId });
    if (!version || !version.file_path) {
      return NextResponse.json({ error: "Evidence version not found" }, { status: 404 });
    }

    if (!version.file_path.startsWith(storageRoot)) {
      return NextResponse.json({ error: "Invalid evidence path" }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(version.file_path);
    const filename = version.filename || path.basename(version.file_path);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": version.file_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download evidence version", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
