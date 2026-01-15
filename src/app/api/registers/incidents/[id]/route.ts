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

// GET /api/registers/incidents/[id] - Get a single Incident record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const record = await getIncidentRecord(id);

    if (!record) {
      return NextResponse.json({ error: "Incident record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error fetching Incident record:", error);
    return NextResponse.json({ error: "Failed to fetch Incident record" }, { status: 500 });
  }
}

// PATCH /api/registers/incidents/[id] - Update an Incident record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // String fields
    if (body.incident_title !== undefined) {
      const title = sanitizeString(body.incident_title);
      if (!title) {
        return NextResponse.json({ error: "Incident title cannot be empty" }, { status: 400 });
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
        return NextResponse.json(
          { error: `Invalid incident type. Must be one of: ${INCIDENT_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.incident_type = body.incident_type;
    }

    if (body.severity !== undefined) {
      if (!isValidEnum(body.severity, INCIDENT_SEVERITIES)) {
        return NextResponse.json(
          { error: `Invalid severity. Must be one of: ${INCIDENT_SEVERITIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.severity = body.severity;
    }

    if (body.status !== undefined) {
      if (!isValidEnum(body.status, INCIDENT_STATUSES)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${INCIDENT_STATUSES.join(", ")}` },
          { status: 400 }
        );
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
            return NextResponse.json({ error: `Invalid date format for ${field}` }, { status: 400 });
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
          return NextResponse.json({ error: "Invalid financial impact" }, { status: 400 });
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
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const record = await updateIncidentRecord(id, updateData);

    if (!record) {
      return NextResponse.json({ error: "Incident record not found" }, { status: 404 });
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating Incident record:", error);
    return NextResponse.json({ error: "Failed to update Incident record" }, { status: 500 });
  }
}

// DELETE /api/registers/incidents/[id] - Delete an Incident record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const deleted = await deleteIncidentRecord(id);

    if (!deleted) {
      return NextResponse.json({ error: "Incident record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting Incident record:", error);
    return NextResponse.json({ error: "Failed to delete Incident record" }, { status: 500 });
  }
}
