import { NextRequest, NextResponse } from "next/server";
import { generateAuthorizationProjectPlan, getAuthorizationProject, updateAuthorizationProjectPlan } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { requireRole } from "@/lib/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id: projectId } = await params;

    if (!isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const project = await getAuthorizationProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ plan: project.project_plan || {} });
  } catch (error) {
    logError(error, "Failed to fetch project plan");
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id: projectId } = await params;

    if (!isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const project = await getAuthorizationProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (project.project_plan && Object.keys(project.project_plan).length > 0) {
      return NextResponse.json({
        success: true,
        message: "Plan already exists",
        plan: project.project_plan,
      });
    }

    const plan = await generateAuthorizationProjectPlan(projectId);
    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to generate project plan");
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

    const { id: projectId } = await params;

    if (!isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID format" }, { status: 400 });
    }

    const project = await getAuthorizationProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const plan = body.plan;
    if (!plan || typeof plan !== "object") {
      return NextResponse.json({ error: "Plan payload is required" }, { status: 400 });
    }

    const updated = await updateAuthorizationProjectPlan(projectId, plan);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    logError(error, "Failed to update project plan");
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
