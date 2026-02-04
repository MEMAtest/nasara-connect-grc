import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getSmcrCertificationRecord,
  updateSmcrCertificationRecord,
  deleteSmcrCertificationRecord,
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

const ASSESSMENT_OUTCOMES = ["fit", "not_fit", "conditional", "pending"] as const;
const CERTIFICATION_STATUSES = ["pending", "certified", "not_certified", "expired"] as const;
const STATUSES = ["active", "inactive", "left"] as const;

// GET /api/registers/smcr-certification/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`smcr-certification-get-${clientIp}`);
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

    const record = await getSmcrCertificationRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching SMCR certification record");
    return serverErrorResponse("Failed to fetch SMCR certification record");
  }
}

// PATCH /api/registers/smcr-certification/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`smcr-certification-patch-${clientIp}`);
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
    const existingRecord = await getSmcrCertificationRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.assessment_outcome && !isValidEnum(body.assessment_outcome, ASSESSMENT_OUTCOMES as unknown as string[])) {
      return badRequestResponse(`Invalid assessment outcome. Must be one of: ${ASSESSMENT_OUTCOMES.join(", ")}`);
    }

    if (body.certification_status && !isValidEnum(body.certification_status, CERTIFICATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid certification status. Must be one of: ${CERTIFICATION_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.employee_reference !== undefined) updateData.employee_reference = sanitizeString(body.employee_reference);
    if (body.employee_name !== undefined) updateData.employee_name = sanitizeString(body.employee_name);
    if (body.job_title !== undefined) updateData.job_title = sanitizeString(body.job_title);
    if (body.department !== undefined) updateData.department = sanitizeString(body.department);
    if (body.certification_function !== undefined) updateData.certification_function = sanitizeString(body.certification_function);
    if (body.certification_start_date !== undefined) updateData.certification_start_date = parseValidDate(body.certification_start_date);
    if (body.certification_expiry_date !== undefined) updateData.certification_expiry_date = parseValidDate(body.certification_expiry_date);
    if (body.last_assessment_date !== undefined) updateData.last_assessment_date = parseValidDate(body.last_assessment_date);
    if (body.next_assessment_due !== undefined) updateData.next_assessment_due = parseValidDate(body.next_assessment_due);
    if (body.assessor_name !== undefined) updateData.assessor_name = sanitizeString(body.assessor_name);
    if (body.assessment_outcome !== undefined) updateData.assessment_outcome = body.assessment_outcome;
    if (body.training_completed !== undefined) updateData.training_completed = body.training_completed;
    if (body.training_details !== undefined) updateData.training_details = sanitizeText(body.training_details);
    if (body.competency_confirmed !== undefined) updateData.competency_confirmed = body.competency_confirmed;
    if (body.competency_evidence !== undefined) updateData.competency_evidence = sanitizeText(body.competency_evidence);
    if (body.conduct_rules_training !== undefined) updateData.conduct_rules_training = body.conduct_rules_training;
    if (body.conduct_rules_date !== undefined) updateData.conduct_rules_date = parseValidDate(body.conduct_rules_date);
    if (body.fit_and_proper_confirmed !== undefined) updateData.fit_and_proper_confirmed = body.fit_and_proper_confirmed;
    if (body.fit_and_proper_date !== undefined) updateData.fit_and_proper_date = parseValidDate(body.fit_and_proper_date);
    if (body.regulatory_references_obtained !== undefined) updateData.regulatory_references_obtained = body.regulatory_references_obtained;
    if (body.references_details !== undefined) updateData.references_details = sanitizeText(body.references_details);
    if (body.certification_status !== undefined) updateData.certification_status = body.certification_status;
    if (body.certification_issued_date !== undefined) updateData.certification_issued_date = parseValidDate(body.certification_issued_date);
    if (body.certification_issued_by !== undefined) updateData.certification_issued_by = sanitizeString(body.certification_issued_by);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.leaving_date !== undefined) updateData.leaving_date = parseValidDate(body.leaving_date);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateSmcrCertificationRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating SMCR certification record");
    return serverErrorResponse("Failed to update SMCR certification record");
  }
}

// DELETE /api/registers/smcr-certification/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`smcr-certification-delete-${clientIp}`);
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
    const existingRecord = await getSmcrCertificationRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteSmcrCertificationRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting SMCR certification record");
    return serverErrorResponse("Failed to delete SMCR certification record");
  }
}
