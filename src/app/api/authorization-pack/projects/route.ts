import { NextRequest, NextResponse } from "next/server";
import { createAuthorizationProject, getAuthorizationProjects } from "@/lib/authorization-pack-db";
import { PermissionCode } from "@/lib/authorization-pack-ecosystems";
import { logError } from "@/lib/logger";
import { requireAuth } from "@/lib/auth-utils";
import { createNotification } from "@/lib/server/notifications-store";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    const projects = await getAuthorizationProjects(auth.organizationId);
    return NextResponse.json({ projects });
  } catch (error) {
    logError(error, "Failed to fetch authorization projects");
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: process.env.NODE_ENV === "production" ? undefined : (error instanceof Error ? error.message : String(error)),
        projects: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    const body = await request.json();
    const { name, permissionCode, targetSubmissionDate, assessmentData } = body;

    if (!name || !permissionCode) {
      return NextResponse.json({ error: "Name and permission code are required" }, { status: 400 });
    }

    if (name.length > 255) {
      return NextResponse.json({ error: "Project name too long (max 255 characters)" }, { status: 400 });
    }

    const project = await createAuthorizationProject({
      organizationId: auth.organizationId,
      permissionCode: permissionCode as PermissionCode,
      name: name.trim(),
      targetSubmissionDate: targetSubmissionDate ?? null,
      assessmentData,
    });

    try {
      await createNotification({
        organizationId: DEFAULT_ORGANIZATION_ID,
        title: "Authorization project created",
        message: `Project "${project.name}" created for ${permissionCode}.`,
        severity: "success",
        source: "authorization-pack",
        link: "/authorization-pack",
        metadata: { projectId: project.id, permissionCode },
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create authorization project");
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes("Permission ecosystem not found") || message.includes("Template not found") ? 400 : 500;
    return NextResponse.json(
      {
        error: status === 400 ? message : "Failed to create project",
        details: process.env.NODE_ENV === "production" ? undefined : message,
      },
      { status }
    );
  }
}
