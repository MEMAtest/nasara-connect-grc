import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { requireRole } from "@/lib/rbac";
// @ts-expect-error archiver does not have types
import archiver from "archiver";
import { PassThrough, Readable } from "stream";
import { isValidUUID } from "@/lib/auth-utils";
import {
  getPack,
  listEvidenceFilesForZip,
  listEvidenceVersionFilesForZip,
} from "@/lib/authorization-pack-db";

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

function buildManifestCsv(documents: Array<Record<string, unknown>>) {
  const header = ["Annex", "Section", "Evidence", "Status", "Version", "Uploaded", "File", "Size"].join(",");
  const body = documents
    .map((doc, index) =>
      [
        escapeCsv(String(doc.annex_number ?? `Annex-${String(index + 1).padStart(3, "0")}`)),
        escapeCsv(String(doc.section_title ?? "General")),
        escapeCsv(String(doc.evidence_name ?? doc.name ?? "")),
        escapeCsv(String(doc.status ?? "")),
        escapeCsv(`v${String(doc.version ?? 1)}`),
        escapeCsv(doc.uploaded_at ? new Date(String(doc.uploaded_at)).toISOString() : ""),
        escapeCsv(doc.filename ? String(doc.filename) : ""),
        escapeCsv(doc.file_size ? String(doc.file_size) : ""),
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
        annexNumber: doc.annex_number ?? `Annex-${String(index + 1).padStart(3, "0")}`,
        sectionTitle: doc.section_title ?? "General",
        evidenceName: doc.evidence_name ?? doc.name ?? null,
        status: doc.status ?? null,
        version: doc.version ?? 1,
        uploadedAt: doc.uploaded_at ?? null,
        filename: doc.filename ?? null,
        fileSize: doc.file_size ?? null,
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
    const { auth, error } = await requireRole("member");
    if (error) return error;

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

    const versionFiles = await listEvidenceVersionFilesForZip(id);
    const itemFiles = await listEvidenceFilesForZip(id);
    const documents = versionFiles.length
      ? versionFiles.map((doc) => ({
          annex_number: doc.annex_number,
          section_title: doc.section_title,
          evidence_name: doc.evidence_name,
          status: doc.status,
          version: doc.version,
          uploaded_at: doc.uploaded_at,
          filename: doc.filename,
          file_path: doc.file_path,
          file_size: doc.file_size,
        }))
      : itemFiles.map((doc) => ({
          annex_number: doc.annex_number,
          section_title: "General",
          evidence_name: doc.name,
          status: "uploaded",
          version: 1,
          uploaded_at: null,
          filename: doc.file_path ? String(doc.file_path).split("/").pop() : doc.name,
          file_path: doc.file_path,
          file_size: doc.file_size,
        }));

    const manifestCsv = buildManifestCsv(documents);
    const manifestJson = buildManifestJson(pack, documents);

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
      if (!doc.file_path) continue;
      const filePath = path.resolve(storageRoot, String(doc.file_path));
      if (!filePath.startsWith(storageRoot + path.sep) && filePath !== storageRoot) {
        continue;
      }

      try {
        await fs.access(filePath);
      } catch {
        continue;
      }

      const sectionFolder = sanitizeFileSegment(String(doc.section_title ?? "general"));
      const baseName = sanitizeFileSegment(String(doc.filename ?? doc.evidence_name ?? path.basename(filePath)));
      const versionLabel = `v${String(doc.version ?? 1).padStart(2, "0")}`;
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
