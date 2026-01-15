import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isValidUUID } from "@/lib/auth-utils";
import { addEvidenceVersion, getEvidenceItem, getPack, listEvidence } from "@/lib/authorization-pack-db";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").slice(0, 255);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const evidence = await listEvidence(id);
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
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const evidenceItemId = formData.get("evidenceItemId");

    if (!evidenceItemId || typeof evidenceItemId !== "string") {
      return NextResponse.json({ error: "Missing evidence item ID" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!isValidUUID(evidenceItemId)) {
      return NextResponse.json({ error: "Invalid evidence ID" }, { status: 400 });
    }

    const evidence = await getEvidenceItem({ packId: id, evidenceId: evidenceItemId });
    if (!evidence) {
      return NextResponse.json({ error: "Evidence item not found" }, { status: 404 });
    }

    const safeName = sanitizeFilename(file.name);
    const relativeDir = path.join(id, evidenceItemId);
    const relativePath = path.join(relativeDir, `${Date.now()}-${safeName}`);
    const fullPath = path.resolve(storageRoot, relativePath);

    if (!fullPath.startsWith(storageRoot + path.sep) && fullPath !== storageRoot) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    await addEvidenceVersion({
      evidenceItemId,
      filename: safeName,
      filePath: relativePath,
      fileSize: buffer.length,
      fileType: file.type || null,
      uploadedBy: "system",
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
