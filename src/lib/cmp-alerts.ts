import type { CmpSummary } from "@/data/cmp/types";

export type CmpAlertSeverity = "critical" | "warning";

export interface CmpAlert {
  id: string;
  title: string;
  description: string;
  severity: CmpAlertSeverity;
}

export function buildCmpAlerts(summary: CmpSummary | null): CmpAlert[] {
  if (!summary) {
    return [];
  }

  const alerts: CmpAlert[] = [];

  if (summary.overdue > 0) {
    alerts.push({
      id: "cmp-overdue",
      title: `${summary.overdue} CMP review${summary.overdue > 1 ? "s" : ""} overdue`,
      description: "Escalate remediation and re-test to evidence control effectiveness.",
      severity: "critical",
    });
  }

  if (summary.dueSoon > 0) {
    alerts.push({
      id: "cmp-due-soon",
      title: `${summary.dueSoon} review${summary.dueSoon > 1 ? "s" : ""} due in 14 days`,
      description: "Schedule testers and confirm evidence locations to stay compliant.",
      severity: "warning",
    });
  }

  if (summary.avgPassRate < 0.85) {
    alerts.push({
      id: "cmp-pass-rate",
      title: "CMP pass rate trending amber",
      description: "Prioritise coaching on failing controls and update remediation plans.",
      severity: "warning",
    });
  }

  if (summary.openFindings > 0) {
    alerts.push({
      id: "cmp-open-findings",
      title: `${summary.openFindings} open CMP finding${summary.openFindings > 1 ? "s" : ""}`,
      description: "Track action owners and due dates to prevent regulatory slippage.",
      severity: "warning",
    });
  }

  return alerts;
}
