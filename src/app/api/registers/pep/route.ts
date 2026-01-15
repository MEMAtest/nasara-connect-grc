import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPEPRecords,
  createPEPRecord,
  PEPRecord,
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

// GET /api/registers/pep - List all PEP records
export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") || "default-org";
    const packId = searchParams.get("packId") || undefined;

    // Validate packId if provided
    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getPEPRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching PEP records:", error);
    return NextResponse.json(
      { error: "Failed to fetch PEP records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/pep - Create a new PEP record
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const fullName = sanitizeString(body.full_name);
    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
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
    const pepType = body.pep_type || "customer";
    if (!isValidEnum(pepType, PEP_TYPES)) {
      return NextResponse.json(
        { error: `Invalid PEP type. Must be one of: ${PEP_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const pepCategory = body.pep_category || "pep";
    if (!isValidEnum(pepCategory, PEP_CATEGORIES)) {
      return NextResponse.json(
        { error: `Invalid PEP category. Must be one of: ${PEP_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const riskRating = body.risk_rating || "high";
    if (!isValidEnum(riskRating, RISK_RATINGS)) {
      return NextResponse.json(
        { error: `Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "active";
    if (!isValidEnum(status, PEP_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${PEP_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const approvalStatus = body.approval_status || "pending";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Parse and validate dates
    const identificationDate = parseValidDate(body.identification_date) || new Date();
    const dateOfBirth = parseValidDate(body.date_of_birth);
    const lastReviewDate = parseValidDate(body.last_review_date);
    const nextReviewDate = parseValidDate(body.next_review_date);
    const eddCompletedDate = parseValidDate(body.edd_completed_date);
    const approvedAt = parseValidDate(body.approved_at);

    const recordData: Omit<PEPRecord, "id" | "created_at" | "updated_at"> = {
      organization_id: body.organization_id || "default-org",
      pack_id: body.pack_id,
      pep_type: pepType,
      full_name: fullName,
      date_of_birth: dateOfBirth || undefined,
      nationality: sanitizeString(body.nationality) || undefined,
      position_held: sanitizeString(body.position_held) || undefined,
      pep_category: pepCategory,
      relationship_type: sanitizeString(body.relationship_type) || undefined,
      risk_rating: riskRating,
      status: status,
      identification_date: identificationDate,
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      edd_completed: Boolean(body.edd_completed),
      edd_completed_date: eddCompletedDate || undefined,
      source_of_wealth: sanitizeText(body.source_of_wealth) || undefined,
      source_of_funds: sanitizeText(body.source_of_funds) || undefined,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createPEPRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating PEP record:", error);
    return NextResponse.json(
      { error: "Failed to create PEP record" },
      { status: 500 }
    );
  }
}
