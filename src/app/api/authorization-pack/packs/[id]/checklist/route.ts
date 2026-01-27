import { NextRequest, NextResponse } from "next/server";
import {
  getPack,
  getPackChecklist,
  updatePackChecklistItem,
  replacePackChecklist,
  type ChecklistItemStatus,
} from "@/lib/authorization-pack-db";
import { requireAuth, isValidUUID } from "@/lib/auth-utils";
import { logError } from "@/lib/logger";
import { getAllChecklistItemIds } from "@/app/(dashboard)/authorization-pack/lib/fca-api-checklist";

const VALID_STATUSES: ChecklistItemStatus[] = [
  "not_started",
  "in_progress",
  "draft_ready",
  "reviewed",
  "final_ready",
  "submitted",
];

// Cache valid item IDs for validation
const validItemIdsSet = new Set(getAllChecklistItemIds());

/**
 * GET /api/authorization-pack/packs/[id]/checklist
 * Fetch the checklist state for a pack
 */
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

    const checklist = await getPackChecklist(id);

    return NextResponse.json({ checklist });
  } catch (error) {
    logError(error, "Failed to fetch checklist");
    return NextResponse.json(
      { error: "Failed to fetch checklist", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/authorization-pack/packs/[id]/checklist
 * Update a single checklist item status
 */
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

    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "Missing or invalid itemId" }, { status: 400 });
    }

    // Validate itemId is a known checklist item
    if (!validItemIdsSet.has(itemId)) {
      return NextResponse.json({ error: "Invalid checklist item ID" }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await updatePackChecklistItem(id, itemId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to update checklist item");
    return NextResponse.json(
      { error: "Failed to update checklist", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/authorization-pack/packs/[id]/checklist
 * Replace entire checklist state (bulk update)
 */
export async function PUT(
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

    const body = await request.json();
    const { checklist } = body;

    if (!checklist || typeof checklist !== "object" || Array.isArray(checklist)) {
      return NextResponse.json({ error: "Missing or invalid checklist data" }, { status: 400 });
    }

    // Validate all keys are valid checklist item IDs
    const invalidKeys = Object.keys(checklist).filter(key => !validItemIdsSet.has(key));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid checklist item IDs: ${invalidKeys.slice(0, 5).join(", ")}${invalidKeys.length > 5 ? "..." : ""}` },
        { status: 400 }
      );
    }

    // Validate all values are valid statuses
    const invalidStatuses = Object.entries(checklist).filter(
      ([, status]) => !VALID_STATUSES.includes(status as ChecklistItemStatus)
    );
    if (invalidStatuses.length > 0) {
      return NextResponse.json(
        { error: `Invalid status values for items: ${invalidStatuses.slice(0, 5).map(([k]) => k).join(", ")}` },
        { status: 400 }
      );
    }

    const pack = await getPack(id);
    if (!pack) {
      return NextResponse.json({ error: "Pack not found" }, { status: 404 });
    }

    if (pack.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await replacePackChecklist(id, checklist);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "Failed to replace checklist");
    return NextResponse.json(
      { error: "Failed to replace checklist", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
