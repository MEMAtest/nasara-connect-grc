import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getCOIRecords,
  createCOIRecord,
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

// GET /api/registers/conflicts - List all COI records
export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") || "default-org";
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getCOIRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching COI records:", error);
    return NextResponse.json(
      { error: "Failed to fetch COI records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/conflicts - Create a new COI record
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const declarantName = sanitizeString(body.declarant_name);
    if (!declarantName) {
      return NextResponse.json(
        { error: "Declarant name is required" },
        { status: 400 }
      );
    }

    const description = sanitizeText(body.description);
    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    // Validate enum fields
    const conflictType = body.conflict_type || "other";
    if (!isValidEnum(conflictType, CONFLICT_TYPES)) {
      return NextResponse.json(
        { error: `Invalid conflict type. Must be one of: ${CONFLICT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const riskRating = body.risk_rating || "medium";
    if (!isValidEnum(riskRating, RISK_RATINGS)) {
      return NextResponse.json(
        { error: `Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "active";
    if (!isValidEnum(status, COI_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${COI_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const reviewFrequency = body.review_frequency || "annual";
    if (!isValidEnum(reviewFrequency, REVIEW_FREQUENCIES)) {
      return NextResponse.json(
        { error: `Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Parse dates
    const declarationDate = parseValidDate(body.declaration_date) || new Date();
    const lastReviewDate = parseValidDate(body.last_review_date);
    const nextReviewDate = parseValidDate(body.next_review_date);
    const approvedAt = parseValidDate(body.approved_at);

    const recordData = {
      organization_id: body.organization_id || "default-org",
      pack_id: body.pack_id,
      declarant_name: declarantName,
      declarant_role: sanitizeString(body.declarant_role) || undefined,
      declaration_date: declarationDate,
      conflict_type: conflictType as typeof CONFLICT_TYPES[number],
      description: description,
      parties_involved: sanitizeText(body.parties_involved) || undefined,
      potential_impact: sanitizeText(body.potential_impact) || undefined,
      mitigation_measures: sanitizeText(body.mitigation_measures) || undefined,
      review_frequency: reviewFrequency as typeof REVIEW_FREQUENCIES[number],
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      risk_rating: riskRating as typeof RISK_RATINGS[number],
      status: status as typeof COI_STATUSES[number],
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createCOIRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating COI record:", error);
    return NextResponse.json(
      { error: "Failed to create COI record" },
      { status: 500 }
    );
  }
}
