import { NextRequest, NextResponse } from "next/server";
import { getPack, listTasks, updateTaskStatus } from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function GET(
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

    const tasks = await listTasks(id);

    // Transform to expected format
    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      owner_id: t.owner_id,
      due_date: t.due_date,
      section_title: t.section_title || null,
      source: t.source,
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load tasks", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const taskId = body.taskId as string | undefined;
    const status = body.status as string | undefined;

    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status are required" }, { status: 400 });
    }

    if (!isValidUUID(taskId)) {
      return NextResponse.json({ error: "Invalid task ID format" }, { status: 400 });
    }

    // Validate status value
    const validStatuses = ["pending", "in_progress", "completed", "blocked"] as const;
    if (!validStatuses.includes(status as typeof validStatuses[number])) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await updateTaskStatus(taskId, status as typeof validStatuses[number]);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
