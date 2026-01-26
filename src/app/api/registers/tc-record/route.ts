import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getTcRecordRecords,
  createTcRecordRecord,
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

const QUALIFICATION_STATUSES = ["in_progress", "passed", "failed", "exempt"] as const;
const COMPETENCY_STATUSES = ["not_assessed", "competent", "not_yet_competent", "lapsed"] as const;
const SUPERVISION_LEVELS = ["standard", "enhanced", "close"] as const;
const FIT_PROPER_STATUSES = ["pending", "confirmed", "concerns"] as const;
const STATUSES = ["active", "inactive", "left"] as const;

// GET /api/registers/tc-record - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tc-record-get-${clientIp}`);
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

    const records = await getTcRecordRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching T&C records");
    return NextResponse.json(
      { error: "Failed to fetch T&C records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/tc-record - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`tc-record-post-${clientIp}`);
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
    const employeeReference = sanitizeString(body.employee_reference);
    if (!employeeReference) {
      return NextResponse.json(
        { error: "Employee reference is required" },
        { status: 400 }
      );
    }

    const employeeName = sanitizeString(body.employee_name);
    if (!employeeName) {
      return NextResponse.json(
        { error: "Employee name is required" },
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
    if (body.qualification_status && !isValidEnum(body.qualification_status, QUALIFICATION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid qualification status. Must be one of: ${QUALIFICATION_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.competency_status && !isValidEnum(body.competency_status, COMPETENCY_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid competency status. Must be one of: ${COMPETENCY_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.supervision_level && !isValidEnum(body.supervision_level, SUPERVISION_LEVELS as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid supervision level. Must be one of: ${SUPERVISION_LEVELS.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.fit_proper_status && !isValidEnum(body.fit_proper_status, FIT_PROPER_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid fit & proper status. Must be one of: ${FIT_PROPER_STATUSES.join(", ")}` },
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
      employee_reference: employeeReference,
      employee_name: employeeName,
      job_title: sanitizeString(body.job_title) || undefined,
      department: sanitizeString(body.department) || undefined,
      start_date: parseValidDate(body.start_date) || undefined,
      end_date: parseValidDate(body.end_date) || undefined,
      tc_regime: sanitizeString(body.tc_regime) || undefined,
      qualification_required: sanitizeString(body.qualification_required) || undefined,
      qualification_status: body.qualification_status || undefined,
      qualification_date: parseValidDate(body.qualification_date) || undefined,
      qualification_expiry: parseValidDate(body.qualification_expiry) || undefined,
      cpd_hours_required: body.cpd_hours_required ? parseFloat(body.cpd_hours_required) : undefined,
      cpd_hours_completed: body.cpd_hours_completed ? parseFloat(body.cpd_hours_completed) : undefined,
      cpd_year: sanitizeString(body.cpd_year) || undefined,
      competency_status: body.competency_status || undefined,
      competency_assessed_date: parseValidDate(body.competency_assessed_date) || undefined,
      competency_assessed_by: sanitizeString(body.competency_assessed_by) || undefined,
      supervision_level: body.supervision_level || undefined,
      supervisor_name: sanitizeString(body.supervisor_name) || undefined,
      fit_proper_status: body.fit_proper_status || undefined,
      fit_proper_date: parseValidDate(body.fit_proper_date) || undefined,
      fit_proper_notes: sanitizeText(body.fit_proper_notes) || undefined,
      smcr_function: sanitizeString(body.smcr_function) || undefined,
      certification_function: sanitizeString(body.certification_function) || undefined,
      conduct_rules_training_date: parseValidDate(body.conduct_rules_training_date) || undefined,
      status: status,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createTcRecordRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "tc-record",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating T&C record");
    return NextResponse.json(
      { error: "Failed to create T&C record" },
      { status: 500 }
    );
  }
}
