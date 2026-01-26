import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getDataBreachDsarRecords,
  createDataBreachDsarRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
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

const RECORD_TYPES = ["data_breach", "dsar"] as const;
const BREACH_CAUSES = ["human_error", "cyber_attack", "system_failure", "theft", "unauthorized_access", "other"] as const;
const DSAR_VERIFICATION_STATUSES = ["pending", "verified", "failed"] as const;
const STATUSES = ["open", "investigating", "remediation", "closed"] as const;

// GET /api/registers/data-breach-dsar - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`data-breach-dsar-get-${clientIp}`);
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
    const organizationId = authResult.user.organizationId;
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getDataBreachDsarRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching data breach/DSAR records");
    return NextResponse.json(
      { error: "Failed to fetch data breach/DSAR records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/data-breach-dsar - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`data-breach-dsar-post-${clientIp}`);
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
    const recordReference = sanitizeString(body.record_reference);
    if (!recordReference) {
      return NextResponse.json(
        { error: "Record reference is required" },
        { status: 400 }
      );
    }

    const recordType = body.record_type;
    if (!recordType) {
      return NextResponse.json(
        { error: "Record type is required" },
        { status: 400 }
      );
    }
    if (!isValidEnum(recordType, RECORD_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid record type. Must be one of: ${RECORD_TYPES.join(", ")}` },
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

    // Validate enum fields if provided
    if (body.breach_cause && !isValidEnum(body.breach_cause, BREACH_CAUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid breach cause. Must be one of: ${BREACH_CAUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.dsar_verification_status && !isValidEnum(body.dsar_verification_status, DSAR_VERIFICATION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid DSAR verification status. Must be one of: ${DSAR_VERIFICATION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "open";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      record_reference: recordReference,
      record_type: recordType,
      // Data Breach specific fields
      breach_date: parseValidDate(body.breach_date) || undefined,
      breach_discovered_date: parseValidDate(body.breach_discovered_date) || undefined,
      breach_cause: body.breach_cause || undefined,
      breach_description: sanitizeText(body.breach_description) || undefined,
      data_subjects_affected: parsePositiveNumber(body.data_subjects_affected) || undefined,
      data_categories_affected: body.data_categories_affected || undefined,
      containment_actions: sanitizeText(body.containment_actions) || undefined,
      ico_notified: body.ico_notified || false,
      ico_notification_date: parseValidDate(body.ico_notification_date) || undefined,
      ico_reference: sanitizeString(body.ico_reference) || undefined,
      data_subjects_notified: body.data_subjects_notified || false,
      data_subjects_notification_date: parseValidDate(body.data_subjects_notification_date) || undefined,
      // DSAR specific fields
      dsar_received_date: parseValidDate(body.dsar_received_date) || undefined,
      dsar_deadline: parseValidDate(body.dsar_deadline) || undefined,
      dsar_requester_name: sanitizeString(body.dsar_requester_name) || undefined,
      dsar_requester_email: sanitizeString(body.dsar_requester_email) || undefined,
      dsar_request_type: sanitizeString(body.dsar_request_type) || undefined,
      dsar_verification_status: body.dsar_verification_status || undefined,
      dsar_extension_applied: body.dsar_extension_applied || false,
      dsar_extension_reason: sanitizeText(body.dsar_extension_reason) || undefined,
      dsar_response_date: parseValidDate(body.dsar_response_date) || undefined,
      // Common fields
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      status: status,
      root_cause_analysis: sanitizeText(body.root_cause_analysis) || undefined,
      remediation_actions: sanitizeText(body.remediation_actions) || undefined,
      lessons_learned: sanitizeText(body.lessons_learned) || undefined,
      closed_date: parseValidDate(body.closed_date) || undefined,
      closed_by: sanitizeString(body.closed_by) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createDataBreachDsarRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "data-breach-dsar",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating data breach/DSAR record");
    return NextResponse.json(
      { error: "Failed to create data breach/DSAR record" },
      { status: 500 }
    );
  }
}
