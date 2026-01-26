import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getSanctionsScreeningRecords,
  createSanctionsScreeningRecord,
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
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { notifyRegisterCreated } from "@/lib/server/notification-builders";
import { logError } from "@/lib/logger";

const ENTITY_TYPES = ["individual", "company", "organization", "vessel", "aircraft", "other"] as const;
const SCREENING_TYPES = ["onboarding", "periodic", "transaction", "ad_hoc", "pep", "adverse_media"] as const;
const DECISIONS = ["pending", "cleared", "match_confirmed", "escalated", "blocked"] as const;
const STATUSES = ["pending", "in_review", "completed", "escalated"] as const;

// GET /api/registers/sanctions - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sanctions-get-${clientIp}`);
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

    const records = await getSanctionsScreeningRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching sanctions screening records");
    return serverErrorResponse("Failed to fetch sanctions screening records");
  }
}

// POST /api/registers/sanctions - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sanctions-post-${clientIp}`, {
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
    const screeningReference = sanitizeString(body.screening_reference);
    if (!screeningReference) {
      return badRequestResponse("Screening reference is required");
    }

    const entityName = sanitizeString(body.entity_name);
    if (!entityName) {
      return badRequestResponse("Entity name is required");
    }

    const entityType = body.entity_type || "individual";
    if (!isValidEnum(entityType, ENTITY_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid entity type. Must be one of: ${ENTITY_TYPES.join(", ")}`);
    }

    const screeningType = body.screening_type || "onboarding";
    if (!isValidEnum(screeningType, SCREENING_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid screening type. Must be one of: ${SCREENING_TYPES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const decision = body.decision || "pending";
    if (!isValidEnum(decision, DECISIONS as unknown as string[])) {
      return badRequestResponse(`Invalid decision. Must be one of: ${DECISIONS.join(", ")}`);
    }

    const status = body.status || "pending";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      screening_reference: screeningReference,
      entity_type: entityType,
      entity_name: entityName,
      entity_dob: parseValidDate(body.entity_dob) || undefined,
      entity_country: sanitizeString(body.entity_country) || undefined,
      screening_date: parseValidDate(body.screening_date) || new Date(),
      screened_by: sanitizeString(body.screened_by) || undefined,
      screening_type: screeningType,
      lists_checked: body.lists_checked || undefined,
      match_found: body.match_found || false,
      match_details: sanitizeText(body.match_details) || undefined,
      match_score: body.match_score ? parseFloat(body.match_score) : undefined,
      false_positive: body.false_positive || false,
      false_positive_reason: sanitizeText(body.false_positive_reason) || undefined,
      escalated: body.escalated || false,
      escalated_to: sanitizeString(body.escalated_to) || undefined,
      escalated_date: parseValidDate(body.escalated_date) || undefined,
      decision: decision,
      decision_by: sanitizeString(body.decision_by) || undefined,
      decision_date: parseValidDate(body.decision_date) || undefined,
      decision_rationale: sanitizeText(body.decision_rationale) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createSanctionsScreeningRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "sanctions",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating sanctions screening record");
    return serverErrorResponse("Failed to create sanctions screening record");
  }
}
