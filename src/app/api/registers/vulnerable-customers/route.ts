import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getVulnerableCustomerRecords,
  createVulnerableCustomerRecord,
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

const VULNERABILITY_TYPES = [
  "health", "life_events", "capability", "financial", "age", "mental_health", "other"
] as const;

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["active", "monitoring", "resolved", "closed"] as const;
const REVIEW_FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual", "ad_hoc"] as const;

// GET /api/registers/vulnerable-customers - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`vulnerable-customers-get-${clientIp}`);
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
    const records = await getVulnerableCustomerRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching vulnerable customer records");
    return serverErrorResponse("Failed to fetch vulnerable customer records");
  }
}

// POST /api/registers/vulnerable-customers - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`vulnerable-customers-post-${clientIp}`, {
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
    const customerReference = sanitizeString(body.customer_reference);
    if (!customerReference) {
      return badRequestResponse("Customer reference is required");
    }

    const vulnerabilityType = body.vulnerability_type || "other";
    if (!isValidEnum(vulnerabilityType, VULNERABILITY_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid vulnerability type. Must be one of: ${VULNERABILITY_TYPES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const riskLevel = body.risk_level || "medium";
    if (!isValidEnum(riskLevel, RISK_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid risk level. Must be one of: ${RISK_LEVELS.join(", ")}`);
    }

    const status = body.status || "active";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const reviewFrequency = body.review_frequency || "quarterly";
    if (!isValidEnum(reviewFrequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      customer_reference: customerReference,
      customer_name: sanitizeString(body.customer_name) || undefined,
      vulnerability_type: vulnerabilityType,
      vulnerability_details: sanitizeText(body.vulnerability_details) || undefined,
      identified_date: parseValidDate(body.identified_date) || new Date(),
      identified_by: sanitizeString(body.identified_by) || undefined,
      risk_level: riskLevel,
      support_measures: sanitizeText(body.support_measures) || undefined,
      review_frequency: reviewFrequency,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      last_review_date: parseValidDate(body.last_review_date) || undefined,
      status: status,
      outcome_notes: sanitizeText(body.outcome_notes) || undefined,
      closed_date: parseValidDate(body.closed_date) || undefined,
      closed_by: sanitizeString(body.closed_by) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createVulnerableCustomerRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating vulnerable customer record");
    return serverErrorResponse("Failed to create vulnerable customer record");
  }
}
