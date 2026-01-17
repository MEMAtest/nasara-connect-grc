import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getIncidentRecord,
  updateIncidentRecord,
  deleteIncidentRecord,
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
  verifyRecordOwnership,
  checkRateLimit,
  rateLimitExceededResponse,
  badRequestResponse,
  notFoundResponse,
  forbiddenResponse,
  serverErrorResponse,
} from "@/lib/api-auth";
import { logError } from "@/lib/logger";

// GET /api/registers/incidents/[id] - Get a single Incident record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    const record = await getIncidentRecord(id);

    if (!record) {
      return notFoundResponse("Incident record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(record, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error fetching Incident record");
    return serverErrorResponse("Failed to fetch Incident record");
  }
}

// PATCH /api/registers/incidents/[id] - Update an Incident record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`incidents-patch-${clientIp}`, {
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
    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getIncidentRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Incident record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // String fields
    if (body.incident_title !== undefined) {
      const title = sanitizeString(body.incident_title);
      if (!title) {
        return badRequestResponse("Incident title cannot be empty");
      }
      updateData.incident_title = title;
    }

    const textFields = [
      "description", "root_cause", "impact_assessment", "immediate_actions",
      "remedial_actions", "lessons_learned", "affected_systems", "notes"
    ];
    for (const field of textFields) {
      if (body[field] !== undefined) {
        updateData[field] = sanitizeText(body[field]) || null;
      }
    }

    if (body.assigned_to !== undefined) {
      updateData.assigned_to = sanitizeString(body.assigned_to) || null;
    }

    // Enum fields
    if (body.incident_type !== undefined) {
      if (!isValidEnum(body.incident_type, INCIDENT_TYPES)) {
        return badRequestResponse(`Invalid incident type. Must be one of: ${INCIDENT_TYPES.join(", ")}`);
      }
      updateData.incident_type = body.incident_type;
    }

    if (body.severity !== undefined) {
      if (!isValidEnum(body.severity, INCIDENT_SEVERITIES)) {
        return badRequestResponse(`Invalid severity. Must be one of: ${INCIDENT_SEVERITIES.join(", ")}`);
      }
      updateData.severity = body.severity;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, INCIDENT_STATUSES)) {
        return badRequestResponse(`Invalid status. Must be one of: ${INCIDENT_STATUSES.join(", ")}`);
      }
      updateData.status = body.status;
    }

    // Date fields
    const dateFields = [
      "detected_date", "occurred_date", "reported_date",
      "resolved_date", "regulatory_notification_date"
    ];
    for (const field of dateFields) {
      if (body[field] !== undefined) {
        if (body[field] === null || body[field] === "") {
          updateData[field] = null;
        } else {
          const parsedDate = parseValidDate(body[field]);
          if (!parsedDate) {
            return badRequestResponse(`Invalid date format for ${field}`);
          }
          updateData[field] = parsedDate;
        }
      }
    }

    // Numeric fields
    if (body.financial_impact !== undefined) {
      if (body.financial_impact === null || body.financial_impact === "") {
        updateData.financial_impact = null;
      } else {
        const parsed = parsePositiveNumber(body.financial_impact);
        if (parsed === null) {
          return badRequestResponse("Invalid financial impact");
        }
        updateData.financial_impact = parsed;
      }
    }

    if (body.affected_customers_count !== undefined) {
      const parsed = parsePositiveNumber(body.affected_customers_count);
      updateData.affected_customers_count = parsed !== null ? Math.floor(parsed) : 0;
    }

    // Boolean fields
    if (body.regulatory_notification_required !== undefined) {
      updateData.regulatory_notification_required = Boolean(body.regulatory_notification_required);
    }

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse("No valid fields to update");
    }

    const record = await updateIncidentRecord(id, updateData);

    if (!record) {
      return notFoundResponse("Incident record not found");
    }

    return NextResponse.json({ record });
  } catch (error) {
    logError(error as Error, "Error updating Incident record");
    return serverErrorResponse("Failed to update Incident record");
  }
}

// DELETE /api/registers/incidents/[id] - Delete an Incident record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = checkRateLimit(`incidents-delete-${clientIp}`, {
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
    const { id } = await params;

    if (!isValidUUID(id)) {
      return badRequestResponse("Invalid ID format");
    }

    // Fetch record first to verify ownership
    const existingRecord = await getIncidentRecord(id);
    if (!existingRecord) {
      return notFoundResponse("Incident record not found");
    }

    // IDOR protection
    if (!verifyRecordOwnership(existingRecord, authResult.user.organizationId)) {
      return forbiddenResponse("You don't have permission to access this record");
    }

    const deleted = await deleteIncidentRecord(id);

    if (!deleted) {
      return notFoundResponse("Incident record not found");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error as Error, "Error deleting Incident record");
    return serverErrorResponse("Failed to delete Incident record");
  }
}
