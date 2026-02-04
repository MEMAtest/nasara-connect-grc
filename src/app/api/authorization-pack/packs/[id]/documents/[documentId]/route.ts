import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/auth-utils";
import { getPack, getPackDocument } from "@/lib/authorization-pack-db";
import { readAuthorizationPackPdf } from "@/lib/authorization-pack-storage";
import { requireRole } from "@/lib/rbac";

function sanitizeFilename(input: string) {
  return input.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim().slice(0, 180);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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

    const storedFile = await readAuthorizationPackPdf(document.storage_key);
    if (!storedFile) {
      return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
    }

    const baseName = sanitizeFilename(String(document.name || "document"));
    const fallbackName = baseName || `document-${documentId}`;
    const hasExtension = /\.[a-z0-9]{1,8}$/i.test(fallbackName);
    const filename =
      !hasExtension && document.mime_type === "application/pdf" ? `${fallbackName}.pdf` : fallbackName;

    const contentType = storedFile.contentType || document.mime_type || "application/octet-stream";
    const contentLength =
      storedFile.contentLength ?? (storedFile.buffer ? storedFile.buffer.length : null);

    return new NextResponse(new Uint8Array(storedFile.buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...(contentLength ? { "Content-Length": contentLength.toString() } : {}),
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
