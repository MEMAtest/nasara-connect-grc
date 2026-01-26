import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { htmlToText } from "@/lib/authorization-pack-export";
import type { FirmBasics } from "@/lib/business-plan-pdf-builder";
import type { PerimeterOpinion } from "@/lib/business-plan-profile";

const COLORS = {
  primary: { r: 0.31, g: 0.27, b: 0.9 },
  secondary: { r: 0.13, g: 0.55, b: 0.55 },
  text: { r: 0.12, g: 0.16, b: 0.22 },
  muted: { r: 0.42, g: 0.45, b: 0.5 },
  light: { r: 0.65, g: 0.68, b: 0.72 },
  success: { r: 0.13, g: 0.55, b: 0.45 },
  warning: { r: 0.85, g: 0.55, b: 0.15 },
};

export interface OpinionSectionInput {
  label: string;
  response: string;
  description?: string;
  references?: string[];
}

export interface OpinionSection {
  key: string;
  title: string;
  description: string;
  inputs: OpinionSectionInput[];
  synthesizedContent?: string;
}

export interface OpinionPackConfig {
  packName: string;
  permissionLabel: string;
  profileCompletion: number;
  opinion: PerimeterOpinion;
  regulatorySignals: Array<{ label: string; count: number }>;
  activityHighlights: string[];
  firmBasics?: FirmBasics;
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

function buildCoverPage(ctx: DrawContext, config: OpinionPackConfig): void {
  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firmName = config.firmBasics?.legalName || config.packName;

  ctx.y = ctx.height - 100;
  ctx.page.drawText("Regulatory Perimeter and Permissions Opinion", {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontBold,
    size: 20,
    color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
  });
  ctx.y -= 32;

  ctx.page.drawText(firmName, {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontBold,
    size: 18,
    color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
  });
  ctx.y -= 30;

  ctx.page.drawText(`Permission scope: ${config.permissionLabel}`, {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 12,
    color: rgb(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b),
  });
  ctx.y -= 25;

  ctx.page.drawText(`Generated: ${generatedDate}`, {
    x: ctx.margin,
    y: ctx.y,
    font: ctx.fontRegular,
    size: 10,
    color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
  });
  ctx.y -= 30;

  const boxPadding = 14;
  const boxWidth = ctx.width - ctx.margin * 2;
  const contentWidth = boxWidth - boxPadding * 2;
  const verdictText = config.opinion.verdict.replace(/-/g, " ").toUpperCase();
  const summaryText = config.opinion.summary;
  const headerFontSize = 11;
  const verdictFontSize = 12;
  const summaryFontSize = 10;
  const headerHeight = headerFontSize * 1.5;
  const verdictLineHeight = verdictFontSize * 1.5;
  const summaryLineHeight = summaryFontSize * 1.5;
  const verdictLines = wrapText(verdictText, ctx.fontBold, verdictFontSize, contentWidth);
  const summaryLines = wrapText(summaryText, ctx.fontRegular, summaryFontSize, contentWidth);
  const boxHeight =
    boxPadding * 2 +
    headerHeight +
    verdictLines.length * verdictLineHeight +
    summaryLines.length * summaryLineHeight +
    6;
  const boxTop = ctx.y + 10;
  const boxY = boxTop - boxHeight;

  ctx.page.drawRectangle({
    x: ctx.margin,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    borderColor: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
    borderWidth: 1,
    color: rgb(0.97, 0.97, 1),
  });

  let cursorY = boxTop - boxPadding - headerFontSize;
  ctx.page.drawText("Perimeter verdict", {
    x: ctx.margin + boxPadding,
    y: cursorY,
    font: ctx.fontBold,
    size: headerFontSize,
    color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
  });
  cursorY -= headerHeight;

  verdictLines.forEach((line) => {
    ctx.page.drawText(line, {
      x: ctx.margin + boxPadding,
      y: cursorY,
      font: ctx.fontBold,
      size: verdictFontSize,
      color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    cursorY -= verdictLineHeight;
  });

  cursorY -= 4;
  summaryLines.forEach((line) => {
    ctx.page.drawText(line, {
      x: ctx.margin + boxPadding,
      y: cursorY,
      font: ctx.fontRegular,
      size: summaryFontSize,
      color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    cursorY -= summaryLineHeight;
  });

  ctx.y = boxY - 32;

  const highlights = config.activityHighlights.slice(0, 6);
  if (highlights.length) {
    drawText(ctx, `Key regulated activities: ${highlights.join(", ")}.`, ctx.fontRegular, 9, COLORS.text, 6);
  }

  const topSignals = config.regulatorySignals.slice(0, 5);
  if (topSignals.length) {
    const sources = topSignals.map((signal) => `${signal.label} (${signal.count})`).join(", ");
    drawText(ctx, `Regulatory sources referenced: ${sources}.`, ctx.fontRegular, 9, COLORS.text, 6);
  }

  if (config.opinion.obligations.length) {
    const obligations = config.opinion.obligations.slice(0, 6).join(", ");
    drawText(ctx, `Key obligations noted: ${obligations}.`, ctx.fontRegular, 9, COLORS.text, 6);
  }

  ctx.y = 70;
  ctx.page.drawText(
    "Indicative perimeter opinion for regulatory scoping only. Not legal advice.",
    {
      x: ctx.margin,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 8,
      color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    }
  );
}

function buildTableOfContents(ctx: DrawContext, sections: OpinionSection[]): void {
  addPage(ctx);

  drawText(ctx, "Contents", ctx.fontBold, 18, COLORS.primary, 18);
  drawHorizontalLine(ctx);

  sections.forEach((section) => {
    ensureSpace(ctx, 20);
    ctx.page.drawText(section.title, {
      x: ctx.margin,
      y: ctx.y,
      font: ctx.fontRegular,
      size: 11,
      color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    ctx.y -= 18;
  });
}

function renderSynthesizedContent(ctx: DrawContext, content: string): void {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  for (const para of paragraphs) {
    const lines = para.split(/\n/).filter(Boolean);
    for (const line of lines) {
      const normalizedLine = line
        .replace(/\*\*/g, "")
        .replace(/^\s*[-*•]\s+/, "")
        .replace(/^\s*\d+[.)]\s+/, "")
        .trim();
      if (!normalizedLine) continue;
      const isLabel = /^(fact|analysis|opinion|assumptions|limitations|change triggers):/i.test(
        normalizedLine
      );
      drawText(
        ctx,
        normalizedLine,
        isLabel ? ctx.fontBold : ctx.fontRegular,
        isLabel ? 11 : 10,
        COLORS.text,
        isLabel ? 5 : 4,
        0
      );
    }
    ctx.y -= 6;
  }
}

function renderInputFallback(ctx: DrawContext, section: OpinionSection): void {
  if (!section.inputs.length) {
    drawText(ctx, "No responses provided for this section yet.", ctx.fontRegular, 10, COLORS.muted, 6);
    return;
  }

  section.inputs.forEach((input) => {
    drawText(ctx, input.label, ctx.fontBold, 10, COLORS.text, 3);
    drawText(ctx, htmlToText(input.response) || input.response, ctx.fontRegular, 10, COLORS.text, 6);
    if (input.references?.length) {
      drawText(ctx, `Sources: ${input.references.join(", ")}`, ctx.fontRegular, 8, COLORS.muted, 6);
    }
  });
}

function renderSection(ctx: DrawContext, section: OpinionSection): void {
  addPage(ctx);

  drawText(ctx, section.title, ctx.fontBold, 16, COLORS.primary, 8);
  drawHorizontalLine(ctx);

  if (section.synthesizedContent) {
    renderSynthesizedContent(ctx, section.synthesizedContent);
  } else {
    renderInputFallback(ctx, section);
  }
}

export async function buildPerimeterOpinionPack(
  config: OpinionPackConfig,
  sections: OpinionSection[]
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

  buildCoverPage(ctx, config);
  buildTableOfContents(ctx, sections);

  sections.forEach((section) => renderSection(ctx, section));

  return pdfDoc.save();
}
