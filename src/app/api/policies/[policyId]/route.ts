import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { updatePolicy, getPolicyById, deletePolicy } from "@/lib/server/policy-store";
import {
  initDatabase,
  getPolicyWithDetails,
  createPolicyActivity,
} from "@/lib/database";
import { createNotification } from "@/lib/server/notifications-store";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  POLICY_STATUSES,
  POLICY_ACTIVITY_TYPES,
  BOARD_FREQUENCIES,
} from "@/lib/validation";

// GET /api/policies/[policyId] - Get policy with all details (versions, activities)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Get policy from policy-store (includes template processing)
    const policy = await getPolicyById(auth.organizationId, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Get additional details (versions, activities)
    const details = await getPolicyWithDetails(policyId);

    return NextResponse.json({
      ...policy,
      versions: details.versions,
      activities: details.activities,
    });
  } catch (error) {
    console.error("Error fetching policy details:", error);
    return NextResponse.json(
      { error: "Failed to fetch policy details" },
      { status: 500 }
    );
  }
}

// PATCH /api/policies/[policyId] - Update policy with activity tracking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const activityChanges: Array<{
      type: string;
      old: string;
      new: string;
      description: string;
    }> = [];
    let statusChange: { from: string; to: string } | null = null;

    // Get current policy for tracking changes
    const current = await getPolicyById(auth.organizationId, policyId);
    if (!current) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Track status changes
    if (body.status !== undefined && body.status !== current.status) {
      if (!isValidEnum(body.status, POLICY_STATUSES)) {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${POLICY_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updates.status = body.status;

      // Use more specific activity type for approval/rejection
      let activityType = "status_change";
      if (body.status === "approved") {
        activityType = "approved";
      } else if (body.status === "in_review" && current.status === "draft") {
        activityType = "approval_requested";
      }

      activityChanges.push({
        type: activityType,
        old: current.status,
        new: body.status,
        description: `Status changed from ${current.status} to ${body.status}`,
      });
      statusChange = { from: current.status, to: body.status };
    }

    // Handle name updates
    if (body.name !== undefined && body.name !== current.name) {
      const sanitizedName = sanitizeString(body.name);
      if (!sanitizedName) {
        return NextResponse.json(
          { error: "Policy name cannot be empty" },
          { status: 400 }
        );
      }
      updates.name = sanitizedName;
      activityChanges.push({
        type: "content_update",
        old: current.name,
        new: sanitizedName,
        description: `Name updated from "${current.name}" to "${sanitizedName}"`,
      });
    }

    // Handle description updates
    if (body.description !== undefined && body.description !== current.description) {
      updates.description = sanitizeText(body.description) || "";
      activityChanges.push({
        type: "content_update",
        old: current.description?.substring(0, 100) || "",
        new: (updates.description as string).substring(0, 100),
        description: "Description updated",
      });
    }

    // Handle permissions updates
    if (body.permissions !== undefined) {
      updates.permissions = body.permissions;
      activityChanges.push({
        type: "content_update",
        old: "previous permissions",
        new: "updated permissions",
        description: "Permissions configuration updated",
      });
    }

    // Handle clauses updates
    if (body.clauses !== undefined) {
      updates.clauses = body.clauses;
      const oldCount = Array.isArray(current.clauses) ? current.clauses.length : 0;
      const newCount = Array.isArray(body.clauses) ? body.clauses.length : 0;
      activityChanges.push({
        type: "content_update",
        old: `${oldCount} clauses`,
        new: `${newCount} clauses`,
        description: `Clauses updated (${oldCount} → ${newCount})`,
      });
    }

    // Handle custom content updates
    if (body.customContent !== undefined) {
      updates.customContent = body.customContent;
      activityChanges.push({
        type: "content_update",
        old: "previous content",
        new: "updated content",
        description: "Custom content updated",
      });
    }

    // Handle approvals updates
    if (body.approvals !== undefined) {
      // Validate board frequency if provided
      if (body.approvals.boardFrequency !== undefined) {
        if (!isValidEnum(body.approvals.boardFrequency, BOARD_FREQUENCIES)) {
          return NextResponse.json(
            {
              error: `Invalid board frequency. Must be one of: ${BOARD_FREQUENCIES.join(", ")}`,
            },
            { status: 400 }
          );
        }
      }

      updates.approvals = body.approvals;

      // Check if SMF approval setting changed
      if (body.approvals.requiresSMF && !current.approvals?.requiresSMF) {
        activityChanges.push({
          type: "approval_requested",
          old: "not required",
          new: "SMF approval required",
          description: "SMF approval requirement added",
        });
      }

      // Check if board approval setting changed
      if (body.approvals.requiresBoard && !current.approvals?.requiresBoard) {
        activityChanges.push({
          type: "approval_requested",
          old: "not required",
          new: "Board approval required",
          description: "Board approval requirement added",
        });
      }

      // Check if board frequency changed
      if (body.approvals.boardFrequency !== current.approvals?.boardFrequency) {
        activityChanges.push({
          type: "content_update",
          old: current.approvals?.boardFrequency || "not set",
          new: body.approvals.boardFrequency,
          description: `Board review frequency changed to ${body.approvals.boardFrequency}`,
        });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(current);
    }

    // Update the record
    const updated = await updatePolicy(auth.organizationId, policyId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Create activity records for tracked changes
    const performedBy = sanitizeString(body._performedBy) || "System";
    for (const change of activityChanges) {
      await createPolicyActivity({
        policy_id: policyId,
        activity_type: change.type as typeof POLICY_ACTIVITY_TYPES[number],
        description: change.description,
        old_value: change.old,
        new_value: change.new,
        performed_by: performedBy,
      });
    }

    if (statusChange) {
      try {
        const severity = statusChange.to === "approved" ? "success" : "info";
        await createNotification({
          organizationId: auth.organizationId,
          title: "Policy status updated",
          message: `"${updated.name}" moved from ${statusChange.from} to ${statusChange.to}.`,
          severity,
          source: "policies",
          link: `/policies/${updated.id}`,
          metadata: { policyId: updated.id, from: statusChange.from, to: statusChange.to },
        });
      } catch {
        // Non-blocking notification failures
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating policy:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}

// DELETE /api/policies/[policyId] - Delete policy with activity logging
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireAuth();
    if (error) return error;
    await initDatabase();
    const { policyId } = await params;

    if (!isValidUUID(policyId)) {
      return NextResponse.json(
        { error: "Invalid policy ID format" },
        { status: 400 }
      );
    }

    // Get policy info before deletion for logging
    const policy = await getPolicyById(auth.organizationId, policyId);
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const deleted = await deletePolicy(auth.organizationId, policyId);
    if (!deleted) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedPolicy: policy.name });
  } catch (error) {
    console.error("Error deleting policy:", error);
    return NextResponse.json(
      { error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}
