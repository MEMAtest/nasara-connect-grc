import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getNarrativeExportRows, getPack, getPackReadiness } from "@/lib/authorization-pack-db";
import { buildNarrativeBlocks, extractSectionTitles } from "@/lib/authorization-pack-export";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number) {
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

    const rows = await getNarrativeExportRows(id);
    const blocks = buildNarrativeBlocks(pack.name, rows);
    const sectionTitles = extractSectionTitles(rows);
    const readiness = await getPackReadiness(id);
    const generatedAt = new Date().toLocaleDateString();

    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 48;
    let y = height - margin;

    const drawBlock = (text: string, font: any, fontSize: number, extraSpacing = 6) => {
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

    page.drawText(pack.name, {
      x: margin,
      y,
      font: fontBold,
      size: 26,
      color: rgb(0, 0, 0),
    });
    y -= 40;
    page.drawText("Authorisation Pack Narrative", {
      x: margin,
      y,
      font: fontBold,
      size: 16,
      color: rgb(0, 0, 0),
    });
    y -= 24;
    page.drawText(`Generated ${generatedAt}`, {
      x: margin,
      y,
      font: fontRegular,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= 18;
    page.drawText(
      `Readiness: ${readiness.overall}% (Narrative ${readiness.narrative}%, Evidence ${readiness.evidence}%, Review ${readiness.review}%)`,
      {
        x: margin,
        y,
        font: fontRegular,
        size: 12,
        color: rgb(0, 0, 0),
      }
    );

    page = pdfDoc.addPage();
    y = page.getSize().height - margin;
    drawBlock("Contents", fontBold, 16, 10);
    sectionTitles.forEach((title, index) => {
      drawBlock(`${index + 1}. ${title}`, fontRegular, 11, 4);
    });

    page = pdfDoc.addPage();
    y = page.getSize().height - margin;

    for (const block of blocks) {
      if (!block.text) {
        y -= 8;
        continue;
      }

      if (block.type === "title") {
        continue;
      }
      if (block.type === "section") {
        drawBlock(block.text, fontBold, 14, 10);
        continue;
      }
      if (block.type === "prompt") {
        drawBlock(block.text, fontBold, 12, 6);
        continue;
      }
      drawBlock(block.text, fontRegular, 11, 4);
    }

    const pdfBytes = await pdfDoc.save();
    const filename = `${sanitizeFilename(pack.name)}-narrative.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
