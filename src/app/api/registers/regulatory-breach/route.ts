import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegulatoryBreachRecords,
  createRegulatoryBreachRecord,
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

const BREACH_TYPES = [
  "conduct", "prudential", "aml", "data_protection", "consumer_duty",
  "reporting", "operational", "governance", "other"
] as const;

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["open", "investigating", "remediation", "closed", "reported"] as const;
const REMEDIATION_STATUSES = ["pending", "in_progress", "completed", "overdue"] as const;

// GET /api/registers/regulatory-breach - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-breach-get-${clientIp}`);
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
    const records = await getRegulatoryBreachRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching regulatory breach records");
    return serverErrorResponse("Failed to fetch regulatory breach records");
  }
}

// POST /api/registers/regulatory-breach - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-breach-post-${clientIp}`, {
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
    const breachReference = sanitizeString(body.breach_reference);
    if (!breachReference) {
      return badRequestResponse("Breach reference is required");
    }

    const breachTitle = sanitizeString(body.breach_title);
    if (!breachTitle) {
      return badRequestResponse("Breach title is required");
    }

    const breachDescription = sanitizeText(body.breach_description);
    if (!breachDescription) {
      return badRequestResponse("Breach description is required");
    }

    const breachType = body.breach_type || "other";
    if (!isValidEnum(breachType, BREACH_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid breach type. Must be one of: ${BREACH_TYPES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const severity = body.severity || "medium";
    if (!isValidEnum(severity, SEVERITIES as unknown as string[])) {
      return badRequestResponse(`Invalid severity. Must be one of: ${SEVERITIES.join(", ")}`);
    }

    const status = body.status || "open";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const remediationStatus = body.remediation_status || "pending";
    if (!isValidEnum(remediationStatus, REMEDIATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid remediation status. Must be one of: ${REMEDIATION_STATUSES.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      breach_reference: breachReference,
      breach_title: breachTitle,
      breach_type: breachType,
      regulatory_rule: sanitizeString(body.regulatory_rule) || undefined,
      regulator: sanitizeString(body.regulator) || undefined,
      identified_date: parseValidDate(body.identified_date) || new Date(),
      identified_by: sanitizeString(body.identified_by) || undefined,
      breach_description: breachDescription,
      root_cause: sanitizeText(body.root_cause) || undefined,
      impact_assessment: sanitizeText(body.impact_assessment) || undefined,
      customers_affected: parseInt(body.customers_affected) || 0,
      financial_impact: parseFloat(body.financial_impact) || undefined,
      severity: severity,
      reported_to_regulator: body.reported_to_regulator || false,
      report_date: parseValidDate(body.report_date) || undefined,
      regulator_reference: sanitizeString(body.regulator_reference) || undefined,
      remediation_plan: sanitizeText(body.remediation_plan) || undefined,
      remediation_deadline: parseValidDate(body.remediation_deadline) || undefined,
      remediation_status: remediationStatus,
      lessons_learned: sanitizeText(body.lessons_learned) || undefined,
      status: status,
      closed_date: parseValidDate(body.closed_date) || undefined,
      closed_by: sanitizeString(body.closed_by) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createRegulatoryBreachRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "regulatory-breach",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating regulatory breach record");
    return serverErrorResponse("Failed to create regulatory breach record");
  }
}
