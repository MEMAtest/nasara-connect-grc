import { NextRequest, NextResponse } from "next/server";
import { initDatabase, getAuthorizationPack, getPackTasks, updatePackTask } from "@/lib/database";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tasks = await getPackTasks(id);

    // Transform to expected format
    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      owner_id: t.assigned_to,
      due_date: t.due_date,
      section_title: null,
      source: t.task_type,
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

    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    const pack = await getAuthorizationPack(id);
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

    await updatePackTask(taskId, { status });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
