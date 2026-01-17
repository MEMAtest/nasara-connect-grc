import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getOutsideBusinessRecord,
  updateOutsideBusinessRecord,
  deleteOutsideBusinessRecord,
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

const INTEREST_TYPES = ["directorship", "employment", "consultancy", "investment", "charity", "other"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "conditional"] as const;
const STATUSES = ["active", "ceased", "withdrawn"] as const;

// GET /api/registers/outside-business/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`outside-business-get-${clientIp}`);
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

    const record = await getOutsideBusinessRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching outside business record");
    return serverErrorResponse("Failed to fetch outside business record");
  }
}

// PATCH /api/registers/outside-business/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`outside-business-patch-${clientIp}`);
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
    const existingRecord = await getOutsideBusinessRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.interest_type && !isValidEnum(body.interest_type, INTEREST_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid interest type. Must be one of: ${INTEREST_TYPES.join(", ")}`);
    }

    if (body.approval_status && !isValidEnum(body.approval_status, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.declaration_reference !== undefined) updateData.declaration_reference = sanitizeString(body.declaration_reference);
    if (body.employee_name !== undefined) updateData.employee_name = sanitizeString(body.employee_name);
    if (body.employee_id !== undefined) updateData.employee_id = sanitizeString(body.employee_id);
    if (body.employee_department !== undefined) updateData.employee_department = sanitizeString(body.employee_department);
    if (body.employee_role !== undefined) updateData.employee_role = sanitizeString(body.employee_role);
    if (body.interest_type !== undefined) updateData.interest_type = body.interest_type;
    if (body.organization_name !== undefined) updateData.organization_name = sanitizeString(body.organization_name);
    if (body.organization_type !== undefined) updateData.organization_type = sanitizeString(body.organization_type);
    if (body.organization_sector !== undefined) updateData.organization_sector = sanitizeString(body.organization_sector);
    if (body.role_held !== undefined) updateData.role_held = sanitizeString(body.role_held);
    if (body.is_remunerated !== undefined) updateData.is_remunerated = body.is_remunerated;
    if (body.remuneration_details !== undefined) updateData.remuneration_details = sanitizeText(body.remuneration_details);
    if (body.time_commitment !== undefined) updateData.time_commitment = sanitizeString(body.time_commitment);
    if (body.start_date !== undefined) updateData.start_date = parseValidDate(body.start_date);
    if (body.end_date !== undefined) updateData.end_date = parseValidDate(body.end_date);
    if (body.conflict_assessment !== undefined) updateData.conflict_assessment = sanitizeText(body.conflict_assessment);
    if (body.potential_conflicts !== undefined) updateData.potential_conflicts = sanitizeText(body.potential_conflicts);
    if (body.mitigating_controls !== undefined) updateData.mitigating_controls = sanitizeText(body.mitigating_controls);
    if (body.declaration_date !== undefined) updateData.declaration_date = parseValidDate(body.declaration_date);
    if (body.reviewed_by !== undefined) updateData.reviewed_by = sanitizeString(body.reviewed_by);
    if (body.review_date !== undefined) updateData.review_date = parseValidDate(body.review_date);
    if (body.approval_status !== undefined) updateData.approval_status = body.approval_status;
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.approval_conditions !== undefined) updateData.approval_conditions = sanitizeText(body.approval_conditions);
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.ceased_date !== undefined) updateData.ceased_date = parseValidDate(body.ceased_date);
    if (body.ceased_reason !== undefined) updateData.ceased_reason = sanitizeText(body.ceased_reason);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateOutsideBusinessRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating outside business record");
    return serverErrorResponse("Failed to update outside business record");
  }
}

// DELETE /api/registers/outside-business/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`outside-business-delete-${clientIp}`);
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
    const existingRecord = await getOutsideBusinessRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteOutsideBusinessRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting outside business record");
    return serverErrorResponse("Failed to delete outside business record");
  }
}
