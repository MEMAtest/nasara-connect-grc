import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintWithDetails,
  updateComplaintRecord,
  createComplaintActivity,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  COMPLAINT_TYPES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  PRIORITY_LEVELS,
} from "@/lib/validation";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/complaints/[id] - Get complaint with all details (letters, activities)
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
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const data = await getComplaintWithDetails(id);

    if (!data.complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }
    if (data.complaint.organization_id && data.complaint.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching complaint details:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint details" },
      { status: 500 }
    );
  }
}

// PATCH /api/complaints/[id] - Update complaint with activity tracking
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
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    const activityChanges: Array<{ type: string; old: string; new: string; description: string }> = [];

    // Get current record for tracking changes
    const currentData = await getComplaintWithDetails(id);
    if (!currentData.complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }
    if (currentData.complaint.organization_id && currentData.complaint.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const current = currentData.complaint;

    // Track status changes
    if (body.status !== undefined && body.status !== current.status) {
      if (!isValidEnum(body.status, COMPLAINT_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
      activityChanges.push({
        type: "status_change",
        old: current.status,
        new: body.status,
        description: `Status changed from ${current.status} to ${body.status}`
      });
    }

    // Track priority changes
    if (body.priority !== undefined && body.priority !== current.priority) {
      if (!isValidEnum(body.priority, PRIORITY_LEVELS)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${PRIORITY_LEVELS.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.priority = body.priority;
      activityChanges.push({
        type: "priority_change",
        old: current.priority,
        new: body.priority,
        description: `Priority changed from ${current.priority} to ${body.priority}`
      });
    }

    // Track assignment changes
    if (body.assigned_to !== undefined && body.assigned_to !== current.assigned_to) {
      updateData.assigned_to = sanitizeString(body.assigned_to) || null;
      activityChanges.push({
        type: "assigned",
        old: current.assigned_to || "Unassigned",
        new: body.assigned_to || "Unassigned",
        description: body.assigned_to
          ? `Assigned to ${body.assigned_to}`
          : "Assignment removed"
      });
    }

    // Handle other fields
    if (body.complainant_name !== undefined) {
      const complainantName = sanitizeString(body.complainant_name);
      if (!complainantName) {
        return NextResponse.json(
          { error: "Complainant name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.complainant_name = complainantName;
    }

    if (body.complainant_email !== undefined) {
      updateData.complainant_email = sanitizeString(body.complainant_email) || null;
    }

    if (body.complainant_address !== undefined) {
      updateData.complainant_address = sanitizeText(body.complainant_address) || null;
    }

    if (body.root_cause !== undefined) {
      updateData.root_cause = sanitizeText(body.root_cause) || null;
    }

    if (body.remedial_action !== undefined) {
      updateData.remedial_action = sanitizeText(body.remedial_action) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    if (body.product_type !== undefined) {
      updateData.product_type = sanitizeString(body.product_type) || null;
    }

    if (body.policy_reference !== undefined) {
      updateData.policy_reference = sanitizeString(body.policy_reference) || null;
    }

    if (body.complaint_type !== undefined) {
      if (!isValidEnum(body.complaint_type, COMPLAINT_TYPES)) {
        return NextResponse.json(
          { error: `Invalid complaint type. Must be one of: ${COMPLAINT_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.complaint_type = body.complaint_type;
    }

    if (body.complaint_category !== undefined) {
      if (!isValidEnum(body.complaint_category, COMPLAINT_CATEGORIES)) {
        return NextResponse.json(
          { error: `Invalid complaint category. Must be one of: ${COMPLAINT_CATEGORIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.complaint_category = body.complaint_category;
    }

    // Date fields
    const dateFields = [
      "received_date",
      "acknowledged_date",
      "resolution_deadline",
      "resolved_date",
      "final_response_date",
    ];

    for (const field of dateFields) {
      if (body[field] !== undefined) {
        if (body[field] === null || body[field] === "") {
          updateData[field] = null;
        } else {
          const parsedDate = parseValidDate(body[field]);
          if (!parsedDate) {
            return NextResponse.json(
              { error: `Invalid date format for ${field}` },
              { status: 400 }
            );
          }
          updateData[field] = parsedDate;
        }
      }
    }

    // Boolean fields
    const booleanFields = [
      "fos_referred",
      "four_week_letter_sent",
      "eight_week_letter_sent",
      "final_response_sent",
    ];

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        updateData[field] = Boolean(body[field]);

        // Track FOS referral
        if (field === "fos_referred" && body[field] && !current.fos_referred) {
          activityChanges.push({
            type: "fos_referred",
            old: "false",
            new: "true",
            description: "Complaint referred to Financial Ombudsman Service"
          });
        }
      }
    }

    // Compensation amount
    if (body.compensation_amount !== undefined) {
      if (body.compensation_amount === null || body.compensation_amount === "") {
        updateData.compensation_amount = null;
      } else {
        const parsedValue = parsePositiveNumber(body.compensation_amount);
        if (parsedValue === null) {
          return NextResponse.json(
            { error: "Invalid compensation amount. Must be a positive number" },
            { status: 400 }
          );
        }
        updateData.compensation_amount = parsedValue;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the record
    const record = await updateComplaintRecord(id, updateData);

    // Create activity records for tracked changes
    const performedBy = body._performedBy || "System";
    for (const change of activityChanges) {
      await createComplaintActivity({
        complaint_id: id,
        activity_type: change.type as "status_change" | "priority_change" | "assigned" | "fos_referred",
        description: change.description,
        old_value: change.old,
        new_value: change.new,
        performed_by: performedBy,
      });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
