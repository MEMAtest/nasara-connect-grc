import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { initDatabase, getAuthorizationPack, getPackSections } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

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

// Calculate readiness from sections
function calculateReadiness(sections: { status: string; progress_percentage: number }[]) {
  if (!sections || sections.length === 0) {
    return { overall: 0, narrative: 0, evidence: 0, review: 0 };
  }
  const total = sections.length;
  const narrative = Math.round(sections.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / total);
  const approved = sections.filter((s) => s.status === "approved").length;
  const review = Math.round((approved / total) * 100);
  const evidence = Math.round((narrative + review) / 2);
  const overall = Math.round(narrative * 0.4 + evidence * 0.3 + review * 0.3);
  return { overall, narrative, evidence, review };
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
    const readiness = calculateReadiness(sections);
    const generatedAt = new Date().toLocaleDateString();

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

    // Title page
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

    // Contents page
    page = pdfDoc.addPage();
    y = page.getSize().height - margin;
    drawBlock("Contents", fontBold, 16, 10);
    sections.forEach((section, index) => {
      const title = section.template?.name || "Section";
      drawBlock(`${index + 1}. ${title}`, fontRegular, 11, 4);
    });

    // Content pages
    page = pdfDoc.addPage();
    y = page.getSize().height - margin;

    for (const section of sections) {
      const sectionTitle = section.template?.name || "Section";
      drawBlock(sectionTitle, fontBold, 14, 10);

      const narrative = section.narrative_content;
      if (narrative && typeof narrative === 'object') {
        for (const [key, value] of Object.entries(narrative)) {
          drawBlock(key, fontBold, 12, 6);
          const responseValue = (value as string)?.trim() || "No response yet.";
          drawBlock(responseValue, fontRegular, 11, 4);
        }
      } else {
        drawBlock("No content yet.", fontRegular, 11, 4);
      }
      y -= 8;
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
