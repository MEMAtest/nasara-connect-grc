import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { requireRole } from "@/lib/rbac";
import { getPolicyById } from "@/lib/server/policy-store";
import { renderClause, renderLiquidTemplate } from "@/lib/policies/liquid-renderer";
import { sanitizeClauseContent, DEFAULT_SANITIZE_OPTIONS } from "@/lib/policies/content-sanitizer";
import { applyTiering, type DetailLevel, type TieredSection } from "@/lib/policies/clause-tiers";
import { applyOptionSelections } from "@/lib/policies/section-options";
import { resolveNotePlaceholders } from "@/lib/policies/section-notes";
import type { JsonValue } from "@/lib/policies/types";

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function isTocClause(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 6) return false;
  const tocLines = lines.filter((line) => /\d{1,3}$/.test(line) && !/[.!?]$/.test(line));
  return tocLines.length / lines.length >= 0.7;
}

function isTocArtifactLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.includes(":")) return false;
  if (/\bby\b/i.test(trimmed)) return false;
  if (/[.!?]$/.test(trimmed)) return false;
  const lastToken = trimmed.split(/\s+/).pop() ?? "";
  return /[A-Za-z]+\d{1,3}$/.test(lastToken);
}

function stripTocArtifacts(text: string): string {
  const lines = text.split(/\r?\n/);
  const artifactIndexes = lines
    .map((line, index) => (isTocArtifactLine(line) ? index : -1))
    .filter((index) => index >= 0);

  if (artifactIndexes.length < 3) {
    return text;
  }

  const artifactSet = new Set(artifactIndexes);
  return lines.filter((_line, index) => !artifactSet.has(index)).join("\n");
}

function normalizeMarkdownTables(input: string): string {
  const lines = input.split(/\r?\n/);
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    const isHeaderRow = line.trim().startsWith("|") && nextLine && /^\s*\|?\s*[-:]+/.test(nextLine.trim());

    if (isHeaderRow) {
      const headers = line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);
      i += 2;

      while (i < lines.length && lines[i].includes("|")) {
        const row = lines[i]
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);
        if (row.length) {
          let cells: string[] = [];
          if (headers.length && row.length === headers.length) {
            cells = headers
              .map((header, index) => {
                const value = row[index];
                return value ? `${header}: ${value}` : "";
              })
              .filter(Boolean);
          } else if (row.length === 2) {
            cells = [`${row[0]}: ${row[1]}`];
          } else {
            cells = row;
          }
          if (cells.length) {
            output.push(`- ${cells.join(" | ")}`);
          }
        }
        i += 1;
      }
      continue;
    }

    output.push(line);
    i += 1;
  }

  return output.join("\n");
}

function stripHtml(html: string): string {
  const normalized = normalizeMarkdownTables(html);
  let cleaned = normalized
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/:([A-Za-z])/g, ": $1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = cleaned.split("\n").map((line) => {
    if (/^\s*[•·]\s+/.test(line)) {
      return line.replace(/^\s*[•·]\s+/, "• ");
    }
    return line
      .replace(/\s*[•·]\s*/g, ", ")
      .replace(/^,\s*/, "")
      .replace(/,\s*$/, "")
      .replace(/,\s*,/g, ",");
  });

  cleaned = lines.join("\n").trim();
  return stripTocArtifacts(cleaned);
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

interface DrawContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  margin: number;
  width: number;
  height: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;
  primaryColor: { r: number; g: number; b: number };
}

interface RenderedClause {
  title: string;
  code: string;
  rendered_body: string;
  is_mandatory: boolean;
}

interface RenderedSection {
  id: string;
  title: string;
  sectionType?: string;
  clauses: RenderedClause[];
  customNotes?: string;
}

const POLICY_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  preserveProceduralLists: false,
};

const NOTE_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  convertBulletsToProseText: false,
  preserveProceduralLists: false,
};

function sanitizeForSection(content: string, sectionType?: string): string {
  const options = sectionType === "procedure" ? DEFAULT_SANITIZE_OPTIONS : POLICY_SANITIZE_OPTIONS;
  return sanitizeClauseContent(content, options);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function ensurePage(ctx: DrawContext, requiredHeight: number): void {
  if (ctx.y - requiredHeight < ctx.margin) {
    ctx.page = ctx.pdfDoc.addPage();
    ctx.y = ctx.height - ctx.margin;
  }
}

function drawText(
  ctx: DrawContext,
  text: string,
  font: PDFFont,
  fontSize: number,
  color: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
  extraSpacing = 6
): void {
  const maxWidth = ctx.width - ctx.margin * 2;
  const lineHeight = fontSize * 1.4;
  const lines = wrapText(text, font, fontSize, maxWidth);

  for (const line of lines) {
    ensurePage(ctx, lineHeight);
    ctx.page.drawText(line, {
      x: ctx.margin,
      y: ctx.y,
      font,
      size: fontSize,
      color: rgb(color.r, color.g, color.b),
    });
    ctx.y -= lineHeight;
  }
  ctx.y -= extraSpacing;
}

function drawHeading(ctx: DrawContext, text: string, level: 1 | 2 | 3): void {
  const sizes = { 1: 18, 2: 14, 3: 12 };
  const spacing = { 1: 12, 2: 10, 3: 8 };
  ensurePage(ctx, sizes[level] * 2);
  ctx.y -= spacing[level];
  drawText(ctx, text, ctx.fontBold, sizes[level], ctx.primaryColor, spacing[level]);
}

function drawBullet(ctx: DrawContext, text: string): void {
  const fontSize = 10;
  const lineHeight = fontSize * 1.4;
  const indent = 12;
  const maxWidth = ctx.width - ctx.margin * 2 - indent;
  const lines = wrapText(text, ctx.fontRegular, fontSize, maxWidth);

  lines.forEach((line, index) => {
    ensurePage(ctx, lineHeight);
    if (index === 0) {
      ctx.page.drawText("•", {
        x: ctx.margin,
        y: ctx.y,
        font: ctx.fontRegular,
        size: fontSize,
        color: rgb(0.12, 0.16, 0.22),
      });
    }
    ctx.page.drawText(line, {
      x: ctx.margin + indent,
      y: ctx.y,
      font: ctx.fontRegular,
      size: fontSize,
      color: rgb(0.12, 0.16, 0.22),
    });
    ctx.y -= lineHeight;
  });
  ctx.y -= 2;
}

function drawParagraph(ctx: DrawContext, text: string): void {
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      ctx.y -= 4;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length === 1 ? 2 : 3;
      drawHeading(ctx, headingMatch[2], level);
      continue;
    }

    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      drawBullet(ctx, bulletMatch[1]);
      continue;
    }

    if (trimmed.endsWith(":") && trimmed.length <= 80) {
      drawText(ctx, trimmed, ctx.fontBold, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
      continue;
    }

    drawText(ctx, trimmed, ctx.fontRegular, 10, { r: 0.12, g: 0.16, b: 0.22 }, 4);
  }
  ctx.y -= 6;
}

function drawNoteBlock(ctx: DrawContext, text: string): void {
  const cleaned = stripHtml(sanitizeClauseContent(text, NOTE_SANITIZE_OPTIONS));
  if (!cleaned) return;
  drawText(ctx, "Firm-specific detail", ctx.fontBold, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
  drawParagraph(ctx, cleaned);
  ctx.y -= 6;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { auth, error } = await requireRole("member");
    if (error) return error;
    const { policyId } = await params;
    const policy = await getPolicyById(auth.organizationId, policyId);

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const detailLevelParam = url.searchParams.get("detailLevel") as DetailLevel | null;
    const inline = url.searchParams.get("inline") === "1";

    const customContent = (policy.customContent ?? {}) as {
      firmProfile?: Record<string, unknown>;
      policyInputs?: Record<string, unknown>;
      sectionClauses?: Record<string, string[]>;
      sectionNotes?: Record<string, string>;
      clauseVariables?: Record<string, Record<string, string>>;
      detailLevel?: DetailLevel;
      governance?: Record<string, unknown>;
      approvals?: Record<string, unknown>;
      sectionOptions?: Record<string, Record<string, string>>;
    };

    const firmProfile = (customContent.firmProfile ?? {}) as Record<string, unknown>;
    const policyInputs = (customContent.policyInputs ?? {}) as Record<string, unknown>;
    const firmName =
      typeof firmProfile.name === "string" && firmProfile.name.trim().length > 0
        ? firmProfile.name.trim()
        : "Firm";

    const governance = customContent.governance ?? {};
    const policyVersion =
      typeof governance.version === "string" && governance.version.trim().length > 0
        ? governance.version.trim()
        : "1.0";

    const detailLevel: DetailLevel =
      detailLevelParam || customContent.detailLevel || "standard";

    const sectionClauses = customContent.sectionClauses ?? {};
    const sectionNotes = customContent.sectionNotes ?? {};
    const clauseVariables = customContent.clauseVariables ?? {};
    const sectionOptions = customContent.sectionOptions ?? {};
    const approvals = {
      ...(policy.approvals ?? {}),
      ...(customContent.approvals ?? {}),
    };

    // Values originate from JSON storage so are inherently JsonValue-shaped
    const renderContext = {
      firm: firmProfile,
      firm_name: firmName,
      permissions: policy.permissions,
      ...policyInputs,
    } as unknown as Record<string, JsonValue>;

    const tieredSections = applyTiering(
      policy.template,
      policy.clauses,
      detailLevel,
      Object.keys(sectionClauses).length > 0 ? sectionClauses : undefined
    );

    const documentSections: RenderedSection[] = (tieredSections
      .map((tieredSection: TieredSection) => {
        const renderedClauses: RenderedClause[] = tieredSection.clauses
          .filter((clause) => !isTocClause(clause.content))
          .map((clause) => ({
            title: clause.title,
            code: clause.id,
            rendered_body: renderClause(
              clause.content,
              renderContext,
              clauseVariables[clause.id] ?? {}
            ),
            is_mandatory: clause.isMandatory ?? false,
          }));

        const sectionId = tieredSection.originalSectionId || tieredSection.id;
        const optionsForSection = sectionOptions[sectionId];
        if (optionsForSection && Object.keys(optionsForSection).length > 0) {
          const optionContent = applyOptionSelections(optionsForSection, policy.template.code, sectionId);
          if (optionContent) {
            renderedClauses.unshift({
              title: "",
              code: `${sectionId}-options`,
              rendered_body: optionContent,
              is_mandatory: false,
            });
          }
        }

        if (renderedClauses.length === 0) {
          return null;
        }

        const rawNotes = sectionNotes[sectionId];
        const renderedNotes =
          typeof rawNotes === "string" && rawNotes.trim().length > 0
            ? renderLiquidTemplate(rawNotes, renderContext)
            : rawNotes;
        const resolvedNotes =
          typeof renderedNotes === "string" && renderedNotes.trim().length > 0
            ? resolveNotePlaceholders(renderedNotes, firmName)
            : renderedNotes;

        return {
          id: tieredSection.id,
          title: tieredSection.title,
          sectionType: tieredSection.sectionType,
          clauses: renderedClauses,
          customNotes: resolvedNotes,
        };
      })
      .filter(Boolean)) as RenderedSection[];

    const versionHistory = [];
    if (policyVersion) {
      versionHistory.push({
        version: policyVersion,
        date: new Date().toLocaleDateString("en-GB"),
        author: typeof approvals.smfRole === "string" ? approvals.smfRole : "Policy Team",
        changes: "Initial version generated",
      });
    }

    const metadata = {
      generated_at: new Date().toISOString(),
      effective_date: typeof governance.effectiveDate === "string"
        ? governance.effectiveDate
        : new Date().toISOString(),
      next_review_date: typeof governance.nextReviewAt === "string"
        ? governance.nextReviewAt
        : undefined,
      owner: typeof governance.owner === "string"
        ? governance.owner
        : typeof approvals.smfRole === "string"
          ? approvals.smfRole
          : "Compliance",
      approved_by: typeof approvals.smfRole === "string" ? approvals.smfRole : undefined,
      classification: "Internal Use Only",
    };

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const primaryColor = hexToRgb("#4F46E5");

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;

    const ctx: DrawContext = {
      pdfDoc,
      page,
      y: height - margin,
      margin,
      width,
      height,
      fontRegular,
      fontBold,
      primaryColor,
    };

    // Cover page
    ctx.y -= 60;
    ctx.page.drawText(firmName.toUpperCase(), {
      x: margin,
      y: ctx.y,
      font: fontRegular,
      size: 12,
      color: rgb(0.42, 0.45, 0.5),
    });
    ctx.y -= 40;

    ctx.page.drawText(policy.name, {
      x: margin,
      y: ctx.y,
      font: fontBold,
      size: 26,
      color: rgb(primaryColor.r, primaryColor.g, primaryColor.b),
    });
    ctx.y -= 30;

    ctx.page.drawText(`Version ${policyVersion}`, {
      x: margin,
      y: ctx.y,
      font: fontRegular,
      size: 12,
      color: rgb(0.42, 0.45, 0.5),
    });
    ctx.y -= 20;

    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    ctx.page.drawText(`Generated: ${generatedDate}`, {
      x: margin,
      y: ctx.y,
      font: fontRegular,
      size: 10,
      color: rgb(0.42, 0.45, 0.5),
    });
    ctx.y -= 20;

    if (policy.status === "draft") {
      ctx.page.drawText("DRAFT - NOT APPROVED", {
        x: margin,
        y: ctx.y,
        font: fontBold,
        size: 12,
        color: rgb(0.94, 0.27, 0.27),
      });
      ctx.y -= 20;
    }

    // Document control page
    ctx.page = pdfDoc.addPage();
    ctx.y = height - margin;

    drawHeading(ctx, "Document Control", 1);

    if (metadata.owner) {
      drawText(ctx, `Document Owner: ${metadata.owner}`, fontRegular, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
    }
    if (metadata.approved_by) {
      drawText(ctx, `Approved By: ${metadata.approved_by}`, fontRegular, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
    }
    if (metadata.effective_date) {
      drawText(
        ctx,
        `Effective Date: ${new Date(metadata.effective_date).toLocaleDateString("en-GB")}`,
        fontRegular,
        11,
        { r: 0.12, g: 0.16, b: 0.22 },
        4
      );
    }
    if (metadata.next_review_date) {
      drawText(
        ctx,
        `Next Review Date: ${new Date(metadata.next_review_date).toLocaleDateString("en-GB")}`,
        fontRegular,
        11,
        { r: 0.12, g: 0.16, b: 0.22 },
        4
      );
    }
    if (metadata.classification) {
      drawText(ctx, `Classification: ${metadata.classification}`, fontRegular, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
    }
    if (metadata.generated_at) {
      drawText(
        ctx,
        `Generated: ${new Date(metadata.generated_at).toLocaleDateString("en-GB")}`,
        fontRegular,
        11,
        { r: 0.12, g: 0.16, b: 0.22 },
        4
      );
    }

    if (versionHistory.length > 0) {
      ctx.y -= 10;
      drawHeading(ctx, "Version History", 2);
      versionHistory.forEach((entry) => {
        drawText(
          ctx,
          `${entry.version} | ${entry.date} | ${entry.author} | ${entry.changes}`,
          fontRegular,
          10,
          { r: 0.12, g: 0.16, b: 0.22 },
          3
        );
      });
    }

    // Table of contents
    ctx.page = pdfDoc.addPage();
    ctx.y = height - margin;

    drawHeading(ctx, "Contents", 1);

    let sectionNumber = 1;
    for (const section of documentSections) {
      if (section.sectionType !== "appendix") {
        drawText(
          ctx,
          `${sectionNumber}. ${section.title}`,
          fontRegular,
          11,
          { r: 0.12, g: 0.16, b: 0.22 },
          4
        );
        sectionNumber++;
      }
    }

    const appendices = documentSections.filter((s) => s.sectionType === "appendix");
    if (appendices.length > 0) {
      ctx.y -= 10;
      drawText(ctx, "Appendices", fontBold, 11, { r: 0.12, g: 0.16, b: 0.22 }, 4);
      appendices.forEach((appendix, idx) => {
        drawText(
          ctx,
          `Appendix ${String.fromCharCode(65 + idx)}: ${appendix.title}`,
          fontRegular,
          11,
          { r: 0.12, g: 0.16, b: 0.22 },
          4
        );
      });
    }

    // Content pages
    sectionNumber = 1;
    let appendixIndex = 0;

    for (const section of documentSections) {
      ctx.page = pdfDoc.addPage();
      ctx.y = height - margin;

      const isAppendix = section.sectionType === "appendix";
      const sectionLabel = isAppendix
        ? `Appendix ${String.fromCharCode(65 + appendixIndex++)}`
        : `${sectionNumber++}`;

      drawHeading(ctx, `${sectionLabel}. ${section.title}`, 1);

      if (section.sectionType === "procedure") {
        ctx.page.drawText("PROCEDURE", {
          x: margin,
          y: ctx.y,
          font: fontBold,
          size: 9,
          color: rgb(0.23, 0.51, 0.96),
        });
        ctx.y -= 16;
      }

      if (section.customNotes) {
        drawNoteBlock(ctx, section.customNotes);
      }

      for (const clause of section.clauses) {
        if (section.clauses.length > 1 && clause.title) {
          drawHeading(ctx, clause.title, 2);
        }

        const plainText = stripHtml(sanitizeForSection(clause.rendered_body, section.sectionType));
        drawParagraph(ctx, plainText);

        ctx.y -= 8;
      }
    }

    // End of document
    ctx.page = pdfDoc.addPage();
    ctx.y = height - margin - 200;
    ctx.page.drawText("— End of Document —", {
      x: width / 2 - 50,
      y: ctx.y,
      font: fontRegular,
      size: 10,
      color: rgb(0.42, 0.45, 0.5),
    });

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const footerFontSize = 9;
    pages.forEach((pageRef, index) => {
      const { width: pageWidth } = pageRef.getSize();
      const label = `Page ${index + 1} of ${totalPages}`;
      const textWidth = fontRegular.widthOfTextAtSize(label, footerFontSize);
      pageRef.drawText(label, {
        x: (pageWidth - textWidth) / 2,
        y: margin / 2,
        font: fontRegular,
        size: footerFontSize,
        color: rgb(0.42, 0.45, 0.5),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${sanitizeFilename(policy.name)}_v${sanitizeFilename(policyVersion)}_${timestamp}.pdf`;

    const disposition = inline ? "inline" : "attachment";
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating policy PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate policy PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
