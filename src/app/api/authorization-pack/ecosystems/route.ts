import { NextResponse } from "next/server";
import { initDatabase, getPackTemplates, seedPackTemplates, getSectionTemplates } from "@/lib/database";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    await initDatabase();
    await seedPackTemplates();

    const templates = await getPackTemplates();

    // Transform templates to ecosystem format expected by the frontend
    const ecosystemsPromises = templates.map(async (t) => {
      const sections = await getSectionTemplates(t.id);
      return {
        id: t.id,
        permission_code: t.code,
        name: t.name,
        description: t.description || `FCA authorization for ${t.name}`,
        pack_template_type: t.pack_type,
        section_keys: sections.map((s) => s.code),
        policy_templates: t.policy_templates || [],
        training_requirements: t.training_requirements || [],
        smcr_roles: t.smcr_roles || [],
        typical_timeline_weeks: t.typical_timeline_weeks,
      };
    });

    const ecosystems = await Promise.all(ecosystemsPromises);

    return NextResponse.json({ ecosystems });
  } catch (error) {
    logError(error, "Failed to load ecosystems");
    return NextResponse.json(
      { error: "Failed to load ecosystems", ecosystems: [] },
      { status: 500 }
    );
  }
}
