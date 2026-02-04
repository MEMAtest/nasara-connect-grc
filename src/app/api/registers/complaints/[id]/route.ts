import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintRecord,
  updateComplaintRecord,
  deleteComplaintRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  COMPLAINT_TYPES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  PRIORITY_LEVELS,
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

// GET /api/registers/complaints/[id] - Get a single Complaint record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`complaints-get-id-${clientIp}`);
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

    const record = await getComplaintRecord(id);

    if (!record) {
      return notFoundResponse("Complaint record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching Complaint record");
    return serverErrorResponse("Failed to fetch Complaint record");
  }
}

// PATCH /api/registers/complaints/[id] - Update a Complaint record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`complaints-patch-${clientIp}`, {
      windowMs: 60000,
      maxRequests: 50,
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

    // First, fetch the record to verify ownership
    const existingRecord = await getComplaintRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Complaint record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and sanitize string fields
    if (body.complainant_name !== undefined) {
      const complainantName = sanitizeString(body.complainant_name);
      if (!complainantName) {
        return badRequestResponse("Complainant name cannot be empty");
      }
      updateData.complainant_name = complainantName;
    }

    if (body.root_cause !== undefined) {
      updateData.root_cause = sanitizeText(body.root_cause) || null;
    }

    if (body.remedial_action !== undefined) {
      updateData.remedial_action = sanitizeText(body.remedial_action) || null;
    }

    if (body.fos_outcome !== undefined) {
      updateData.fos_outcome = sanitizeString(body.fos_outcome) || null;
    }

    if (body.assigned_to !== undefined) {
      updateData.assigned_to = sanitizeString(body.assigned_to) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    // Validate enum fields
    if (body.complaint_type !== undefined) {
      if (!isValidEnum(body.complaint_type, COMPLAINT_TYPES)) {
        return badRequestResponse(
          `Invalid complaint type. Must be one of: ${COMPLAINT_TYPES.join(", ")}`
        );
      }
      updateData.complaint_type = body.complaint_type;
    }

    if (body.complaint_category !== undefined) {
      if (!isValidEnum(body.complaint_category, COMPLAINT_CATEGORIES)) {
        return badRequestResponse(
          `Invalid complaint category. Must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`
        );
      }
      updateData.complaint_category = body.complaint_category;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, COMPLAINT_STATUSES)) {
        return badRequestResponse(
          `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(", ")}`
        );
      }
      updateData.status = body.status;
    }

    if (body.priority !== undefined) {
      if (!isValidEnum(body.priority, PRIORITY_LEVELS)) {
        return badRequestResponse(
          `Invalid priority. Must be one of: ${PRIORITY_LEVELS.join(", ")}`
        );
      }
      updateData.priority = body.priority;
    }

    // Validate and parse date fields
    const dateFields = [
      "received_date",
      "acknowledged_date",
      "resolution_deadline",
      "resolved_date",
    ];

    for (const field of dateFields) {
      if (body[field] !== undefined) {
        if (body[field] === null || body[field] === "") {
          updateData[field] = null;
        } else {
          const parsedDate = parseValidDate(body[field]);
          if (!parsedDate) {
            return badRequestResponse(`Invalid date format for ${field}`);
          }
          updateData[field] = parsedDate;
        }
      }
    }

    // Validate compensation amount
    if (body.compensation_amount !== undefined) {
      if (body.compensation_amount === null || body.compensation_amount === "") {
        updateData.compensation_amount = null;
      } else {
        const parsedValue = parsePositiveNumber(body.compensation_amount);
        if (parsedValue === null) {
          return badRequestResponse(
            "Invalid compensation amount. Must be a positive number"
          );
        }
        updateData.compensation_amount = parsedValue;
      }
    }

    // Boolean fields
    if (body.fos_referred !== undefined) {
      updateData.fos_referred = Boolean(body.fos_referred);
    }
    if (body.four_week_letter_sent !== undefined) {
      updateData.four_week_letter_sent = Boolean(body.four_week_letter_sent);
    }
    if (body.eight_week_letter_sent !== undefined) {
      updateData.eight_week_letter_sent = Boolean(body.eight_week_letter_sent);
    }
    if (body.final_response_sent !== undefined) {
      updateData.final_response_sent = Boolean(body.final_response_sent);
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse("No valid fields to update");
    }

    const record = await updateComplaintRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Complaint record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating Complaint record");
    return serverErrorResponse("Failed to update Complaint record");
  }
}

// DELETE /api/registers/complaints/[id] - Delete a Complaint record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (stricter for deletes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`complaints-delete-${clientIp}`, {
      windowMs: 60000,
      maxRequests: 20,
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

    // First, fetch the record to verify ownership
    const existingRecord = await getComplaintRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Complaint record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteComplaintRecord(id);

    if (!deleted) {
      return notFoundResponse("Complaint record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting Complaint record");
    return serverErrorResponse("Failed to delete Complaint record");
  }
}
