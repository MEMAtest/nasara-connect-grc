import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_COMPLIANCE_MON: PolicyTemplate[] = [
  {
    code: "COMPLIANCE_MON",
    name: "Compliance Monitoring Plan",
    category: "Governance",
    description: "Risk-based monitoring plan covering FCA obligations, testing, and remediation.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define compliance monitoring objectives",
        suggestedClauses: ["clause-compmon-purpose"],
      },
      {
        id: "scope",
        title: "Scope",
        summary: "Define the regulatory obligations in scope",
        suggestedClauses: ["clause-compmon-scope"],
      },
      {
        id: "plan",
        title: "Risk-based plan",
        summary: "Set the monitoring plan and cadence",
        suggestedClauses: ["clause-compmon-risk"],
      },
      {
        id: "testing",
        title: "Testing methodology",
        summary: "Define testing and sampling approach",
        suggestedClauses: ["clause-compmon-testing"],
      },
      {
        id: "reporting",
        title: "Reporting",
        summary: "Define MI and escalation",
        suggestedClauses: ["clause-compmon-reporting"],
      },
      {
        id: "remediation",
        title: "Remediation",
        summary: "Define action tracking and closure",
        suggestedClauses: ["clause-compmon-remediation"],
      },
    ],
    mandatoryClauses: [
      "clause-compmon-purpose",
      "clause-compmon-scope",
      "clause-compmon-risk",
      "clause-compmon-testing",
      "clause-compmon-reporting",
      "clause-compmon-remediation",
    ],
  },
];
