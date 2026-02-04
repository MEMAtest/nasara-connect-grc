import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import {
  initDatabase,
  getProjectMilestones,
  createProjectMilestone,
  updateProjectMilestone,
  getAuthorizationPack,
} from "@/lib/database";
import { logError } from "@/lib/logger";
import { isValidUUID } from "@/lib/auth-utils";

// Valid milestone statuses
const VALID_STATUSES = new Set(['pending', 'in_progress', 'completed', 'blocked']);

// Valid linked modules
const VALID_LINKED_MODULES = new Set(['policy', 'training', 'smcr', 'document', null, undefined]);

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
    const { auth, error } = await requireRole("member");
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

    const milestones = await getProjectMilestones(packId);

    // Transform to client-friendly format
    const formattedMilestones = milestones.map((m) => ({
      id: m.id,
      packId: m.pack_id,
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.due_date,
      completedAt: m.completed_at,
      dependencies: m.dependencies,
      linkedModule: m.linked_module,
      linkedItemId: m.linked_item_id,
      orderIndex: m.order_index,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    }));

    return NextResponse.json({ milestones: formattedMilestones });
  } catch (error) {
    logError(error, "Failed to fetch milestones");
    return NextResponse.json({ error: "Failed to fetch milestones", milestones: [] }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
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
    const { title, description, dueDate, dependencies, linkedModule, linkedItemId, orderIndex } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 255) {
      return NextResponse.json({ error: "Title too long (max 255 characters)" }, { status: 400 });
    }

    // Validate optional fields
    if (description && description.length > 1000) {
      return NextResponse.json({ error: "Description too long (max 1000 characters)" }, { status: 400 });
    }

    if (linkedModule && !VALID_LINKED_MODULES.has(linkedModule)) {
      return NextResponse.json({ error: "Invalid linked module" }, { status: 400 });
    }

    if (linkedItemId && !isValidUUID(linkedItemId)) {
      return NextResponse.json({ error: "Invalid linked item ID format" }, { status: 400 });
    }

    const milestone = await createProjectMilestone({
      pack_id: packId,
      title: title.trim(),
      description: description?.trim(),
      due_date: dueDate ? new Date(dueDate) : undefined,
      dependencies,
      linked_module: linkedModule,
      linked_item_id: linkedItemId,
      order_index: orderIndex ?? 0,
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create milestone");
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    // Authenticate the request
    const { auth, error } = await requireRole("member");
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
    const { milestoneId, ...updates } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    if (!isValidUUID(milestoneId)) {
      return NextResponse.json({ error: "Invalid milestone ID format" }, { status: 400 });
    }

    // Validate status if provided
    if (updates.status && !VALID_STATUSES.has(updates.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Validate title if provided
    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
      }
      if (updates.title.length > 255) {
        return NextResponse.json({ error: "Title too long (max 255 characters)" }, { status: 400 });
      }
    }

    // Transform camelCase to snake_case for database
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title.trim();
    if (updates.description !== undefined) dbUpdates.description = updates.description?.trim();
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt ? new Date(updates.completedAt) : null;
    if (updates.dependencies !== undefined) dbUpdates.dependencies = updates.dependencies;

    const updated = await updateProjectMilestone(milestoneId, dbUpdates);

    if (!updated) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, milestone: updated });
  } catch (error) {
    logError(error, "Failed to update milestone");
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
