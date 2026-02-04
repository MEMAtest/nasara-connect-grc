import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getOpResilienceRecords,
  createOpResilienceRecord,
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
} from "@/lib/api-auth";
import { notifyRegisterCreated } from "@/lib/server/notification-builders";
import { logError } from "@/lib/logger";

const SCENARIO_TEST_RESULTS = ["passed", "failed", "partial", "not_tested"] as const;
const REMEDIATION_STATUSES = ["pending", "in_progress", "completed", "deferred"] as const;
const STATUSES = ["active", "under_review", "deprecated"] as const;

// GET /api/registers/op-resilience - List all records
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const organizationId = authResult.user.organizationId;
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getOpResilienceRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching operational resilience records");
    return NextResponse.json(
      { error: "Failed to fetch operational resilience records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/op-resilience - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`op-resilience-post-${clientIp}`);
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
    const serviceReference = sanitizeString(body.service_reference);
    if (!serviceReference) {
      return NextResponse.json(
        { error: "Service reference is required" },
        { status: 400 }
      );
    }

    const serviceName = sanitizeString(body.service_name);
    if (!serviceName) {
      return NextResponse.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    // Validate enum fields if provided
    if (body.scenario_test_result && !isValidEnum(body.scenario_test_result, SCENARIO_TEST_RESULTS as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid scenario test result. Must be one of: ${SCENARIO_TEST_RESULTS.join(", ")}` },
        { status: 400 }
      );
    }

    const remediationStatus = body.remediation_status || "pending";
    if (!isValidEnum(remediationStatus, REMEDIATION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid remediation status. Must be one of: ${REMEDIATION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "active";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      service_reference: serviceReference,
      service_name: serviceName,
      service_description: sanitizeText(body.service_description) || undefined,
      service_owner: sanitizeString(body.service_owner) || undefined,
      is_important_business_service: body.is_important_business_service || false,
      impact_tolerance_defined: body.impact_tolerance_defined || false,
      impact_tolerance_description: sanitizeText(body.impact_tolerance_description) || undefined,
      max_tolerable_disruption: sanitizeString(body.max_tolerable_disruption) || undefined,
      dependencies: body.dependencies || undefined,
      third_party_dependencies: body.third_party_dependencies || undefined,
      last_scenario_test_date: parseValidDate(body.last_scenario_test_date) || undefined,
      scenario_test_result: body.scenario_test_result || undefined,
      scenario_test_findings: sanitizeText(body.scenario_test_findings) || undefined,
      vulnerabilities_identified: sanitizeText(body.vulnerabilities_identified) || undefined,
      remediation_plan: sanitizeText(body.remediation_plan) || undefined,
      remediation_deadline: parseValidDate(body.remediation_deadline) || undefined,
      remediation_status: remediationStatus,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createOpResilienceRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "op-resilience",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating operational resilience record");
    return NextResponse.json(
      { error: "Failed to create operational resilience record" },
      { status: 500 }
    );
  }
}
