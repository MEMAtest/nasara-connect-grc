import { NextRequest, NextResponse } from "next/server";
import { getPack, getProjectByPackId } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import {
  buildProfileInsights,
  isProfilePermissionCode,
  type BusinessPlanProfile,
} from "@/lib/business-plan-profile";

interface ProjectAssessmentData {
  businessPlanProfile?: BusinessPlanProfile;
  [key: string]: unknown;
}

/**
 * GET /api/authorization-pack/packs/[id]/insights
 * Get profile insights computed from business plan responses
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id: packId } = await params;
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(packId);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const project = await getProjectByPackId(packId);
    if (!project) {
      return NextResponse.json({
        insights: null,
        message: "No project associated with this pack",
      });
    }

    const assessmentData = project.assessmentData as ProjectAssessmentData | null;
    const responses = assessmentData?.businessPlanProfile?.responses ?? {};

    // Validate permission code
    const rawPermissionCode = project.permissionCode;
    const permissionCode = typeof rawPermissionCode === "string"
      ? rawPermissionCode.trim()
      : null;

    // Validate format (alphanumeric with dashes only)
    if (permissionCode && !/^[a-z0-9-]+$/i.test(permissionCode)) {
      return NextResponse.json({
        insights: null,
        message: "Invalid permission code format",
      });
    }

    // Normalize permission code for insights
    const permission = isProfilePermissionCode(permissionCode)
      ? permissionCode
      : permissionCode?.startsWith("payments")
      ? "payments"
      : null;

    if (!permission) {
      return NextResponse.json({
        insights: null,
        message: "Invalid permission code for insights",
      });
    }

    const hasResponses = Object.keys(responses).length > 0;
    if (!hasResponses) {
      return NextResponse.json({
        insights: {
          activityHighlights: [],
          focusAreas: [],
          completionPercent: 0,
          sectionScores: [],
          packSectionScores: [],
          regulatorySignals: [],
          perimeterOpinion: {
            verdict: "incomplete",
            summary: "Complete the business plan profile to generate insights.",
            rationale: [],
            obligations: [],
          },
        },
        hasResponses: false,
      });
    }

    const insights = buildProfileInsights(permission, responses);

    // Build regulatory signals for the insight cards
    const regulatorySignalCounts = new Map<string, number>();
    for (const key of Object.keys(responses)) {
      // Extract regulatory references from question IDs
      if (key.startsWith("perg-") || key.includes("-perg")) {
        const current = regulatorySignalCounts.get("PERG") ?? 0;
        regulatorySignalCounts.set("PERG", current + 1);
      }
      if (key.startsWith("psd-") || key.includes("-psd")) {
        const current = regulatorySignalCounts.get("PSD2") ?? 0;
        regulatorySignalCounts.set("PSD2", current + 1);
      }
      if (key.startsWith("conc-") || key.includes("-conc")) {
        const current = regulatorySignalCounts.get("CONC") ?? 0;
        regulatorySignalCounts.set("CONC", current + 1);
      }
      if (key.startsWith("cobs-") || key.includes("-cobs")) {
        const current = regulatorySignalCounts.get("COBS") ?? 0;
        regulatorySignalCounts.set("COBS", current + 1);
      }
      if (key.startsWith("pay-") || key.includes("-pay")) {
        const current = regulatorySignalCounts.get("Payments") ?? 0;
        regulatorySignalCounts.set("Payments", current + 1);
      }
      if (key.startsWith("core-") || key.includes("-core")) {
        const current = regulatorySignalCounts.get("Core") ?? 0;
        regulatorySignalCounts.set("Core", current + 1);
      }
    }

    const regulatorySignals = Array.from(regulatorySignalCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      insights: {
        activityHighlights: insights.activityHighlights,
        focusAreas: insights.focusAreas,
        completionPercent: insights.completionPercent,
        sectionScores: insights.sectionScores.slice(0, 6),
        packSectionScores: insights.packSectionScores
          .sort((a, b) => a.percent - b.percent)
          .slice(0, 6),
        perimeterOpinion: insights.perimeterOpinion,
        regulatorySignals: regulatorySignals.slice(0, 6),
      },
      hasResponses: true,
      projectId: project.id,
      permissionCode,
    });
  } catch (error) {
    logError(error, "Failed to get pack insights");
    return NextResponse.json({ error: "Failed to get pack insights" }, { status: 500 });
  }
}
