import { NextRequest, NextResponse } from "next/server";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { isValidUUID } from "@/lib/auth-utils";
import { getNarrativeExportRows, getPack, getPackReadiness } from "@/lib/authorization-pack-db";
import { buildNarrativeBlocks } from "@/lib/authorization-pack-export";
import { requireRole } from "@/lib/rbac";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
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

    const rows = await getNarrativeExportRows(id);
    const blocks = buildNarrativeBlocks(pack.name, rows);
    const readiness = await getPackReadiness(id);

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
    const buffer = await Packer.toBuffer(doc);
    const filename = `${sanitizeFilename(pack.name)}-narrative.docx`;

    return new NextResponse(new Uint8Array(buffer), {
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
