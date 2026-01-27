import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_CASS: PolicyTemplate[] = [
  {
    code: "CASS",
    name: "Client Assets Policy",
    category: "Ops",
    description: "Safeguarding of client money and assets under CASS.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define client asset protection objectives",
        suggestedClauses: ["clause-cass-purpose"],
      },
      {
        id: "scope",
        title: "Scope & classification",
        summary: "Define CASS applicability and classifications",
        suggestedClauses: ["clause-cass-scope"],
      },
      {
        id: "segregation",
        title: "Segregation",
        summary: "Define segregation and trust status",
        suggestedClauses: ["clause-cass-segregation"],
      },
      {
        id: "reconciliations",
        title: "Reconciliations",
        summary: "Define reconciliation requirements",
        suggestedClauses: ["clause-cass-reconciliations"],
      },
      {
        id: "records",
        title: "Record keeping",
        summary: "Define record keeping and audit trail",
        suggestedClauses: ["clause-cass-records"],
      },
      {
        id: "governance",
        title: "Governance",
        summary: "Define oversight and accountability",
        suggestedClauses: ["clause-cass-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-cass-purpose",
      "clause-cass-scope",
      "clause-cass-segregation",
      "clause-cass-reconciliations",
      "clause-cass-records",
      "clause-cass-governance",
    ],
  },
];
