import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationProject, saveAuthorizationBusinessPlanProfile } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import type { BusinessPlanProfile } from "@/lib/business-plan-profile";

const DEFAULT_PROFILE: BusinessPlanProfile = {
  version: 1,
  responses: {},
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
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
    const profile = (assessment?.businessPlanProfile as BusinessPlanProfile | undefined) ?? DEFAULT_PROFILE;

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
    const { auth, error } = await requireAuth();
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
