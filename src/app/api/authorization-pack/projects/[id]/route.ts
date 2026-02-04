import { NextRequest, NextResponse } from "next/server";
import { deleteAuthorizationProject, getAuthorizationProject } from "@/lib/authorization-pack-db";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/auth-utils";
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id } = await params;

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const projectData = await getAuthorizationProject(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (projectData.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const project = {
      id: projectData.id,
      name: projectData.name,
      permissionCode: projectData.permission_code,
      permissionName: projectData.permission_name,
      status: projectData.status,
      targetSubmissionDate: projectData.target_submission_date,
      createdAt: projectData.created_at,
      updatedAt: projectData.updated_at,
      packId: projectData.pack_id,
      packName: projectData.pack_name,
      packStatus: projectData.pack_status,
      packTemplateName: projectData.pack_template_name,
      typicalTimelineWeeks: projectData.typical_timeline_weeks,
      policyTemplates: projectData.policy_templates,
      trainingRequirements: projectData.training_requirements,
      smcrRoles: projectData.smcr_roles,
      assessmentData: projectData.assessment_data,
      projectPlan: projectData.project_plan,
      readiness: projectData.readiness,
      sections: projectData.sections ?? [],
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const projectData = await getAuthorizationProject(id);
    if (!projectData) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (projectData.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const deleted = await deleteAuthorizationProject(id, auth.userId ?? null);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to delete authorization project");
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
