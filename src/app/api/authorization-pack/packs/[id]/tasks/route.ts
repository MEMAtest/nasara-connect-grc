import { NextRequest, NextResponse } from "next/server";
import { listTasks, updateTaskStatus } from "@/lib/authorization-pack-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = await listTasks(id);
    return NextResponse.json({ tasks });
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
    const body = await request.json();
    const taskId = body.taskId as string | undefined;
    const status = body.status as string | undefined;

    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status are required" }, { status: 400 });
    }

    await updateTaskStatus(taskId, status);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update task", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
