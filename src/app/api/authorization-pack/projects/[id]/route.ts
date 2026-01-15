import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getAuthorizationPack,
  getPackSections,
  getPackTemplates,
  getProjectMilestones,
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

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<{ pack: Awaited<ReturnType<typeof getAuthorizationPack>> | null; hasAccess: boolean }> {
  const pack = await getAuthorizationPack(packId);
  if (!pack) return { pack: null, hasAccess: false };
  return { pack, hasAccess: pack.organization_id === organizationId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    // Verify the user has access to this project
    const { pack, hasAccess } = await verifyPackOwnership(id, auth.organizationId);
    if (!pack) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const sections = await getPackSections(id);
    const templates = await getPackTemplates();
    const milestones = await getProjectMilestones(id);
    const template = templates.find((t) => t.id === pack.pack_template_id);
    const readiness = calculateReadiness(sections);

    const project = {
      id: pack.id,
      name: pack.name,
      permissionCode: template?.code || "unknown",
      permissionName: template?.name || "Unknown",
      status: pack.status,
      targetSubmissionDate: pack.target_submission_date,
      createdAt: pack.created_at,
      updatedAt: pack.updated_at,
      packId: pack.id,
      packName: pack.name,
      packStatus: pack.status,
      packTemplateName: pack.template_name,
      typicalTimelineWeeks: pack.typical_timeline_weeks,
      policyTemplates: template?.policy_templates || [],
      trainingRequirements: template?.training_requirements || [],
      smcrRoles: template?.smcr_roles || [],
      assessmentData: pack.assessment_data,
      projectPlan: pack.project_plan,
      readiness,
      sections: sections.map((s) => ({
        id: s.id,
        code: s.template.code,
        name: s.template.name,
        status: s.status,
        progress: s.progress_percentage,
        orderIndex: s.template.order_index,
      })),
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        dueDate: m.due_date,
        orderIndex: m.order_index,
      })),
    };

    return NextResponse.json({ project });
  } catch (error) {
    logError(error, "Failed to load authorization project");
    return NextResponse.json(
      { error: "Failed to load authorization project" },
      { status: 500 }
    );
  }
}
