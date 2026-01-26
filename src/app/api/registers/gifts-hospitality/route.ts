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
} from "@/lib/validation";
import {
  authenticateRequest,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { notifyRegisterCreated } from "@/lib/server/notification-builders";
import { logError } from "@/lib/logger";

// Extended approval statuses for gifts
const GIFT_APPROVAL_STATUSES = ["not_required", "pending", "approved", "rejected"] as const;

// GET /api/registers/gifts-hospitality - List all Gift/Hospitality records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`gifts-hospitality-get-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const { searchParams } = new URL(request.url);
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const records = await getGiftHospitalityRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching Gift/Hospitality records");
    return serverErrorResponse("Failed to fetch Gift/Hospitality records");
  }
}

// POST /api/registers/gifts-hospitality - Create a new Gift/Hospitality record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`gifts-hospitality-post-${clientIp}`, {
      windowMs: 60000,
      maxRequests: 30,
    });
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const description = sanitizeText(body.description);
    if (!description) {
      return badRequestResponse("Description is required");
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    // Validate entry type
    const entryType = body.entry_type || "gift_received";
    if (!isValidEnum(entryType, GIFT_ENTRY_TYPES)) {
      return badRequestResponse(`Invalid entry type. Must be one of: ${GIFT_ENTRY_TYPES.join(", ")}`);
    }

    // Parse date
    const dateOfEvent = parseValidDate(body.date_of_event) || new Date();
    const approvedAt = parseValidDate(body.approved_at);

    // Parse estimated value
    let estimatedValue: number | undefined;
    if (body.estimated_value_gbp !== undefined && body.estimated_value_gbp !== null && body.estimated_value_gbp !== "") {
      const parsedValue = parsePositiveNumber(body.estimated_value_gbp);
      if (parsedValue === null) {
        return badRequestResponse("Invalid estimated value. Must be a positive number");
      }
      estimatedValue = parsedValue;
    }

    // Determine if approval is required (threshold: GBP 50)
    const approvalRequired = estimatedValue !== undefined && estimatedValue >= 50;
    const approvalStatus = body.approval_status || (approvalRequired ? "pending" : "not_required");

    if (!GIFT_APPROVAL_STATUSES.includes(approvalStatus)) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${GIFT_APPROVAL_STATUSES.join(", ")}`);
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
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
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "gifts-hospitality",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating Gift/Hospitality record");
    return serverErrorResponse("Failed to create Gift/Hospitality record");
  }
}
