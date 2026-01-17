import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getTxMonitoringRecords,
  createTxMonitoringRecord,
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

const ALERT_TYPES = ["high_value", "unusual_pattern", "structuring", "rapid_movement", "dormant_account", "geographic", "other"] as const;
const ALERT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const INVESTIGATION_OUTCOMES = ["cleared", "sar_filed", "account_closed", "enhanced_monitoring", "pending"] as const;
const STATUSES = ["open", "assigned", "investigating", "escalated", "closed"] as const;

// GET /api/registers/tx-monitoring - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tx-monitoring-get-${clientIp}`);
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
    const records = await getTxMonitoringRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching tx monitoring records");
    return serverErrorResponse("Failed to fetch tx monitoring records");
  }
}

// POST /api/registers/tx-monitoring - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tx-monitoring-post-${clientIp}`, {
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
    const alertReference = sanitizeString(body.alert_reference);
    if (!alertReference) {
      return badRequestResponse("Alert reference is required");
    }

    const customerName = sanitizeString(body.customer_name);
    if (!customerName) {
      return badRequestResponse("Customer name is required");
    }

    const alertType = body.alert_type || "other";
    if (!isValidEnum(alertType, ALERT_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid alert type. Must be one of: ${ALERT_TYPES.join(", ")}`);
    }

    const alertSeverity = body.alert_severity || "medium";
    if (!isValidEnum(alertSeverity, ALERT_SEVERITIES as unknown as string[])) {
      return badRequestResponse(`Invalid alert severity. Must be one of: ${ALERT_SEVERITIES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const investigationOutcome = body.investigation_outcome || "pending";
    if (!isValidEnum(investigationOutcome, INVESTIGATION_OUTCOMES as unknown as string[])) {
      return badRequestResponse(`Invalid investigation outcome. Must be one of: ${INVESTIGATION_OUTCOMES.join(", ")}`);
    }

    const status = body.status || "open";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      alert_reference: alertReference,
      alert_date: parseValidDate(body.alert_date) || new Date(),
      alert_type: alertType,
      alert_severity: alertSeverity,
      customer_id: sanitizeString(body.customer_id) || undefined,
      customer_name: customerName,
      account_number: sanitizeString(body.account_number) || undefined,
      transaction_amount: body.transaction_amount ? parseFloat(body.transaction_amount) : undefined,
      transaction_currency: sanitizeString(body.transaction_currency) || undefined,
      transaction_date: parseValidDate(body.transaction_date) || undefined,
      alert_description: sanitizeText(body.alert_description) || undefined,
      rule_triggered: sanitizeString(body.rule_triggered) || undefined,
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      assigned_date: parseValidDate(body.assigned_date) || undefined,
      investigation_start_date: parseValidDate(body.investigation_start_date) || undefined,
      investigation_end_date: parseValidDate(body.investigation_end_date) || undefined,
      investigation_notes: sanitizeText(body.investigation_notes) || undefined,
      investigation_outcome: investigationOutcome,
      escalated: body.escalated || false,
      escalated_to: sanitizeString(body.escalated_to) || undefined,
      escalated_date: parseValidDate(body.escalated_date) || undefined,
      sar_reference: sanitizeString(body.sar_reference) || undefined,
      sar_filed_date: parseValidDate(body.sar_filed_date) || undefined,
      status: status,
      closed_date: parseValidDate(body.closed_date) || undefined,
      closed_by: sanitizeString(body.closed_by) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createTxMonitoringRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating tx monitoring record");
    return serverErrorResponse("Failed to create tx monitoring record");
  }
}
