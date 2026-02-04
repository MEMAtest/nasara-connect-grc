import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getCOIRecord,
  updateCOIRecord,
  deleteCOIRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  CONFLICT_TYPES,
  COI_STATUSES,
  RISK_RATINGS,
  REVIEW_FREQUENCIES,
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

// GET /api/registers/conflicts/[id] - Get a single COI record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`conflicts-get-${clientIp}`);
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

    const record = await getCOIRecord(id);

    if (!record) {
      return notFoundResponse("COI record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching COI record");
    return serverErrorResponse("Failed to fetch COI record");
  }
}

// PATCH /api/registers/conflicts/[id] - Update a COI record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`conflicts-patch-${clientIp}`, {
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
    const existingRecord = await getCOIRecord(id);
    if (!existingRecord) {
      return notFoundResponse("COI record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // String fields
    if (body.declarant_name !== undefined) {
      const name = sanitizeString(body.declarant_name);
      if (!name) {
        return badRequestResponse("Declarant name cannot be empty");
      }
      updateData.declarant_name = name;
    }

    if (body.description !== undefined) {
      const desc = sanitizeText(body.description);
      if (!desc) {
        return badRequestResponse("Description cannot be empty");
      }
      updateData.description = desc;
    }

    if (body.declarant_role !== undefined) {
      updateData.declarant_role = sanitizeString(body.declarant_role) || null;
    }

    const textFields = ["parties_involved", "potential_impact", "mitigation_measures", "notes"];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeText(body[field]) || null;
      }
    }

    if (body.approved_by !== undefined) {
      updateData.approved_by = sanitizeString(body.approved_by) || null;
    }

    // Enum fields
    if (body.conflict_type !== undefined) {
      if (!isValidEnum(body.conflict_type, CONFLICT_TYPES)) {
        return badRequestResponse(`Invalid conflict type. Must be one of: ${CONFLICT_TYPES.join(", ")}`);
      }
      updateData.conflict_type = body.conflict_type;
    }

    if (body.risk_rating !== undefined) {
      if (!isValidEnum(body.risk_rating, RISK_RATINGS)) {
        return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
      }
      updateData.risk_rating = body.risk_rating;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, COI_STATUSES)) {
        return badRequestResponse(`Invalid status. Must be one of: ${COI_STATUSES.join(", ")}`);
      }
      updateData.status = body.status;
    }

    if (body.review_frequency !== undefined) {
      if (!isValidEnum(body.review_frequency, REVIEW_FREQUENCIES)) {
        return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
      }
      updateData.review_frequency = body.review_frequency;
    }

    // Date fields
    const dateFields = ["declaration_date", "last_review_date", "next_review_date", "approved_at"];
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

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse("No valid fields to update");
    }

    const record = await updateCOIRecord(id, updateData);

    if (!record) {
      return notFoundResponse("COI record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating COI record");
    return serverErrorResponse("Failed to update COI record");
  }
}

// DELETE /api/registers/conflicts/[id] - Delete a COI record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`conflicts-delete-${clientIp}`, {
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
    const existingRecord = await getCOIRecord(id);
    if (!existingRecord) {
      return notFoundResponse("COI record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, auth.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteCOIRecord(id);

    if (!deleted) {
      return notFoundResponse("COI record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting COI record");
    return serverErrorResponse("Failed to delete COI record");
  }
}
