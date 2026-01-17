import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
// @ts-expect-error archiver has no type declarations
import archiver from "archiver";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { buildNarrativeBlocks } from "@/lib/authorization-pack-export";
import {
  getAnnexIndexRows,
  getNarrativeExportRows,
  getPack,
  getPackReadiness,
  listEvidenceFilesForZip,
  listEvidenceVersionFilesForZip,
} from "@/lib/authorization-pack-db";

const storageRoot = path.resolve(process.cwd(), "storage", "authorization-pack");

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_\.]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function sanitizeFileSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function renderMarkdown(blocks: ReturnType<typeof buildNarrativeBlocks>) {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "title") {
      lines.push(`# ${block.text}`, "");
      continue;
    }
    if (block.type === "section") {
      lines.push(`## ${block.text}`, "");
      continue;
    }
    if (block.type === "prompt") {
      lines.push(`### ${block.text}`, "");
      continue;
    }
    if (block.type === "text") {
      lines.push(block.text || "", "");
    }
  }
  return lines.join("\n").trim() + "\n";
}

function escapeCsv(value: string | null | undefined) {
  const safe = (value ?? "").toString();
  if (safe.includes(",") || safe.includes("\"") || safe.includes("\n")) {
    return `"${safe.replace(/\"/g, "\"\"")}"`;
  }
  return safe;
}

function buildAnnexCsv(rows: Array<{ annex_number: string | null; section_title: string | null; name: string; status: string; version: number | null; file_path: string | null; }>) {
  const header = ["Annex", "Section", "Evidence", "Status", "Version", "File"].join(",");
  const body = rows
    .map((row) =>
      [
        escapeCsv(row.annex_number ?? ""),
        escapeCsv(row.section_title ?? "General"),
        escapeCsv(row.name),
        escapeCsv(row.status),
        escapeCsv(row.version?.toString() ?? ""),
        escapeCsv(row.file_path ? row.file_path.split("/").pop() : ""),
      ].join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

async function buildDocxBuffer(
  packName: string,
  blocks: ReturnType<typeof buildNarrativeBlocks>,
  readiness: { overall: number; narrative: number; evidence: number; review: number }
) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: packName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "Authorisation Pack Narrative", bold: true })],
      alignment: AlignmentType.CENTER,
    })
  );
  children.push(
    new Paragraph({
      text: `Generated ${new Date().toLocaleDateString("en-GB")}`,
      alignment: AlignmentType.CENTER,
    })
  );
  children.push(
    new Paragraph({
      text: `Readiness: ${readiness.overall}% (Narrative ${readiness.narrative}%, Evidence ${readiness.evidence}%, Review ${readiness.review}%)`,
      alignment: AlignmentType.CENTER,
    })
  );

  for (const block of blocks) {
    if (block.type === "title") continue;
    if (block.type === "section") {
      children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 }));
      continue;
    }
    if (block.type === "prompt") {
      children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 }));
      continue;
    }
    if (block.type === "text") {
      children.push(new Paragraph(block.text || ""));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

async function buildPdfBuffer(
  packName: string,
  blocks: ReturnType<typeof buildNarrativeBlocks>,
  readiness: { overall: number; narrative: number; evidence: number; review: number }
) {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 48;
  let y = height - margin;

  const drawBlock = (text: string, font: PDFFont, fontSize: number, extraSpacing = 6) => {
    const maxWidth = width - margin * 2;
    const lineHeight = fontSize * 1.4;
    const lines = wrapText(text, font, fontSize, maxWidth);

    for (const line of lines) {
      if (y - lineHeight < margin) {
        page = pdfDoc.addPage();
        y = page.getSize().height - margin;
      }
      page.drawText(line, { x: margin, y, font, size: fontSize, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }
    y -= extraSpacing;
  };

  drawBlock(packName, fontBold, 24, 12);
  drawBlock("Authorisation Pack Narrative", fontBold, 14, 8);
  drawBlock(`Generated ${new Date().toLocaleDateString("en-GB")}`, fontRegular, 11, 4);
  drawBlock(
    `Readiness: ${readiness.overall}% (Narrative ${readiness.narrative}%, Evidence ${readiness.evidence}%, Review ${readiness.review}%)`,
    fontRegular,
    11,
    12
  );

  for (const block of blocks) {
    if (block.type === "title") continue;
    if (block.type === "section") {
      drawBlock(block.text, fontBold, 13, 8);
      continue;
    }
    if (block.type === "prompt") {
      drawBlock(block.text, fontBold, 11, 4);
      continue;
    }
    if (block.type === "text") {
      drawBlock(block.text || "", fontRegular, 10, 3);
    }
  }

  return Buffer.from(await pdfDoc.save());
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
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

    const rows = await getNarrativeExportRows(id);
    const blocks = buildNarrativeBlocks(pack.name, rows);
    const readiness = await getPackReadiness(id);
    const annexRows = await getAnnexIndexRows(id);

    const safeName = sanitizeFilename(pack.name || "pack");
    const timestamp = new Date().toISOString().split("T")[0];

    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("error", (err: Error) => {
      throw err;
    });

    const markdown = renderMarkdown(blocks);
    archive.append(markdown, { name: `${safeName}-narrative.md` });

    const docxBuffer = await buildDocxBuffer(pack.name, blocks, readiness);
    archive.append(docxBuffer, { name: `${safeName}-narrative.docx` });

    const pdfBuffer = await buildPdfBuffer(pack.name, blocks, readiness);
    archive.append(pdfBuffer, { name: `${safeName}-narrative.pdf` });

    const annexCsv = buildAnnexCsv(annexRows);
    archive.append(annexCsv, { name: `${safeName}-annex-index.csv` });

    const versionFiles = await listEvidenceVersionFilesForZip(id);
    const itemFiles = await listEvidenceFilesForZip(id);
    const documents = versionFiles.length
      ? versionFiles.map((doc) => ({
          annex_number: doc.annex_number,
          section_title: doc.section_title,
          evidence_name: doc.evidence_name,
          status: doc.status,
          version: doc.version,
          filename: doc.filename,
          file_path: doc.file_path,
        }))
      : itemFiles.map((doc) => ({
          annex_number: doc.annex_number,
          section_title: "General",
          evidence_name: doc.name,
          status: "uploaded",
          version: 1,
          filename: doc.file_path ? String(doc.file_path).split("/").pop() : doc.name,
          file_path: doc.file_path,
        }));

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

    const manifest = {
      packId: id,
      packName: pack.name,
      exportDate: new Date().toISOString(),
      contents: {
        narrative: [
          `${safeName}-narrative.md`,
          `${safeName}-narrative.docx`,
          `${safeName}-narrative.pdf`,
        ],
        annexIndex: `${safeName}-annex-index.csv`,
        evidenceCount: documents.filter((doc) => doc.file_path).length,
      },
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });

    await archive.finalize();
    await new Promise<void>((resolve) => archive.on("end", resolve));

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}-complete-${timestamp}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    logError(error, "Batch export route error");
    return NextResponse.json(
      { error: "Failed to generate batch export" },
      { status: 500 }
    );
  }
}
