/**
 * Complaint Letter DOCX Generator
 * Creates professional FCA-compliant complaint letters
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  convertInchesToTwip,
  Header,
  Footer,
  PageNumber,
} from "docx";
import { Packer } from "docx";
import {
  LetterTemplate,
  OrganizationSettings,
  renderLetterContent,
  formatLetterDate,
  formatContactMethod,
  getLetterTemplate,
} from "./letter-templates";
import { ComplaintRecord, LetterTemplateType } from "@/lib/database";

// =====================================================
// TYPES
// =====================================================

export interface LetterGenerationOptions {
  template: LetterTemplate;
  complaint: ComplaintRecord;
  organization: OrganizationSettings;
  contactName: string;
  contactTitle: string;
  customVariables?: Record<string, string>;
}

export interface GeneratedLetter {
  content: string;
  buffer: Buffer;
  filename: string;
}

// =====================================================
// STYLES
// =====================================================

const FONT_FAMILY = "Arial";
const FONT_SIZE_NORMAL = 22; // 11pt in half-points
const FONT_SIZE_SMALL = 20; // 10pt
const FONT_SIZE_HEADING = 28; // 14pt
const LINE_SPACING = 276; // 1.15 line spacing

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createLetterheadParagraph(text: string, bold = false, size = FONT_SIZE_NORMAL): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size,
        bold,
      }),
    ],
    spacing: { after: 60 },
  });
}

function createAddressParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_NORMAL,
      }),
    ],
    spacing: { after: 40 },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSubjectParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_HEADING,
        bold: true,
      }),
    ],
    spacing: { before: 240, after: 240 },
  });
}

function createBodyParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_NORMAL,
      }),
    ],
    spacing: { after: 200, line: LINE_SPACING },
  });
}

function createSectionHeading(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_NORMAL,
        bold: true,
      }),
    ],
    spacing: { before: 280, after: 120 },
  });
}

function createBulletParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    bullet: { level: 0 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_NORMAL,
      }),
    ],
    spacing: { after: 80 },
  });
}

function createSignatureParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: FONT_SIZE_NORMAL,
      }),
    ],
    spacing: { after: 40 },
  });
}

function createDivider(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "─".repeat(50),
        font: FONT_FAMILY,
        size: FONT_SIZE_SMALL,
        color: "999999",
      }),
    ],
    spacing: { before: 240, after: 240 },
  });
}

// Parse letter content into structured paragraphs
function parseLetterContent(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines but add spacing
    if (!line) {
      if (paragraphs.length > 0) {
        // Add extra spacing after empty lines
      }
      continue;
    }

    // Section divider
    if (line.startsWith("---")) {
      paragraphs.push(createDivider());
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      const bulletText = line.substring(2).trim();
      paragraphs.push(createBulletParagraph(bulletText));
      continue;
    }

    // Section headings (lines that end with specific patterns or are short and bold-looking)
    if (
      line === "We've received your complaint" ||
      line === "We're here to help" ||
      line === "Next Steps" ||
      line === "Your options now" ||
      line === "Your complaint details" ||
      line === "My decision and findings" ||
      line === "Our Commitment to Handling Complaints" ||
      line === "What happens next?" ||
      line === "Not satisfied with our response?" ||
      line === "The Financial Ombudsman Service" ||
      line === "We're still investigating your complaint" ||
      line === "We're gathering the information" ||
      line === "We're finalising the information" ||
      line === "We're redirecting your complaint..." ||
      line === "Your complaint is being sent to..." ||
      line === "We've investigated your complaint" ||
      line === "Our findings" ||
      line === "Your options" ||
      line.endsWith(":") ||
      (line.length < 50 && !line.includes(".") && i > 0)
    ) {
      paragraphs.push(createSectionHeading(line));
      continue;
    }

    // Subject line (first heading after address block)
    if (line === "Dear " || line.startsWith("Dear ")) {
      paragraphs.push(createBodyParagraph(line));
      continue;
    }

    // Signature lines
    if (line === "Yours sincerely," || line === "Yours faithfully,") {
      paragraphs.push(new Paragraph({ spacing: { before: 240 } }));
      paragraphs.push(createSignatureParagraph(line));
      continue;
    }

    // Enclosure line
    if (line.startsWith("Enc.")) {
      paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: FONT_FAMILY,
              size: FONT_SIZE_SMALL,
              italics: true,
            }),
          ],
        })
      );
      continue;
    }

    // Contact details (phone, email, website)
    if (
      line.startsWith("Write to:") ||
      line.startsWith("Phone:") ||
      line.startsWith("Email:") ||
      line.startsWith("Website:")
    ) {
      paragraphs.push(createAddressParagraph(line));
      continue;
    }

    // Regular body paragraph
    paragraphs.push(createBodyParagraph(line));
  }

  return paragraphs;
}

// =====================================================
// MAIN GENERATOR FUNCTIONS
// =====================================================

/**
 * Build template variables from complaint and organization data
 */
export function buildTemplateVariables(
  complaint: ComplaintRecord,
  organization: OrganizationSettings,
  contactName: string,
  contactTitle: string,
  customVariables?: Record<string, string>
): Record<string, string> {
  const variables: Record<string, string> = {
    // Complaint variables
    complainant_name: complaint.complainant_name,
    complainant_salutation: customVariables?.complainant_salutation || "",
    complaint_reference: complaint.complaint_reference || "",
    received_date: formatLetterDate(complaint.received_date),
    contact_method: formatContactMethod(complaint.contact_method),
    product_type: complaint.product_type || "product/service",
    complainant_address: complaint.complainant_address || "",

    // Organization variables
    firm_name: organization.companyName,
    firm_address: organization.address,
    firm_phone: organization.phone,

    // Contact variables
    contact_name: contactName,
    contact_title: contactTitle,
    current_date: formatLetterDate(new Date()),

    // Custom variables
    ...customVariables,
  };

  return variables;
}

/**
 * Generate letter content with variable substitution
 */
export function generateLetterContent(options: LetterGenerationOptions): string {
  const variables = buildTemplateVariables(
    options.complaint,
    options.organization,
    options.contactName,
    options.contactTitle,
    options.customVariables
  );

  return renderLetterContent(options.template, variables);
}

/**
 * Generate DOCX document from letter content
 */
export async function generateLetterDOCX(options: LetterGenerationOptions): Promise<GeneratedLetter> {
  const content = generateLetterContent(options);
  const paragraphs = parseLetterContent(content);

  // Create header with firm name
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: options.organization.companyName,
            font: FONT_FAMILY,
            size: FONT_SIZE_SMALL,
            color: "666666",
          }),
        ],
      }),
    ],
  });

  // Create footer with page number
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "Page ",
            font: FONT_FAMILY,
            size: FONT_SIZE_SMALL,
            color: "666666",
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            font: FONT_FAMILY,
            size: FONT_SIZE_SMALL,
            color: "666666",
          }),
          new TextRun({
            text: " of ",
            font: FONT_FAMILY,
            size: FONT_SIZE_SMALL,
            color: "666666",
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            font: FONT_FAMILY,
            size: FONT_SIZE_SMALL,
            color: "666666",
          }),
        ],
      }),
    ],
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: header,
        },
        footers: {
          default: footer,
        },
        children: paragraphs,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);

  // Generate filename
  const templateName = options.template.id.replace(/_/g, "-");
  const date = new Date().toISOString().split("T")[0];
  const reference = options.complaint.complaint_reference?.replace(/[^a-zA-Z0-9-]/g, "") || "letter";
  const filename = `${reference}-${templateName}-${date}.docx`;

  return {
    content,
    buffer: Buffer.from(buffer),
    filename,
  };
}

/**
 * Generate letter from template ID
 */
export async function generateLetterFromTemplate(
  templateId: LetterTemplateType,
  complaint: ComplaintRecord,
  organization: OrganizationSettings,
  contactName: string,
  contactTitle: string,
  customVariables?: Record<string, string>
): Promise<GeneratedLetter | null> {
  const template = getLetterTemplate(templateId);
  if (!template) {
    return null;
  }

  return generateLetterDOCX({
    template,
    complaint,
    organization,
    contactName,
    contactTitle,
    customVariables,
  });
}

/**
 * Preview letter content without generating DOCX
 */
export function previewLetterContent(
  templateId: LetterTemplateType,
  complaint: ComplaintRecord,
  organization: OrganizationSettings,
  contactName: string,
  contactTitle: string,
  customVariables?: Record<string, string>
): string | null {
  const template = getLetterTemplate(templateId);
  if (!template) {
    return null;
  }

  const variables = buildTemplateVariables(
    complaint,
    organization,
    contactName,
    contactTitle,
    customVariables
  );

  return renderLetterContent(template, variables);
}
