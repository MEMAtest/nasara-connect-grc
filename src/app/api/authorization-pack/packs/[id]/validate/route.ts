import { NextRequest, NextResponse } from "next/server";
import {
  getPack,
  getPackDocuments,
  getProjectByPackId,
} from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import {
  getProfileQuestions,
  getProfileSections,
  isProfilePermissionCode,
  type ProfileQuestion,
  type ProfileResponse,
} from "@/lib/business-plan-profile";

interface ValidationIssue {
  section: string;
  type: "incomplete" | "inconsistent" | "unclear" | "missing";
  description: string;
  severity: "warning" | "error";
}

interface ValidationResponse {
  score: number;
  issues: ValidationIssue[];
  ready: boolean;
  summary: string;
}

const resolvePermission = (permissionCode?: string | null) => {
  if (!permissionCode) return null;
  if (isProfilePermissionCode(permissionCode)) return permissionCode;
  if (permissionCode.startsWith("payments")) return "payments";
  return null;
};

const isAnswered = (
  question: ProfileQuestion,
  value: ProfileResponse | undefined,
  responses: Record<string, ProfileResponse>
) => {
  if (
    question.allowOther &&
    ((Array.isArray(value) && value.includes("other")) || value === "other")
  ) {
    const otherText = responses[`${question.id}_other_text`];
    if (typeof otherText !== "string" || otherText.trim().length === 0) {
      return false;
    }
  }
  if (value === undefined || value === null) return false;
  if (question.type === "multi-choice") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "text") {
    return String(value).trim().length > 0;
  }
  if (question.type === "number") {
    if (typeof value === "number") return !isNaN(value);
    if (typeof value === "string") {
      const parsed = Number(value);
      return value.trim().length > 0 && !Number.isNaN(parsed);
    }
    return false;
  }
  if (question.type === "boolean") {
    return typeof value === "boolean";
  }
  return String(value).trim().length > 0;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }
    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const project = await getProjectByPackId(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found for this pack" }, { status: 404 });
    }

    const permission = resolvePermission(project.permissionCode);
    const responses = project.assessmentData?.businessPlanProfile?.responses ?? {};
    const sectionLookup = new Map(
      getProfileSections(permission).map((section) => [section.id, section.title])
    );
    const questions = getProfileQuestions(permission);
    const requiredQuestions = questions.filter((question) => question.required);

    const missingQuestions = requiredQuestions.filter(
      (question) => !isAnswered(question, responses[question.id], responses)
    );

    const documents = await getPackDocuments(id);
    const hasOpinionPack = documents.some(
      (doc) => doc.section_code === "perimeter-opinion" && doc.storage_key
    );

    const issues: ValidationIssue[] = [];
    for (const question of missingQuestions) {
      const sectionLabel = sectionLookup.get(question.sectionId) || "Business Plan Profile";
      issues.push({
        section: sectionLabel,
        type: "missing",
        description: `Missing required response: ${question.label}.`,
        severity: "error",
      });
    }

    if (!hasOpinionPack) {
      issues.push({
        section: "Opinion Pack",
        type: "missing",
        description: "Perimeter opinion pack has not been generated yet.",
        severity: "error",
      });
    }

    const requiredTotal = requiredQuestions.length;
    const requiredAnswered = requiredTotal - missingQuestions.length;
    const completionPercent = requiredTotal
      ? Math.round((requiredAnswered / requiredTotal) * 100)
      : 0;

    const score = Math.round((completionPercent + (hasOpinionPack ? 100 : 0)) / 2);
    const ready = completionPercent >= 95 && hasOpinionPack;
    const summary = `Profile completion: ${completionPercent}%. Opinion pack: ${
      hasOpinionPack ? "generated" : "missing"
    }.`;

    const response: ValidationResponse = {
      score,
      issues,
      ready,
      summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error, "Validation route error");
    return NextResponse.json(
      { error: "Failed to validate pack", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
