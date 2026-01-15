import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getCOIRecord,
  updateCOIRecord,
  deleteCOIRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  CONFLICT_TYPES,
  COI_STATUSES,
  RISK_RATINGS,
  REVIEW_FREQUENCIES,
} from "@/lib/validation";

// GET /api/registers/conflicts/[id] - Get a single COI record
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

    const record = await getCOIRecord(id);

    if (!record) {
      return NextResponse.json({ error: "COI record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching COI record:", error);
    return NextResponse.json({ error: "Failed to fetch COI record" }, { status: 500 });
  }
}

// PATCH /api/registers/conflicts/[id] - Update a COI record
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

    // String fields
    if (body.declarant_name !== undefined) {
      const name = sanitizeString(body.declarant_name);
      if (!name) {
        return NextResponse.json({ error: "Declarant name cannot be empty" }, { status: 400 });
      }
      updateData.declarant_name = name;
    }

    if (body.description !== undefined) {
      const desc = sanitizeText(body.description);
      if (!desc) {
        return NextResponse.json({ error: "Description cannot be empty" }, { status: 400 });
      }
      updateData.description = desc;
    }

    if (body.declarant_role !== undefined) {
      updateData.declarant_role = sanitizeString(body.declarant_role) || null;
    }

    const textFields = ["parties_involved", "potential_impact", "mitigation_measures", "notes"];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeText(body[field]) || null;
      }
    }

    if (body.approved_by !== undefined) {
      updateData.approved_by = sanitizeString(body.approved_by) || null;
    }

    // Enum fields
    if (body.conflict_type !== undefined) {
      if (!isValidEnum(body.conflict_type, CONFLICT_TYPES)) {
        return NextResponse.json(
          { error: `Invalid conflict type. Must be one of: ${CONFLICT_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.conflict_type = body.conflict_type;
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
      if (!isValidEnum(body.status, COI_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${COI_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.review_frequency !== undefined) {
      if (!isValidEnum(body.review_frequency, REVIEW_FREQUENCIES)) {
        return NextResponse.json(
          { error: `Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.review_frequency = body.review_frequency;
    }

    // Date fields
    const dateFields = ["declaration_date", "last_review_date", "next_review_date", "approved_at"];
    for (const field of dateFields) {
      if (body[field] !== undefined) {
        if (body[field] === null || body[field] === "") {
          updateData[field] = null;
        } else {
          const parsedDate = parseValidDate(body[field]);
          if (!parsedDate) {
            return NextResponse.json({ error: `Invalid date format for ${field}` }, { status: 400 });
          }
          updateData[field] = parsedDate;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const record = await updateCOIRecord(id, updateData);

    if (!record) {
      return NextResponse.json({ error: "COI record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating COI record:", error);
    return NextResponse.json({ error: "Failed to update COI record" }, { status: 500 });
  }
}

// DELETE /api/registers/conflicts/[id] - Delete a COI record
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

    const deleted = await deleteCOIRecord(id);

    if (!deleted) {
      return NextResponse.json({ error: "COI record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting COI record:", error);
    return NextResponse.json({ error: "Failed to delete COI record" }, { status: 500 });
  }
}
