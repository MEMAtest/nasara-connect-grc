import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getAmlCddRecords,
  createAmlCddRecord,
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

const CUSTOMER_TYPES = ["individual", "company", "trust", "partnership", "charity", "other"] as const;
const CDD_LEVELS = ["simplified", "standard", "enhanced"] as const;
const RISK_RATINGS = ["low", "medium", "high", "critical"] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VERIFICATION_STATUSES = ["pending", "in_progress", "completed", "failed", "expired"] as const;
const OVERALL_STATUSES = ["in_progress", "completed", "pending_review", "on_hold", "rejected"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "conditional"] as const;

// GET /api/registers/aml-cdd - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`aml-cdd-get-${clientIp}`);
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

    const records = await getAmlCddRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching AML CDD records");
    return serverErrorResponse("Failed to fetch AML CDD records");
  }
}

// POST /api/registers/aml-cdd - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`aml-cdd-post-${clientIp}`, {
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

    const customerName = sanitizeString(body.customer_name);
    if (!customerName) {
      return badRequestResponse("Customer name is required");
    }

    const customerType = body.customer_type || "individual";
    if (!isValidEnum(customerType, CUSTOMER_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid customer type. Must be one of: ${CUSTOMER_TYPES.join(", ")}`);
    }

    const cddLevel = body.cdd_level || "standard";
    if (!isValidEnum(cddLevel, CDD_LEVELS as unknown as string[])) {
      return badRequestResponse(`Invalid CDD level. Must be one of: ${CDD_LEVELS.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const riskRating = body.risk_rating || "medium";
    if (!isValidEnum(riskRating, RISK_RATINGS as unknown as string[])) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    const overallStatus = body.overall_status || "in_progress";
    if (!isValidEnum(overallStatus, OVERALL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid overall status. Must be one of: ${OVERALL_STATUSES.join(", ")}`);
    }

    const approvalStatus = body.approval_status || "pending";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      customer_reference: customerReference,
      customer_name: customerName,
      customer_type: customerType,
      onboarding_date: parseValidDate(body.onboarding_date) || undefined,
      cdd_level: cddLevel,
      risk_rating: riskRating,
      id_verification_status: body.id_verification_status || "pending",
      id_verification_date: parseValidDate(body.id_verification_date) || undefined,
      id_verification_method: sanitizeString(body.id_verification_method) || undefined,
      poa_verification_status: body.poa_verification_status || "pending",
      poa_verification_date: parseValidDate(body.poa_verification_date) || undefined,
      source_of_funds: sanitizeString(body.source_of_funds) || undefined,
      source_of_wealth: sanitizeString(body.source_of_wealth) || undefined,
      beneficial_owners: sanitizeText(body.beneficial_owners) || undefined,
      pep_check_status: body.pep_check_status || "pending",
      pep_check_date: parseValidDate(body.pep_check_date) || undefined,
      sanctions_check_status: body.sanctions_check_status || "pending",
      sanctions_check_date: parseValidDate(body.sanctions_check_date) || undefined,
      adverse_media_status: body.adverse_media_status || "pending",
      adverse_media_date: parseValidDate(body.adverse_media_date) || undefined,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      last_review_date: parseValidDate(body.last_review_date) || undefined,
      reviewer: sanitizeString(body.reviewer) || undefined,
      overall_status: overallStatus,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createAmlCddRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "aml-cdd",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating AML CDD record");
    return serverErrorResponse("Failed to create AML CDD record");
  }
}
