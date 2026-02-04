import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintActivities,
  createComplaintActivity,
  getComplaintRecord,
  ActivityType,
} from "@/lib/database";
import { isValidUUID, sanitizeString, sanitizeText } from "@/lib/validation";
import { requireRole } from "@/lib/rbac";

const ACTIVITY_TYPES: ActivityType[] = [
  "complaint_created",
  "status_change",
  "letter_generated",
  "letter_sent",
  "note_added",
  "assigned",
  "priority_change",
  "fos_referred",
  "resolved",
  "closed",
];

// GET /api/complaints/[id]/activities - Get all activities for a complaint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID format" },
        { status: 400 }
      );
    }

    const complaint = await getComplaintRecord(id);
    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    if (complaint.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const activities = await getComplaintActivities(id);
    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching complaint activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint activities" },
      { status: 500 }
    );
  }
}

// POST /api/complaints/[id]/activities - Add a new activity (e.g., note)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    await initDatabase();
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid complaint ID format" },
        { status: 400 }
      );
    }

    // Verify complaint exists
    const complaint = await getComplaintRecord(id);
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }
    if (complaint.organization_id !== auth.organizationId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();

    // Validate activity type
    if (!body.activity_type || !ACTIVITY_TYPES.includes(body.activity_type)) {
      return NextResponse.json(
        { error: `Invalid activity type. Must be one of: ${ACTIVITY_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate description
    const description = sanitizeText(body.description);
    if (!description) {
      return NextResponse.json(
        { error: "Activity description is required" },
        { status: 400 }
      );
    }

    // Create the activity
    const activity = await createComplaintActivity({
      complaint_id: id,
      activity_type: body.activity_type,
      description,
      old_value: sanitizeString(body.old_value) || undefined,
      new_value: sanitizeString(body.new_value) || undefined,
      metadata: body.metadata || undefined,
      performed_by: sanitizeString(body.performed_by) || "System",
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint activity:", error);
    return NextResponse.json(
      { error: "Failed to create complaint activity" },
      { status: 500 }
    );
  }
}
