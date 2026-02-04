import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getInsiderListRecord,
  updateInsiderListRecord,
  deleteInsiderListRecord,
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

const LIST_STATUSES = ["active", "closed", "archived"] as const;

// GET /api/registers/insider-list/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`insider-list-get-${clientIp}`);
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

    const record = await getInsiderListRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching insider list record");
    return serverErrorResponse("Failed to fetch insider list record");
  }
}

// PATCH /api/registers/insider-list/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`insider-list-patch-${clientIp}`);
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
    const existingRecord = await getInsiderListRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.status && !isValidEnum(body.status, LIST_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${LIST_STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.list_reference !== undefined) updateData.list_reference = sanitizeString(body.list_reference);
    if (body.project_name !== undefined) updateData.project_name = sanitizeString(body.project_name);
    if (body.insider_name !== undefined) updateData.insider_name = sanitizeString(body.insider_name);
    if (body.insider_role !== undefined) updateData.insider_role = sanitizeString(body.insider_role);
    if (body.insider_company !== undefined) updateData.insider_company = sanitizeString(body.insider_company);
    if (body.insider_email !== undefined) updateData.insider_email = sanitizeString(body.insider_email);
    if (body.insider_phone !== undefined) updateData.insider_phone = sanitizeString(body.insider_phone);
    if (body.date_added !== undefined) updateData.date_added = parseValidDate(body.date_added);
    if (body.date_removed !== undefined) updateData.date_removed = parseValidDate(body.date_removed);
    if (body.reason_for_access !== undefined) updateData.reason_for_access = sanitizeText(body.reason_for_access);
    if (body.access_granted_by !== undefined) updateData.access_granted_by = sanitizeString(body.access_granted_by);
    if (body.acknowledgment_received !== undefined) updateData.acknowledgment_received = body.acknowledgment_received;
    if (body.acknowledgment_date !== undefined) updateData.acknowledgment_date = parseValidDate(body.acknowledgment_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateInsiderListRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating insider list record");
    return serverErrorResponse("Failed to update insider list record");
  }
}

// DELETE /api/registers/insider-list/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`insider-list-delete-${clientIp}`);
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
    const existingRecord = await getInsiderListRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteInsiderListRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting insider list record");
    return serverErrorResponse("Failed to delete insider list record");
  }
}
