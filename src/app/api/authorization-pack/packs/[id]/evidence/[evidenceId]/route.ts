import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isValidUUID } from "@/lib/auth-utils";
import { getEvidenceItem, getPack, updateEvidenceStatus } from "@/lib/authorization-pack-db";
import { requireRole } from "@/lib/rbac";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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

    if (!evidence.file_path) {
      return NextResponse.json(evidence);
    }

    const filePath = path.resolve(storageRoot, evidence.file_path);
    if (!filePath.startsWith(storageRoot + path.sep) && filePath !== storageRoot) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": evidence.file_type || "application/octet-stream",
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
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

    const body = await request.json();
    const status = body.status as string | undefined;
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updated = await updateEvidenceStatus({ packId: id, evidenceId, status });
    if (!updated) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update evidence status", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
