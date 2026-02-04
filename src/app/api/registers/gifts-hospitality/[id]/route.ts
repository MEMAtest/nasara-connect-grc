import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getGiftHospitalityRecord,
  updateGiftHospitalityRecord,
  deleteGiftHospitalityRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  GIFT_ENTRY_TYPES,
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

const GIFT_APPROVAL_STATUSES = ["not_required", "pending", "approved", "rejected"] as const;

// GET /api/registers/gifts-hospitality/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`gifts-hospitality-get-${clientIp}`);
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
      return badRequestResponse("Invalid ID format");
    }

    const record = await getGiftHospitalityRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching Gift/Hospitality record");
    return serverErrorResponse("Failed to fetch record");
  }
}

// PATCH /api/registers/gifts-hospitality/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`gifts-hospitality-patch-${clientIp}`, {
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
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getGiftHospitalityRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Description (required if provided)
    if (body.description !== undefined) {
      const desc = sanitizeText(body.description);
      if (!desc) {
        return badRequestResponse("Description cannot be empty");
      }
      updateData.description = desc;
    }

    // String fields
    const stringFields = ["recipient_name", "recipient_organization", "provider_name", "provider_organization", "approved_by"];
    for (const field of stringFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeString(body[field]) || null;
      }
    }

    const textFields = ["business_justification", "declined_reason", "notes"];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeText(body[field]) || null;
      }
    }

    // Entry type
    if (body.entry_type !== undefined) {
      if (!isValidEnum(body.entry_type, GIFT_ENTRY_TYPES)) {
        return badRequestResponse(`Invalid entry type. Must be one of: ${GIFT_ENTRY_TYPES.join(", ")}`);
      }
      updateData.entry_type = body.entry_type;
    }

    // Approval status
    if (body.approval_status !== undefined) {
      if (!GIFT_APPROVAL_STATUSES.includes(body.approval_status)) {
        return badRequestResponse(`Invalid approval status. Must be one of: ${GIFT_APPROVAL_STATUSES.join(", ")}`);
      }
      updateData.approval_status = body.approval_status;
    }

    // Date fields
    if (body.date_of_event !== undefined) {
      if (body.date_of_event === null || body.date_of_event === "") {
        updateData.date_of_event = null;
      } else {
        const parsedDate = parseValidDate(body.date_of_event);
        if (!parsedDate) {
          return badRequestResponse("Invalid date format for date_of_event");
        }
        updateData.date_of_event = parsedDate;
      }
    }

    if (body.approved_at !== undefined) {
      if (body.approved_at === null || body.approved_at === "") {
        updateData.approved_at = null;
      } else {
        const parsedDate = parseValidDate(body.approved_at);
        if (!parsedDate) {
          return badRequestResponse("Invalid date format for approved_at");
        }
        updateData.approved_at = parsedDate;
      }
    }

    // Numeric fields
    if (body.estimated_value_gbp !== undefined) {
      if (body.estimated_value_gbp === null || body.estimated_value_gbp === "") {
        updateData.estimated_value_gbp = null;
        updateData.approval_required = false;
      } else {
        const parsed = parsePositiveNumber(body.estimated_value_gbp);
        if (parsed === null) {
          return badRequestResponse("Invalid estimated value");
        }
        updateData.estimated_value_gbp = parsed;
        updateData.approval_required = parsed >= 50;
      }
    }

    // Boolean fields
    if (body.approval_required !== undefined) {
      updateData.approval_required = Boolean(body.approval_required);
    }

    if (body.declined !== undefined) {
      updateData.declined = Boolean(body.declined);
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse("No valid fields to update");
    }

    const record = await updateGiftHospitalityRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating Gift/Hospitality record");
    return serverErrorResponse("Failed to update record");
  }
}

// DELETE /api/registers/gifts-hospitality/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`gifts-hospitality-delete-${clientIp}`, {
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
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getGiftHospitalityRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteGiftHospitalityRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting Gift/Hospitality record");
    return serverErrorResponse("Failed to delete record");
  }
}
