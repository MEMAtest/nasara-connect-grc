import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getGiftHospitalityRecord,
  updateGiftHospitalityRecord,
  deleteGiftHospitalityRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  GIFT_ENTRY_TYPES,
} from "@/lib/validation";

const GIFT_APPROVAL_STATUSES = ["not_required", "pending", "approved", "rejected"] as const;

// GET /api/registers/gifts-hospitality/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const record = await getGiftHospitalityRecord(id);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching Gift/Hospitality record:", error);
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 });
  }
}

// PATCH /api/registers/gifts-hospitality/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Description (required if provided)
    if (body.description !== undefined) {
      const desc = sanitizeText(body.description);
      if (!desc) {
        return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
      }
      updateData.description = desc;
    }

    // String fields
    const stringFields = ["recipient_name", "recipient_organization", "provider_name", "provider_organization", "approved_by"];
    for (const field of stringFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeString(body[field]) || null;
      }
    }

    const textFields = ["business_justification", "declined_reason", "notes"];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeText(body[field]) || null;
      }
    }

    // Entry type
    if (body.entry_type !== undefined) {
      if (!isValidEnum(body.entry_type, GIFT_ENTRY_TYPES)) {
        return NextResponse.json(
          { error: `Invalid entry type. Must be one of: ${GIFT_ENTRY_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.entry_type = body.entry_type;
    }

    // Approval status
    if (body.approval_status !== undefined) {
      if (!GIFT_APPROVAL_STATUSES.includes(body.approval_status)) {
        return NextResponse.json(
          { error: `Invalid approval status. Must be one of: ${GIFT_APPROVAL_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.approval_status = body.approval_status;
    }

    // Date fields
    if (body.date_of_event !== undefined) {
      if (body.date_of_event === null || body.date_of_event === "") {
        updateData.date_of_event = null;
      } else {
        const parsedDate = parseValidDate(body.date_of_event);
        if (!parsedDate) {
          return NextResponse.json({ error: "Invalid date format for date_of_event" }, { status: 400 });
        }
        updateData.date_of_event = parsedDate;
      }
    }

    if (body.approved_at !== undefined) {
      if (body.approved_at === null || body.approved_at === "") {
        updateData.approved_at = null;
      } else {
        const parsedDate = parseValidDate(body.approved_at);
        if (!parsedDate) {
          return NextResponse.json({ error: "Invalid date format for approved_at" }, { status: 400 });
        }
        updateData.approved_at = parsedDate;
      }
    }

    // Numeric fields
    if (body.estimated_value_gbp !== undefined) {
      if (body.estimated_value_gbp === null || body.estimated_value_gbp === "") {
        updateData.estimated_value_gbp = null;
        updateData.approval_required = false;
      } else {
        const parsed = parsePositiveNumber(body.estimated_value_gbp);
        if (parsed === null) {
          return NextResponse.json({ error: "Invalid estimated value" }, { status: 400 });
        }
        updateData.estimated_value_gbp = parsed;
        updateData.approval_required = parsed >= 50;
      }
    }

    // Boolean fields
    if (body.approval_required !== undefined) {
      updateData.approval_required = Boolean(body.approval_required);
    }

    if (body.declined !== undefined) {
      updateData.declined = Boolean(body.declined);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const record = await updateGiftHospitalityRecord(id, updateData);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating Gift/Hospitality record:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// DELETE /api/registers/gifts-hospitality/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deleted = await deleteGiftHospitalityRecord(id);

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Gift/Hospitality record:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
