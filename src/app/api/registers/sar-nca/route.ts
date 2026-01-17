import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getSarNcaRecords,
  createSarNcaRecord,
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
import { logError } from "@/lib/logger";

const SUBJECT_TYPES = ["individual", "company", "trust", "other"] as const;
const SUSPICION_TYPES = ["money_laundering", "terrorist_financing", "fraud", "tax_evasion", "sanctions_breach", "other"] as const;
const MLRO_DECISIONS = ["pending", "submit_sar", "no_sar", "escalate"] as const;
const STATUSES = ["draft", "under_review", "submitted", "consent_pending", "closed"] as const;

// GET /api/registers/sar-nca - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sar-nca-get-${clientIp}`);
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

    // Use authenticated user's organization ID (IDOR protection)
    const records = await getSarNcaRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching SAR-NCA records");
    return serverErrorResponse("Failed to fetch SAR-NCA records");
  }
}

// POST /api/registers/sar-nca - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`sar-nca-post-${clientIp}`, {
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
    const sarReference = sanitizeString(body.sar_reference);
    if (!sarReference) {
      return badRequestResponse("SAR reference is required");
    }

    const subjectName = sanitizeString(body.subject_name);
    if (!subjectName) {
      return badRequestResponse("Subject name is required");
    }

    const subjectType = body.subject_type || "individual";
    if (!isValidEnum(subjectType, SUBJECT_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid subject type. Must be one of: ${SUBJECT_TYPES.join(", ")}`);
    }

    const suspicionType = body.suspicion_type || "money_laundering";
    if (!isValidEnum(suspicionType, SUSPICION_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid suspicion type. Must be one of: ${SUSPICION_TYPES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const mlroDecision = body.mlro_decision || "pending";
    if (!isValidEnum(mlroDecision, MLRO_DECISIONS as unknown as string[])) {
      return badRequestResponse(`Invalid MLRO decision. Must be one of: ${MLRO_DECISIONS.join(", ")}`);
    }

    const status = body.status || "draft";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      sar_reference: sarReference,
      internal_reference: sanitizeString(body.internal_reference) || undefined,
      subject_name: subjectName,
      subject_type: subjectType,
      suspicion_type: suspicionType,
      suspicion_description: sanitizeText(body.suspicion_description) || undefined,
      discovery_date: parseValidDate(body.discovery_date) || undefined,
      reporter: sanitizeString(body.reporter) || undefined,
      mlro_review_date: parseValidDate(body.mlro_review_date) || undefined,
      mlro_decision: mlroDecision,
      mlro_rationale: sanitizeText(body.mlro_rationale) || undefined,
      submitted_to_nca: body.submitted_to_nca || false,
      nca_submission_date: parseValidDate(body.nca_submission_date) || undefined,
      nca_reference: sanitizeString(body.nca_reference) || undefined,
      consent_required: body.consent_required || false,
      consent_requested_date: parseValidDate(body.consent_requested_date) || undefined,
      consent_received: body.consent_received || false,
      consent_received_date: parseValidDate(body.consent_received_date) || undefined,
      consent_expiry_date: parseValidDate(body.consent_expiry_date) || undefined,
      daml_requested: body.daml_requested || false,
      daml_reference: sanitizeString(body.daml_reference) || undefined,
      status: status,
      outcome: sanitizeText(body.outcome) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createSarNcaRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating SAR-NCA record");
    return serverErrorResponse("Failed to create SAR-NCA record");
  }
}
