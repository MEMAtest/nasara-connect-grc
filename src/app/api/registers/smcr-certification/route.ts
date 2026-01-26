import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getSmcrCertificationRecords,
  createSmcrCertificationRecord,
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

const ASSESSMENT_OUTCOMES = ["fit", "not_fit", "conditional", "pending"] as const;
const CERTIFICATION_STATUSES = ["pending", "certified", "not_certified", "expired"] as const;
const STATUSES = ["active", "inactive", "left"] as const;

// GET /api/registers/smcr-certification - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`smcr-certification-get-${clientIp}`);
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

    const records = await getSmcrCertificationRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching SMCR certification records");
    return NextResponse.json(
      { error: "Failed to fetch SMCR certification records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/smcr-certification - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`smcr-certification-post-${clientIp}`);
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

    const certificationFunction = sanitizeString(body.certification_function);
    if (!certificationFunction) {
      return NextResponse.json(
        { error: "Certification function is required" },
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

    const assessmentOutcome = body.assessment_outcome || "pending";
    if (!isValidEnum(assessmentOutcome, ASSESSMENT_OUTCOMES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid assessment outcome. Must be one of: ${ASSESSMENT_OUTCOMES.join(", ")}` },
        { status: 400 }
      );
    }

    const certificationStatus = body.certification_status || "pending";
    if (!isValidEnum(certificationStatus, CERTIFICATION_STATUSES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid certification status. Must be one of: ${CERTIFICATION_STATUSES.join(", ")}` },
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
      certification_function: certificationFunction,
      certification_start_date: parseValidDate(body.certification_start_date) || undefined,
      certification_expiry_date: parseValidDate(body.certification_expiry_date) || undefined,
      last_assessment_date: parseValidDate(body.last_assessment_date) || undefined,
      next_assessment_due: parseValidDate(body.next_assessment_due) || undefined,
      assessor_name: sanitizeString(body.assessor_name) || undefined,
      assessment_outcome: assessmentOutcome,
      training_completed: body.training_completed || false,
      training_details: sanitizeText(body.training_details) || undefined,
      competency_confirmed: body.competency_confirmed || false,
      competency_evidence: sanitizeText(body.competency_evidence) || undefined,
      conduct_rules_training: body.conduct_rules_training || false,
      conduct_rules_date: parseValidDate(body.conduct_rules_date) || undefined,
      fit_and_proper_confirmed: body.fit_and_proper_confirmed || false,
      fit_and_proper_date: parseValidDate(body.fit_and_proper_date) || undefined,
      regulatory_references_obtained: body.regulatory_references_obtained || false,
      references_details: sanitizeText(body.references_details) || undefined,
      certification_status: certificationStatus,
      certification_issued_date: parseValidDate(body.certification_issued_date) || undefined,
      certification_issued_by: sanitizeString(body.certification_issued_by) || undefined,
      status: status,
      leaving_date: parseValidDate(body.leaving_date) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createSmcrCertificationRecord(recordData);
    try {
      await notifyRegisterCreated({
        organizationId: authResult.user.organizationId,
        registerKey: "smcr-certification",
        record,
        actor: authResult.user.userEmail,
      });
    } catch {
      // Non-blocking notification failures
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating SMCR certification record");
    return NextResponse.json(
      { error: "Failed to create SMCR certification record" },
      { status: 500 }
    );
  }
}
