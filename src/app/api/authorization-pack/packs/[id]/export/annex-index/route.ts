import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getProjectDocuments } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

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

    const documents = await getProjectDocuments(id);

    const header = ["Annex", "Section", "Evidence", "Status", "Version", "File"].join(",");
    const body = documents
      .map((doc, index) =>
        [
          escapeCsv(`A${(index + 1).toString().padStart(3, '0')}`),
          escapeCsv(doc.section_code || "General"),
          escapeCsv(doc.name),
          escapeCsv(doc.status),
          escapeCsv(doc.version?.toString()),
          escapeCsv(doc.storage_key ? doc.storage_key.split("/").pop() : ""),
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
