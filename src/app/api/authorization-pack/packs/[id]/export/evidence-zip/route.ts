import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
// @ts-expect-error archiver does not have types
import archiver from "archiver";
import { PassThrough, Readable } from "stream";
import { initDatabase, getAuthorizationPack, getProjectDocuments, ProjectDocument } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Define storage root as absolute path
const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function sanitizeFileSegment(input: string) {
  return input.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function escapeCsv(value: string | null | undefined) {
  const safe = (value ?? "").toString();
  if (safe.includes(",") || safe.includes("\"") || safe.includes("\n")) {
    return `"${safe.replace(/\"/g, "\"\"")}"`;
  }
  return safe;
}

function buildManifestCsv(documents: ProjectDocument[]) {
  const header = [
    "Annex",
    "Section",
    "Evidence",
    "Status",
    "Version",
    "Uploaded",
    "File",
    "Size",
  ].join(",");
  const body = documents
    .map((doc, index) =>
      [
        escapeCsv(`A${(index + 1).toString().padStart(3, '0')}`),
        escapeCsv(doc.section_code || "General"),
        escapeCsv(doc.name),
        escapeCsv(doc.status),
        escapeCsv(`v${doc.version}`),
        escapeCsv(doc.uploaded_at ? new Date(doc.uploaded_at).toISOString() : ""),
        escapeCsv(doc.storage_key ? doc.storage_key.split("/").pop() : ""),
        escapeCsv(doc.file_size_bytes ? String(doc.file_size_bytes) : ""),
      ].join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function buildManifestJson(pack: { id: string; name: string }, documents: Array<Record<string, unknown>>) {
  return JSON.stringify(
    {
      packId: pack.id,
      packName: pack.name,
      generatedAt: new Date().toISOString(),
      entries: documents.map((doc, index) => ({
        annexNumber: `A${(index + 1).toString().padStart(3, '0')}`,
        sectionCode: doc.section_code || "General",
        evidenceName: doc.name,
        status: doc.status,
        version: doc.version,
        uploadedAt: doc.uploaded_at,
        filename: doc.storage_key ? String(doc.storage_key).split("/").pop() : null,
        fileSize: doc.file_size_bytes ?? null,
      })),
    },
    null,
    2
  );
}

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
    const manifestCsv = buildManifestCsv(documents);
    const manifestJson = buildManifestJson(pack, documents as unknown as Array<Record<string, unknown>>);

    const archive = archiver("zip", { zlib: { level: 9 } });
    const passthrough = new PassThrough();
    archive.on("warning", (error: Error & { code?: string }) => {
      if (error.code !== "ENOENT") {
        passthrough.destroy(error);
      }
    });
    archive.on("error", (error: Error) => {
      passthrough.destroy(error);
    });
    archive.pipe(passthrough);

    archive.append(manifestCsv, { name: "manifest.csv" });
    archive.append(manifestJson, { name: "manifest.json" });

    if (!documents.length) {
      archive.append("No evidence uploaded yet.", { name: "README.txt" });
    }

    for (const doc of documents) {
      if (!doc.storage_key) continue;

      // Resolve the file path and prevent path traversal
      const filePath = path.resolve(storageRoot, doc.storage_key);

      // Security check: ensure resolved path is within storage root
      if (!filePath.startsWith(storageRoot + path.sep) && filePath !== storageRoot) {
        continue;
      }

      try {
        await fs.access(filePath);
      } catch {
        continue;
      }

      const sectionFolder = doc.section_code ? sanitizeFileSegment(doc.section_code) : "general";
      const baseName = sanitizeFileSegment(doc.name || path.basename(filePath));
      const versionLabel = `v${String(doc.version).padStart(2, "0")}`;
      const zipPath = path.posix.join("evidence", sectionFolder, `${versionLabel}-${baseName}`);
      archive.file(filePath, { name: zipPath });
    }

    await archive.finalize();

    const filename = `${sanitizeFilename(pack.name)}-evidence.zip`;
    return new NextResponse(Readable.toWeb(passthrough) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export evidence zip", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
