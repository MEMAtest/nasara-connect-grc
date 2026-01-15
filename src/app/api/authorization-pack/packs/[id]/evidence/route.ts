import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { addEvidenceVersion, listEvidence } from "@/lib/authorization-pack-db";

const storageRoot = path.join(process.cwd(), "storage", "authorization-pack");

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const evidenceItemId = formData.get("evidenceItemId") as string | null;

    if (!file || !evidenceItemId) {
      return NextResponse.json({ error: "file and evidenceItemId are required" }, { status: 400 });
    }

    const safeName = sanitizeFilename(file.name);
    const directory = path.join(storageRoot, id, evidenceItemId);
    await fs.mkdir(directory, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(directory, `${timestamp}-${safeName}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    await addEvidenceVersion({
      evidenceItemId,
      filename: safeName,
      filePath,
      fileSize: file.size,
      fileType: file.type || null,
      uploadedBy: null,
    });

    return NextResponse.json({ status: "ok", filePath });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload evidence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
