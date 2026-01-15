import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { initDatabase, getAuthorizationPack, getProjectDocument } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Define storage root as absolute path
const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id, evidenceId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(evidenceId)) {
      return NextResponse.json({ error: "Invalid evidence ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const document = await getProjectDocument(evidenceId);
    if (!document) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    // Verify document belongs to the pack
    if (document.pack_id !== id) {
      return NextResponse.json({ error: "Evidence does not belong to this pack" }, { status: 403 });
    }

    // If no file path, return document metadata
    if (!document.storage_key) {
      return NextResponse.json({
        id: document.id,
        name: document.name,
        description: document.description,
        status: document.status,
        version: document.version,
        uploaded_at: document.uploaded_at,
        file_size: document.file_size_bytes,
        mime_type: document.mime_type,
      });
    }

    // Resolve the file path and prevent path traversal
    const filePath = path.resolve(storageRoot, document.storage_key);

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
    const filename = path.basename(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": document.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
