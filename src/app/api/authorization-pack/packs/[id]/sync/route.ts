import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackSections, seedPackTemplates, getSectionTemplates } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { Pool } from "pg";

// Get pool for direct queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(
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

    // Ensure templates are seeded
    await seedPackTemplates();

    // Get existing sections
    const existingSections = await getPackSections(id);

    // If pack has a template, sync sections from template
    if (pack.pack_template_id) {
      // Get section templates for this pack template
      const sectionTemplates = await getSectionTemplates(pack.pack_template_id);

      // Create any missing sections
      let sectionsCreated = 0;
      const client = await pool.connect();
      try {
        for (const template of sectionTemplates) {
          const exists = existingSections.some(s => s.section_template_id === template.id);
          if (!exists) {
            await client.query(`
              INSERT INTO pack_sections (pack_id, section_template_id, status, progress_percentage)
              VALUES ($1, $2, 'not_started', 0)
            `, [id, template.id]);
            sectionsCreated++;
          }
        }
      } finally {
        client.release();
      }

      return NextResponse.json({
        status: "ok",
        message: `Pack synced successfully`,
        sectionsCreated,
        totalSections: sectionTemplates.length,
      });
    }

    return NextResponse.json({
      status: "ok",
      message: "Pack has no template to sync from",
      sectionsCreated: 0,
      totalSections: existingSections.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sync pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
