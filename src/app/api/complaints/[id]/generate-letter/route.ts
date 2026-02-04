import { NextRequest, NextResponse } from "next/server";
import {
  initDatabase,
  getComplaintRecord,
  createComplaintLetter,
  createComplaintActivity,
  updateComplaintRecord,
  LetterTemplateType,
} from "@/lib/database";
import { isValidUUID, sanitizeString } from "@/lib/validation";
import { requireRole } from "@/lib/rbac";
import {
  generateLetterFromTemplate,
  previewLetterContent,
} from "@/lib/complaints/letter-generator";
import { getLetterTemplate, OrganizationSettings } from "@/lib/complaints/letter-templates";

const LETTER_TEMPLATE_TYPES: LetterTemplateType[] = [
  "acknowledgement",
  "forward_third_party",
  "four_week_holding",
  "eight_week_holding",
  "complaint_upheld",
  "complaint_rejected",
  "general_contact",
];

// Default organization settings (should be from DB/settings in production)
function getOrganizationSettings(): OrganizationSettings {
  return {
    companyName: process.env.COMPANY_NAME || "Your Company Name",
    address: process.env.COMPANY_ADDRESS || "Your Company Address",
    phone: process.env.COMPANY_PHONE || "Your Company Phone",
    email: process.env.COMPANY_EMAIL,
    website: process.env.COMPANY_WEBSITE,
  };
}

// POST /api/complaints/[id]/generate-letter - Generate a letter from template
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

    // Get complaint
    const complaint = await getComplaintRecord(id);
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }
    if (complaint.organization_id && complaint.organization_id !== auth.organizationId) {
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

    // Validate required fields
    if (!body.contact_name) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    if (!body.contact_title) {
      return NextResponse.json(
        { error: "Contact title is required" },
        { status: 400 }
      );
    }

    // Validate custom_variables if provided
    if (body.custom_variables && typeof body.custom_variables !== 'object') {
      return NextResponse.json(
        { error: "Invalid custom_variables format. Must be an object." },
        { status: 400 }
      );
    }

    // Validate organization if provided
    if (body.organization) {
      if (typeof body.organization !== 'object' ||
          !body.organization.companyName ||
          !body.organization.address ||
          !body.organization.phone) {
        return NextResponse.json(
          { error: "Invalid organization settings. Required: companyName, address, phone" },
          { status: 400 }
        );
      }
    }

    const templateType = body.template_type as LetterTemplateType;
    const contactName = sanitizeString(body.contact_name) || "";
    const contactTitle = sanitizeString(body.contact_title) || "";

    // Sanitize custom_variables
    const customVariables: Record<string, string> = {};
    if (body.custom_variables) {
      for (const [key, value] of Object.entries(body.custom_variables)) {
        const sanitizedKey = sanitizeString(key);
        if (sanitizedKey && typeof value === 'string') {
          customVariables[sanitizedKey] = sanitizeString(value) || '';
        }
      }
    }

    // Get organization settings (custom or default)
    const organization: OrganizationSettings = body.organization || getOrganizationSettings();

    // Check if preview only
    if (body.preview_only) {
      const preview = previewLetterContent(
        templateType,
        complaint,
        organization,
        contactName,
        contactTitle,
        customVariables
      );

      if (!preview) {
        return NextResponse.json(
          { error: "Failed to generate preview" },
          { status: 500 }
        );
      }

      const template = getLetterTemplate(templateType);
      return NextResponse.json({
        preview,
        template: template ? {
          id: template.id,
          name: template.name,
          subject: template.subject,
          includesFOSInfo: template.includesFOSInfo,
          includesOmbudsmanLeaflet: template.includesOmbudsmanLeaflet,
        } : null,
      });
    }

    // Generate the letter DOCX
    const letter = await generateLetterFromTemplate(
      templateType,
      complaint,
      organization,
      contactName,
      contactTitle,
      customVariables
    );

    if (!letter) {
      return NextResponse.json(
        { error: "Failed to generate letter" },
        { status: 500 }
      );
    }

    // Save letter record to database
    const letterRecord = await createComplaintLetter({
      complaint_id: id,
      template_type: templateType,
      generated_content: letter.content,
      template_variables: {
        contact_name: contactName,
        contact_title: contactTitle,
        organization,
        ...customVariables,
      },
      status: "ready",
      generated_by: body.generated_by || "System",
    });

    // Create activity record
    const template = getLetterTemplate(templateType);
    await createComplaintActivity({
      complaint_id: id,
      activity_type: "letter_generated",
      description: `${template?.name || "Letter"} generated`,
      new_value: letterRecord.letter_reference,
      metadata: {
        letter_id: letterRecord.id,
        template_type: templateType,
        filename: letter.filename,
      },
      performed_by: body.generated_by || "System",
    });

    // Update complaint tracking flags based on letter type
    const updateData: Record<string, unknown> = {};
    if (templateType === "four_week_holding") {
      updateData.four_week_letter_sent = true;
    } else if (templateType === "eight_week_holding") {
      updateData.eight_week_letter_sent = true;
    } else if (templateType === "complaint_upheld" || templateType === "complaint_rejected") {
      updateData.final_response_sent = true;
      updateData.final_response_date = new Date();
    }

    if (Object.keys(updateData).length > 0) {
      await updateComplaintRecord(id, updateData);
    }

    // Return the DOCX file
    return new NextResponse(new Uint8Array(letter.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${letter.filename}"`,
        "X-Letter-Id": letterRecord.id,
        "X-Letter-Reference": letterRecord.letter_reference || "",
      },
    });
  } catch (error) {
    console.error("Error generating complaint letter:", error);
    return NextResponse.json(
      { error: "Failed to generate complaint letter" },
      { status: 500 }
    );
  }
}
