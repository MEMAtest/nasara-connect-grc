import { NextRequest, NextResponse } from "next/server";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, PageBreak, TextRun } from "docx";
import { initDatabase, getAuthorizationPack, getPackSections } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
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

    // Table of contents
    children.push(
      new Paragraph({
        text: "Contents",
        heading: HeadingLevel.HEADING_1,
      })
    );
    sections.forEach((section, index) => {
      const title = section.template?.name || "Section";
      children.push(
        new Paragraph({
          text: `${index + 1}. ${title}`,
        })
      );
    });
    children.push(new Paragraph({ children: [new PageBreak()] }));

    // Section content
    for (const section of sections) {
      const sectionTitle = section.template?.name || "Section";
      children.push(new Paragraph({ text: sectionTitle, heading: HeadingLevel.HEADING_1 }));

      const narrative = section.narrative_content;
      if (narrative && typeof narrative === 'object') {
        for (const [key, value] of Object.entries(narrative)) {
          children.push(new Paragraph({ text: key, heading: HeadingLevel.HEADING_2 }));
          const responseValue = (value as string)?.trim() || "No response yet.";
          children.push(new Paragraph(responseValue));
        }
      } else {
        children.push(new Paragraph("No content yet."));
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
