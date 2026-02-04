import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegulatoryReturnsRecord,
  updateRegulatoryReturnsRecord,
  deleteRegulatoryReturnsRecord,
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
import { requireRole } from "@/lib/rbac";
import { logError } from "@/lib/logger";

const REGULATORS = ["fca", "pra", "ico", "hmrc", "companies_house", "other"] as const;
const FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual", "ad_hoc"] as const;
const PREPARATION_STATUSES = ["not_started", "in_progress", "ready_for_review", "completed"] as const;
const REVIEW_STATUSES = ["pending", "in_review", "approved", "rejected"] as const;
const SUBMISSION_STATUSES = ["pending", "submitted", "accepted", "rejected"] as const;
const STATUSES = ["upcoming", "in_progress", "completed", "overdue"] as const;

// GET /api/registers/regulatory-returns/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-returns-get-${clientIp}`);
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

    const record = await getRegulatoryReturnsRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching regulatory returns record");
    return serverErrorResponse("Failed to fetch regulatory returns record");
  }
}

// PATCH /api/registers/regulatory-returns/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-returns-patch-${clientIp}`);
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
    const existingRecord = await getRegulatoryReturnsRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.regulator && !isValidEnum(body.regulator, REGULATORS as unknown as string[])) {
      return badRequestResponse(`Invalid regulator. Must be one of: ${REGULATORS.join(", ")}`);
    }

    if (body.frequency && !isValidEnum(body.frequency, FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid frequency. Must be one of: ${FREQUENCIES.join(", ")}`);
    }

    if (body.preparation_status && !isValidEnum(body.preparation_status, PREPARATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid preparation status. Must be one of: ${PREPARATION_STATUSES.join(", ")}`);
    }

    if (body.review_status && !isValidEnum(body.review_status, REVIEW_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid review status. Must be one of: ${REVIEW_STATUSES.join(", ")}`);
    }

    if (body.submission_status && !isValidEnum(body.submission_status, SUBMISSION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid submission status. Must be one of: ${SUBMISSION_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.return_reference !== undefined) updateData.return_reference = sanitizeString(body.return_reference);
    if (body.return_name !== undefined) updateData.return_name = sanitizeString(body.return_name);
    if (body.regulator !== undefined) updateData.regulator = body.regulator;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.reporting_period_start !== undefined) updateData.reporting_period_start = parseValidDate(body.reporting_period_start);
    if (body.reporting_period_end !== undefined) updateData.reporting_period_end = parseValidDate(body.reporting_period_end);
    if (body.due_date !== undefined) updateData.due_date = parseValidDate(body.due_date);
    if (body.submission_deadline !== undefined) updateData.submission_deadline = parseValidDate(body.submission_deadline);
    if (body.assigned_to !== undefined) updateData.assigned_to = sanitizeString(body.assigned_to);
    if (body.reviewer !== undefined) updateData.reviewer = sanitizeString(body.reviewer);
    if (body.approver !== undefined) updateData.approver = sanitizeString(body.approver);
    if (body.preparation_status !== undefined) updateData.preparation_status = body.preparation_status;
    if (body.review_status !== undefined) updateData.review_status = body.review_status;
    if (body.submission_status !== undefined) updateData.submission_status = body.submission_status;
    if (body.data_sources !== undefined) updateData.data_sources = body.data_sources;
    if (body.submission_method !== undefined) updateData.submission_method = sanitizeString(body.submission_method);
    if (body.submission_reference !== undefined) updateData.submission_reference = sanitizeString(body.submission_reference);
    if (body.submitted_date !== undefined) updateData.submitted_date = parseValidDate(body.submitted_date);
    if (body.submitted_by !== undefined) updateData.submitted_by = sanitizeString(body.submitted_by);
    if (body.acknowledgement_received !== undefined) updateData.acknowledgement_received = body.acknowledgement_received;
    if (body.acknowledgement_reference !== undefined) updateData.acknowledgement_reference = sanitizeString(body.acknowledgement_reference);
    if (body.issues_identified !== undefined) updateData.issues_identified = body.issues_identified;
    if (body.issues_details !== undefined) updateData.issues_details = sanitizeText(body.issues_details);
    if (body.remediation_required !== undefined) updateData.remediation_required = body.remediation_required;
    if (body.remediation_details !== undefined) updateData.remediation_details = sanitizeText(body.remediation_details);
    if (body.remediation_deadline !== undefined) updateData.remediation_deadline = parseValidDate(body.remediation_deadline);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateRegulatoryReturnsRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating regulatory returns record");
    return serverErrorResponse("Failed to update regulatory returns record");
  }
}

// DELETE /api/registers/regulatory-returns/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-returns-delete-${clientIp}`);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetIn);
    }

    // Authentication & Authorization (admin only)
    const { auth, error: authError } = await requireRole("admin");
    if (authError) return authError;

    await initDatabase();

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    // First, fetch the record to verify ownership
    const existingRecord = await getRegulatoryReturnsRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteRegulatoryReturnsRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting regulatory returns record");
    return serverErrorResponse("Failed to delete regulatory returns record");
  }
}
