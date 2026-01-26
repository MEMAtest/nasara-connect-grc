import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getEddCaseRecords,
  createEddCaseRecord,
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

const EDD_TRIGGERS = [
  "pep", "high_risk_country", "complex_structure", "high_value",
  "sanctions_alert", "adverse_media", "unusual_activity", "referral", "other"
] as const;
const MONITORING_LEVELS = ["standard", "enhanced", "intensive"] as const;
const REVIEW_FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual"] as const;
const STATUSES = ["open", "under_review", "closed", "escalated"] as const;
const DECISIONS = ["pending", "approved", "rejected", "terminated", "exited"] as const;

// GET /api/registers/edd-cases - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`edd-cases-get-${clientIp}`);
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

    const records = await getEddCaseRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching EDD case records");
    return serverErrorResponse("Failed to fetch EDD case records");
  }
}

// POST /api/registers/edd-cases - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`edd-cases-post-${clientIp}`, {
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
    const caseReference = sanitizeString(body.case_reference);
    if (!caseReference) {
      return badRequestResponse("Case reference is required");
    }

    const customerReference = sanitizeString(body.customer_reference);
    if (!customerReference) {
      return badRequestResponse("Customer reference is required");
    }

    const customerName = sanitizeString(body.customer_name);
    if (!customerName) {
      return badRequestResponse("Customer name is required");
    }

    const eddTrigger = body.edd_trigger || "other";
    if (!isValidEnum(eddTrigger, EDD_TRIGGERS as unknown as string[])) {
      return badRequestResponse(`Invalid EDD trigger. Must be one of: ${EDD_TRIGGERS.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const monitoringLevel = body.ongoing_monitoring_level || "enhanced";
    if (!isValidEnum(monitoringLevel, MONITORING_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid monitoring level. Must be one of: ${MONITORING_LEVELS.join(", ")}`);
    }

    const reviewFrequency = body.review_frequency || "quarterly";
    if (!isValidEnum(reviewFrequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    const status = body.status || "open";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const decision = body.decision || "pending";
    if (!isValidEnum(decision, DECISIONS as unknown as string[])) {
      return badRequestResponse(`Invalid decision. Must be one of: ${DECISIONS.join(", ")}`);
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      case_reference: caseReference,
      customer_reference: customerReference,
      customer_name: customerName,
      edd_trigger: eddTrigger,
      trigger_description: sanitizeText(body.trigger_description) || undefined,
      trigger_date: parseValidDate(body.trigger_date) || new Date(),
      risk_factors: body.risk_factors || undefined,
      enhanced_measures: body.enhanced_measures || undefined,
      source_of_wealth_verified: body.source_of_wealth_verified || false,
      source_of_funds_verified: body.source_of_funds_verified || false,
      ongoing_monitoring_level: monitoringLevel,
      senior_management_approval: body.senior_management_approval || false,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      approval_rationale: sanitizeText(body.approval_rationale) || undefined,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      last_review_date: parseValidDate(body.last_review_date) || undefined,
      review_frequency: reviewFrequency,
      status: status,
      decision: decision,
      decision_rationale: sanitizeText(body.decision_rationale) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createEddCaseRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "edd-cases",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating EDD case record");
    return serverErrorResponse("Failed to create EDD case record");
  }
}
