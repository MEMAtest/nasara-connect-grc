import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections, getProjectDocuments } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
// @ts-expect-error archiver has no type declarations
import archiver from "archiver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
} from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { htmlToText } from "@/lib/authorization-pack-export";
import fs from "fs/promises";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvidenceData = any;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_\.]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function wrapTextForPdf(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.5;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > charsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function extractNarrativeText(section: SectionData): string {
  const narrative = section.narrative_content;
  if (narrative && typeof narrative === "object") {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(narrative)) {
      const text = typeof value === "string" ? htmlToText(value.trim()) : "";
      if (text) {
        parts.push(`${key}: ${text}`);
      }
    }
    return parts.join("\n\n");
  }
  return "";
}

function generateMarkdownNarrative(packName: string, sections: SectionData[]): string {
  let output = `# ${packName}\n\n`;

  for (const section of sections) {
    const sectionTitle = section.template?.name || "Section";
    output += `## ${sectionTitle}\n\n`;

    const narrative = section.narrative_content;
    if (narrative && typeof narrative === "object") {
      for (const [key, value] of Object.entries(narrative)) {
        const responseValue = typeof value === "string" ? htmlToText(value.trim()) || "_No response yet._" : "_No response yet._";
        output += `### ${key}\n\n${responseValue}\n\n`;
      }
    } else {
      output += "_No content yet._\n\n";
    }
  }

  return output;
}

async function generateDocxBuffer(packName: string, sections: SectionData[]): Promise<Buffer> {
  const sectionParagraphs: Paragraph[] = [];

  for (const sec of sections) {
    const title = sec.template?.name || "Section";
    sectionParagraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const text = extractNarrativeText(sec);
    if (text) {
      for (const block of text.split("\n\n")) {
        sectionParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: block, size: 24 })],
            spacing: { after: 200 },
          })
        );
      }
    } else {
      sectionParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "No narrative content.", italics: true, size: 24 })],
          spacing: { after: 200 },
        })
      );
    }

    sectionParagraphs.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: packName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Paragraph({
            text: "Business Plan Narrative",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Generated: ${new Date().toISOString().split("T")[0]}`, size: 20 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({ children: [new PageBreak()] }),
          ...sectionParagraphs,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

async function generatePdfBuffer(packName: string, sections: SectionData[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Title page
  const titlePage = pdfDoc.addPage([pageWidth, pageHeight]);
  titlePage.drawText(packName, {
    x: margin,
    y: pageHeight - 200,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: contentWidth,
  });
  titlePage.drawText("Business Plan Narrative", {
    x: margin,
    y: pageHeight - 240,
    size: 16,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  titlePage.drawText(`Generated: ${new Date().toISOString().split("T")[0]}`, {
    x: margin,
    y: pageHeight - 280,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Content pages
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPos = pageHeight - margin;

  for (const sec of sections) {
    const title = sec.template?.name || "Section";

    if (yPos < 150) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPos = pageHeight - margin;
    }

    currentPage.drawText(title, {
      x: margin,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    yPos -= 30;

    const contentText = extractNarrativeText(sec) || "No narrative content.";
    const lines = wrapTextForPdf(contentText, contentWidth, 11);

    for (const line of lines) {
      if (yPos < margin + 20) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPos = pageHeight - margin;
      }
      currentPage.drawText(line, {
        x: margin,
        y: yPos,
        size: 11,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPos -= 16;
    }

    yPos -= 20;
  }

  return Buffer.from(await pdfDoc.save());
}

function generateAnnexCsv(evidence: EvidenceData[]): string {
  const escapeCSV = (val: unknown) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows: string[] = [
    "Annex Number,Section,Evidence Name,Status,Version,Filename",
  ];

  for (const ev of evidence) {
    const annexNum = ev.annex_number ?? "";
    const section = ev.section_code ?? "";
    const name = ev.name ?? "";
    const status = ev.status ?? "";
    const version = ev.version ?? "";
    const filename = ev.storage_key ? path.basename(ev.storage_key) : "";
    rows.push(
      [annexNum, section, name, status, version, filename].map(escapeCSV).join(",")
    );
  }

  return rows.join("\n");
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

    const sections = await getPackSections(id);
    const evidence = await getProjectDocuments(id);

    const safeName = sanitizeFilename(pack.name || "pack");
    const timestamp = new Date().toISOString().split("T")[0];

    // Create the batch ZIP archive
    const archive = archiver("zip", { zlib: { level: 6 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("error", (err: Error) => {
      throw err;
    });

    // Generate and add narrative files
    const mdContent = generateMarkdownNarrative(pack.name, sections);
    archive.append(mdContent, { name: `${safeName}-narrative.md` });

    const docxBuffer = await generateDocxBuffer(pack.name, sections);
    archive.append(docxBuffer, { name: `${safeName}-narrative.docx` });

    const pdfBuffer = await generatePdfBuffer(pack.name, sections);
    archive.append(pdfBuffer, { name: `${safeName}-narrative.pdf` });

    // Generate and add annex index
    const csvContent = generateAnnexCsv(evidence);
    archive.append(csvContent, { name: `${safeName}-annex-index.csv` });

    // Add evidence files (if they exist)
    const uploadDir = path.join(process.cwd(), "uploads", "evidence");
    for (const ev of evidence) {
      if (ev.storage_key) {
        const filename = path.basename(ev.storage_key);
        if (filename.includes("..") || filename.startsWith("/")) {
          continue; // Security: skip path traversal attempts
        }
        const filePath = path.join(uploadDir, filename);
        try {
          await fs.access(filePath);
          const sectionFolder = sanitizeFilename(ev.section_code || "uncategorized");
          const versionPrefix = `v${String(ev.version ?? 1).padStart(2, "0")}`;
          archive.file(filePath, { name: `evidence/${sectionFolder}/${versionPrefix}-${filename}` });
        } catch {
          // File doesn't exist, skip
        }
      }
    }

    // Add manifest
    const manifest = {
      packId: id,
      packName: pack.name,
      exportDate: new Date().toISOString(),
      contents: {
        narrative: [`${safeName}-narrative.md`, `${safeName}-narrative.docx`, `${safeName}-narrative.pdf`],
        annexIndex: `${safeName}-annex-index.csv`,
        evidenceCount: evidence.filter((e: EvidenceData) => e.storage_key).length,
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
