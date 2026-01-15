import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getProjectDocuments } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const documents = await getProjectDocuments(id);

    // Transform to expected evidence format
    const evidence = documents.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      status: d.status,
      annex_number: null,
      file_path: d.storage_key,
      file_size: d.file_size_bytes,
      file_type: d.mime_type,
      uploaded_at: d.uploaded_at,
      version: d.version,
      section_instance_id: null,
      section_key: d.section_code,
      section_title: d.section_code,
    }));

    return NextResponse.json({ evidence });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // File upload functionality requires cloud storage setup
  // For now, return a message indicating this needs to be configured
  return NextResponse.json(
    { error: "File upload requires cloud storage configuration" },
    { status: 501 }
  );
}
