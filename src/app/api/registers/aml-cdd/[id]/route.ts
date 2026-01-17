import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getAmlCddRecords,
  updateAmlCddRecord,
  deleteAmlCddRecord,
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

const CUSTOMER_TYPES = ["individual", "company", "trust", "partnership", "charity", "other"] as const;
const CDD_LEVELS = ["simplified", "standard", "enhanced"] as const;
const RISK_RATINGS = ["low", "medium", "high", "critical"] as const;
const VERIFICATION_STATUSES = ["pending", "in_progress", "completed", "failed", "expired"] as const;
const OVERALL_STATUSES = ["in_progress", "completed", "pending_review", "on_hold", "rejected"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "conditional"] as const;

// Helper to get a single record by ID
async function getAmlCddRecordById(id: string, organizationId: string) {
  const records = await getAmlCddRecords(organizationId);
  return records.find((r: { id: string }) => r.id === id) || null;
}

// PATCH /api/registers/aml-cdd/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`aml-cdd-patch-${clientIp}`, {
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

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getAmlCddRecordById(id, authResult.user.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.customer_type && !isValidEnum(body.customer_type, CUSTOMER_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid customer type. Must be one of: ${CUSTOMER_TYPES.join(", ")}`);
    }

    if (body.cdd_level && !isValidEnum(body.cdd_level, CDD_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid CDD level. Must be one of: ${CDD_LEVELS.join(", ")}`);
    }

    if (body.risk_rating && !isValidEnum(body.risk_rating, RISK_RATINGS as unknown as string[])) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    if (body.overall_status && !isValidEnum(body.overall_status, OVERALL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid overall status. Must be one of: ${OVERALL_STATUSES.join(", ")}`);
    }

    if (body.approval_status && !isValidEnum(body.approval_status, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    // Validate verification statuses
    const verificationFields = ['id_verification_status', 'poa_verification_status', 'pep_check_status', 'sanctions_check_status', 'adverse_media_status'];
    for (const field of verificationFields) {
      if (body[field] && !isValidEnum(body[field], VERIFICATION_STATUSES as unknown as string[])) {
        return badRequestResponse(`Invalid ${field.replace(/_/g, ' ')}. Must be one of: ${VERIFICATION_STATUSES.join(", ")}`);
      }
    }

    const updateData: Record<string, unknown> = {};

    if (body.customer_reference !== undefined) updateData.customer_reference = sanitizeString(body.customer_reference);
    if (body.customer_name !== undefined) updateData.customer_name = sanitizeString(body.customer_name);
    if (body.customer_type !== undefined) updateData.customer_type = body.customer_type;
    if (body.onboarding_date !== undefined) updateData.onboarding_date = parseValidDate(body.onboarding_date);
    if (body.cdd_level !== undefined) updateData.cdd_level = body.cdd_level;
    if (body.risk_rating !== undefined) updateData.risk_rating = body.risk_rating;
    if (body.id_verification_status !== undefined) updateData.id_verification_status = body.id_verification_status;
    if (body.id_verification_date !== undefined) updateData.id_verification_date = parseValidDate(body.id_verification_date);
    if (body.id_verification_method !== undefined) updateData.id_verification_method = sanitizeString(body.id_verification_method);
    if (body.poa_verification_status !== undefined) updateData.poa_verification_status = body.poa_verification_status;
    if (body.poa_verification_date !== undefined) updateData.poa_verification_date = parseValidDate(body.poa_verification_date);
    if (body.source_of_funds !== undefined) updateData.source_of_funds = sanitizeString(body.source_of_funds);
    if (body.source_of_wealth !== undefined) updateData.source_of_wealth = sanitizeString(body.source_of_wealth);
    if (body.beneficial_owners !== undefined) updateData.beneficial_owners = sanitizeText(body.beneficial_owners);
    if (body.pep_check_status !== undefined) updateData.pep_check_status = body.pep_check_status;
    if (body.pep_check_date !== undefined) updateData.pep_check_date = parseValidDate(body.pep_check_date);
    if (body.sanctions_check_status !== undefined) updateData.sanctions_check_status = body.sanctions_check_status;
    if (body.sanctions_check_date !== undefined) updateData.sanctions_check_date = parseValidDate(body.sanctions_check_date);
    if (body.adverse_media_status !== undefined) updateData.adverse_media_status = body.adverse_media_status;
    if (body.adverse_media_date !== undefined) updateData.adverse_media_date = parseValidDate(body.adverse_media_date);
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.last_review_date !== undefined) updateData.last_review_date = parseValidDate(body.last_review_date);
    if (body.reviewer !== undefined) updateData.reviewer = sanitizeString(body.reviewer);
    if (body.overall_status !== undefined) updateData.overall_status = body.overall_status;
    if (body.approval_status !== undefined) updateData.approval_status = body.approval_status;
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateAmlCddRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating AML CDD record");
    return serverErrorResponse("Failed to update AML CDD record");
  }
}

// DELETE /api/registers/aml-cdd/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`aml-cdd-delete-${clientIp}`, {
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

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getAmlCddRecordById(id, authResult.user.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteAmlCddRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting AML CDD record");
    return serverErrorResponse("Failed to delete AML CDD record");
  }
}
