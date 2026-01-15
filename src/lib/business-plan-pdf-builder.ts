import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { htmlToText } from "@/lib/authorization-pack-export";

// Color palette (Nasara brand colors)
const COLORS = {
  primary: { r: 0.31, g: 0.27, b: 0.9 },      // Indigo
  secondary: { r: 0.13, g: 0.55, b: 0.55 },   // Teal
  text: { r: 0.12, g: 0.16, b: 0.22 },        // Dark slate
  muted: { r: 0.42, g: 0.45, b: 0.5 },        // Gray
  light: { r: 0.65, g: 0.68, b: 0.72 },       // Light gray
  success: { r: 0.13, g: 0.55, b: 0.45 },     // Green
  warning: { r: 0.85, g: 0.55, b: 0.15 },     // Amber
};

export interface BusinessPlanSection {
  sectionKey: string;
  title: string;
  description: string;
  displayOrder: number;
  outline: string[];
  prompts: Array<{
    title: string;
    response: string | null;
  }>;
  evidence: Array<{
    name: string;
    status: string;
    annexNumber: string | null;
  }>;
  narrativeCompletion: number;
  evidenceCompletion: number;
  synthesizedContent?: string;
}

export interface FirmBasics {
  legalName?: string;
  companyNumber?: string;
  incorporationDate?: string;
  firmStage?: string;
  regulatedActivities?: string;
  headcount?: number;
  primaryJurisdiction?: string;
  primaryContact?: string;
  contactEmail?: string;
  address?: string;
}

export interface BusinessPlanConfig {
  packName: string;
  packType: string;
  readiness: {
    overall: number;
    narrative: number;
    evidence: number;
  };
  firmBasics?: FirmBasics;
  readinessSignals?: Record<string, "missing" | "partial" | "complete">;
}

interface DrawContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  pageNum: number;
  margin: number;
  width: number;
  height: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function addPage(ctx: DrawContext): void {
  ctx.page = ctx.pdfDoc.addPage();
  ctx.y = ctx.height - ctx.margin;
  ctx.pageNum += 1;

  // Add page footer
  ctx.page.drawText(`Page ${ctx.pageNum}`, {
    x: ctx.width - ctx.margin - 50,
    y: 30,
    font: ctx.fontRegular,
    size: 9,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
}

function ensureSpace(ctx: DrawContext, requiredHeight: number): void {
  if (ctx.y - requiredHeight < ctx.margin + 40) {
    addPage(ctx);
  }
}

function drawText(
  ctx: DrawContext,
  text: string,
  font: PDFFont,
  fontSize: number,
  color: { r: number; g: number; b: number } = COLORS.text,
  extraSpacing = 6,
  indent = 0
): void {
  const maxWidth = ctx.width - ctx.margin * 2 - indent;
  const lineHeight = fontSize * 1.5;
  const lines = wrapText(text, font, fontSize, maxWidth);

  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line, {
      x: ctx.margin + indent,
      y: ctx.y,
      font,
      size: fontSize,
      color: rgb(color.r, color.g, color.b),
    });
    ctx.y -= lineHeight;
  }
  ctx.y -= extraSpacing;
}

function drawHorizontalLine(ctx: DrawContext, color = COLORS.light): void {
  ensureSpace(ctx, 20);
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 0.5,
    color: rgb(color.r, color.g, color.b),
  });
  ctx.y -= 15;
}

function buildCoverPage(ctx: DrawContext, config: BusinessPlanConfig): void {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const basics = config.firmBasics;

  // Title
  ctx.y = ctx.height - 100;
  ctx.page.drawText("BUSINESS PLAN", {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontBold,
    size: 36,
    color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
  });
  ctx.y -= 50;

  // Subtitle
  ctx.page.drawText("FCA Authorization Application", {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 16,
    color: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
  });
  ctx.y -= 40;

  // Firm name (from assessment or pack name)
  const firmName = basics?.legalName || config.packName;
  ctx.page.drawText(firmName, {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontBold,
    size: 22,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.y -= 30;

  // Company info line (if available)
  if (basics?.companyNumber) {
    ctx.page.drawText(`Company No: ${basics.companyNumber}`, {
      x: ctx.margin,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 11,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    ctx.y -= 18;
  }

  // Pack type and date
  ctx.page.drawText(`Pack Type: ${config.packType}`, {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 11,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.page.drawText(`Generated: ${generatedDate}`, {
    x: ctx.margin + 250,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 11,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 35;

  // Firm Profile Box (if we have firm basics)
  if (basics && (basics.firmStage || basics.regulatedActivities || basics.headcount || basics.primaryJurisdiction)) {
    ctx.page.drawRectangle({
      x: ctx.margin,
      y: ctx.y - 100,
      width: ctx.width - ctx.margin * 2,
      height: 110,
      borderColor: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
      borderWidth: 1,
      color: rgb(0.97, 1, 0.99),
    });

    ctx.y -= 15;
    ctx.page.drawText("Firm Profile", {
      x: ctx.margin + 15,
      y: ctx.y,
      font: ctx.fontBold,
      size: 11,
      color: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
    });
    ctx.y -= 22;

    // Row 1: Stage and Activities
    if (basics.firmStage) {
      ctx.page.drawText(`Stage: ${basics.firmStage}`, {
        x: ctx.margin + 15,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 10,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
      });
    }
    if (basics.regulatedActivities) {
      ctx.page.drawText(`Activities: ${basics.regulatedActivities}`, {
        x: ctx.margin + 180,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 10,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
      });
    }
    ctx.y -= 18;

    // Row 2: Headcount and Jurisdiction
    if (basics.headcount) {
      ctx.page.drawText(`Headcount: ${basics.headcount} staff`, {
        x: ctx.margin + 15,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 10,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
      });
    }
    if (basics.primaryJurisdiction) {
      ctx.page.drawText(`Jurisdiction: ${basics.primaryJurisdiction}`, {
        x: ctx.margin + 180,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 10,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
      });
    }
    ctx.y -= 18;

    // Row 3: Address (if available)
    if (basics.address) {
      ctx.page.drawText(`Address: ${basics.address}`, {
        x: ctx.margin + 15,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 9,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
      });
    }
    ctx.y -= 40;
  }

  // Readiness summary box
  ctx.page.drawRectangle({
    x: ctx.margin,
    y: ctx.y - 80,
    width: ctx.width - ctx.margin * 2,
    height: 90,
    borderColor: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
    borderWidth: 1,
    color: rgb(0.97, 0.97, 1),
  });

  ctx.y -= 15;
  ctx.page.drawText("Readiness Summary", {
    x: ctx.margin + 15,
    y: ctx.y,
    font: ctx.fontBold,
    size: 11,
    color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
  });
  ctx.y -= 22;

  ctx.page.drawText(`Overall: ${config.readiness.overall}%`, {
    x: ctx.margin + 15,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.page.drawText(`Narrative: ${config.readiness.narrative}%`, {
    x: ctx.margin + 130,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.page.drawText(`Evidence: ${config.readiness.evidence}%`, {
    x: ctx.margin + 260,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.y -= 22;

  // Readiness signals (if available)
  if (config.readinessSignals && Object.keys(config.readinessSignals).length > 0) {
    const signals = config.readinessSignals;
    const signalLabels: Record<string, string> = {
      businessPlanDraft: "Business Plan",
      financialModel: "Financials",
      technologyStack: "Technology",
      safeguardingSetup: "Safeguarding",
      amlFramework: "AML/CTF",
      riskFramework: "Risk",
      governancePack: "Governance",
    };

    let xPos = ctx.margin + 15;
    for (const [key, status] of Object.entries(signals)) {
      const label = signalLabels[key] || key;
      const icon = status === "complete" ? "[OK]" : status === "partial" ? "[~]" : "[-]";
      const iconColor = status === "complete" ? COLORS.success : status === "partial" ? COLORS.warning : COLORS.muted;

      ctx.page.drawText(`${label}: `, {
        x: xPos,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 8,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
      });
      ctx.page.drawText(icon, {
        x: xPos + ctx.fontRegular.widthOfTextAtSize(label + ": ", 8),
        y: ctx.y,
        font: ctx.fontBold,
        size: 8,
        color: rgb(iconColor.r, iconColor.g, iconColor.b),
      });
      xPos += 70;
      if (xPos > ctx.width - ctx.margin - 70) {
        xPos = ctx.margin + 15;
        ctx.y -= 12;
      }
    }
  }

  // Contact info (if available)
  if (basics?.primaryContact || basics?.contactEmail) {
    ctx.y = 120;
    if (basics.primaryContact) {
      ctx.page.drawText(`Primary Contact: ${basics.primaryContact}`, {
        x: ctx.margin,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 9,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
      });
      ctx.y -= 12;
    }
    if (basics.contactEmail) {
      ctx.page.drawText(`Email: ${basics.contactEmail}`, {
        x: ctx.margin,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 9,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
      });
    }
  }

  // Footer note
  ctx.y = 50;
  ctx.page.drawText("This document has been generated by Nasara Connect for FCA authorization pack submission.", {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 8,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
}

function buildTableOfContents(ctx: DrawContext, sections: BusinessPlanSection[]): void {
  addPage(ctx);

  drawText(ctx, "Table of Contents", ctx.fontBold, 20, COLORS.primary, 20);
  drawHorizontalLine(ctx);
  ctx.y -= 10;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const sectionNum = i + 1;

    // Status indicator
    let statusIcon: string;
    let statusColor: { r: number; g: number; b: number };
    if (section.narrativeCompletion >= 80) {
      statusIcon = "[Complete]";
      statusColor = COLORS.success;
    } else if (section.narrativeCompletion > 0) {
      statusIcon = "[In Progress]";
      statusColor = COLORS.warning;
    } else {
      statusIcon = "[Not Started]";
      statusColor = COLORS.muted;
    }

    ensureSpace(ctx, 25);

    const titleText = `${sectionNum}. ${section.title}`;
    ctx.page.drawText(titleText, {
      x: ctx.margin,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 11,
      color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });

    ctx.page.drawText(statusIcon, {
      x: ctx.width - ctx.margin - 80,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 9,
      color: rgb(statusColor.r, statusColor.g, statusColor.b),
    });

    ctx.y -= 20;
  }
}

function renderCompleteSectionContent(
  ctx: DrawContext,
  section: BusinessPlanSection
): void {
  // If we have synthesized content from AI, use that
  if (section.synthesizedContent) {
    const paragraphs = section.synthesizedContent.split(/\n\n+/).filter(Boolean);
    for (const para of paragraphs) {
      const lines = para.split(/\n/).filter(Boolean);
      for (const line of lines) {
        if (line.startsWith("**") && line.endsWith("**")) {
          drawText(ctx, line.replace(/\*\*/g, ""), ctx.fontBold, 11, COLORS.text, 6, 0);
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          drawText(ctx, line, ctx.fontRegular, 10, COLORS.text, 3, 15);
        } else {
          drawText(ctx, line, ctx.fontRegular, 10, COLORS.text, 3, 0);
        }
      }
      ctx.y -= 8;
    }
  } else {
    // Fallback: show prompt responses directly
    for (const prompt of section.prompts) {
      if (prompt.response && prompt.response.trim()) {
        drawText(ctx, prompt.title, ctx.fontBold, 11, COLORS.text, 4);
        const cleanResponse = htmlToText(prompt.response) || "";
        drawText(ctx, cleanResponse, ctx.fontRegular, 10, COLORS.text, 10);
      }
    }
  }
}

function renderPlaceholderContent(
  ctx: DrawContext,
  section: BusinessPlanSection
): void {
  ctx.y -= 10;

  // Placeholder box
  ensureSpace(ctx, 150);
  ctx.page.drawRectangle({
    x: ctx.margin + 30,
    y: ctx.y - 100,
    width: ctx.width - ctx.margin * 2 - 60,
    height: 110,
    borderColor: rgb(COLORS.warning.r, COLORS.warning.g, COLORS.warning.b),
    borderWidth: 1,
    color: rgb(1, 0.98, 0.95),
  });

  ctx.y -= 20;
  ctx.page.drawText("TO BE COMPLETED", {
    x: ctx.width / 2 - 60,
    y: ctx.y,
    font: ctx.fontBold,
    size: 14,
    color: rgb(COLORS.warning.r, COLORS.warning.g, COLORS.warning.b),
  });
  ctx.y -= 25;

  ctx.page.drawText("This section requires narrative content.", {
    x: ctx.margin + 50,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 15;
  ctx.page.drawText("Please complete the prompts in the pack workspace.", {
    x: ctx.margin + 50,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 50;

  // List required prompts
  drawText(ctx, "Required prompts:", ctx.fontBold, 10, COLORS.muted, 6, 30);

  const unansweredPrompts = section.prompts.filter(
    (p) => !p.response || !p.response.trim()
  );
  for (const prompt of unansweredPrompts.slice(0, 5)) {
    drawText(ctx, `- ${prompt.title}`, ctx.fontRegular, 9, COLORS.muted, 3, 40);
  }
  if (unansweredPrompts.length > 5) {
    drawText(
      ctx,
      `... and ${unansweredPrompts.length - 5} more`,
      ctx.fontRegular,
      9,
      COLORS.muted,
      3,
      40
    );
  }
}

function renderPartialContent(
  ctx: DrawContext,
  section: BusinessPlanSection
): void {
  // Show completed prompts
  for (const prompt of section.prompts) {
    if (prompt.response && prompt.response.trim()) {
      drawText(ctx, prompt.title, ctx.fontBold, 11, COLORS.text, 4);
      const cleanResponse = htmlToText(prompt.response) || "";
      drawText(ctx, cleanResponse, ctx.fontRegular, 10, COLORS.text, 10);
    }
  }

  // Show remaining items notice
  const unansweredPrompts = section.prompts.filter(
    (p) => !p.response || !p.response.trim()
  );

  if (unansweredPrompts.length > 0) {
    ctx.y -= 15;
    drawHorizontalLine(ctx, COLORS.warning);

    drawText(
      ctx,
      `[Remaining content to be completed: ${unansweredPrompts.length} prompt(s)]`,
      ctx.fontBold,
      10,
      COLORS.warning,
      10
    );

    for (const prompt of unansweredPrompts.slice(0, 3)) {
      drawText(ctx, `- ${prompt.title}`, ctx.fontRegular, 9, COLORS.muted, 3, 15);
    }
    if (unansweredPrompts.length > 3) {
      drawText(
        ctx,
        `... and ${unansweredPrompts.length - 3} more`,
        ctx.fontRegular,
        9,
        COLORS.muted,
        3,
        15
      );
    }
  }
}

function renderSection(
  ctx: DrawContext,
  section: BusinessPlanSection,
  sectionIndex: number
): void {
  // Start new page for each section
  addPage(ctx);

  const sectionNum = sectionIndex + 1;
  const completionStatus =
    section.narrativeCompletion >= 80 ? "Complete" :
    section.narrativeCompletion > 0 ? "In Progress" : "Not Started";

  // Section header
  drawText(
    ctx,
    `Section ${sectionNum}`,
    ctx.fontRegular,
    10,
    COLORS.muted,
    2
  );

  drawText(ctx, section.title, ctx.fontBold, 18, COLORS.primary, 8);

  // Completion badge
  ctx.page.drawText(`[${section.narrativeCompletion}% ${completionStatus}]`, {
    x: ctx.width - ctx.margin - 100,
    y: ctx.y + 30,
    font: ctx.fontRegular,
    size: 9,
    color: rgb(
      section.narrativeCompletion >= 80 ? COLORS.success.r :
      section.narrativeCompletion > 0 ? COLORS.warning.r : COLORS.muted.r,
      section.narrativeCompletion >= 80 ? COLORS.success.g :
      section.narrativeCompletion > 0 ? COLORS.warning.g : COLORS.muted.g,
      section.narrativeCompletion >= 80 ? COLORS.success.b :
      section.narrativeCompletion > 0 ? COLORS.warning.b : COLORS.muted.b
    ),
  });

  drawHorizontalLine(ctx);

  // Section overview
  drawText(ctx, "SECTION OVERVIEW", ctx.fontBold, 10, COLORS.secondary, 6);
  drawText(ctx, section.description, ctx.fontRegular, 10, COLORS.text, 15);

  // Section outline (required coverage)
  if (section.outline && section.outline.length > 0) {
    drawText(ctx, "REQUIRED COVERAGE", ctx.fontBold, 10, COLORS.secondary, 6);
    drawText(
      ctx,
      "This section should address the following topics:",
      ctx.fontRegular,
      9,
      COLORS.muted,
      6
    );

    for (const item of section.outline) {
      drawText(ctx, `  \u2022 ${item}`, ctx.fontRegular, 9, COLORS.text, 3);
    }
    ctx.y -= 15;
  }

  // Narrative content
  drawText(ctx, "NARRATIVE CONTENT", ctx.fontBold, 10, COLORS.secondary, 10);

  if (section.narrativeCompletion >= 80) {
    // Complete: show synthesized or full content
    renderCompleteSectionContent(ctx, section);
  } else if (section.narrativeCompletion > 0) {
    // Partial: show what's there plus notice
    renderPartialContent(ctx, section);
  } else {
    // Empty: show placeholder
    renderPlaceholderContent(ctx, section);
  }

  // Evidence summary
  if (section.evidence && section.evidence.length > 0) {
    ctx.y -= 20;
    drawHorizontalLine(ctx);

    drawText(ctx, "SUPPORTING EVIDENCE", ctx.fontBold, 10, COLORS.secondary, 8);

    const uploadedEvidence = section.evidence.filter(
      (e) => e.status === "uploaded" || e.status === "approved"
    );
    const missingEvidence = section.evidence.filter(
      (e) => e.status !== "uploaded" && e.status !== "approved"
    );

    drawText(
      ctx,
      `Evidence status: ${uploadedEvidence.length}/${section.evidence.length} items uploaded`,
      ctx.fontRegular,
      9,
      COLORS.muted,
      8
    );

    // List evidence items
    for (const item of section.evidence.slice(0, 6)) {
      const statusIcon =
        item.status === "uploaded" || item.status === "approved" ? "[Uploaded]" : "[Missing]";
      const statusColor =
        item.status === "uploaded" || item.status === "approved" ? COLORS.success : COLORS.warning;

      ensureSpace(ctx, 15);
      ctx.page.drawText(`${item.annexNumber || "-"}: ${item.name}`, {
        x: ctx.margin + 10,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 9,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
      });
      ctx.page.drawText(statusIcon, {
        x: ctx.width - ctx.margin - 60,
        y: ctx.y,
        font: ctx.fontRegular,
        size: 8,
        color: rgb(statusColor.r, statusColor.g, statusColor.b),
      });
      ctx.y -= 14;
    }

    if (section.evidence.length > 6) {
      drawText(
        ctx,
        `... and ${section.evidence.length - 6} more evidence items`,
        ctx.fontRegular,
        8,
        COLORS.muted,
        3,
        10
      );
    }
  }
}

function buildEndPage(ctx: DrawContext, config: BusinessPlanConfig): void {
  addPage(ctx);

  ctx.y = ctx.height - 250;

  ctx.page.drawText("--- End of Business Plan ---", {
    x: ctx.width / 2 - 80,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 12,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 50;

  // Final readiness summary
  ctx.page.drawRectangle({
    x: ctx.margin + 50,
    y: ctx.y - 100,
    width: ctx.width - ctx.margin * 2 - 100,
    height: 110,
    borderColor: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
    borderWidth: 1,
    color: rgb(0.97, 1, 1),
  });

  ctx.y -= 20;
  ctx.page.drawText("Final Readiness Summary", {
    x: ctx.width / 2 - 70,
    y: ctx.y,
    font: ctx.fontBold,
    size: 13,
    color: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
  });
  ctx.y -= 30;

  ctx.page.drawText(`Overall Completion: ${config.readiness.overall}%`, {
    x: ctx.margin + 70,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 11,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.y -= 20;

  ctx.page.drawText(`Narrative: ${config.readiness.narrative}%`, {
    x: ctx.margin + 70,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.page.drawText(`Evidence: ${config.readiness.evidence}%`, {
    x: ctx.margin + 200,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 80;

  // Next steps
  if (config.readiness.overall < 100) {
    ctx.page.drawText("Next Steps:", {
      x: ctx.margin + 50,
      y: ctx.y,
      font: ctx.fontBold,
      size: 11,
      color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    ctx.y -= 20;

    ctx.page.drawText("1. Complete remaining narrative sections marked 'To be completed'", {
      x: ctx.margin + 50,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 10,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    ctx.y -= 15;

    ctx.page.drawText("2. Upload missing evidence items", {
      x: ctx.margin + 50,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 10,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    ctx.y -= 15;

    ctx.page.drawText("3. Submit sections for consultant and client review", {
      x: ctx.margin + 50,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 10,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    ctx.y -= 15;

    ctx.page.drawText("4. Re-generate this document once complete", {
      x: ctx.margin + 50,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 10,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
  }

  // Footer
  ctx.y = 60;
  ctx.page.drawText("Generated by Nasara Connect", {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 9,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
}

export async function buildGoldStandardBusinessPlan(
  config: BusinessPlanConfig,
  sections: BusinessPlanSection[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 50;

  const ctx: DrawContext = {
    pdfDoc,
    page,
    y: height - margin,
    pageNum: 1,
    margin,
    width,
    height,
    fontRegular,
    fontBold,
  };

  // 1. Cover page
  buildCoverPage(ctx, config);

  // 2. Table of contents
  buildTableOfContents(ctx, sections);

  // 3. All sections
  for (let i = 0; i < sections.length; i++) {
    renderSection(ctx, sections[i], i);
  }

  // 4. End page
  buildEndPage(ctx, config);

  return pdfDoc.save();
}
