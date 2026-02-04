import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getEddCaseRecords,
  updateEddCaseRecord,
  deleteEddCaseRecord,
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

const EDD_TRIGGERS = [
  "pep", "high_risk_country", "complex_structure", "high_value",
  "sanctions_alert", "adverse_media", "unusual_activity", "referral", "other"
] as const;
const MONITORING_LEVELS = ["standard", "enhanced", "intensive"] as const;
const REVIEW_FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual"] as const;
const STATUSES = ["open", "under_review", "closed", "escalated"] as const;
const DECISIONS = ["pending", "approved", "rejected", "terminated", "exited"] as const;

// Helper to get a single record by ID
async function getEddCaseRecordById(id: string, organizationId: string) {
  const records = await getEddCaseRecords(organizationId);
  return records.find((r: { id: string }) => r.id === id) || null;
}

// PATCH /api/registers/edd-cases/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`edd-cases-patch-${clientIp}`, {
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
    const existingRecord = await getEddCaseRecordById(id, authResult.user.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.edd_trigger && !isValidEnum(body.edd_trigger, EDD_TRIGGERS as unknown as string[])) {
      return badRequestResponse(`Invalid EDD trigger. Must be one of: ${EDD_TRIGGERS.join(", ")}`);
    }

    if (body.ongoing_monitoring_level && !isValidEnum(body.ongoing_monitoring_level, MONITORING_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid monitoring level. Must be one of: ${MONITORING_LEVELS.join(", ")}`);
    }

    if (body.review_frequency && !isValidEnum(body.review_frequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    if (body.decision && !isValidEnum(body.decision, DECISIONS as unknown as string[])) {
      return badRequestResponse(`Invalid decision. Must be one of: ${DECISIONS.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.case_reference !== undefined) updateData.case_reference = sanitizeString(body.case_reference);
    if (body.customer_reference !== undefined) updateData.customer_reference = sanitizeString(body.customer_reference);
    if (body.customer_name !== undefined) updateData.customer_name = sanitizeString(body.customer_name);
    if (body.edd_trigger !== undefined) updateData.edd_trigger = body.edd_trigger;
    if (body.trigger_description !== undefined) updateData.trigger_description = sanitizeText(body.trigger_description);
    if (body.trigger_date !== undefined) updateData.trigger_date = parseValidDate(body.trigger_date);
    if (body.risk_factors !== undefined) updateData.risk_factors = body.risk_factors;
    if (body.enhanced_measures !== undefined) updateData.enhanced_measures = body.enhanced_measures;
    if (body.source_of_wealth_verified !== undefined) updateData.source_of_wealth_verified = body.source_of_wealth_verified;
    if (body.source_of_funds_verified !== undefined) updateData.source_of_funds_verified = body.source_of_funds_verified;
    if (body.ongoing_monitoring_level !== undefined) updateData.ongoing_monitoring_level = body.ongoing_monitoring_level;
    if (body.senior_management_approval !== undefined) updateData.senior_management_approval = body.senior_management_approval;
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.approval_rationale !== undefined) updateData.approval_rationale = sanitizeText(body.approval_rationale);
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.last_review_date !== undefined) updateData.last_review_date = parseValidDate(body.last_review_date);
    if (body.review_frequency !== undefined) updateData.review_frequency = body.review_frequency;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.decision !== undefined) updateData.decision = body.decision;
    if (body.decision_rationale !== undefined) updateData.decision_rationale = sanitizeText(body.decision_rationale);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateEddCaseRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating EDD case record");
    return serverErrorResponse("Failed to update EDD case record");
  }
}

// DELETE /api/registers/edd-cases/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`edd-cases-delete-${clientIp}`, {
      windowMs: 60000,
      maxRequests: 30,
    });
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

    // Fetch record first to verify ownership
    const existingRecord = await getEddCaseRecordById(id, auth.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteEddCaseRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting EDD case record");
    return serverErrorResponse("Failed to delete EDD case record");
  }
}
