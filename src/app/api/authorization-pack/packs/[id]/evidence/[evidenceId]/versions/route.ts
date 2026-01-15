import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getProjectDocument } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

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

    // Return current version info (document versioning uses a single version field)
    return NextResponse.json({
      versions: [{
        id: document.id,
        version_number: document.version || 1,
        uploaded_at: document.uploaded_at,
        uploaded_by: document.uploaded_by,
        file_size: document.file_size_bytes,
        change_notes: null,
      }],
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load evidence versions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
