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

// GET /api/registers/complaints - List all Complaint records
export async function GET(request: NextRequest) {
  try {
    await initDatabase();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId") || "default-org";
    const packId = searchParams.get("packId") || undefined;

    if (packId && !isValidUUID(packId)) {
      return NextResponse.json(
        { error: "Invalid pack ID format" },
        { status: 400 }
      );
    }

    const records = await getComplaintRecords(organizationId, packId);

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error fetching Complaint records:", error);
    return NextResponse.json(
      { error: "Failed to fetch Complaint records" },
      { status: 500 }
    );
  }
}

// POST /api/registers/complaints - Create a new Complaint record
export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();

    // Validate required fields
    const complainantName = sanitizeString(body.complainant_name);
    if (!complainantName) {
      return NextResponse.json(
        { error: "Complainant name is required" },
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

    // Validate enum fields
    const complaintType = body.complaint_type || "other";
    if (!isValidEnum(complaintType, COMPLAINT_TYPES)) {
      return NextResponse.json(
        { error: `Invalid complaint type. Must be one of: ${COMPLAINT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    const complaintCategory = body.complaint_category || "pending";
    if (!isValidEnum(complaintCategory, COMPLAINT_CATEGORIES)) {
      return NextResponse.json(
        { error: `Invalid complaint category. Must be one of: ${COMPLAINT_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const status = body.status || "open";
    if (!isValidEnum(status, COMPLAINT_STATUSES)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${COMPLAINT_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const priority = body.priority || "medium";
    if (!isValidEnum(priority, PRIORITY_LEVELS)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${PRIORITY_LEVELS.join(", ")}` },
        { status: 400 }
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
    if (body.compensation_amount !== undefined && body.compensation_amount !== null && body.compensation_amount !== "") {
      const parsedValue = parsePositiveNumber(body.compensation_amount);
      if (parsedValue === null) {
        return NextResponse.json(
          { error: "Invalid compensation amount. Must be a positive number" },
          { status: 400 }
        );
      }
      compensationAmount = parsedValue;
    }

    const recordData = {
      organization_id: body.organization_id || "default-org",
      pack_id: body.pack_id,
      complainant_name: complainantName,
      complaint_type: complaintType as typeof COMPLAINT_TYPES[number],
      complaint_category: complaintCategory as typeof COMPLAINT_CATEGORIES[number],
      received_date: receivedDate,
      acknowledged_date: acknowledgedDate || undefined,
      resolution_deadline: resolutionDeadline || undefined,
      resolved_date: resolvedDate || undefined,
      root_cause: sanitizeText(body.root_cause) || undefined,
      remedial_action: sanitizeText(body.remedial_action) || undefined,
      compensation_amount: compensationAmount,
      fos_referred: Boolean(body.fos_referred),
      fos_outcome: sanitizeString(body.fos_outcome) || undefined,
      status: status as typeof COMPLAINT_STATUSES[number],
      assigned_to: sanitizeString(body.assigned_to) || undefined,
      priority: priority as typeof PRIORITY_LEVELS[number],
      notes: sanitizeText(body.notes) || undefined,
      four_week_letter_sent: Boolean(body.four_week_letter_sent),
      eight_week_letter_sent: Boolean(body.eight_week_letter_sent),
      final_response_sent: Boolean(body.final_response_sent),
      created_by: sanitizeString(body.created_by) || undefined,
    };

    const record = await createComplaintRecord(recordData);

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Error creating Complaint record:", error);
    return NextResponse.json(
      { error: "Failed to create Complaint record" },
      { status: 500 }
    );
  }
}
