import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getGiftHospitalityRecords,
  createGiftHospitalityRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  GIFT_ENTRY_TYPES,
  APPROVAL_STATUSES,
} from "@/lib/validation";

// Extended approval statuses for gifts
const GIFT_APPROVAL_STATUSES = ["not_required", "pending", "approved", "rejected"] as const;

// GET /api/registers/gifts-hospitality - List all Gift/Hospitality records
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

    const records = await getGiftHospitalityRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching Gift/Hospitality records:", error);
    return NextResponse.json(
      { error: "Failed to fetch Gift/Hospitality records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/gifts-hospitality - Create a new Gift/Hospitality record
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();

    // Validate required fields
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

    // Validate entry type
    const entryType = body.entry_type || "gift_received";
    if (!isValidEnum(entryType, GIFT_ENTRY_TYPES)) {
      return NextResponse.json(
        { error: `Invalid entry type. Must be one of: ${GIFT_ENTRY_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Parse date
    const dateOfEvent = parseValidDate(body.date_of_event) || new Date();
    const approvedAt = parseValidDate(body.approved_at);

    // Parse estimated value
    let estimatedValue: number | undefined;
    if (body.estimated_value_gbp !== undefined && body.estimated_value_gbp !== null && body.estimated_value_gbp !== "") {
      const parsedValue = parsePositiveNumber(body.estimated_value_gbp);
      if (parsedValue === null) {
        return NextResponse.json(
          { error: "Invalid estimated value. Must be a positive number" },
          { status: 400 }
        );
      }
      estimatedValue = parsedValue;
    }

    // Determine if approval is required (threshold: GBP 50)
    const approvalRequired = estimatedValue !== undefined && estimatedValue >= 50;
    const approvalStatus = body.approval_status || (approvalRequired ? "pending" : "not_required");

    if (!GIFT_APPROVAL_STATUSES.includes(approvalStatus)) {
      return NextResponse.json(
        { error: `Invalid approval status. Must be one of: ${GIFT_APPROVAL_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: body.organization_id || "default-org",
      pack_id: body.pack_id,
      entry_type: entryType as typeof GIFT_ENTRY_TYPES[number],
      date_of_event: dateOfEvent,
      recipient_name: sanitizeString(body.recipient_name) || undefined,
      recipient_organization: sanitizeString(body.recipient_organization) || undefined,
      provider_name: sanitizeString(body.provider_name) || undefined,
      provider_organization: sanitizeString(body.provider_organization) || undefined,
      description: description,
      estimated_value_gbp: estimatedValue,
      business_justification: sanitizeText(body.business_justification) || undefined,
      approval_required: approvalRequired,
      approval_status: approvalStatus as "not_required" | "pending" | "approved" | "rejected",
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      declined: Boolean(body.declined),
      declined_reason: sanitizeText(body.declined_reason) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createGiftHospitalityRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating Gift/Hospitality record:", error);
    return NextResponse.json(
      { error: "Failed to create Gift/Hospitality record" },
      { status: 500 }
    );
  }
}
