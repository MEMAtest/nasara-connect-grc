import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getAuthorizationProject } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import {
  calculatePredictiveScore,
  calculateFromQuestionBank,
  identifyHardGateFailures,
} from "@/lib/fca-intelligence/predictive-scorer";
import { buildQuestionContext, type QuestionResponse } from "@/lib/assessment-question-bank";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ProjectAssessmentData {
  businessPlanProfile?: BusinessPlanProfile;
  basics?: Record<string, string | number | null>;
  questionResponses?: Record<string, QuestionResponse>;
  [key: string]: unknown;
}

/**
 * GET /api/authorization-pack/projects/[id]/predict
 * Calculate predictive authorization score based on profile responses
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;

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
    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get permission code (snake_case from DB)
    const rawPermissionCode = project.permission_code ?? project.permissionCode;
    if (!rawPermissionCode || typeof rawPermissionCode !== "string") {
      return NextResponse.json({
        error: "Invalid or missing permission code"
      }, { status: 400 });
    }
    const permissionCode = rawPermissionCode;

    // Get assessment data (snake_case from DB) with runtime validation
    const rawAssessmentData = project.assessment_data ?? project.assessmentData;
    if (rawAssessmentData && typeof rawAssessmentData !== "object") {
      logError(new Error("Invalid assessment data format"), "Assessment data is not an object");
      return NextResponse.json({ error: "Invalid assessment data format" }, { status: 500 });
    }
    const assessmentData = rawAssessmentData as ProjectAssessmentData | null;

    // Try to calculate from question bank first (new approach)
    const questionBankResponses = assessmentData?.questionResponses;

    // Validate questionBankResponses is a proper object (not array, not primitive)
    if (
      questionBankResponses &&
      typeof questionBankResponses === "object" &&
      !Array.isArray(questionBankResponses) &&
      Object.keys(questionBankResponses).length > 0
    ) {
      // Build question context to get applicable questions
      const questionContext = buildQuestionContext(
        { basics: assessmentData?.basics, questionResponses: questionBankResponses },
        permissionCode
      );

      // Get all question definitions
      const questionDefinitions = questionContext.sections.flatMap(s => s.questions);

      // Calculate prediction from question bank
      const prediction = calculateFromQuestionBank(
        questionContext.responses,
        questionDefinitions,
        permissionCode
      );

      // Also identify hard gate failures
      const hardGateFailures = identifyHardGateFailures(
        questionContext.responses,
        questionDefinitions
      );

      return NextResponse.json({
        success: true,
        prediction,
        projectId,
        permissionCode,
        source: "question_bank",
        hardGateFailures: hardGateFailures.length > 0 ? hardGateFailures : undefined,
        questionStats: {
          totalQuestions: questionContext.requiredCount,
          answeredQuestions: questionContext.answeredCount,
          completionPercentage: questionContext.requiredCount > 0
            ? Math.round((questionContext.answeredCount / questionContext.requiredCount) * 100)
            : 0,
        },
      });
    }

    // Fall back to legacy business plan profile responses
    const legacyResponses = assessmentData?.businessPlanProfile?.responses ?? {};
    const prediction = calculatePredictiveScore(legacyResponses, permissionCode);

    return NextResponse.json({
      success: true,
      prediction,
      projectId,
      permissionCode,
      source: "business_plan_profile",
    });
  } catch (error) {
    logError(error, "Predict authorization score error");
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
    const { auth, error } = await requireRole("member");
    if (error) return error;

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
    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get permission code (snake_case from DB)
    const rawPermissionCode = project.permission_code ?? project.permissionCode;
    if (!rawPermissionCode || typeof rawPermissionCode !== "string") {
      return NextResponse.json({
        error: "Invalid or missing permission code"
      }, { status: 400 });
    }
    const permissionCode = rawPermissionCode;

    // Get assessment data (snake_case from DB) with runtime validation
    const rawAssessmentData = project.assessment_data ?? project.assessmentData;
    if (rawAssessmentData && typeof rawAssessmentData !== "object") {
      logError(new Error("Invalid assessment data format"), "Assessment data is not an object");
      return NextResponse.json({ error: "Invalid assessment data format" }, { status: 500 });
    }
    const assessmentData = rawAssessmentData as ProjectAssessmentData | null;

    // Try to calculate from question bank first (new approach)
    const questionBankResponses = assessmentData?.questionResponses;

    // Validate questionBankResponses is a proper object (not array, not primitive)
    if (
      questionBankResponses &&
      typeof questionBankResponses === "object" &&
      !Array.isArray(questionBankResponses) &&
      Object.keys(questionBankResponses).length > 0
    ) {
      // Build question context to get applicable questions
      const questionContext = buildQuestionContext(
        { basics: assessmentData?.basics, questionResponses: questionBankResponses },
        permissionCode
      );

      // Get all question definitions
      const questionDefinitions = questionContext.sections.flatMap(s => s.questions);

      // Calculate prediction from question bank
      const prediction = calculateFromQuestionBank(
        questionContext.responses,
        questionDefinitions,
        permissionCode
      );

      // Also identify hard gate failures
      const hardGateFailures = identifyHardGateFailures(
        questionContext.responses,
        questionDefinitions
      );

      return NextResponse.json({
        success: true,
        prediction,
        projectId,
        permissionCode,
        source: "question_bank",
        hardGateFailures: hardGateFailures.length > 0 ? hardGateFailures : undefined,
        questionStats: {
          totalQuestions: questionContext.requiredCount,
          answeredQuestions: questionContext.answeredCount,
          completionPercentage: questionContext.requiredCount > 0
            ? Math.round((questionContext.answeredCount / questionContext.requiredCount) * 100)
            : 0,
        },
      });
    }

    // Fall back to legacy business plan profile responses
    const legacyResponses = assessmentData?.businessPlanProfile?.responses ?? {};
    const prediction = calculatePredictiveScore(legacyResponses, permissionCode);

    return NextResponse.json({
      success: true,
      prediction,
      projectId,
      permissionCode,
      source: "business_plan_profile",
    });
  } catch (error) {
    logError(error, "Predict authorization score error");
    return NextResponse.json(
      { error: "Failed to calculate prediction" },
      { status: 500 }
    );
  }
}
