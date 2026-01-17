/**
 * Training Assignments API Routes
 * GET /api/training/assignments - List assignments created by current user
 * POST /api/training/assignments - Create a new training assignment
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionIdentity, isAuthDisabled } from "@/lib/auth-utils";
import { logApiRequest, logError } from "@/lib/logger";
import { createTrainingAssignment, initTrainingDatabase, listTrainingAssignments } from "@/lib/training-database";

export async function GET(_request: NextRequest) {
  logApiRequest("GET", "/api/training/assignments");

  try {
    const session = isAuthDisabled() ? null : await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initTrainingDatabase();
    const { searchParams } = new URL(_request.url);
    const scopeParam = searchParams.get("scope");
    const scope =
      scopeParam === "assigned_to" || scopeParam === "all" || scopeParam === "assigned_by"
        ? scopeParam
        : "assigned_by";
    const assignments = await listTrainingAssignments(identity.email, scope);

    return NextResponse.json({ assignments, scope, viewerEmail: identity.email });
  } catch (error) {
    logError(error, "Failed to fetch training assignments");
    return NextResponse.json(
      { error: "Failed to fetch assignments", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logApiRequest("POST", "/api/training/assignments");

  try {
    const session = isAuthDisabled() ? null : await auth();
    const identity = getSessionIdentity(session);

    if (!identity?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initTrainingDatabase();

    const body = (await request.json()) as Record<string, unknown>;
    const moduleId = typeof body.moduleId === "string" ? body.moduleId.trim() : "";
    const assignedTo = typeof body.assignedTo === "string" ? body.assignedTo.trim() : "";
    const dueDate = typeof body.dueDate === "string" && body.dueDate.trim().length ? body.dueDate.trim() : null;
    const notes = typeof body.notes === "string" && body.notes.trim().length ? body.notes.trim() : null;

    if (!moduleId || !assignedTo) {
      return NextResponse.json({ error: "moduleId and assignedTo are required" }, { status: 400 });
    }

    const assignment = await createTrainingAssignment(identity.email, {
      moduleId,
      assignedTo,
      dueDate,
      notes,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create training assignment");
    return NextResponse.json(
      { error: "Failed to create assignment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
