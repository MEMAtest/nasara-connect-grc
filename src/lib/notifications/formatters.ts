import type { NotificationSeverity } from "@/lib/notifications/types";

export const REGISTER_LABELS: Record<string, string> = {
  "aml-cdd": "AML CDD",
  complaints: "Complaint",
  conflicts: "Conflict of Interest",
  "data-breach-dsar": "Data Breach / DSAR",
  "edd-cases": "EDD Case",
  "fin-prom": "Financial Promotion",
  "gifts-hospitality": "Gifts & Hospitality",
  incidents: "Incident",
  "insider-list": "Insider List",
  "op-resilience": "Operational Resilience",
  "outside-business": "Outside Business Interest",
  "pa-dealing": "Personal Account Dealing",
  pep: "PEP",
  "product-governance": "Product Governance",
  "regulatory-breach": "Regulatory Breach",
  "regulatory-returns": "Regulatory Return",
  sanctions: "Sanctions Screening",
  "sar-nca": "SAR / NCA",
  "smcr-certification": "SMCR Certification",
  "tc-record": "TC Record",
  "third-party": "Third-Party",
  "tx-monitoring": "Transaction Monitoring",
  "vulnerable-customers": "Vulnerable Customer",
};

const REFERENCE_KEYS = [
  "record_reference",
  "incident_reference",
  "complaint_reference",
  "case_reference",
  "return_reference",
  "product_reference",
  "service_reference",
  "request_reference",
  "alert_reference",
  "sar_reference",
  "list_reference",
  "declaration_reference",
  "employee_reference",
  "customer_reference",
  "vendor_reference",
  "reference",
];

const NAME_KEYS = [
  "incident_title",
  "complaint_title",
  "case_title",
  "return_name",
  "service_name",
  "product_name",
  "employee_name",
  "customer_name",
  "complainant_name",
  "subject_name",
  "project_name",
  "title",
  "name",
];

function pickFirstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function formatRecordSummary(record: Record<string, unknown>): string | null {
  if (!record) return null;
  const reference = pickFirstString(record, REFERENCE_KEYS);
  const name = pickFirstString(record, NAME_KEYS);
  if (reference && name && reference !== name) {
    return `${reference} • ${name}`;
  }
  return reference || name;
}

const SEVERITY_MAP: Record<string, NotificationSeverity> = {
  critical: "critical",
  high: "critical",
  severe: "critical",
  medium: "warning",
  moderate: "warning",
  low: "info",
};

export function deriveSeverity(record: Record<string, unknown>): NotificationSeverity {
  const severityValue = typeof record.severity === "string" ? record.severity.toLowerCase() : "";
  if (SEVERITY_MAP[severityValue]) {
    return SEVERITY_MAP[severityValue];
  }
  const alertSeverity = typeof record.alert_severity === "string" ? record.alert_severity.toLowerCase() : "";
  if (SEVERITY_MAP[alertSeverity]) {
    return SEVERITY_MAP[alertSeverity];
  }
  const priorityValue = typeof record.priority === "string" ? record.priority.toLowerCase() : "";
  if (SEVERITY_MAP[priorityValue]) {
    return SEVERITY_MAP[priorityValue];
  }
  const riskValue = typeof record.risk_rating === "string" ? record.risk_rating.toLowerCase() : "";
  if (SEVERITY_MAP[riskValue]) {
    return SEVERITY_MAP[riskValue];
  }
  return "info";
}
