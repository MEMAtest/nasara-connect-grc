import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getFinPromRecords,
  createFinPromRecord,
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

const PROMOTION_TYPES = [
  "advertisement", "website", "social_media", "email", "brochure",
  "presentation", "video", "app", "sms", "other"
] as const;

const CHANNELS = [
  "online", "print", "broadcast", "social", "email", "direct_mail", "phone", "in_person", "app", "other"
] as const;

const APPROVAL_STATUSES = ["draft", "review", "approved", "rejected", "withdrawn"] as const;
const STATUSES = ["draft", "live", "paused", "expired", "withdrawn"] as const;
const RISK_RATINGS = ["low", "medium", "high", "critical"] as const;

// GET /api/registers/fin-prom - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`fin-prom-get-${clientIp}`);
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
    const records = await getFinPromRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching fin-prom records");
    return serverErrorResponse("Failed to fetch fin-prom records");
  }
}

// POST /api/registers/fin-prom - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`fin-prom-post-${clientIp}`, {
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
    const promotionReference = sanitizeString(body.promotion_reference);
    if (!promotionReference) {
      return badRequestResponse("Promotion reference is required");
    }

    const promotionTitle = sanitizeString(body.promotion_title);
    if (!promotionTitle) {
      return badRequestResponse("Promotion title is required");
    }

    const promotionType = body.promotion_type || "other";
    if (!isValidEnum(promotionType, PROMOTION_TYPES as unknown as string[])) {
      return badRequestResponse(`Invalid promotion type. Must be one of: ${PROMOTION_TYPES.join(", ")}`);
    }

    const channel = body.channel || "other";
    if (!isValidEnum(channel, CHANNELS as unknown as string[])) {
      return badRequestResponse(`Invalid channel. Must be one of: ${CHANNELS.join(", ")}`);
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    const approvalStatus = body.approval_status || "draft";
    if (!isValidEnum(approvalStatus, APPROVAL_STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid approval status. Must be one of: ${APPROVAL_STATUSES.join(", ")}`);
    }

    const status = body.status || "draft";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return badRequestResponse(`Invalid status. Must be one of: ${STATUSES.join(", ")}`);
    }

    const riskRating = body.risk_rating || "medium";
    if (!isValidEnum(riskRating, RISK_RATINGS as unknown as string[])) {
      return badRequestResponse(`Invalid risk rating. Must be one of: ${RISK_RATINGS.join(", ")}`);
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      promotion_reference: promotionReference,
      promotion_title: promotionTitle,
      promotion_type: promotionType,
      channel: channel,
      target_audience: sanitizeString(body.target_audience) || undefined,
      product_service: sanitizeString(body.product_service) || undefined,
      content_summary: sanitizeText(body.content_summary) || undefined,
      created_date: parseValidDate(body.created_date) || new Date(),
      created_by: sanitizeString(body.created_by) || undefined,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      approval_status: approvalStatus,
      compliance_reviewer: sanitizeString(body.compliance_reviewer) || undefined,
      compliance_review_date: parseValidDate(body.compliance_review_date) || undefined,
      compliance_notes: sanitizeText(body.compliance_notes) || undefined,
      version_number: parseInt(body.version_number) || 1,
      live_date: parseValidDate(body.live_date) || undefined,
      expiry_date: parseValidDate(body.expiry_date) || undefined,
      withdrawn_date: parseValidDate(body.withdrawn_date) || undefined,
      withdrawal_reason: sanitizeText(body.withdrawal_reason) || undefined,
      risk_rating: riskRating,
      regulatory_requirements: body.regulatory_requirements || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
    };

    const record = await createFinPromRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "fin-prom",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating fin-prom record");
    return serverErrorResponse("Failed to create fin-prom record");
  }
}
