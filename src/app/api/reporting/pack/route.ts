import { NextRequest, NextResponse } from "next/server";
import { buildReportPackSummary, reportModules } from "@/lib/reporting/reporting-data";
import { buildReportPackDocx } from "@/lib/reporting/report-pack-docx";
import { buildReportPackPdf } from "@/lib/reporting/report-pack-pdf";
import {
  REPORT_AUDIENCES,
  REPORT_PERIODS,
  REPORT_TEMPLATES,
  type ReportAudience,
  type ReportPackFilters,
  type ReportPeriod,
  type ReportTemplate,
} from "@/lib/reporting/types";
import { requireRole } from "@/lib/rbac";

const templateSet = new Set(REPORT_TEMPLATES);
const audienceSet = new Set(REPORT_AUDIENCES);
const periodSet = new Set(REPORT_PERIODS);
const knownModules = new Set(reportModules.map((module) => module.id));

function parseModules(value: string | null): string[] | undefined {
  if (value === null) return undefined;
  if (value.trim() === "") return [];
  const modules = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => knownModules.has(entry));
  return modules;
}

function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

export async function GET(request: NextRequest) {
  const { error } = await requireRole("member");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const formatParam = searchParams.get("format") ?? "pdf";
  const templateParam = searchParams.get("template");
  const audienceParam = searchParams.get("audience");
  const periodParam = searchParams.get("period");
  const modulesParam = searchParams.get("modules");
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  if (formatParam !== "pdf" && formatParam !== "docx") {
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  }
  if (templateParam && !templateSet.has(templateParam as ReportTemplate)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }
  if (audienceParam && !audienceSet.has(audienceParam as ReportAudience)) {
    return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
  }
  if (periodParam && !periodSet.has(periodParam as ReportPeriod)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const modules = parseModules(modulesParam);
  const template = templateParam ? (templateParam as ReportTemplate) : undefined;
  const audience = audienceParam ? (audienceParam as ReportAudience) : undefined;
  const period = periodParam ? (periodParam as ReportPeriod) : undefined;

  const filters: ReportPackFilters = { template, audience, period, modules };
  if (period === "custom") {
    filters.start = start;
    filters.end = end;
  }

  const summary = buildReportPackSummary(filters);

  const timestamp = new Date(summary.generatedAt).toISOString().split("T")[0];
  const baseName = sanitizeFilename(`reporting-pack-${summary.template}-${summary.period}-${timestamp}`);

  if (formatParam === "docx") {
    const docxBuffer = await buildReportPackDocx(summary);
    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseName}.docx"`,
      },
    });
  }

  const pdfBuffer = await buildReportPackPdf(summary);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
    },
  });
}
