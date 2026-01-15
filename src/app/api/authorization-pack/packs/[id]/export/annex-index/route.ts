import { NextRequest, NextResponse } from "next/server";
import { getPack, getAnnexIndexRows } from "@/lib/authorization-pack-db";

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function escapeCsv(value: string | null | undefined) {
  const safe = (value ?? "").toString();
  if (safe.includes(",") || safe.includes("\"") || safe.includes("\n")) {
    return `"${safe.replace(/\"/g, "\"\"")}"`;
  }
  return safe;
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

    const rows = await getAnnexIndexRows(id);
    const header = ["Annex", "Section", "Evidence", "Status", "Version", "File"].join(",");
    const body = rows
      .map((row) =>
        [
          escapeCsv(row.annex_number),
          escapeCsv(row.section_title),
          escapeCsv(row.name),
          escapeCsv(row.status),
          escapeCsv(row.version?.toString()),
          escapeCsv(row.file_path ? row.file_path.split("/").pop() : ""),
        ].join(",")
      )
      .join("\n");

    const filename = `${sanitizeFilename(pack.name)}-annex-index.csv`;
    const output = `${header}\n${body}`;

    return new NextResponse(output, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export annex index", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
