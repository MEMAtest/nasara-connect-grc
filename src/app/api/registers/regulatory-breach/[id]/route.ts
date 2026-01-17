import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegulatoryBreachRecord,
  updateRegulatoryBreachRecord,
  deleteRegulatoryBreachRecord,
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
  verifyRecordOwnership,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

const BREACH_TYPES = [
  "conduct", "prudential", "aml", "data_protection", "consumer_duty",
  "reporting", "operational", "governance", "other"
] as const;
const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["open", "investigating", "remediation", "closed", "reported"] as const;
const REMEDIATION_STATUSES = ["pending", "in_progress", "completed", "overdue"] as const;

// GET /api/registers/regulatory-breach/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid record ID format");
    }

    const record = await getRegulatoryBreachRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching regulatory breach record");
    return serverErrorResponse("Failed to fetch regulatory breach record");
  }
}

// PATCH /api/registers/regulatory-breach/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-breach-patch-${clientIp}`);
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
      return badRequestResponse("Invalid record ID format");
    }

    // First, fetch the record to verify ownership
    const existingRecord = await getRegulatoryBreachRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.breach_type && !isValidEnum(body.breach_type, BREACH_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid breach type. Must be one of: ${BREACH_TYPES.join(", ")}`);
    }

    if (body.severity && !isValidEnum(body.severity, SEVERITIES as unknown as string[])) {
      return badRequestResponse(`Invalid severity. Must be one of: ${SEVERITIES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    if (body.remediation_status && !isValidEnum(body.remediation_status, REMEDIATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid remediation status. Must be one of: ${REMEDIATION_STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.breach_reference !== undefined) updateData.breach_reference = sanitizeString(body.breach_reference);
    if (body.breach_title !== undefined) updateData.breach_title = sanitizeString(body.breach_title);
    if (body.breach_type !== undefined) updateData.breach_type = body.breach_type;
    if (body.regulatory_rule !== undefined) updateData.regulatory_rule = sanitizeString(body.regulatory_rule);
    if (body.regulator !== undefined) updateData.regulator = sanitizeString(body.regulator);
    if (body.identified_date !== undefined) updateData.identified_date = parseValidDate(body.identified_date);
    if (body.identified_by !== undefined) updateData.identified_by = sanitizeString(body.identified_by);
    if (body.breach_description !== undefined) updateData.breach_description = sanitizeText(body.breach_description);
    if (body.root_cause !== undefined) updateData.root_cause = sanitizeText(body.root_cause);
    if (body.impact_assessment !== undefined) updateData.impact_assessment = sanitizeText(body.impact_assessment);
    if (body.customers_affected !== undefined) updateData.customers_affected = parseInt(body.customers_affected);
    if (body.financial_impact !== undefined) updateData.financial_impact = parseFloat(body.financial_impact);
    if (body.severity !== undefined) updateData.severity = body.severity;
    if (body.reported_to_regulator !== undefined) updateData.reported_to_regulator = body.reported_to_regulator;
    if (body.report_date !== undefined) updateData.report_date = parseValidDate(body.report_date);
    if (body.regulator_reference !== undefined) updateData.regulator_reference = sanitizeString(body.regulator_reference);
    if (body.remediation_plan !== undefined) updateData.remediation_plan = sanitizeText(body.remediation_plan);
    if (body.remediation_deadline !== undefined) updateData.remediation_deadline = parseValidDate(body.remediation_deadline);
    if (body.remediation_status !== undefined) updateData.remediation_status = body.remediation_status;
    if (body.lessons_learned !== undefined) updateData.lessons_learned = sanitizeText(body.lessons_learned);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.closed_date !== undefined) updateData.closed_date = parseValidDate(body.closed_date);
    if (body.closed_by !== undefined) updateData.closed_by = sanitizeString(body.closed_by);
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateRegulatoryBreachRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating regulatory breach record");
    return serverErrorResponse("Failed to update regulatory breach record");
  }
}

// DELETE /api/registers/regulatory-breach/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-breach-delete-${clientIp}`);
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
      return badRequestResponse("Invalid record ID format");
    }

    // First, fetch the record to verify ownership
    const existingRecord = await getRegulatoryBreachRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteRegulatoryBreachRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting regulatory breach record");
    return serverErrorResponse("Failed to delete regulatory breach record");
  }
}
