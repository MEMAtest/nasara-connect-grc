import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getPaDealingRecords,
  createPaDealingRecord,
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

const REQUEST_TYPES = ["buy", "sell", "transfer"] as const;
const INSTRUMENT_TYPES = ["equity", "bond", "fund", "etf", "derivative", "crypto", "other"] as const;
const PRE_CLEARANCE_STATUSES = ["pending", "approved", "rejected", "expired"] as const;
const STATUSES = ["pending", "approved", "executed", "cancelled", "expired"] as const;

// GET /api/registers/pa-dealing - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pa-dealing-get-${clientIp}`);
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
    const records = await getPaDealingRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching PA dealing records");
    return serverErrorResponse("Failed to fetch PA dealing records");
  }
}

// POST /api/registers/pa-dealing - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`pa-dealing-post-${clientIp}`, {
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
    const requestReference = sanitizeString(body.request_reference);
    if (!requestReference) {
      return badRequestResponse("Request reference is required");
    }

    const employeeName = sanitizeString(body.employee_name);
    if (!employeeName) {
      return badRequestResponse("Employee name is required");
    }

    const requestType = body.request_type || "buy";
    if (!isValidEnum(requestType, REQUEST_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid request type. Must be one of: ${REQUEST_TYPES.join(", ")}`);
    }

    const instrumentType = body.instrument_type || "equity";
    if (!isValidEnum(instrumentType, INSTRUMENT_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid instrument type. Must be one of: ${INSTRUMENT_TYPES.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const preClearanceStatus = body.pre_clearance_status || "pending";
    if (!isValidEnum(preClearanceStatus, PRE_CLEARANCE_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid pre-clearance status. Must be one of: ${PRE_CLEARANCE_STATUSES.join(", ")}`);
    }

    const status = body.status || "pending";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      request_reference: requestReference,
      employee_name: employeeName,
      employee_id: sanitizeString(body.employee_id) || undefined,
      request_type: requestType,
      instrument_type: instrumentType,
      instrument_name: sanitizeString(body.instrument_name) || undefined,
      isin: sanitizeString(body.isin) || undefined,
      quantity: body.quantity ? parseInt(body.quantity) : undefined,
      estimated_value: body.estimated_value ? parseFloat(body.estimated_value) : undefined,
      currency: sanitizeString(body.currency) || undefined,
      broker_account: sanitizeString(body.broker_account) || undefined,
      reason_for_trade: sanitizeText(body.reason_for_trade) || undefined,
      request_date: parseValidDate(body.request_date) || new Date(),
      pre_clearance_status: preClearanceStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      approval_conditions: sanitizeText(body.approval_conditions) || undefined,
      execution_date: parseValidDate(body.execution_date) || undefined,
      execution_price: body.execution_price ? parseFloat(body.execution_price) : undefined,
      holding_period_end: parseValidDate(body.holding_period_end) || undefined,
      restricted_list_check: body.restricted_list_check || false,
      conflict_check: body.conflict_check || false,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createPaDealingRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating PA dealing record");
    return serverErrorResponse("Failed to create PA dealing record");
  }
}
