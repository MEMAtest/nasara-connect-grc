import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPackTasks,
  createPackTask,
  updatePackTask,
  getAuthorizationPack,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";

// Valid task statuses
const VALID_STATUSES = new Set(['pending', 'in_progress', 'completed', 'blocked', 'cancelled']);

// Valid task types
const VALID_TASK_TYPES = new Set(['narrative', 'evidence', 'review', 'policy', 'training', 'smcr', 'general']);

// Valid priorities
const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);

// Verify pack belongs to user's organization
async function verifyPackOwnership(packId: string, organizationId: string): Promise<boolean> {
  const pack = await getAuthorizationPack(packId);
  return pack !== null && pack.organization_id === organizationId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tasks = await getPackTasks(packId);

    // Transform to client-friendly format
    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      packId: t.pack_id,
      sectionId: t.pack_section_id,
      milestoneId: t.milestone_id,
      title: t.title,
      description: t.description,
      taskType: t.task_type,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assigned_to,
      assignedName: t.assigned_name,
      dueDate: t.due_date,
      completedAt: t.completed_at,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    logError(error, "Failed to fetch tasks");
    return NextResponse.json({ error: "Failed to fetch tasks", tasks: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      taskType,
      priority,
      sectionId,
      milestoneId,
      assignedTo,
      assignedName,
      dueDate,
    } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!taskType || !VALID_TASK_TYPES.has(taskType)) {
      return NextResponse.json({ error: "Valid task type is required" }, { status: 400 });
    }

    if (title.length > 255) {
      return NextResponse.json({ error: "Title too long (max 255 characters)" }, { status: 400 });
    }

    // Validate optional fields
    if (description && description.length > 2000) {
      return NextResponse.json({ error: "Description too long (max 2000 characters)" }, { status: 400 });
    }

    if (priority && !VALID_PRIORITIES.has(priority)) {
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    if (sectionId && !isValidUUID(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID format" }, { status: 400 });
    }

    if (milestoneId && !isValidUUID(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID format" }, { status: 400 });
    }

    if (assignedTo && !isValidUUID(assignedTo)) {
      return NextResponse.json({ error: "Invalid assigned user ID format" }, { status: 400 });
    }

    if (assignedName && assignedName.length > 255) {
      return NextResponse.json({ error: "Assigned name too long (max 255 characters)" }, { status: 400 });
    }

    const task = await createPackTask({
      pack_id: packId,
      title: title.trim(),
      description: description?.trim(),
      task_type: taskType,
      priority: priority || 'medium',
      pack_section_id: sectionId,
      milestone_id: milestoneId,
      assigned_to: assignedTo,
      assigned_name: assignedName?.trim(),
      due_date: dueDate ? new Date(dueDate) : undefined,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create task");
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireAuth();
    if (error) return error;

    await initDatabase();
    const { packId } = await params;

    // Validate packId format
    if (!isValidUUID(packId)) {
      return NextResponse.json({ error: "Invalid pack ID format" }, { status: 400 });
    }

    // Verify the user has access to this pack
    const hasAccess = await verifyPackOwnership(packId, auth.organizationId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    if (!isValidUUID(taskId)) {
      return NextResponse.json({ error: "Invalid task ID format" }, { status: 400 });
    }

    // Validate updates
    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    if (updates.priority && !VALID_PRIORITIES.has(updates.priority)) {
      return NextResponse.json({ error: "Invalid priority value" }, { status: 400 });
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      if (updates.title.length > 255) {
        return NextResponse.json({ error: "Title too long (max 255 characters)" }, { status: 400 });
      }
    }

    if (updates.assignedTo && !isValidUUID(updates.assignedTo)) {
      return NextResponse.json({ error: "Invalid assigned user ID format" }, { status: 400 });
    }

    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description?.trim();
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
    if (updates.assignedName !== undefined) dbUpdates.assigned_name = updates.assignedName?.trim();
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt ? new Date(updates.completedAt) : null;

    const updated = await updatePackTask(taskId, dbUpdates);

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    logError(error, "Failed to update task");
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
