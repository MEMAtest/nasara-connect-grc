import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getRegulatoryReturnsRecords,
  createRegulatoryReturnsRecord,
  type RegulatoryReturnsRecord,
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

const REGULATORS = ["fca", "pra", "ico", "hmrc", "companies_house", "other"] as const;
const FREQUENCIES = ["monthly", "quarterly", "semi_annual", "annual", "ad_hoc"] as const;
const PREPARATION_STATUSES = ["not_started", "in_progress", "ready_for_review", "completed"] as const;
const REVIEW_STATUSES = ["pending", "in_review", "approved", "rejected"] as const;
const SUBMISSION_STATUSES = ["pending", "submitted", "accepted", "rejected"] as const;
const STATUSES = ["upcoming", "in_progress", "completed", "overdue"] as const;

// GET /api/registers/regulatory-returns - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-returns-get-${clientIp}`);
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

    const records = await getRegulatoryReturnsRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching regulatory returns records");
    return NextResponse.json(
      { error: "Failed to fetch regulatory returns records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/regulatory-returns - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`regulatory-returns-post-${clientIp}`);
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
    const returnReference = sanitizeString(body.return_reference);
    if (!returnReference) {
      return NextResponse.json(
        { error: "Return reference is required" },
        { status: 400 }
      );
    }

    const returnName = sanitizeString(body.return_name);
    if (!returnName) {
      return NextResponse.json(
        { error: "Return name is required" },
        { status: 400 }
      );
    }

    const regulator = body.regulator;
    if (!regulator) {
      return NextResponse.json(
        { error: "Regulator is required" },
        { status: 400 }
      );
    }
    if (!isValidEnum(regulator, REGULATORS as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid regulator. Must be one of: ${REGULATORS.join(", ")}` },
        { status: 400 }
      );
    }

    const dueDate = parseValidDate(body.due_date);
    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
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

    // Validate optional enum fields
    const frequency = body.frequency || "quarterly";
    if (!isValidEnum(frequency, FREQUENCIES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${FREQUENCIES.join(", ")}` },
        { status: 400 }
      );
    }

    const preparationStatus = body.preparation_status || "not_started";
    if (!isValidEnum(preparationStatus, PREPARATION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid preparation status. Must be one of: ${PREPARATION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const reviewStatus = body.review_status || "pending";
    if (!isValidEnum(reviewStatus, REVIEW_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid review status. Must be one of: ${REVIEW_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const submissionStatus = body.submission_status || "pending";
    if (!isValidEnum(submissionStatus, SUBMISSION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid submission status. Must be one of: ${SUBMISSION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "upcoming";
    if (!isValidEnum(status, STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      return_reference: returnReference,
      return_name: returnName,
      regulator: regulator,
      frequency: frequency,
      reporting_period_start: parseValidDate(body.reporting_period_start) || undefined,
      reporting_period_end: parseValidDate(body.reporting_period_end) || undefined,
      due_date: dueDate,
      submission_deadline: parseValidDate(body.submission_deadline) || undefined,
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      reviewer: sanitizeString(body.reviewer) || undefined,
      approver: sanitizeString(body.approver) || undefined,
      preparation_status: preparationStatus,
      review_status: reviewStatus,
      submission_status: submissionStatus,
      data_sources: body.data_sources || undefined,
      submission_method: sanitizeString(body.submission_method) || undefined,
      submission_reference: sanitizeString(body.submission_reference) || undefined,
      submitted_date: parseValidDate(body.submitted_date) || undefined,
      submitted_by: sanitizeString(body.submitted_by) || undefined,
      acknowledgement_received: body.acknowledgement_received || false,
      acknowledgement_reference: sanitizeString(body.acknowledgement_reference) || undefined,
      issues_identified: body.issues_identified || false,
      issues_details: sanitizeText(body.issues_details) || undefined,
      remediation_required: body.remediation_required || false,
      remediation_details: sanitizeText(body.remediation_details) || undefined,
      remediation_deadline: parseValidDate(body.remediation_deadline) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createRegulatoryReturnsRecord(recordData as unknown as Omit<RegulatoryReturnsRecord, 'id' | 'created_at' | 'updated_at'>);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "regulatory-returns",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating regulatory returns record");
    return NextResponse.json(
      { error: "Failed to create regulatory returns record" },
      { status: 500 }
    );
  }
}
