import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isValidUUID } from "@/lib/auth-utils";
import { getEvidenceItem, getEvidenceVersion, getPack } from "@/lib/authorization-pack-db";

// Define storage root as absolute path
const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string; versionId: string }> }
) {
  try {
    const { id, evidenceId, versionId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(evidenceId)) {
      return NextResponse.json({ error: "Invalid evidence ID format" }, { status: 400 });
    }
    if (!isValidUUID(versionId)) {
      return NextResponse.json({ error: "Invalid version ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const evidence = await getEvidenceItem({ packId: id, evidenceId });
    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    const version = await getEvidenceVersion({ packId: id, evidenceId, versionId });
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (!version.file_path) {
      return NextResponse.json({ error: "No file associated with this version" }, { status: 404 });
    }

    // Resolve the file path and prevent path traversal
    const filePath = path.resolve(storageRoot, version.file_path);

    // Security check: ensure resolved path is within storage root
    if (!filePath.startsWith(storageRoot + path.sep) && filePath !== storageRoot) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const filename = version.filename || path.basename(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": version.file_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download evidence version", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
