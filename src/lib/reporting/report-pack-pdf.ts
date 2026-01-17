import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { ReportModuleStatus, ReportPackSummary } from "./types";

const COLORS = {
  primary: { r: 0.11, g: 0.35, b: 0.34 },
  secondary: { r: 0.2, g: 0.22, b: 0.24 },
  muted: { r: 0.45, g: 0.48, b: 0.5 },
  border: { r: 0.88, g: 0.89, b: 0.9 },
  background: { r: 0.97, g: 0.98, b: 0.98 },
};

const STATUS_LABELS: Record<ReportModuleStatus, string> = {
  ready: "Ready",
  partial: "Needs review",
  blocked: "Blocked",
};

interface DrawContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  y: number;
  width: number;
  height: number;
  margin: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
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
}

function ensureSpace(ctx: DrawContext, height: number): void {
  if (ctx.y - height < ctx.margin) {
    addPage(ctx);
  }
}

function drawText(
  ctx: DrawContext,
  text: string,
  options: { font: PDFFont; size: number; color?: { r: number; g: number; b: number }; indent?: number } = {
    font: ctx.fontRegular,
    size: 11,
  }
) {
  const indent = options.indent ?? 0;
  const maxWidth = ctx.width - ctx.margin * 2 - indent;
  const lineHeight = options.size * 1.5;
  const lines = wrapText(text, options.font, options.size, maxWidth);
  lines.forEach((line) => {
    ensureSpace(ctx, lineHeight + 6);
    ctx.page.drawText(line, {
      x: ctx.margin + indent,
      y: ctx.y,
      font: options.font,
      size: options.size,
      color: rgb(
        options.color?.r ?? COLORS.secondary.r,
        options.color?.g ?? COLORS.secondary.g,
        options.color?.b ?? COLORS.secondary.b
      ),
    });
    ctx.y -= lineHeight;
  });
  ctx.y -= 6;
}

function drawSectionTitle(ctx: DrawContext, title: string) {
  drawText(ctx, title, { font: ctx.fontBold, size: 14, color: COLORS.secondary });
}

function drawDivider(ctx: DrawContext) {
  ensureSpace(ctx, 20);
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 0.5,
    color: rgb(COLORS.border.r, COLORS.border.g, COLORS.border.b),
  });
  ctx.y -= 12;
}

export async function buildReportPackPdf(summary: ReportPackSummary): Promise<Uint8Array> {
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
    width,
    height,
    margin,
    fontRegular,
    fontBold,
  };

  ctx.page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(COLORS.background.r, COLORS.background.g, COLORS.background.b),
  });

  const title = "Reporting Pack";
  const templateLabel = formatLabel(summary.template);
  const audienceLabel = formatLabel(summary.audience);
  const periodLabel = formatLabel(summary.period);
  const generatedDate = new Date(summary.generatedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  drawText(ctx, title, { font: ctx.fontBold, size: 26, color: COLORS.primary });
  drawText(ctx, `${templateLabel} - ${audienceLabel}`, { font: ctx.fontRegular, size: 12, color: COLORS.muted });
  drawText(ctx, `Reporting period: ${periodLabel}`, { font: ctx.fontRegular, size: 11, color: COLORS.muted });
  drawText(ctx, `Generated ${generatedDate}`, { font: ctx.fontRegular, size: 11, color: COLORS.muted });
  drawDivider(ctx);

  drawSectionTitle(ctx, "Executive snapshot");
  drawText(ctx, `Overall readiness: ${summary.readiness}%`, { font: ctx.fontBold, size: 12 });

  drawDivider(ctx);
  drawSectionTitle(ctx, "Module highlights");

  summary.modules.forEach((module) => {
    drawText(ctx, module.label, { font: ctx.fontBold, size: 12, color: COLORS.secondary });
    drawText(ctx, module.description, { font: ctx.fontRegular, size: 10, color: COLORS.muted });
    drawText(
      ctx,
      `Status: ${STATUS_LABELS[module.status]} | Coverage: ${module.coverage}% | ${module.highlight}`,
      { font: ctx.fontRegular, size: 10 }
    );
    ctx.y -= 4;
  });

  return pdfDoc.save();
}
