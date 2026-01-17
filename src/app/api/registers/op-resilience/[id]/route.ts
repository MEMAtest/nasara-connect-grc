import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getOpResilienceRecord,
  updateOpResilienceRecord,
  deleteOpResilienceRecord,
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

const SCENARIO_TEST_RESULTS = ["passed", "failed", "partial", "not_tested"] as const;
const REMEDIATION_STATUSES = ["pending", "in_progress", "completed", "deferred"] as const;
const STATUSES = ["active", "under_review", "deprecated"] as const;

// GET /api/registers/op-resilience/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`op-resilience-get-${clientIp}`);
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

    const record = await getOpResilienceRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching operational resilience record");
    return serverErrorResponse("Failed to fetch operational resilience record");
  }
}

// PATCH /api/registers/op-resilience/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`op-resilience-patch-${clientIp}`);
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
    const existingRecord = await getOpResilienceRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.scenario_test_result && !isValidEnum(body.scenario_test_result, SCENARIO_TEST_RESULTS as unknown as string[])) {
      return badRequestResponse(`Invalid scenario test result. Must be one of: ${SCENARIO_TEST_RESULTS.join(", ")}`);
    }

    if (body.remediation_status && !isValidEnum(body.remediation_status, REMEDIATION_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid remediation status. Must be one of: ${REMEDIATION_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.service_reference !== undefined) updateData.service_reference = sanitizeString(body.service_reference);
    if (body.service_name !== undefined) updateData.service_name = sanitizeString(body.service_name);
    if (body.service_description !== undefined) updateData.service_description = sanitizeText(body.service_description);
    if (body.service_owner !== undefined) updateData.service_owner = sanitizeString(body.service_owner);
    if (body.is_important_business_service !== undefined) updateData.is_important_business_service = body.is_important_business_service;
    if (body.impact_tolerance_defined !== undefined) updateData.impact_tolerance_defined = body.impact_tolerance_defined;
    if (body.impact_tolerance_description !== undefined) updateData.impact_tolerance_description = sanitizeText(body.impact_tolerance_description);
    if (body.max_tolerable_disruption !== undefined) updateData.max_tolerable_disruption = sanitizeString(body.max_tolerable_disruption);
    if (body.dependencies !== undefined) updateData.dependencies = body.dependencies;
    if (body.third_party_dependencies !== undefined) updateData.third_party_dependencies = body.third_party_dependencies;
    if (body.last_scenario_test_date !== undefined) updateData.last_scenario_test_date = parseValidDate(body.last_scenario_test_date);
    if (body.scenario_test_result !== undefined) updateData.scenario_test_result = body.scenario_test_result;
    if (body.scenario_test_findings !== undefined) updateData.scenario_test_findings = sanitizeText(body.scenario_test_findings);
    if (body.vulnerabilities_identified !== undefined) updateData.vulnerabilities_identified = sanitizeText(body.vulnerabilities_identified);
    if (body.remediation_plan !== undefined) updateData.remediation_plan = sanitizeText(body.remediation_plan);
    if (body.remediation_deadline !== undefined) updateData.remediation_deadline = parseValidDate(body.remediation_deadline);
    if (body.remediation_status !== undefined) updateData.remediation_status = body.remediation_status;
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateOpResilienceRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating operational resilience record");
    return serverErrorResponse("Failed to update operational resilience record");
  }
}

// DELETE /api/registers/op-resilience/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`op-resilience-delete-${clientIp}`);
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
    const existingRecord = await getOpResilienceRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteOpResilienceRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting operational resilience record");
    return serverErrorResponse("Failed to delete operational resilience record");
  }
}
