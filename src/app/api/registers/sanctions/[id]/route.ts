import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getSanctionsScreeningRecords,
  updateSanctionsScreeningRecord,
  deleteSanctionsScreeningRecord,
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

const ENTITY_TYPES = ["individual", "company", "organization", "vessel", "aircraft", "other"] as const;
const SCREENING_TYPES = ["onboarding", "periodic", "transaction", "ad_hoc", "pep", "adverse_media"] as const;
const DECISIONS = ["pending", "cleared", "match_confirmed", "escalated", "blocked"] as const;
const STATUSES = ["pending", "in_review", "completed", "escalated"] as const;

// Helper to get a single record by ID
async function getSanctionsScreeningRecordById(id: string, organizationId: string) {
  const records = await getSanctionsScreeningRecords(organizationId);
  return records.find((r: { id: string }) => r.id === id) || null;
}

// PATCH /api/registers/sanctions/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sanctions-patch-${clientIp}`, {
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
    const existingRecord = await getSanctionsScreeningRecordById(id, authResult.user.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.entity_type && !isValidEnum(body.entity_type, ENTITY_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid entity type. Must be one of: ${ENTITY_TYPES.join(", ")}`);
    }

    if (body.screening_type && !isValidEnum(body.screening_type, SCREENING_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid screening type. Must be one of: ${SCREENING_TYPES.join(", ")}`);
    }

    if (body.decision && !isValidEnum(body.decision, DECISIONS as unknown as string[])) {
      return badRequestResponse(`Invalid decision. Must be one of: ${DECISIONS.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.screening_reference !== undefined) updateData.screening_reference = sanitizeString(body.screening_reference);
    if (body.entity_type !== undefined) updateData.entity_type = body.entity_type;
    if (body.entity_name !== undefined) updateData.entity_name = sanitizeString(body.entity_name);
    if (body.entity_dob !== undefined) updateData.entity_dob = parseValidDate(body.entity_dob);
    if (body.entity_country !== undefined) updateData.entity_country = sanitizeString(body.entity_country);
    if (body.screening_date !== undefined) updateData.screening_date = parseValidDate(body.screening_date);
    if (body.screened_by !== undefined) updateData.screened_by = sanitizeString(body.screened_by);
    if (body.screening_type !== undefined) updateData.screening_type = body.screening_type;
    if (body.lists_checked !== undefined) updateData.lists_checked = body.lists_checked;
    if (body.match_found !== undefined) updateData.match_found = body.match_found;
    if (body.match_details !== undefined) updateData.match_details = sanitizeText(body.match_details);
    if (body.match_score !== undefined) updateData.match_score = parseFloat(body.match_score);
    if (body.false_positive !== undefined) updateData.false_positive = body.false_positive;
    if (body.false_positive_reason !== undefined) updateData.false_positive_reason = sanitizeText(body.false_positive_reason);
    if (body.escalated !== undefined) updateData.escalated = body.escalated;
    if (body.escalated_to !== undefined) updateData.escalated_to = sanitizeString(body.escalated_to);
    if (body.escalated_date !== undefined) updateData.escalated_date = parseValidDate(body.escalated_date);
    if (body.decision !== undefined) updateData.decision = body.decision;
    if (body.decision_by !== undefined) updateData.decision_by = sanitizeString(body.decision_by);
    if (body.decision_date !== undefined) updateData.decision_date = parseValidDate(body.decision_date);
    if (body.decision_rationale !== undefined) updateData.decision_rationale = sanitizeText(body.decision_rationale);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateSanctionsScreeningRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating sanctions screening record");
    return serverErrorResponse("Failed to update sanctions screening record");
  }
}

// DELETE /api/registers/sanctions/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sanctions-delete-${clientIp}`, {
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
    const existingRecord = await getSanctionsScreeningRecordById(id, authResult.user.organizationId);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteSanctionsScreeningRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting sanctions screening record");
    return serverErrorResponse("Failed to delete sanctions screening record");
  }
}
