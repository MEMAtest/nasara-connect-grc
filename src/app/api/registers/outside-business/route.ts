import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getOutsideBusinessRecords,
  createOutsideBusinessRecord,
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
import { logError } from "@/lib/logger";

const INTEREST_TYPES = ["directorship", "employment", "consultancy", "investment", "charity", "other"] as const;
const APPROVAL_STATUSES = ["pending", "approved", "rejected", "conditional"] as const;
const STATUSES = ["active", "ceased", "withdrawn"] as const;

// GET /api/registers/outside-business - List all records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`outside-business-get-${clientIp}`);
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

    const records = await getOutsideBusinessRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching outside business records");
    return NextResponse.json(
      { error: "Failed to fetch outside business records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/outside-business - Create a new record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`outside-business-post-${clientIp}`);
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
    const declarationReference = sanitizeString(body.declaration_reference);
    if (!declarationReference) {
      return NextResponse.json(
        { error: "Declaration reference is required" },
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

    const interestType = body.interest_type;
    if (!interestType) {
      return NextResponse.json(
        { error: "Interest type is required" },
        { status: 400 }
      );
    }
    if (!isValidEnum(interestType, INTEREST_TYPES as unknown as string[])) {
      return NextResponse.json(
        { error: `Invalid interest type. Must be one of: ${INTEREST_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const organizationName = sanitizeString(body.organization_name);
    if (!organizationName) {
      return NextResponse.json(
        { error: "Organization name is required" },
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
      declaration_reference: declarationReference,
      employee_name: employeeName,
      employee_id: sanitizeString(body.employee_id) || undefined,
      employee_department: sanitizeString(body.employee_department) || undefined,
      employee_role: sanitizeString(body.employee_role) || undefined,
      interest_type: interestType,
      organization_name: organizationName,
      organization_type: sanitizeString(body.organization_type) || undefined,
      organization_sector: sanitizeString(body.organization_sector) || undefined,
      role_held: sanitizeString(body.role_held) || undefined,
      is_remunerated: body.is_remunerated || false,
      remuneration_details: sanitizeText(body.remuneration_details) || undefined,
      time_commitment: sanitizeString(body.time_commitment) || undefined,
      start_date: parseValidDate(body.start_date) || undefined,
      end_date: parseValidDate(body.end_date) || undefined,
      conflict_assessment: sanitizeText(body.conflict_assessment) || undefined,
      potential_conflicts: sanitizeText(body.potential_conflicts) || undefined,
      mitigating_controls: sanitizeText(body.mitigating_controls) || undefined,
      declaration_date: parseValidDate(body.declaration_date) || new Date(),
      reviewed_by: sanitizeString(body.reviewed_by) || undefined,
      review_date: parseValidDate(body.review_date) || undefined,
      approval_status: approvalStatus,
      approved_by: sanitizeString(body.approved_by) || undefined,
      approval_date: parseValidDate(body.approval_date) || undefined,
      approval_conditions: sanitizeText(body.approval_conditions) || undefined,
      next_review_date: parseValidDate(body.next_review_date) || undefined,
      status: status,
      ceased_date: parseValidDate(body.ceased_date) || undefined,
      ceased_reason: sanitizeText(body.ceased_reason) || undefined,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createOutsideBusinessRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating outside business record");
    return NextResponse.json(
      { error: "Failed to create outside business record" },
      { status: 500 }
    );
  }
}
