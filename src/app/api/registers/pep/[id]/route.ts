import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPEPRecord,
  updatePEPRecord,
  deletePEPRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  PEP_TYPES,
  PEP_CATEGORIES,
  RISK_RATINGS,
  PEP_STATUSES,
  APPROVAL_STATUSES,
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

// GET /api/registers/pep/[id] - Get a single PEP record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pep-get-${clientIp}`);
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

    // Validate UUID format
    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    const record = await getPEPRecord(id);

    if (!record) {
      return notFoundResponse("PEP record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching PEP record");
    return serverErrorResponse("Failed to fetch PEP record");
  }
}

// PATCH /api/registers/pep/[id] - Update a PEP record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pep-patch-${clientIp}`, {
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

    // Validate UUID format
    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getPEPRecord(id);
    if (!existingRecord) {
      return notFoundResponse("PEP record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Validate and sanitize string fields
    if (body.full_name !== undefined) {
      const fullName = sanitizeString(body.full_name);
      if (!fullName) {
        return badRequestResponse("Full name cannot be empty");
      }
      updateData.full_name = fullName;
    }

    if (body.nationality !== undefined) {
      updateData.nationality = sanitizeString(body.nationality) || null;
    }

    if (body.position_held !== undefined) {
      updateData.position_held = sanitizeString(body.position_held) || null;
    }

    if (body.relationship_type !== undefined) {
      updateData.relationship_type = sanitizeString(body.relationship_type) || null;
    }

    if (body.source_of_wealth !== undefined) {
      updateData.source_of_wealth = sanitizeText(body.source_of_wealth) || null;
    }

    if (body.source_of_funds !== undefined) {
      updateData.source_of_funds = sanitizeText(body.source_of_funds) || null;
    }

    if (body.approved_by !== undefined) {
      updateData.approved_by = sanitizeString(body.approved_by) || null;
    }

    if (body.notes !== undefined) {
      updateData.notes = sanitizeText(body.notes) || null;
    }

    // Validate enum fields
    if (body.pep_type !== undefined) {
      if (!isValidEnum(body.pep_type, PEP_TYPES)) {
        return badRequestResponse(`Invalid PEP type. Must be one of: ${PEP_TYPES.join(", ")}`);
      }
      updateData.pep_type = body.pep_type;
    }

    if (body.pep_category !== undefined) {
      if (!isValidEnum(body.pep_category, PEP_CATEGORIES)) {
        return badRequestResponse(`Invalid PEP category. Must be one of: ${PEP_CATEGORIES.join(", ")}`);
      }
      updateData.pep_category = body.pep_category;
    }

    if (body.risk_rating !== undefined) {
      if (!isValidEnum(body.risk_rating, RISK_RATINGS)) {
        return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
      }
      updateData.risk_rating = body.risk_rating;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, PEP_STATUSES)) {
        return badRequestResponse(`Invalid status. Must be one of: ${PEP_STATUSES.join(", ")}`);
      }
      updateData.status = body.status;
    }

    if (body.approval_status !== undefined) {
      if (!isValidEnum(body.approval_status, APPROVAL_STATUSES)) {
        return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
      }
      updateData.approval_status = body.approval_status;
    }

    // Validate and parse date fields
    const dateFields = [
      "date_of_birth",
      "identification_date",
      "last_review_date",
      "next_review_date",
      "edd_completed_date",
      "approved_at",
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

    // Boolean field
    if (body.edd_completed !== undefined) {
      updateData.edd_completed = Boolean(body.edd_completed);
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse("No valid fields to update");
    }

    const record = await updatePEPRecord(id, updateData);

    if (!record) {
      return notFoundResponse("PEP record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating PEP record");
    return serverErrorResponse("Failed to update PEP record");
  }
}

// DELETE /api/registers/pep/[id] - Delete a PEP record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pep-delete-${clientIp}`, {
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

    // Validate UUID format
    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getPEPRecord(id);
    if (!existingRecord) {
      return notFoundResponse("PEP record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deletePEPRecord(id);

    if (!deleted) {
      return notFoundResponse("PEP record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting PEP record");
    return serverErrorResponse("Failed to delete PEP record");
  }
}
