import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getTcRecordRecord,
  updateTcRecordRecord,
  deleteTcRecordRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
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

const QUALIFICATION_STATUSES = ["in_progress", "passed", "failed", "exempt"] as const;
const COMPETENCY_STATUSES = ["not_assessed", "competent", "not_yet_competent", "lapsed"] as const;
const SUPERVISION_LEVELS = ["standard", "enhanced", "close"] as const;
const FIT_PROPER_STATUSES = ["pending", "confirmed", "concerns"] as const;
const STATUSES = ["active", "inactive", "left"] as const;

// GET /api/registers/tc-record/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tc-record-get-${clientIp}`);
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

    const record = await getTcRecordRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching T&C record");
    return serverErrorResponse("Failed to fetch T&C record");
  }
}

// PATCH /api/registers/tc-record/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tc-record-patch-${clientIp}`);
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
    const existingRecord = await getTcRecordRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.qualification_status && !isValidEnum(body.qualification_status, QUALIFICATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid qualification status. Must be one of: ${QUALIFICATION_STATUSES.join(", ")}`);
    }

    if (body.competency_status && !isValidEnum(body.competency_status, COMPETENCY_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid competency status. Must be one of: ${COMPETENCY_STATUSES.join(", ")}`);
    }

    if (body.supervision_level && !isValidEnum(body.supervision_level, SUPERVISION_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid supervision level. Must be one of: ${SUPERVISION_LEVELS.join(", ")}`);
    }

    if (body.fit_proper_status && !isValidEnum(body.fit_proper_status, FIT_PROPER_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid fit & proper status. Must be one of: ${FIT_PROPER_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.employee_reference !== undefined) updateData.employee_reference = sanitizeString(body.employee_reference);
    if (body.employee_name !== undefined) updateData.employee_name = sanitizeString(body.employee_name);
    if (body.job_title !== undefined) updateData.job_title = sanitizeString(body.job_title);
    if (body.department !== undefined) updateData.department = sanitizeString(body.department);
    if (body.start_date !== undefined) updateData.start_date = parseValidDate(body.start_date);
    if (body.end_date !== undefined) updateData.end_date = parseValidDate(body.end_date);
    if (body.tc_regime !== undefined) updateData.tc_regime = sanitizeString(body.tc_regime);
    if (body.qualification_required !== undefined) updateData.qualification_required = sanitizeString(body.qualification_required);
    if (body.qualification_status !== undefined) updateData.qualification_status = body.qualification_status;
    if (body.qualification_date !== undefined) updateData.qualification_date = parseValidDate(body.qualification_date);
    if (body.qualification_expiry !== undefined) updateData.qualification_expiry = parseValidDate(body.qualification_expiry);
    if (body.cpd_hours_required !== undefined) updateData.cpd_hours_required = parseFloat(body.cpd_hours_required);
    if (body.cpd_hours_completed !== undefined) updateData.cpd_hours_completed = parseFloat(body.cpd_hours_completed);
    if (body.cpd_year !== undefined) updateData.cpd_year = sanitizeString(body.cpd_year);
    if (body.competency_status !== undefined) updateData.competency_status = body.competency_status;
    if (body.competency_assessed_date !== undefined) updateData.competency_assessed_date = parseValidDate(body.competency_assessed_date);
    if (body.competency_assessed_by !== undefined) updateData.competency_assessed_by = sanitizeString(body.competency_assessed_by);
    if (body.supervision_level !== undefined) updateData.supervision_level = body.supervision_level;
    if (body.supervisor_name !== undefined) updateData.supervisor_name = sanitizeString(body.supervisor_name);
    if (body.fit_proper_status !== undefined) updateData.fit_proper_status = body.fit_proper_status;
    if (body.fit_proper_date !== undefined) updateData.fit_proper_date = parseValidDate(body.fit_proper_date);
    if (body.fit_proper_notes !== undefined) updateData.fit_proper_notes = sanitizeText(body.fit_proper_notes);
    if (body.smcr_function !== undefined) updateData.smcr_function = sanitizeString(body.smcr_function);
    if (body.certification_function !== undefined) updateData.certification_function = sanitizeString(body.certification_function);
    if (body.conduct_rules_training_date !== undefined) updateData.conduct_rules_training_date = parseValidDate(body.conduct_rules_training_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateTcRecordRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating T&C record");
    return serverErrorResponse("Failed to update T&C record");
  }
}

// DELETE /api/registers/tc-record/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tc-record-delete-${clientIp}`);
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
    const existingRecord = await getTcRecordRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteTcRecordRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting T&C record");
    return serverErrorResponse("Failed to delete T&C record");
  }
}
