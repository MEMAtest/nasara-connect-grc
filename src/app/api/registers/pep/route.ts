import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPEPRecords,
  createPEPRecord,
  PEPRecord,
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
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

// GET /api/registers/pep - List all PEP records
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const packId = searchParams.get("packId") || undefined;

    // Validate packId if provided
    if (packId && !isValidUUID(packId)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const records = await getPEPRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching PEP records");
    return serverErrorResponse("Failed to fetch PEP records");
  }
}

// POST /api/registers/pep - Create a new PEP record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pep-post-${clientIp}`, {
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
    const fullName = sanitizeString(body.full_name);
    if (!fullName) {
      return badRequestResponse("Full name is required");
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    // Validate enum fields
    const pepType = body.pep_type || "customer";
    if (!isValidEnum(pepType, PEP_TYPES)) {
      return badRequestResponse(`Invalid PEP type. Must be one of: ${PEP_TYPES.join(", ")}`);
    }

    const pepCategory = body.pep_category || "pep";
    if (!isValidEnum(pepCategory, PEP_CATEGORIES)) {
      return badRequestResponse(`Invalid PEP category. Must be one of: ${PEP_CATEGORIES.join(", ")}`);
    }

    const riskRating = body.risk_rating || "high";
    if (!isValidEnum(riskRating, RISK_RATINGS)) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    const status = body.status || "active";
    if (!isValidEnum(status, PEP_STATUSES)) {
      return badRequestResponse(`Invalid status. Must be one of: ${PEP_STATUSES.join(", ")}`);
    }

    const approvalStatus = body.approval_status || "pending";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES)) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    // Parse and validate dates
    const identificationDate = parseValidDate(body.identification_date) || new Date();
    const dateOfBirth = parseValidDate(body.date_of_birth);
    const lastReviewDate = parseValidDate(body.last_review_date);
    const nextReviewDate = parseValidDate(body.next_review_date);
    const eddCompletedDate = parseValidDate(body.edd_completed_date);
    const approvedAt = parseValidDate(body.approved_at);

    const recordData: Omit<PEPRecord, "id" | "created_at" | "updated_at"> = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      pep_type: pepType,
      full_name: fullName,
      date_of_birth: dateOfBirth || undefined,
      nationality: sanitizeString(body.nationality) || undefined,
      position_held: sanitizeString(body.position_held) || undefined,
      pep_category: pepCategory,
      relationship_type: sanitizeString(body.relationship_type) || undefined,
      risk_rating: riskRating,
      status: status,
      identification_date: identificationDate,
      last_review_date: lastReviewDate || undefined,
      next_review_date: nextReviewDate || undefined,
      edd_completed: Boolean(body.edd_completed),
      edd_completed_date: eddCompletedDate || undefined,
      source_of_wealth: sanitizeText(body.source_of_wealth) || undefined,
      source_of_funds: sanitizeText(body.source_of_funds) || undefined,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approved_at: approvedAt || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createPEPRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating PEP record");
    return serverErrorResponse("Failed to create PEP record");
  }
}
