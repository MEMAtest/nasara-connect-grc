import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
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

    let output = `# ${pack.name}\n\n`;

    for (const section of sections) {
      const sectionTitle = section.template?.name || "Section";
      output += `## ${sectionTitle}\n\n`;

      // Add narrative content if available
      const narrative = section.narrative_content;
      if (narrative && typeof narrative === 'object') {
        for (const [key, value] of Object.entries(narrative)) {
          const responseValue = (value as string)?.trim() || "_No response yet._";
          output += `### ${key}\n\n${responseValue}\n\n`;
        }
      } else {
        output += "_No content yet._\n\n";
      }
    }

    const filename = `${sanitizeFilename(pack.name)}-narrative.md`;
    return new NextResponse(output, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export narrative", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
