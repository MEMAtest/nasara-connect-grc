import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getThirdPartyRecord,
  updateThirdPartyRecord,
  deleteThirdPartyRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  isValidEmail,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  VENDOR_TYPES,
  CRITICALITY_LEVELS,
  RISK_RATINGS,
  THIRD_PARTY_STATUSES,
  APPROVAL_STATUSES,
} from "@/lib/validation";

// GET /api/registers/third-party/[id] - Get a single Third-Party record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const record = await getThirdPartyRecord(id);

    if (!record) {
      return NextResponse.json(
        { error: "Third-Party record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching Third-Party record:", error);
    return NextResponse.json(
      { error: "Failed to fetch Third-Party record" },
      { status: 500 }
    );
  }
}

// PATCH /api/registers/third-party/[id] - Update a Third-Party record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and sanitize string fields
    if (body.vendor_name !== undefined) {
      const vendorName = sanitizeString(body.vendor_name);
      if (!vendorName) {
        return NextResponse.json(
          { error: "Vendor name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.vendor_name = vendorName;
    }

    if (body.service_description !== undefined) {
      updateData.service_description = sanitizeText(body.service_description) || null;
    }

    if (body.primary_contact_name !== undefined) {
      updateData.primary_contact_name = sanitizeString(body.primary_contact_name) || null;
    }

    if (body.primary_contact_email !== undefined) {
      const email = sanitizeString(body.primary_contact_email);
      if (email && !isValidEmail(email)) {
        return NextResponse.json(
          { error: "Invalid email format for primary contact" },
          { status: 400 }
        );
      }
      updateData.primary_contact_email = email || null;
    }

    if (body.primary_contact_phone !== undefined) {
      updateData.primary_contact_phone = sanitizeString(body.primary_contact_phone) || null;
    }

    if (body.geographic_location !== undefined) {
      updateData.geographic_location = sanitizeString(body.geographic_location) || null;
    }

    if (body.approved_by !== undefined) {
      updateData.approved_by = sanitizeString(body.approved_by) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    // Validate enum fields
    if (body.vendor_type !== undefined) {
      if (!isValidEnum(body.vendor_type, VENDOR_TYPES)) {
        return NextResponse.json(
          { error: `Invalid vendor type. Must be one of: ${VENDOR_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.vendor_type = body.vendor_type;
    }

    if (body.criticality !== undefined) {
      if (!isValidEnum(body.criticality, CRITICALITY_LEVELS)) {
        return NextResponse.json(
          { error: `Invalid criticality. Must be one of: ${CRITICALITY_LEVELS.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.criticality = body.criticality;
    }

    if (body.risk_rating !== undefined) {
      if (!isValidEnum(body.risk_rating, RISK_RATINGS)) {
        return NextResponse.json(
          { error: `Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.risk_rating = body.risk_rating;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, THIRD_PARTY_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${THIRD_PARTY_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.approval_status !== undefined) {
      if (!isValidEnum(body.approval_status, APPROVAL_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.approval_status = body.approval_status;
    }

    // Validate and parse contract value
    if (body.contract_value_gbp !== undefined) {
      if (body.contract_value_gbp === null || body.contract_value_gbp === "") {
        updateData.contract_value_gbp = null;
      } else {
        const parsedValue = parsePositiveNumber(body.contract_value_gbp);
        if (parsedValue === null) {
          return NextResponse.json(
            { error: "Invalid contract value. Must be a positive number" },
            { status: 400 }
          );
        }
        updateData.contract_value_gbp = parsedValue;
      }
    }

    // Validate and parse date fields
    const dateFields = [
      "contract_start_date",
      "contract_end_date",
      "due_diligence_date",
      "last_review_date",
      "next_review_date",
      "approved_at",
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
      "is_outsourcing",
      "is_material_outsourcing",
      "regulatory_notification_required",
      "due_diligence_completed",
      "exit_strategy_documented",
      "data_processing_agreement",
      "sub_outsourcing_permitted",
    ];

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        updateData[field] = Boolean(body[field]);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const record = await updateThirdPartyRecord(id, updateData);

    if (!record) {
      return NextResponse.json(
        { error: "Third-Party record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating Third-Party record:", error);
    return NextResponse.json(
      { error: "Failed to update Third-Party record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/third-party/[id] - Delete a Third-Party record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const deleted = await deleteThirdPartyRecord(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Third-Party record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Third-Party record:", error);
    return NextResponse.json(
      { error: "Failed to delete Third-Party record" },
      { status: 500 }
    );
  }
}
