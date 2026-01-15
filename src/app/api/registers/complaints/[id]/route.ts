import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintRecord,
  updateComplaintRecord,
  deleteComplaintRecord,
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

// GET /api/registers/complaints/[id] - Get a single Complaint record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const record = await getComplaintRecord(id);

    if (!record) {
      return NextResponse.json(
        { error: "Complaint record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching Complaint record:", error);
    return NextResponse.json(
      { error: "Failed to fetch Complaint record" },
      { status: 500 }
    );
  }
}

// PATCH /api/registers/complaints/[id] - Update a Complaint record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Validate and sanitize string fields
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

    if (body.root_cause !== undefined) {
      updateData.root_cause = sanitizeText(body.root_cause) || null;
    }

    if (body.remedial_action !== undefined) {
      updateData.remedial_action = sanitizeText(body.remedial_action) || null;
    }

    if (body.fos_outcome !== undefined) {
      updateData.fos_outcome = sanitizeString(body.fos_outcome) || null;
    }

    if (body.assigned_to !== undefined) {
      updateData.assigned_to = sanitizeString(body.assigned_to) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    // Validate enum fields
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

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, COMPLAINT_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.priority !== undefined) {
      if (!isValidEnum(body.priority, PRIORITY_LEVELS)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${PRIORITY_LEVELS.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.priority = body.priority;
    }

    // Validate and parse date fields
    const dateFields = [
      "received_date",
      "acknowledged_date",
      "resolution_deadline",
      "resolved_date",
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

    // Validate compensation amount
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

    // Boolean field
    if (body.fos_referred !== undefined) {
      updateData.fos_referred = Boolean(body.fos_referred);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const record = await updateComplaintRecord(id, updateData);

    if (!record) {
      return NextResponse.json(
        { error: "Complaint record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating Complaint record:", error);
    return NextResponse.json(
      { error: "Failed to update Complaint record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/complaints/[id] - Delete a Complaint record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deleted = await deleteComplaintRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Complaint record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Complaint record:", error);
    return NextResponse.json(
      { error: "Failed to delete Complaint record" },
      { status: 500 }
    );
  }
}
