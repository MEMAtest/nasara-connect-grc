import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getAuthorizationPacks,
  createAuthorizationPack,
  getPackTemplates,
  seedPackTemplates,
  getPackSections,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Calculate readiness scores based on section progress
function calculateReadiness(sections: { status: string; progress_percentage: number }[]) {
  if (!sections || sections.length === 0) {
    return { overall: 0, narrative: 0, evidence: 0, review: 0 };
  }

  const total = sections.length;
  const narrative = Math.round(
    sections.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / total
  );
  const approved = sections.filter((s) => s.status === "approved").length;
  const review = Math.round((approved / total) * 100);
  const evidence = Math.round((narrative + review) / 2);
  const overall = Math.round(narrative * 0.4 + evidence * 0.3 + review * 0.3);

  return { overall, narrative, evidence, review };
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    await seedPackTemplates();

    // Use organization ID from authenticated user
    const organizationId = auth.organizationId;

    const packs = await getAuthorizationPacks(organizationId);
    const templates = await getPackTemplates();

    // Enhance each pack with readiness scores and template data
    const projectsWithReadiness = await Promise.all(
      packs.map(async (pack) => {
        const sections = await getPackSections(pack.id);
        const readiness = calculateReadiness(sections);
        const template = templates.find((t) => t.id === pack.pack_template_id);

        return {
          id: pack.id,
          name: pack.name,
          permission_code: template?.code || "unknown",
          permission_name: template?.name || "Unknown",
          status: pack.status,
          target_submission_date: pack.target_submission_date,
          created_at: pack.created_at,
          pack_id: pack.id,
          pack_name: pack.name,
          pack_status: pack.status,
          pack_template_name: pack.template_name,
          typical_timeline_weeks: pack.typical_timeline_weeks,
          policy_templates: template?.policy_templates || [],
          training_requirements: template?.training_requirements || [],
          smcr_roles: template?.smcr_roles || [],
          readiness,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithReadiness });
  } catch (error) {
    logError(error, "Failed to fetch authorization projects");
    return NextResponse.json({ error: "Failed to fetch projects", projects: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    await seedPackTemplates();

    const body = await request.json();
    const { name, templateCode, permissionCode, targetSubmissionDate, assignedConsultant } = body;

    // Support both templateCode and permissionCode for backwards compatibility
    const code = templateCode || permissionCode;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and template code are required" }, { status: 400 });
    }

    // Validate name length
    if (name.length > 255) {
      return NextResponse.json({ error: "Project name too long (max 255 characters)" }, { status: 400 });
    }

    // Get the template ID from the code
    const templates = await getPackTemplates();
    const template = templates.find((t) => t.code === code || t.pack_type === code);

    if (!template) {
      return NextResponse.json({ error: "Invalid template code" }, { status: 400 });
    }

    // Validate assignedConsultant is a valid UUID if provided
    if (assignedConsultant && !isValidUUID(assignedConsultant)) {
      return NextResponse.json({ error: "Invalid consultant ID format" }, { status: 400 });
    }

    const pack = await createAuthorizationPack({
      organization_id: auth.organizationId,
      pack_template_id: template.id,
      name: name.trim(),
      target_submission_date: targetSubmissionDate ? new Date(targetSubmissionDate) : undefined,
      assigned_consultant: assignedConsultant,
      created_by: auth.userId,
    });

    return NextResponse.json({ project: pack }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create authorization project");
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
