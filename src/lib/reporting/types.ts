export const REPORT_TEMPLATES = ["board", "regulator", "ops"] as const;
export const REPORT_AUDIENCES = ["board", "regulator", "ops"] as const;
export const REPORT_PERIODS = ["monthly", "quarterly", "ytd", "custom"] as const;

export type ReportTemplate = (typeof REPORT_TEMPLATES)[number];
export type ReportAudience = (typeof REPORT_AUDIENCES)[number];
export type ReportPeriod = (typeof REPORT_PERIODS)[number];
export type ReportModuleStatus = "ready" | "partial" | "blocked";

export interface ReportModuleSummary {
  id: string;
  label: string;
  description: string;
  coverage: number;
  status: ReportModuleStatus;
  highlight: string;
}

export interface ReportPackSummary {
  template: ReportTemplate;
  audience: ReportAudience;
  period: ReportPeriod;
  readiness: number;
  generatedAt: string;
  modules: ReportModuleSummary[];
  range?: { start?: string; end?: string };
}

export interface ReportPackFilters {
  template?: ReportTemplate;
  audience?: ReportAudience;
  period?: ReportPeriod;
  modules?: string[];
  start?: string;
  end?: string;
}
