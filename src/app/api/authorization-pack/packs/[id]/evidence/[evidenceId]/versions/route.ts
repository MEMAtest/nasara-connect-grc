import { NextRequest, NextResponse } from "next/server";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";
import { getEvidenceItem, getPack, listEvidenceVersions } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id, evidenceId } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }
    if (!isValidUUID(evidenceId)) {
      return NextResponse.json({ error: "Invalid evidence ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const evidence = await getEvidenceItem({ packId: id, evidenceId });
    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    const versions = await listEvidenceVersions({ packId: id, evidenceId });

    return NextResponse.json({
      versions: versions.map((version) => ({
        id: version.id,
        version: version.version,
        filename: version.filename,
        file_size: version.file_size,
        file_type: version.file_type,
        uploaded_at: version.uploaded_at,
        uploaded_by: version.uploaded_by,
        notes: version.notes ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load evidence versions", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
