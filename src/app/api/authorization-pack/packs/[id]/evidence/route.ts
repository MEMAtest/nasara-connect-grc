import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";
import { addEvidenceVersion, getEvidenceItem, getPack, listEvidence } from "@/lib/authorization-pack-db";
import { checkRateLimit, handleApiError, rateLimitExceeded } from "@/lib/api-utils";
import {
  sanitizeFilename,
  scanFileForViruses,
  validateFileUpload,
} from "@/lib/file-upload-security";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const evidence = await listEvidence(id);
    return NextResponse.json({ evidence }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { success, headers } = await checkRateLimit(request);
    if (!success) return rateLimitExceeded(headers);

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
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

    const validation = await validateFileUpload(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers });
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

    const scanResult = await scanFileForViruses(buffer);
    if (!scanResult.clean) {
      return NextResponse.json(
        { error: `File failed virus scan${scanResult.threat ? `: ${scanResult.threat}` : ""}` },
        { status: 400, headers }
      );
    }
    await fs.writeFile(fullPath, buffer);

    await addEvidenceVersion({
      evidenceItemId,
      filename: safeName,
      filePath: relativePath,
      fileSize: buffer.length,
      fileType: validation.detectedMimeType || file.type || null,
      uploadedBy: "system",
    });

    return NextResponse.json({ status: "ok" }, { headers });
  } catch (error) {
    return handleApiError(error);
  }
}
