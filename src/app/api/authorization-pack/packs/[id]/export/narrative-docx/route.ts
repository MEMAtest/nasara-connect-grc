import { NextRequest, NextResponse } from "next/server";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, PageBreak, TextRun } from "docx";
import { getNarrativeExportRows, getPack, getPackReadiness } from "@/lib/authorization-pack-db";
import { buildNarrativeBlocks, extractSectionTitles } from "@/lib/authorization-pack-export";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
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
    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        text: pack.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Authorisation Pack Narrative",
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(
      new Paragraph({
        text: `Generated ${generatedAt}`,
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(
      new Paragraph({
        text: `Readiness: ${readiness.overall}% (Narrative ${readiness.narrative}%, Evidence ${readiness.evidence}%, Review ${readiness.review}%)`,
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(new Paragraph({ children: [new PageBreak()] }));

    children.push(
      new Paragraph({
        text: "Contents",
        heading: HeadingLevel.HEADING_1,
      })
    );
    sectionTitles.forEach((title, index) => {
      children.push(
        new Paragraph({
          text: `${index + 1}. ${title}`,
        })
      );
    });
    children.push(new Paragraph({ children: [new PageBreak()] }));

    for (const block of blocks) {
      if (block.type === "title") {
        continue;
      }
      if (block.type === "section") {
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 }));
        continue;
      }
      if (block.type === "prompt") {
        children.push(new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 }));
        continue;
      }
      children.push(new Paragraph(block.text));
    }

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    const filename = `${sanitizeFilename(pack.name)}-narrative.docx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export DOCX", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
