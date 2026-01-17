import { NextRequest, NextResponse } from "next/server";
import {
  createPackDocument,
  deletePackDocument,
  getPack,
  getPackDocuments,
  updatePackDocument,
} from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

const VALID_STATUSES = new Set(["draft", "review", "approved", "signed"]);

function isValidSectionCode(code: string): boolean {
  return /^[a-z0-9-]+$/.test(code) && code.length <= 100;
}

function formatDocument(row: Record<string, unknown>) {
  return {
    id: row.id,
    packId: row.pack_id,
    sectionCode: row.section_code,
    name: row.name,
    description: row.description,
    storageKey: row.storage_key,
    fileSizeBytes: row.file_size_bytes,
    mimeType: row.mime_type,
    checksum: row.checksum,
    version: row.version,
    status: row.status,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    signedBy: row.signed_by,
    signedAt: row.signed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function verifyPackOwnership(packId: string, organizationId: string) {
  const pack = await getPack(packId);
  return pack && pack.organization_id === organizationId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await getPackDocuments(packId);
    const formatted = documents.map((doc) => formatDocument(doc));
    return NextResponse.json({ documents: formatted });
  } catch (error) {
    logError(error, "Failed to fetch pack documents");
    return NextResponse.json({ error: "Failed to fetch documents", documents: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const name = body?.name;
    const description = body?.description;
    const sectionCode = body?.sectionCode;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    }

    if (name.length > 255) {
      return NextResponse.json({ error: "Document name too long (max 255 characters)" }, { status: 400 });
    }

    if (description && description.length > 1000) {
      return NextResponse.json({ error: "Description too long (max 1000 characters)" }, { status: 400 });
    }

    if (sectionCode && !isValidSectionCode(sectionCode)) {
      return NextResponse.json({ error: "Invalid section code format" }, { status: 400 });
    }

    const document = await createPackDocument({
      packId,
      name: name.trim(),
      description: description?.trim() ?? null,
      sectionCode: sectionCode || null,
      uploadedBy: auth.userId,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({ document: document ? formatDocument(document) : null }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create pack document");
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { documentId, ...updates } = body || {};

    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
    }

    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || updates.name.trim().length === 0) {
        return NextResponse.json({ error: "Document name cannot be empty" }, { status: 400 });
      }
      if (updates.name.length > 255) {
        return NextResponse.json({ error: "Document name too long (max 255 characters)" }, { status: 400 });
      }
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description?.trim();
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.reviewedAt !== undefined) {
      dbUpdates.reviewed_at = updates.reviewedAt ? new Date(updates.reviewedAt) : null;
      dbUpdates.reviewed_by = auth.userId;
    }
    if (updates.signedAt !== undefined) {
      dbUpdates.signed_at = updates.signedAt ? new Date(updates.signedAt) : null;
      dbUpdates.signed_by = auth.userId;
    }

    const updated = await updatePackDocument(documentId, dbUpdates);
    if (!updated) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, document: formatDocument(updated) });
  } catch (error) {
    logError(error, "Failed to update pack document");
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId || !isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
    }

    const deleted = await deletePackDocument(documentId);
    if (!deleted) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete pack document");
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
