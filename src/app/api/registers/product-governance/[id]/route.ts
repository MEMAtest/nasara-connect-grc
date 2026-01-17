import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getProductGovernanceRecord,
  updateProductGovernanceRecord,
  deleteProductGovernanceRecord,
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

const PRODUCT_TYPES = ["investment", "insurance", "credit", "payment", "deposit", "other"] as const;
const RISK_PROFILES = ["low", "medium", "high"] as const;
const REVIEW_FREQUENCIES = ["quarterly", "semi_annual", "annual", "biennial"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "withdrawn"] as const;
const STATUSES = ["draft", "approved", "live", "withdrawn", "discontinued"] as const;

// GET /api/registers/product-governance/[id] - Get a single record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`product-governance-get-${clientIp}`);
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

    const record = await getProductGovernanceRecord(id);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching product governance record");
    return serverErrorResponse("Failed to fetch product governance record");
  }
}

// PATCH /api/registers/product-governance/[id] - Update a record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`product-governance-patch-${clientIp}`);
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
    const existingRecord = await getProductGovernanceRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to modify this record");
    }

    const body = await request.json();

    // Validate enum fields if provided
    if (body.product_type && !isValidEnum(body.product_type, PRODUCT_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid product type. Must be one of: ${PRODUCT_TYPES.join(", ")}`);
    }

    if (body.risk_profile && !isValidEnum(body.risk_profile, RISK_PROFILES as unknown as string[])) {
      return badRequestResponse(`Invalid risk profile. Must be one of: ${RISK_PROFILES.join(", ")}`);
    }

    if (body.review_frequency && !isValidEnum(body.review_frequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return badRequestResponse(`Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}`);
    }

    if (body.approval_status && !isValidEnum(body.approval_status, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    if (body.status && !isValidEnum(body.status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const updateData: Record<string, unknown> = {};

    if (body.product_reference !== undefined) updateData.product_reference = sanitizeString(body.product_reference);
    if (body.product_name !== undefined) updateData.product_name = sanitizeString(body.product_name);
    if (body.product_type !== undefined) updateData.product_type = body.product_type;
    if (body.product_description !== undefined) updateData.product_description = sanitizeText(body.product_description);
    if (body.target_market !== undefined) updateData.target_market = sanitizeText(body.target_market);
    if (body.distribution_channels !== undefined) updateData.distribution_channels = body.distribution_channels;
    if (body.risk_profile !== undefined) updateData.risk_profile = body.risk_profile;
    if (body.key_risks !== undefined) updateData.key_risks = sanitizeText(body.key_risks);
    if (body.manufacturer !== undefined) updateData.manufacturer = sanitizeString(body.manufacturer);
    if (body.manufacturer_country !== undefined) updateData.manufacturer_country = sanitizeString(body.manufacturer_country);
    if (body.launch_date !== undefined) updateData.launch_date = parseValidDate(body.launch_date);
    if (body.last_review_date !== undefined) updateData.last_review_date = parseValidDate(body.last_review_date);
    if (body.next_review_date !== undefined) updateData.next_review_date = parseValidDate(body.next_review_date);
    if (body.review_frequency !== undefined) updateData.review_frequency = body.review_frequency;
    if (body.product_owner !== undefined) updateData.product_owner = sanitizeString(body.product_owner);
    if (body.compliance_owner !== undefined) updateData.compliance_owner = sanitizeString(body.compliance_owner);
    if (body.approval_status !== undefined) updateData.approval_status = body.approval_status;
    if (body.approved_by !== undefined) updateData.approved_by = sanitizeString(body.approved_by);
    if (body.approval_date !== undefined) updateData.approval_date = parseValidDate(body.approval_date);
    if (body.regulatory_requirements !== undefined) updateData.regulatory_requirements = sanitizeText(body.regulatory_requirements);
    if (body.consumer_duty_assessment !== undefined) updateData.consumer_duty_assessment = sanitizeText(body.consumer_duty_assessment);
    if (body.value_assessment !== undefined) updateData.value_assessment = sanitizeText(body.value_assessment);
    if (body.fair_value_statement !== undefined) updateData.fair_value_statement = sanitizeText(body.fair_value_statement);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = sanitizeText(body.notes);

    const record = await updateProductGovernanceRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating product governance record");
    return serverErrorResponse("Failed to update product governance record");
  }
}

// DELETE /api/registers/product-governance/[id] - Delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`product-governance-delete-${clientIp}`);
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
    const existingRecord = await getProductGovernanceRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Record not found");
    }

    // IDOR Protection: Verify the record belongs to user's organization
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to delete this record");
    }

    const deleted = await deleteProductGovernanceRecord(id);

    if (!deleted) {
      return notFoundResponse("Record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting product governance record");
    return serverErrorResponse("Failed to delete product governance record");
  }
}
