import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getCOIRecords,
  createCOIRecord,
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
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { notifyRegisterCreated } from "@/lib/server/notification-builders";
import { logError } from "@/lib/logger";

// GET /api/registers/conflicts - List all COI records
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const records = await getCOIRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching COI records");
    return serverErrorResponse("Failed to fetch COI records");
  }
}

// POST /api/registers/conflicts - Create a new COI record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`conflicts-post-${clientIp}`, {
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

    const body = await request.json();

    // Validate required fields
    const declarantName = sanitizeString(body.declarant_name);
    if (!declarantName) {
      return badRequestResponse("Declarant name is required");
    }

    const description = sanitizeText(body.description);
    if (!description) {
      return badRequestResponse("Description is required");
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    // Validate enum fields
    const conflictType = body.conflict_type || "other";
    if (!isValidEnum(conflictType, CONFLICT_TYPES)) {
      return badRequestResponse(`Invalid conflict type. Must be one of: ${CONFLICT_TYPES.join(", ")}`);
    }

    const riskRating = body.risk_rating || "medium";
    if (!isValidEnum(riskRating, RISK_RATINGS)) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    const status = body.status || "active";
    if (!isValidEnum(status, COI_STATUSES)) {
      return badRequestResponse(`Invalid status. Must be one of: ${COI_STATUSES.join(", ")}`);
    }

    const reviewFrequency = body.review_frequency || "annual";
    if (!isValidEnum(reviewFrequency, REVIEW_FREQUENCIES)) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    // Parse dates
    const declarationDate = parseValidDate(body.declaration_date) || new Date();
    const lastReviewDate = parseValidDate(body.last_review_date);
    const nextReviewDate = parseValidDate(body.next_review_date);
    const approvedAt = parseValidDate(body.approved_at);

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      declarant_name: declarantName,
      declarant_role: sanitizeString(body.declarant_role) || undefined,
      declaration_date: declarationDate,
      conflict_type: conflictType as typeof CONFLICT_TYPES[number],
      description: description,
      parties_involved: sanitizeText(body.parties_involved) || undefined,
      potential_impact: sanitizeText(body.potential_impact) || undefined,
      mitigation_measures: sanitizeText(body.mitigation_measures) || undefined,
      review_frequency: reviewFrequency as typeof REVIEW_FREQUENCIES[number],
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      risk_rating: riskRating as typeof RISK_RATINGS[number],
      status: status as typeof COI_STATUSES[number],
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createCOIRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "conflicts",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating COI record");
    return serverErrorResponse("Failed to create COI record");
  }
}
