import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationProject, saveAuthorizationBusinessPlanProfile } from "@/lib/authorization-pack-db";
import { isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import type { BusinessPlanProfile, ProfileResponse } from "@/lib/business-plan-profile";
import { requireRole } from "@/lib/rbac";

const DEFAULT_PROFILE: BusinessPlanProfile = {
  version: 1,
  responses: {},
};

const PAYMENT_BACKFILL_RESPONSES: Record<string, ProfileResponse> = {
  "pay-psp-record": "review",
  "pay-operate-accounts": "review",
  "pay-credit-line": "review",
  "pay-payment-instruments": "review",
};

const PAYMENT_SERVICE_BACKFILL_MAP: Record<string, string> = {
  "ps-cash-payment-account": "cash-deposit",
  "ps-cash-withdrawal": "cash-withdrawal",
  "ps-execution-payment-account": "execution-transfers",
  "ps-execution-credit-line": "execution-transfers",
  "ps-issuing-acquiring": "issuing-acquiring",
  "ps-money-remittance": "money-remittance",
  "ps-pis": "payment-initiation",
  "ps-ais": "account-info",
  "payment-initiation": "payment-initiation",
  "account-info-services": "account-info",
  "money-transmission": "money-remittance",
  "card-issuing": "issuing-acquiring",
  acquiring: "issuing-acquiring",
};

const parseCommaList = (value: unknown) => {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const applyPaymentProfileBackfill = (
  profile: BusinessPlanProfile,
  permissionCode: string | null | undefined
): BusinessPlanProfile | null => {
  if (permissionCode !== "payments") {
    return null;
  }

  const responses = profile.responses ?? {};
  let changed = false;
  const nextResponses: Record<string, ProfileResponse> = { ...responses };

  for (const [key, value] of Object.entries(PAYMENT_BACKFILL_RESPONSES)) {
    if (nextResponses[key] === undefined) {
      nextResponses[key] = value;
      changed = true;
    }
  }

  if (!changed) {
    return null;
  }

  return {
    ...profile,
    responses: nextResponses,
  };
};

const applyAssessmentProfileBackfill = (
  profile: BusinessPlanProfile,
  assessmentData: Record<string, unknown> | null | undefined,
  permissionCode: string | null | undefined
): BusinessPlanProfile | null => {
  const basics = assessmentData?.basics;
  if (!basics || typeof basics !== "object" || Array.isArray(basics)) {
    return null;
  }

  const responses = profile.responses ?? {};
  let changed = false;
  const nextResponses: Record<string, ProfileResponse> = { ...responses };

  const headcount = (basics as Record<string, unknown>).headcount;
  if (permissionCode === "payments" && typeof headcount === "string" && nextResponses["pay-headcount"] === undefined) {
    nextResponses["pay-headcount"] = headcount;
    changed = true;
  }

  const targetMarkets = (basics as Record<string, unknown>).targetMarkets;
  if (typeof targetMarkets === "string" && nextResponses["core-geography"] === undefined) {
    const geographyMap: Record<string, string> = {
      "uk-only": "uk",
      "uk-eea": "uk-eea",
      "uk-international": "global",
      global: "global",
    };
    const mapped = geographyMap[targetMarkets];
    if (mapped) {
      nextResponses["core-geography"] = mapped;
      changed = true;
    }
  }

  if (permissionCode === "payments" && nextResponses["pay-services"] === undefined) {
    const activities = parseCommaList((basics as Record<string, unknown>).regulatedActivities);
    const mapped = Array.from(
      new Set(
        activities
          .map((activity) => PAYMENT_SERVICE_BACKFILL_MAP[activity])
          .filter((value): value is string => Boolean(value))
      )
    );
    if (mapped.length) {
      nextResponses["pay-services"] = mapped;
      changed = true;
    }
  }

  if (permissionCode === "payments" && nextResponses["pay-emoney"] === undefined) {
    const activities = parseCommaList((basics as Record<string, unknown>).regulatedActivities);
    if (activities.includes("e-money-issuance")) {
      nextResponses["pay-emoney"] = "yes";
      changed = true;
    }
  }

  if (!changed) {
    return null;
  }

  return {
    ...profile,
    responses: nextResponses,
  };
};

export async function GET(
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

    const project = await getAuthorizationProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const assessment = project.assessment_data as Record<string, unknown>;
    const storedProfile = assessment?.businessPlanProfile as BusinessPlanProfile | undefined;
    const profile: BusinessPlanProfile = {
      version: storedProfile?.version ?? DEFAULT_PROFILE.version,
      responses: storedProfile?.responses ?? DEFAULT_PROFILE.responses,
      updatedAt: storedProfile?.updatedAt,
    };

    let nextProfile = profile;
    const assessmentBackfill = applyAssessmentProfileBackfill(profile, assessment, project.permission_code);
    if (assessmentBackfill) {
      nextProfile = assessmentBackfill;
    }

    const paymentBackfill = applyPaymentProfileBackfill(nextProfile, project.permission_code);
    if (paymentBackfill) {
      nextProfile = paymentBackfill;
    }

    if (nextProfile !== profile) {
      const saved = await saveAuthorizationBusinessPlanProfile(id, nextProfile);
      return NextResponse.json({ profile: saved ?? nextProfile });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    logError(error, "Failed to load business plan profile");
    return NextResponse.json({ error: "Failed to load business plan profile" }, { status: 500 });
  }
}

export async function POST(
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

    const project = await getAuthorizationProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const responses = body?.responses;
    if (!responses || typeof responses !== "object" || Array.isArray(responses)) {
      return NextResponse.json({ error: "Invalid responses payload" }, { status: 400 });
    }

    const profile: BusinessPlanProfile = {
      version: Number(body?.version ?? DEFAULT_PROFILE.version),
      responses,
    };

    const saved = await saveAuthorizationBusinessPlanProfile(id, profile);
    if (!saved) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: saved });
  } catch (error) {
    logError(error, "Failed to save business plan profile");
    return NextResponse.json({ error: "Failed to save business plan profile" }, { status: 500 });
  }
}
