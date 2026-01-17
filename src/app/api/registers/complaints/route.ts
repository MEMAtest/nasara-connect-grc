import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintRecords,
  createComplaintRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  COMPLAINT_TYPES,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  PRIORITY_LEVELS,
} from "@/lib/validation";
import {
  authenticateRequest,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

// GET /api/registers/complaints - List all Complaint records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`complaints-get-${clientIp}`);
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
    const records = await getComplaintRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching Complaint records");
    return serverErrorResponse("Failed to fetch Complaint records");
  }
}

// POST /api/registers/complaints - Create a new Complaint record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for writes)
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`complaints-post-${clientIp}`, {
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
    const complainantName = sanitizeString(body.complainant_name);
    if (!complainantName) {
      return badRequestResponse("Complainant name is required");
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    // Validate enum fields
    const complaintType = body.complaint_type || "other";
    if (!isValidEnum(complaintType, COMPLAINT_TYPES)) {
      return badRequestResponse(
        `Invalid complaint type. Must be one of: ${COMPLAINT_TYPES.join(", ")}`
      );
    }

    const complaintCategory = body.complaint_category || "pending";
    if (!isValidEnum(complaintCategory, COMPLAINT_CATEGORIES)) {
      return badRequestResponse(
        `Invalid complaint category. Must be one of: ${COMPLAINT_CATEGORIES.join(", ")}`
      );
    }

    const status = body.status || "open";
    if (!isValidEnum(status, COMPLAINT_STATUSES)) {
      return badRequestResponse(
        `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(", ")}`
      );
    }

    const priority = body.priority || "medium";
    if (!isValidEnum(priority, PRIORITY_LEVELS)) {
      return badRequestResponse(
        `Invalid priority. Must be one of: ${PRIORITY_LEVELS.join(", ")}`
      );
    }

    // Parse dates
    const receivedDate = parseValidDate(body.received_date) || new Date();
    const acknowledgedDate = parseValidDate(body.acknowledged_date);
    const resolvedDate = parseValidDate(body.resolved_date);

    // Auto-calculate resolution deadline (8 weeks from received date)
    let resolutionDeadline = parseValidDate(body.resolution_deadline);
    if (!resolutionDeadline && receivedDate) {
      const deadline = new Date(receivedDate);
      deadline.setDate(deadline.getDate() + 56); // 8 weeks
      resolutionDeadline = deadline;
    }

    // Parse compensation amount
    let compensationAmount: number | undefined;
    if (
      body.compensation_amount !== undefined &&
      body.compensation_amount !== null &&
      body.compensation_amount !== ""
    ) {
      const parsedValue = parsePositiveNumber(body.compensation_amount);
      if (parsedValue === null) {
        return badRequestResponse(
          "Invalid compensation amount. Must be a positive number"
        );
      }
      compensationAmount = parsedValue;
    }

    const recordData = {
      // Use authenticated user's organization ID (IDOR protection)
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      complainant_name: complainantName,
      complaint_type: complaintType as (typeof COMPLAINT_TYPES)[number],
      complaint_category: complaintCategory as (typeof COMPLAINT_CATEGORIES)[number],
      received_date: receivedDate,
      acknowledged_date: acknowledgedDate || undefined,
      resolution_deadline: resolutionDeadline || undefined,
      resolved_date: resolvedDate || undefined,
      root_cause: sanitizeText(body.root_cause) || undefined,
      remedial_action: sanitizeText(body.remedial_action) || undefined,
      compensation_amount: compensationAmount,
      fos_referred: Boolean(body.fos_referred),
      fos_outcome: sanitizeString(body.fos_outcome) || undefined,
      status: status as (typeof COMPLAINT_STATUSES)[number],
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      priority: priority as (typeof PRIORITY_LEVELS)[number],
      notes: sanitizeText(body.notes) || undefined,
      four_week_letter_sent: Boolean(body.four_week_letter_sent),
      eight_week_letter_sent: Boolean(body.eight_week_letter_sent),
      final_response_sent: Boolean(body.final_response_sent),
      created_by: authResult.user.userEmail || sanitizeString(body.created_by) || undefined,
    };

    const record = await createComplaintRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating Complaint record");
    return serverErrorResponse("Failed to create Complaint record");
  }
}
