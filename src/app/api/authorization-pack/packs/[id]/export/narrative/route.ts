import { NextRequest, NextResponse } from "next/server";
import { getPack, getNarrativeExportRows } from "@/lib/authorization-pack-db";

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
    let output = `# ${pack.name}\n\n`;

    let currentSection = "";
    for (const row of rows) {
      if (row.section_title !== currentSection) {
        currentSection = row.section_title;
        output += `## ${currentSection}\n\n`;
      }
      const promptTitle = row.prompt_title || "Prompt";
      const responseValue = row.response_value?.trim() || "_No response yet._";
      output += `### ${promptTitle}\n\n${responseValue}\n\n`;
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
