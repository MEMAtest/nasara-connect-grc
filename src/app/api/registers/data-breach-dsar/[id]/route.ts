import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getDataBreachDsarRecord,
  updateDataBreachDsarRecord,
  deleteDataBreachDsarRecord,
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
  verifyRecordOwnership,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

const RECORD_TYPES = ["data_breach", "dsar"] as const;
const BREACH_CAUSES = ["human_error", "cyber_attack", "system_failure", "theft", "unauthorized_access", "other"] as const;
const DSAR_VERIFICATION_STATUSES = ["pending", "verified", "failed"] as const;
const STATUSES = ["open", "investigating", "remediation", "closed"] as const;

// GET /api/registers/data-breach-dsar/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    const record = await getDataBreachDsarRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching data breach/DSAR record");
    return serverErrorResponse("Failed to fetch data breach/DSAR record");
  }
}

// PATCH /api/registers/data-breach-dsar/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`data-breach-dsar-patch-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    // First, fetch the record to verify ownership
    const existingRecord = await getDataBreachDsarRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.record_type && !isValidEnum(body.record_type, RECORD_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid record type. Must be one of: ${RECORD_TYPES.join(", ")}`);
    }

    if (body.breach_cause && !isValidEnum(body.breach_cause, BREACH_CAUSES as unknown as string[])) {
      return badRequestResponse(`Invalid breach cause. Must be one of: ${BREACH_CAUSES.join(", ")}`);
    }

    if (body.dsar_verification_status && !isValidEnum(body.dsar_verification_status, DSAR_VERIFICATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid DSAR verification status. Must be one of: ${DSAR_VERIFICATION_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    // Record reference and type
    if (body.record_reference !== undefined) updateData.record_reference = sanitizeString(body.record_reference);
    if (body.record_type !== undefined) updateData.record_type = body.record_type;

    // Data Breach specific fields
    if (body.breach_date !== undefined) updateData.breach_date = parseValidDate(body.breach_date);
    if (body.breach_discovered_date !== undefined) updateData.breach_discovered_date = parseValidDate(body.breach_discovered_date);
    if (body.breach_cause !== undefined) updateData.breach_cause = body.breach_cause;
    if (body.breach_description !== undefined) updateData.breach_description = sanitizeText(body.breach_description);
    if (body.data_subjects_affected !== undefined) updateData.data_subjects_affected = parsePositiveNumber(body.data_subjects_affected);
    if (body.data_categories_affected !== undefined) updateData.data_categories_affected = body.data_categories_affected;
    if (body.containment_actions !== undefined) updateData.containment_actions = sanitizeText(body.containment_actions);
    if (body.ico_notified !== undefined) updateData.ico_notified = body.ico_notified;
    if (body.ico_notification_date !== undefined) updateData.ico_notification_date = parseValidDate(body.ico_notification_date);
    if (body.ico_reference !== undefined) updateData.ico_reference = sanitizeString(body.ico_reference);
    if (body.data_subjects_notified !== undefined) updateData.data_subjects_notified = body.data_subjects_notified;
    if (body.data_subjects_notification_date !== undefined) updateData.data_subjects_notification_date = parseValidDate(body.data_subjects_notification_date);

    // DSAR specific fields
    if (body.dsar_received_date !== undefined) updateData.dsar_received_date = parseValidDate(body.dsar_received_date);
    if (body.dsar_deadline !== undefined) updateData.dsar_deadline = parseValidDate(body.dsar_deadline);
    if (body.dsar_requester_name !== undefined) updateData.dsar_requester_name = sanitizeString(body.dsar_requester_name);
    if (body.dsar_requester_email !== undefined) updateData.dsar_requester_email = sanitizeString(body.dsar_requester_email);
    if (body.dsar_request_type !== undefined) updateData.dsar_request_type = sanitizeString(body.dsar_request_type);
    if (body.dsar_verification_status !== undefined) updateData.dsar_verification_status = body.dsar_verification_status;
    if (body.dsar_extension_applied !== undefined) updateData.dsar_extension_applied = body.dsar_extension_applied;
    if (body.dsar_extension_reason !== undefined) updateData.dsar_extension_reason = sanitizeText(body.dsar_extension_reason);
    if (body.dsar_response_date !== undefined) updateData.dsar_response_date = parseValidDate(body.dsar_response_date);

    // Common fields
    if (body.assigned_to !== undefined) updateData.assigned_to = sanitizeString(body.assigned_to);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.root_cause_analysis !== undefined) updateData.root_cause_analysis = sanitizeText(body.root_cause_analysis);
    if (body.remediation_actions !== undefined) updateData.remediation_actions = sanitizeText(body.remediation_actions);
    if (body.lessons_learned !== undefined) updateData.lessons_learned = sanitizeText(body.lessons_learned);
    if (body.closed_date !== undefined) updateData.closed_date = parseValidDate(body.closed_date);
    if (body.closed_by !== undefined) updateData.closed_by = sanitizeString(body.closed_by);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateDataBreachDsarRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating data breach/DSAR record");
    return serverErrorResponse("Failed to update data breach/DSAR record");
  }
}

// DELETE /api/registers/data-breach-dsar/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`data-breach-dsar-delete-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.error!;
    }

    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    // First, fetch the record to verify ownership
    const existingRecord = await getDataBreachDsarRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteDataBreachDsarRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting data breach/DSAR record");
    return serverErrorResponse("Failed to delete data breach/DSAR record");
  }
}
