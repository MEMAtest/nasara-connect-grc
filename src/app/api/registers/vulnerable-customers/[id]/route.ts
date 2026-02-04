import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getVulnerableCustomerRecord,
  updateVulnerableCustomerRecord,
  deleteVulnerableCustomerRecord,
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

const VULNERABILITY_TYPES = [
  "health", "life_events", "capability", "financial", "age", "mental_health", "other"
] as const;
const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["active", "monitoring", "resolved", "closed"] as const;
const REVIEW_FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual", "ad_hoc"] as const;

// GET /api/registers/vulnerable-customers/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`vulnerable-customers-get-${clientIp}`);
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

    const record = await getVulnerableCustomerRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching vulnerable customer record");
    return serverErrorResponse("Failed to fetch vulnerable customer record");
  }
}

// PATCH /api/registers/vulnerable-customers/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`vulnerable-customers-patch-${clientIp}`);
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
    const existingRecord = await getVulnerableCustomerRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.vulnerability_type && !isValidEnum(body.vulnerability_type, VULNERABILITY_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid vulnerability type. Must be one of: ${VULNERABILITY_TYPES.join(", ")}`);
    }

    if (body.risk_level && !isValidEnum(body.risk_level, RISK_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid risk level. Must be one of: ${RISK_LEVELS.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    if (body.review_frequency && !isValidEnum(body.review_frequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.customer_reference !== undefined) updateData.customer_reference = sanitizeString(body.customer_reference);
    if (body.customer_name !== undefined) updateData.customer_name = sanitizeString(body.customer_name);
    if (body.vulnerability_type !== undefined) updateData.vulnerability_type = body.vulnerability_type;
    if (body.vulnerability_details !== undefined) updateData.vulnerability_details = sanitizeText(body.vulnerability_details);
    if (body.identified_date !== undefined) updateData.identified_date = parseValidDate(body.identified_date);
    if (body.identified_by !== undefined) updateData.identified_by = sanitizeString(body.identified_by);
    if (body.risk_level !== undefined) updateData.risk_level = body.risk_level;
    if (body.support_measures !== undefined) updateData.support_measures = sanitizeText(body.support_measures);
    if (body.review_frequency !== undefined) updateData.review_frequency = body.review_frequency;
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.last_review_date !== undefined) updateData.last_review_date = parseValidDate(body.last_review_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.outcome_notes !== undefined) updateData.outcome_notes = sanitizeText(body.outcome_notes);
    if (body.closed_date !== undefined) updateData.closed_date = parseValidDate(body.closed_date);
    if (body.closed_by !== undefined) updateData.closed_by = sanitizeString(body.closed_by);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateVulnerableCustomerRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating vulnerable customer record");
    return serverErrorResponse("Failed to update vulnerable customer record");
  }
}

// DELETE /api/registers/vulnerable-customers/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`vulnerable-customers-delete-${clientIp}`);
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
    const existingRecord = await getVulnerableCustomerRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteVulnerableCustomerRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting vulnerable customer record");
    return serverErrorResponse("Failed to delete vulnerable customer record");
  }
}
