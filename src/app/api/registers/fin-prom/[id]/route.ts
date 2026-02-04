import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getFinPromRecord,
  updateFinPromRecord,
  deleteFinPromRecord,
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

const PROMOTION_TYPES = [
  "advertisement", "website", "social_media", "email", "brochure",
  "presentation", "video", "app", "sms", "other"
] as const;
const CHANNELS = [
  "online", "print", "broadcast", "social", "email", "direct_mail", "phone", "in_person", "app", "other"
] as const;
const APPROVAL_STATUSES = ["draft", "review", "approved", "rejected", "withdrawn"] as const;
const STATUSES = ["draft", "live", "paused", "expired", "withdrawn"] as const;
const RISK_RATINGS = ["low", "medium", "high", "critical"] as const;

// GET /api/registers/fin-prom/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`fin-prom-get-${clientIp}`);
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

    const record = await getFinPromRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching fin-prom record");
    return serverErrorResponse("Failed to fetch fin-prom record");
  }
}

// PATCH /api/registers/fin-prom/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`fin-prom-patch-${clientIp}`);
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
    const existingRecord = await getFinPromRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.promotion_type && !isValidEnum(body.promotion_type, PROMOTION_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid promotion type. Must be one of: ${PROMOTION_TYPES.join(", ")}`);
    }

    if (body.channel && !isValidEnum(body.channel, CHANNELS as unknown as string[])) {
      return badRequestResponse(`Invalid channel. Must be one of: ${CHANNELS.join(", ")}`);
    }

    if (body.approval_status && !isValidEnum(body.approval_status, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    if (body.risk_rating && !isValidEnum(body.risk_rating, RISK_RATINGS as unknown as string[])) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.promotion_reference !== undefined) updateData.promotion_reference = sanitizeString(body.promotion_reference);
    if (body.promotion_title !== undefined) updateData.promotion_title = sanitizeString(body.promotion_title);
    if (body.promotion_type !== undefined) updateData.promotion_type = body.promotion_type;
    if (body.channel !== undefined) updateData.channel = body.channel;
    if (body.target_audience !== undefined) updateData.target_audience = sanitizeString(body.target_audience);
    if (body.product_service !== undefined) updateData.product_service = sanitizeString(body.product_service);
    if (body.content_summary !== undefined) updateData.content_summary = sanitizeText(body.content_summary);
    if (body.created_date !== undefined) updateData.created_date = parseValidDate(body.created_date);
    if (body.created_by !== undefined) updateData.created_by = sanitizeString(body.created_by);
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.approval_status !== undefined) updateData.approval_status = body.approval_status;
    if (body.compliance_reviewer !== undefined) updateData.compliance_reviewer = sanitizeString(body.compliance_reviewer);
    if (body.compliance_review_date !== undefined) updateData.compliance_review_date = parseValidDate(body.compliance_review_date);
    if (body.compliance_notes !== undefined) updateData.compliance_notes = sanitizeText(body.compliance_notes);
    if (body.version_number !== undefined) updateData.version_number = parseInt(body.version_number);
    if (body.live_date !== undefined) updateData.live_date = parseValidDate(body.live_date);
    if (body.expiry_date !== undefined) updateData.expiry_date = parseValidDate(body.expiry_date);
    if (body.withdrawn_date !== undefined) updateData.withdrawn_date = parseValidDate(body.withdrawn_date);
    if (body.withdrawal_reason !== undefined) updateData.withdrawal_reason = sanitizeText(body.withdrawal_reason);
    if (body.risk_rating !== undefined) updateData.risk_rating = body.risk_rating;
    if (body.regulatory_requirements !== undefined) updateData.regulatory_requirements = body.regulatory_requirements;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateFinPromRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating fin-prom record");
    return serverErrorResponse("Failed to update fin-prom record");
  }
}

// DELETE /api/registers/fin-prom/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`fin-prom-delete-${clientIp}`);
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
    const existingRecord = await getFinPromRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteFinPromRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting fin-prom record");
    return serverErrorResponse("Failed to delete fin-prom record");
  }
}
