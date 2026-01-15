import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getThirdPartyRecords,
  createThirdPartyRecord,
  ThirdPartyRecord,
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

// GET /api/registers/third-party - List all Third-Party records
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

    const records = await getThirdPartyRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching Third-Party records:", error);
    return NextResponse.json(
      { error: "Failed to fetch Third-Party records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/third-party - Create a new Third-Party record
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const vendorName = sanitizeString(body.vendor_name);
    if (!vendorName) {
      return NextResponse.json(
        { error: "Vendor name is required" },
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

    // Validate vendor_type
    const vendorType = body.vendor_type || "other";
    if (!isValidEnum(vendorType, VENDOR_TYPES)) {
      return NextResponse.json(
        { error: `Invalid vendor type. Must be one of: ${VENDOR_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate criticality
    const criticality = body.criticality || "medium";
    if (!isValidEnum(criticality, CRITICALITY_LEVELS)) {
      return NextResponse.json(
        { error: `Invalid criticality. Must be one of: ${CRITICALITY_LEVELS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate risk_rating
    const riskRating = body.risk_rating || "medium";
    if (!isValidEnum(riskRating, RISK_RATINGS)) {
      return NextResponse.json(
        { error: `Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate status
    const status = body.status || "active";
    if (!isValidEnum(status, THIRD_PARTY_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${THIRD_PARTY_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate approval_status
    const approvalStatus = body.approval_status || "pending";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email if provided
    const contactEmail = sanitizeString(body.primary_contact_email);
    if (contactEmail && !isValidEmail(contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email format for primary contact" },
        { status: 400 }
      );
    }

    // Validate contract value
    let contractValue: number | undefined;
    if (body.contract_value_gbp !== undefined && body.contract_value_gbp !== null && body.contract_value_gbp !== "") {
      const parsedValue = parsePositiveNumber(body.contract_value_gbp);
      if (parsedValue === null) {
        return NextResponse.json(
          { error: "Invalid contract value. Must be a positive number" },
          { status: 400 }
        );
      }
      contractValue = parsedValue;
    }

    // Parse and validate dates
    const contractStartDate = parseValidDate(body.contract_start_date);
    const contractEndDate = parseValidDate(body.contract_end_date);
    const dueDiligenceDate = parseValidDate(body.due_diligence_date);
    const lastReviewDate = parseValidDate(body.last_review_date);
    const nextReviewDate = parseValidDate(body.next_review_date);
    const approvedAt = parseValidDate(body.approved_at);

    const recordData: Omit<ThirdPartyRecord, "id" | "created_at" | "updated_at"> = {
      organization_id: body.organization_id || "default-org",
      pack_id: body.pack_id,
      vendor_name: vendorName,
      vendor_type: vendorType,
      service_description: sanitizeText(body.service_description) || undefined,
      criticality: criticality,
      is_outsourcing: Boolean(body.is_outsourcing),
      is_material_outsourcing: Boolean(body.is_material_outsourcing),
      regulatory_notification_required: Boolean(body.regulatory_notification_required),
      contract_start_date: contractStartDate || undefined,
      contract_end_date: contractEndDate || undefined,
      contract_value_gbp: contractValue,
      risk_rating: riskRating,
      status: status,
      primary_contact_name: sanitizeString(body.primary_contact_name) || undefined,
      primary_contact_email: contactEmail || undefined,
      primary_contact_phone: sanitizeString(body.primary_contact_phone) || undefined,
      due_diligence_completed: Boolean(body.due_diligence_completed),
      due_diligence_date: dueDiligenceDate || undefined,
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      exit_strategy_documented: Boolean(body.exit_strategy_documented),
      data_processing_agreement: Boolean(body.data_processing_agreement),
      sub_outsourcing_permitted: Boolean(body.sub_outsourcing_permitted),
      geographic_location: sanitizeString(body.geographic_location) || undefined,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createThirdPartyRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating Third-Party record:", error);
    return NextResponse.json(
      { error: "Failed to create Third-Party record" },
      { status: 500 }
    );
  }
}
