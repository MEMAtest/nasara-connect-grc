import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPEPRecord,
  updatePEPRecord,
  deletePEPRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  PEP_TYPES,
  PEP_CATEGORIES,
  RISK_RATINGS,
  PEP_STATUSES,
  APPROVAL_STATUSES,
} from "@/lib/validation";

// GET /api/registers/pep/[id] - Get a single PEP record
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

    const record = await getPEPRecord(id);

    if (!record) {
      return NextResponse.json({ error: "PEP record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching PEP record:", error);
    return NextResponse.json(
      { error: "Failed to fetch PEP record" },
      { status: 500 }
    );
  }
}

// PATCH /api/registers/pep/[id] - Update a PEP record
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
    if (body.full_name !== undefined) {
      const fullName = sanitizeString(body.full_name);
      if (!fullName) {
        return NextResponse.json(
          { error: "Full name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.full_name = fullName;
    }

    if (body.nationality !== undefined) {
      updateData.nationality = sanitizeString(body.nationality) || null;
    }

    if (body.position_held !== undefined) {
      updateData.position_held = sanitizeString(body.position_held) || null;
    }

    if (body.relationship_type !== undefined) {
      updateData.relationship_type = sanitizeString(body.relationship_type) || null;
    }

    if (body.source_of_wealth !== undefined) {
      updateData.source_of_wealth = sanitizeText(body.source_of_wealth) || null;
    }

    if (body.source_of_funds !== undefined) {
      updateData.source_of_funds = sanitizeText(body.source_of_funds) || null;
    }

    if (body.approved_by !== undefined) {
      updateData.approved_by = sanitizeString(body.approved_by) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    // Validate enum fields
    if (body.pep_type !== undefined) {
      if (!isValidEnum(body.pep_type, PEP_TYPES)) {
        return NextResponse.json(
          { error: `Invalid PEP type. Must be one of: ${PEP_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.pep_type = body.pep_type;
    }

    if (body.pep_category !== undefined) {
      if (!isValidEnum(body.pep_category, PEP_CATEGORIES)) {
        return NextResponse.json(
          { error: `Invalid PEP category. Must be one of: ${PEP_CATEGORIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.pep_category = body.pep_category;
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
      if (!isValidEnum(body.status, PEP_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${PEP_STATUSES.join(", ")}` },
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

    // Validate and parse date fields
    const dateFields = [
      "date_of_birth",
      "identification_date",
      "last_review_date",
      "next_review_date",
      "edd_completed_date",
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

    // Boolean field
    if (body.edd_completed !== undefined) {
      updateData.edd_completed = Boolean(body.edd_completed);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const record = await updatePEPRecord(id, updateData);

    if (!record) {
      return NextResponse.json({ error: "PEP record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating PEP record:", error);
    return NextResponse.json(
      { error: "Failed to update PEP record" },
      { status: 500 }
    );
  }
}

// DELETE /api/registers/pep/[id] - Delete a PEP record
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

    const deleted = await deletePEPRecord(id);

    if (!deleted) {
      return NextResponse.json({ error: "PEP record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting PEP record:", error);
    return NextResponse.json(
      { error: "Failed to delete PEP record" },
      { status: 500 }
    );
  }
}
