import { NextRequest, NextResponse } from "next/server";
import { buildReportPackSummary, reportModules } from "@/lib/reporting/reporting-data";
import {
  REPORT_AUDIENCES,
  REPORT_PERIODS,
  REPORT_TEMPLATES,
  type ReportAudience,
  type ReportPackFilters,
  type ReportPeriod,
  type ReportTemplate,
} from "@/lib/reporting/types";
import { requireAuth } from "@/lib/auth-utils";

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

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);

  const templateParam = searchParams.get("template");
  const audienceParam = searchParams.get("audience");
  const periodParam = searchParams.get("period");
  const modulesParam = searchParams.get("modules");
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;

  if (templateParam && !templateSet.has(templateParam as ReportTemplate)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }
  if (audienceParam && !audienceSet.has(audienceParam as ReportAudience)) {
    return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
  }
  if (periodParam && !periodSet.has(periodParam as ReportPeriod)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const period = periodParam as ReportPeriod | null;
  const filters: ReportPackFilters = {
    template: templateParam ? (templateParam as ReportTemplate) : undefined,
    audience: audienceParam ? (audienceParam as ReportAudience) : undefined,
    period: period ?? undefined,
    modules: parseModules(modulesParam),
  };

  if (period === "custom") {
    filters.start = start;
    filters.end = end;
  }

  const summary = buildReportPackSummary(filters);
  return NextResponse.json(summary);
}
