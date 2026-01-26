import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getProductGovernanceRecords,
  createProductGovernanceRecord,
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

const PRODUCT_TYPES = ["investment", "insurance", "credit", "payment", "deposit", "other"] as const;
const RISK_PROFILES = ["low", "medium", "high"] as const;
const REVIEW_FREQUENCIES = ["quarterly", "semi_annual", "annual", "biennial"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "withdrawn"] as const;
const STATUSES = ["draft", "approved", "live", "withdrawn", "discontinued"] as const;

// GET /api/registers/product-governance - List all records
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const organizationId = authResult.user.organizationId;
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getProductGovernanceRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching product governance records");
    return NextResponse.json(
      { error: "Failed to fetch product governance records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/product-governance - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`product-governance-post-${clientIp}`);
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
    const productReference = sanitizeString(body.product_reference);
    if (!productReference) {
      return NextResponse.json(
        { error: "Product reference is required" },
        { status: 400 }
      );
    }

    const productName = sanitizeString(body.product_name);
    if (!productName) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const productType = body.product_type || "other";
    if (!isValidEnum(productType, PRODUCT_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid product type. Must be one of: ${PRODUCT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const riskProfile = body.risk_profile || "medium";
    if (!isValidEnum(riskProfile, RISK_PROFILES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid risk profile. Must be one of: ${RISK_PROFILES.join(", ")}` },
        { status: 400 }
      );
    }

    const reviewFrequency = body.review_frequency || "annual";
    if (!isValidEnum(reviewFrequency, REVIEW_FREQUENCIES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid review frequency. Must be one of: ${REVIEW_FREQUENCIES.join(", ")}` },
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

    const approvalStatus = body.approval_status || "pending";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "draft";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      product_reference: productReference,
      product_name: productName,
      product_type: productType,
      product_description: sanitizeText(body.product_description) || undefined,
      target_market: sanitizeText(body.target_market) || undefined,
      distribution_channels: body.distribution_channels || undefined,
      risk_profile: riskProfile,
      key_risks: sanitizeText(body.key_risks) || undefined,
      manufacturer: sanitizeString(body.manufacturer) || undefined,
      manufacturer_country: sanitizeString(body.manufacturer_country) || undefined,
      launch_date: parseValidDate(body.launch_date) || undefined,
      last_review_date: parseValidDate(body.last_review_date) || undefined,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      review_frequency: reviewFrequency,
      product_owner: sanitizeString(body.product_owner) || undefined,
      compliance_owner: sanitizeString(body.compliance_owner) || undefined,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      regulatory_requirements: sanitizeText(body.regulatory_requirements) || undefined,
      consumer_duty_assessment: sanitizeText(body.consumer_duty_assessment) || undefined,
      value_assessment: sanitizeText(body.value_assessment) || undefined,
      fair_value_statement: sanitizeText(body.fair_value_statement) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createProductGovernanceRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "product-governance",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating product governance record");
    return NextResponse.json(
      { error: "Failed to create product governance record" },
      { status: 500 }
    );
  }
}
