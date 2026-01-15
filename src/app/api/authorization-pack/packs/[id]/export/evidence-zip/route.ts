import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";
import {
  getAnnexIndexRows,
  getPack,
  listEvidenceFilesForZip,
  listEvidenceVersionFilesForZip,
} from "@/lib/authorization-pack-db";

const storageRoot = path.join(process.cwd(), "storage", "authorization-pack");

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

function buildAnnexCsv(rows: Array<Record<string, unknown>>) {
  const header = ["Annex", "Section", "Evidence", "Status", "Version", "File"].join(",");
  const body = rows
    .map((row) =>
      [
        escapeCsv(row.annex_number as string),
        escapeCsv(row.section_title as string),
        escapeCsv(row.name as string),
        escapeCsv(row.status as string),
        escapeCsv(row.version ? String(row.version) : ""),
        escapeCsv(row.file_path ? String(row.file_path).split("/").pop() : ""),
      ].join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function buildManifestCsv(rows: Array<Record<string, unknown>>) {
  const header = [
    "Annex",
    "Section",
    "Evidence",
    "Status",
    "Owner",
    "Due date",
    "Review state",
    "Version",
    "Uploaded",
    "File",
    "Size",
  ].join(",");
  const body = rows
    .map((row) =>
      [
        escapeCsv(row.annex_number as string),
        escapeCsv(row.section_title as string),
        escapeCsv(row.evidence_name as string),
        escapeCsv(row.status as string),
        escapeCsv(row.owner_id ? String(row.owner_id) : ""),
        escapeCsv(row.due_date ? String(row.due_date) : ""),
        escapeCsv(row.review_state ? String(row.review_state) : ""),
        escapeCsv(row.version ? `v${row.version}` : ""),
        escapeCsv(row.uploaded_at ? String(row.uploaded_at) : ""),
        escapeCsv(row.filename as string),
        escapeCsv(row.file_size ? String(row.file_size) : ""),
      ].join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function buildManifestJson(pack: { id: string; name: string }, rows: Array<Record<string, unknown>>) {
  return JSON.stringify(
    {
      packId: pack.id,
      packName: pack.name,
      generatedAt: new Date().toISOString(),
      entries: rows.map((row) => ({
        annexNumber: row.annex_number ?? null,
        sectionTitle: row.section_title ?? null,
        evidenceName: row.evidence_name ?? null,
        status: row.status ?? null,
        ownerId: row.owner_id ?? null,
        dueDate: row.due_date ?? null,
        reviewState: row.review_state ?? null,
        version: row.version ?? null,
        uploadedAt: row.uploaded_at ?? null,
        filename: row.filename ?? null,
        fileSize: row.file_size ?? null,
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
    const { id } = await params;
    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const files = await listEvidenceFilesForZip(id);
    const versions = await listEvidenceVersionFilesForZip(id);
    const annexRows = await getAnnexIndexRows(id);
    const annexCsv = buildAnnexCsv(annexRows);
    const manifestCsv = buildManifestCsv(versions);
    const manifestJson = buildManifestJson(pack, versions);

    const archive = archiver("zip", { zlib: { level: 9 } });
    const passthrough = new PassThrough();
    archive.on("warning", (error) => {
      if (error.code !== "ENOENT") {
        passthrough.destroy(error);
      }
    });
    archive.on("error", (error) => {
      passthrough.destroy(error);
    });
    archive.pipe(passthrough);

    archive.append(annexCsv, { name: "annex-index.csv" });
    archive.append(manifestCsv, { name: "manifest.csv" });
    archive.append(manifestJson, { name: "manifest.json" });

    if (!files.length && !versions.length) {
      archive.append("No evidence uploaded yet.", { name: "README.txt" });
    }

    const includedPaths = new Set<string>();
    for (const version of versions) {
      const filePath = version.file_path as string;
      if (!filePath || !filePath.startsWith(storageRoot)) {
        continue;
      }
      try {
        await fs.access(filePath);
      } catch {
        continue;
      }
      const annexFolder = version.annex_number ? sanitizeFileSegment(version.annex_number) : "unassigned";
      const evidenceLabel = sanitizeFileSegment(version.evidence_name || "evidence");
      const baseName = sanitizeFileSegment(version.filename || path.basename(filePath));
      const versionLabel = version.version ? `v${String(version.version).padStart(2, "0")}` : "v00";
      const zipPath = path.posix.join("evidence", annexFolder, `${versionLabel}-${evidenceLabel}-${baseName}`);
      archive.file(filePath, { name: zipPath });
      includedPaths.add(filePath);
    }

    for (const file of files) {
      const filePath = file.file_path as string;
      if (!filePath || includedPaths.has(filePath) || !filePath.startsWith(storageRoot)) {
        continue;
      }
      try {
        await fs.access(filePath);
      } catch {
        continue;
      }
      const annexFolder = file.annex_number ? sanitizeFileSegment(file.annex_number) : "unassigned";
      const baseName = sanitizeFileSegment(path.basename(filePath));
      const zipPath = path.posix.join("evidence", annexFolder, `latest-${baseName}`);
      archive.file(filePath, { name: zipPath });
    }

    await archive.finalize();

    const filename = `${sanitizeFilename(pack.name)}-evidence.zip`;
    return new NextResponse(Readable.toWeb(passthrough) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export evidence zip", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
