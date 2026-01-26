import { NextRequest, NextResponse } from "next/server";
import { getPack, getProjectByPackId } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";

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
      return NextResponse.json({ error: "Project not found for this pack" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        permissionCode: project.permissionCode,
        permissionName: project.permissionName,
        packId,
      },
    });
  } catch (error) {
    logError(error, "Failed to load pack project");
    return NextResponse.json({ error: "Failed to load pack project" }, { status: 500 });
  }
}
