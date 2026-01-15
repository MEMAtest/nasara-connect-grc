import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/lib/auth-utils";
import { getNarrativeExportRows, getPack } from "@/lib/authorization-pack-db";
import { buildNarrativeBlocks } from "@/lib/authorization-pack-export";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function renderMarkdown(blocks: ReturnType<typeof buildNarrativeBlocks>) {
  const lines: string[] = [];
  for (const block of blocks) {
    if (block.type === "title") {
      lines.push(`# ${block.text}`);
      lines.push("");
      continue;
    }
    if (block.type === "section") {
      lines.push(`## ${block.text}`);
      lines.push("");
      continue;
    }
    if (block.type === "prompt") {
      lines.push(`### ${block.text}`);
      lines.push("");
      continue;
    }
    if (block.type === "text") {
      lines.push(block.text || "");
      lines.push("");
    }
  }
  return lines.join("\n").trim() + "\n";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    const rows = await getNarrativeExportRows(id);
    const blocks = buildNarrativeBlocks(pack.name, rows);
    const output = renderMarkdown(blocks);

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
