import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getIncidentRecords,
  createIncidentRecord,
} from "@/lib/database";
import {
  isValidUUID,
  isValidEnum,
  sanitizeString,
  sanitizeText,
  parseValidDate,
  parsePositiveNumber,
  INCIDENT_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
} from "@/lib/validation";
import {
  authenticateRequest,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

// GET /api/registers/incidents - List all Incident records
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`incidents-get-${clientIp}`);
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

    const records = await getIncidentRecords(authResult.user.organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    logError(error as Error, "Error fetching Incident records");
    return serverErrorResponse("Failed to fetch Incident records");
  }
}

// POST /api/registers/incidents - Create a new Incident record
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`incidents-post-${clientIp}`, {
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
    const incidentTitle = sanitizeString(body.incident_title);
    if (!incidentTitle) {
      return badRequestResponse("Incident title is required");
    }

    // Validate pack_id if provided
    if (body.pack_id && !isValidUUID(body.pack_id)) {
      return badRequestResponse("Invalid pack ID format");
    }

    // Validate enum fields
    const incidentType = body.incident_type || "other";
    if (!isValidEnum(incidentType, INCIDENT_TYPES)) {
      return badRequestResponse(`Invalid incident type. Must be one of: ${INCIDENT_TYPES.join(", ")}`);
    }

    const severity = body.severity || "medium";
    if (!isValidEnum(severity, INCIDENT_SEVERITIES)) {
      return badRequestResponse(`Invalid severity. Must be one of: ${INCIDENT_SEVERITIES.join(", ")}`);
    }

    const status = body.status || "detected";
    if (!isValidEnum(status, INCIDENT_STATUSES)) {
      return badRequestResponse(`Invalid status. Must be one of: ${INCIDENT_STATUSES.join(", ")}`);
    }

    // Parse dates
    const detectedDate = parseValidDate(body.detected_date) || new Date();
    const occurredDate = parseValidDate(body.occurred_date);
    const reportedDate = parseValidDate(body.reported_date);
    const resolvedDate = parseValidDate(body.resolved_date);
    const regulatoryNotificationDate = parseValidDate(body.regulatory_notification_date);

    // Parse financial impact
    let financialImpact: number | undefined;
    if (body.financial_impact !== undefined && body.financial_impact !== null && body.financial_impact !== "") {
      const parsedValue = parsePositiveNumber(body.financial_impact);
      if (parsedValue === null) {
        return badRequestResponse("Invalid financial impact. Must be a positive number");
      }
      financialImpact = parsedValue;
    }

    // Parse affected customers count
    let affectedCustomersCount = 0;
    if (body.affected_customers_count !== undefined && body.affected_customers_count !== null) {
      const parsed = parsePositiveNumber(body.affected_customers_count);
      if (parsed !== null) {
        affectedCustomersCount = Math.floor(parsed);
      }
    }

    const recordData = {
      organization_id: authResult.user.organizationId,
      pack_id: body.pack_id,
      incident_title: incidentTitle,
      incident_type: incidentType as typeof INCIDENT_TYPES[number],
      severity: severity as typeof INCIDENT_SEVERITIES[number],
      detected_date: detectedDate,
      occurred_date: occurredDate || undefined,
      reported_date: reportedDate || undefined,
      resolved_date: resolvedDate || undefined,
      description: sanitizeText(body.description) || undefined,
      root_cause: sanitizeText(body.root_cause) || undefined,
      impact_assessment: sanitizeText(body.impact_assessment) || undefined,
      immediate_actions: sanitizeText(body.immediate_actions) || undefined,
      remedial_actions: sanitizeText(body.remedial_actions) || undefined,
      lessons_learned: sanitizeText(body.lessons_learned) || undefined,
      regulatory_notification_required: Boolean(body.regulatory_notification_required),
      regulatory_notification_date: regulatoryNotificationDate || undefined,
      status: status as typeof INCIDENT_STATUSES[number],
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      affected_systems: sanitizeText(body.affected_systems) || undefined,
      affected_customers_count: affectedCustomersCount,
      financial_impact: financialImpact,
      notes: sanitizeText(body.notes) || undefined,
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createIncidentRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    logError(error as Error, "Error creating Incident record");
    return serverErrorResponse("Failed to create Incident record");
  }
}
