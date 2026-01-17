import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";
import { getNarrativeExportRows, getPack, getPackReadiness } from "@/lib/authorization-pack-db";
import { buildNarrativeBlocks } from "@/lib/authorization-pack-export";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
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

    drawBlock(pack.name, fontBold, 24, 12);
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

    const pdfBytes = await pdfDoc.save();
    const filename = `${sanitizeFilename(pack.name)}-narrative.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
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
