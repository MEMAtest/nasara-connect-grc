import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initDatabase,
  getProjectDocuments,
  createProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  getAuthorizationPack,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/auth-utils";

// Allowed document statuses
const VALID_STATUSES = new Set(['draft', 'review', 'approved', 'signed']);

// Validate section code format
function isValidSectionCode(code: string): boolean {
  return /^[a-z0-9-]+$/.test(code) && code.length <= 100;
}

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<boolean> {
  const pack = await getAuthorizationPack(packId);
  return pack !== null && pack.organization_id === organizationId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await getProjectDocuments(packId);

    // Transform to client-friendly format
    const formattedDocs = documents.map((d) => ({
      id: d.id,
      packId: d.pack_id,
      milestoneId: d.milestone_id,
      sectionCode: d.section_code,
      name: d.name,
      description: d.description,
      storageKey: d.storage_key,
      fileSizeBytes: d.file_size_bytes,
      mimeType: d.mime_type,
      checksum: d.checksum,
      version: d.version,
      status: d.status,
      uploadedBy: d.uploaded_by,
      uploadedAt: d.uploaded_at,
      reviewedBy: d.reviewed_by,
      reviewedAt: d.reviewed_at,
      signedBy: d.signed_by,
      signedAt: d.signed_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return NextResponse.json({ documents: formattedDocs });
  } catch (error) {
    logError(error, "Failed to fetch documents");
    return NextResponse.json({ error: "Failed to fetch documents", documents: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();

    const {
      name,
      description,
      sectionCode,
      milestoneId,
      storageKey,
      fileSizeBytes,
      mimeType,
      checksum,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    }

    if (name.length > 255) {
      return NextResponse.json({ error: "Document name too long (max 255 characters)" }, { status: 400 });
    }

    // Validate optional fields
    if (description && description.length > 1000) {
      return NextResponse.json({ error: "Description too long (max 1000 characters)" }, { status: 400 });
    }

    if (sectionCode && !isValidSectionCode(sectionCode)) {
      return NextResponse.json({ error: "Invalid section code format" }, { status: 400 });
    }

    if (milestoneId && !isValidUUID(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID format" }, { status: 400 });
    }

    const document = await createProjectDocument({
      pack_id: packId,
      name: name.trim(),
      description: description?.trim(),
      section_code: sectionCode,
      milestone_id: milestoneId,
      storage_key: storageKey,
      file_size_bytes: fileSizeBytes,
      mime_type: mimeType,
      checksum,
      uploaded_by: auth.userId ?? undefined,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create document");
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { documentId, ...updates } = body;

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    if (!isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return NextResponse.json({ error: "Document name cannot be empty" }, { status: 400 });
      }
      if (updates.name.length > 255) {
        return NextResponse.json({ error: "Document name too long (max 255 characters)" }, { status: 400 });
      }
    }

    // Transform camelCase to snake_case for database (only allowed fields)
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

    const updated = await updateProjectDocument(documentId, dbUpdates);

    if (!updated) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    logError(error, "Failed to update document");
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("admin");
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    if (!isValidUUID(documentId)) {
      return NextResponse.json({ error: "Invalid document ID format" }, { status: 400 });
    }

    const deleted = await deleteProjectDocument(documentId);

    if (!deleted) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete document");
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
