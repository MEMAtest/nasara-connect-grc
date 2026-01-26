import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationProject } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { calculatePredictiveScore } from "@/lib/fca-intelligence/predictive-scorer";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ProjectAssessmentData {
  businessPlanProfile?: BusinessPlanProfile;
  [key: string]: unknown;
}

/**
 * GET /api/authorization-pack/projects/[id]/predict
 * Calculate predictive authorization score based on profile responses
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    if (!projectId || !isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Get project and profile data
    const project = await getAuthorizationProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check organization access
    if (project.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get profile responses from assessmentData
    const assessmentData = project.assessmentData as ProjectAssessmentData | null;
    const responses = assessmentData?.businessPlanProfile?.responses ?? {};

    // Calculate predictive score
    const prediction = calculatePredictiveScore(responses, project.permissionCode);

    return NextResponse.json({
      success: true,
      prediction,
      projectId,
      permissionCode: project.permissionCode,
    });
  } catch (error) {
    logError("Predict authorization score error", error);
    return NextResponse.json(
      { error: "Failed to calculate prediction" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/authorization-pack/projects/[id]/predict
 * Recalculate and optionally save prediction
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAuth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;
    if (!projectId || !isValidUUID(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    // Get project
    const project = await getAuthorizationProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check organization access
    if (project.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get profile responses from assessmentData
    const assessmentData = project.assessmentData as ProjectAssessmentData | null;
    const responses = assessmentData?.businessPlanProfile?.responses ?? {};

    // Calculate predictive score
    const prediction = calculatePredictiveScore(responses, project.permissionCode);

    return NextResponse.json({
      success: true,
      prediction,
      projectId,
      permissionCode: project.permissionCode,
    });
  } catch (error) {
    logError("Predict authorization score error", error);
    return NextResponse.json(
      { error: "Failed to calculate prediction" },
      { status: 500 }
    );
  }
}
