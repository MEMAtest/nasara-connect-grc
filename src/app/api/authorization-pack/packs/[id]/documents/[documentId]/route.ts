import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";
import { getPack, getPackDocument } from "@/lib/authorization-pack-db";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

function sanitizeFilename(input: string) {
  return input.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim().slice(0, 180);
}

function resolveStoragePath(storageKey: string) {
  const fullPath = path.resolve(storageRoot, storageKey);
  if (!fullPath.startsWith(storageRoot + path.sep) && fullPath !== storageRoot) {
    throw new Error("Invalid file path");
  }
  return fullPath;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId, documentId } = await params;

    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
    }

    const pack = await getPack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const document = await getPackDocument(documentId);
    if (!document || document.pack_id !== packId) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!document.storage_key) {
      return NextResponse.json({ error: "Document file missing" }, { status: 404 });
    }

    const filePath = resolveStoragePath(document.storage_key);
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    const baseName = sanitizeFilename(String(document.name || "document"));
    const fallbackName = baseName || `document-${documentId}`;
    const extension =
      path.extname(document.storage_key) || (document.mime_type === "application/pdf" ? ".pdf" : "");
    const filename = extension && !fallbackName.toLowerCase().endsWith(extension.toLowerCase())
      ? `${fallbackName}${extension}`
      : fallbackName;

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": document.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Document-Filename": filename,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
