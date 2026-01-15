import { NextResponse } from "next/server";
import { initDatabase, getPackTemplates, seedPackTemplates } from "@/lib/database";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    await initDatabase();
    // Force re-seed if templates are missing codes
    await seedPackTemplates(true);

    const templates = await getPackTemplates();

    // Transform to match expected format
    const formattedTemplates = templates.map((t) => ({
      code: t.code,
      name: t.name,
      description: t.description,
      packType: t.pack_type,
      typicalTimelineWeeks: t.typical_timeline_weeks,
      policyTemplates: t.policy_templates,
      trainingRequirements: t.training_requirements,
      smcrRoles: t.smcr_roles,
    }));

    return NextResponse.json({ templates: formattedTemplates });
  } catch (error) {
    logError(error, "Failed to load templates");
    return NextResponse.json(
      { error: "Failed to load templates", templates: [] },
      { status: 500 }
    );
  }
}
