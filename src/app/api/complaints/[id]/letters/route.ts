import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintLetters,
  createComplaintLetter,
  createComplaintActivity,
  getComplaintRecord,
  updateComplaintRecord,
  LetterTemplateType,
} from "@/lib/database";
import { isValidUUID, sanitizeString, sanitizeText } from "@/lib/validation";
import { requireRole } from "@/lib/rbac";

const LETTER_TEMPLATE_TYPES: LetterTemplateType[] = [
  "acknowledgement",
  "forward_third_party",
  "four_week_holding",
  "eight_week_holding",
  "complaint_upheld",
  "complaint_rejected",
  "general_contact",
];

// GET /api/complaints/[id]/letters - Get all letters for a complaint
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

    const letters = await getComplaintLetters(id);
    return NextResponse.json({ letters });
  } catch (error) {
    console.error("Error fetching complaint letters:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint letters" },
      { status: 500 }
    );
  }
}

// POST /api/complaints/[id]/letters - Create a new letter
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

    // Validate template type
    if (!body.template_type || !LETTER_TEMPLATE_TYPES.includes(body.template_type)) {
      return NextResponse.json(
        { error: `Invalid template type. Must be one of: ${LETTER_TEMPLATE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the letter
    const letter = await createComplaintLetter({
      complaint_id: id,
      template_type: body.template_type,
      generated_content: sanitizeText(body.generated_content) || undefined,
      template_variables: body.template_variables || {},
      status: body.status || "draft",
      sent_at: body.sent_at ? new Date(body.sent_at) : undefined,
      sent_via: body.sent_via,
      generated_by: sanitizeString(body.generated_by) || undefined,
    });

    // Create activity record
    const templateNames: Record<LetterTemplateType, string> = {
      acknowledgement: "Acknowledgement Letter",
      forward_third_party: "Forward to Third Party Letter",
      four_week_holding: "Four Week Holding Letter",
      eight_week_holding: "Eight Week Holding Letter",
      complaint_upheld: "Complaint Upheld Letter",
      complaint_rejected: "Complaint Rejected Letter",
      general_contact: "General Contact Letter",
    };

    await createComplaintActivity({
      complaint_id: id,
      activity_type: "letter_generated",
      description: `${templateNames[body.template_type as LetterTemplateType]} generated`,
      new_value: letter.letter_reference,
      metadata: {
        letter_id: letter.id,
        template_type: body.template_type,
      },
      performed_by: body.generated_by || "System",
    });

    // Update complaint tracking flags based on letter type
    const updateData: Record<string, unknown> = {};
    if (body.template_type === "four_week_holding") {
      updateData.four_week_letter_sent = true;
    } else if (body.template_type === "eight_week_holding") {
      updateData.eight_week_letter_sent = true;
    } else if (body.template_type === "complaint_upheld" || body.template_type === "complaint_rejected") {
      updateData.final_response_sent = true;
      updateData.final_response_date = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await updateComplaintRecord(id, updateData);
    }

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint letter:", error);
    return NextResponse.json(
      { error: "Failed to create complaint letter" },
      { status: 500 }
    );
  }
}
