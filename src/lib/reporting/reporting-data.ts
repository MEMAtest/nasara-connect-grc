import type { ReportPackFilters, ReportPackSummary, ReportModuleSummary } from "./types";

export const reportModules: ReportModuleSummary[] = [
  {
    id: "authorizations",
    label: "Authorizations",
    description: "Application progress, evidence gates, and approvals.",
    coverage: 82,
    status: "ready",
    highlight: "3 open actions",
  },
  {
    id: "registers",
    label: "Registers",
    description: "Complaints, incidents, PEPs, gifts, and conflicts.",
    coverage: 76,
    status: "partial",
    highlight: "2 registers overdue",
  },
  {
    id: "training",
    label: "Training",
    description: "Completion rates, overdue courses, certifications.",
    coverage: 88,
    status: "ready",
    highlight: "91% completion",
  },
  {
    id: "compliance-framework",
    label: "CMP Monitoring",
    description: "Control pass rate, findings, and due tests.",
    coverage: 90,
    status: "ready",
    highlight: "4 tests due",
  },
  {
    id: "smcr",
    label: "SMCR",
    description: "SMF responsibilities, conduct, fitness.",
    coverage: 73,
    status: "partial",
    highlight: "2 attestations pending",
  },
  {
    id: "risk",
    label: "Risk Assessment",
    description: "Top risks, mitigations, and heat map shifts.",
    coverage: 79,
    status: "ready",
    highlight: "1 emerging risk",
  },
];

export const recentReportPacks = [
  { id: "pack-1", title: "Board Pack - Q2 2024", status: "Published", date: "12 Jun 2024" },
  { id: "pack-2", title: "Regulator Pack - May 2024", status: "Ready", date: "30 May 2024" },
  { id: "pack-3", title: "Ops Pack - Weekly Rollup", status: "Draft", date: "21 May 2024" },
];

export function buildReportPackSummary(filters: ReportPackFilters): ReportPackSummary {
  const selectedModules =
    filters.modules !== undefined
      ? reportModules.filter((module) => filters.modules?.includes(module.id))
      : reportModules;

  const readiness = selectedModules.length
    ? Math.round(selectedModules.reduce((sum, module) => sum + module.coverage, 0) / selectedModules.length)
    : 0;

  return {
    template: filters.template ?? "board",
    audience: filters.audience ?? "board",
    period: filters.period ?? "monthly",
    readiness,
    generatedAt: new Date().toISOString(),
    modules: selectedModules,
    range: filters.start || filters.end ? { start: filters.start, end: filters.end } : undefined,
  };
}
