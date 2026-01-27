import type { PolicyClause } from "./templates";

export const CORE_POLICY_TEMPLATE_CLAUSES_SAFEGUARDING: PolicyClause[] = [
  {
    id: "clause-psd-safeguarding",
    title: "Safeguarding of Relevant Funds",
    summary: "Segregation and reconciliations for payment/e-money firms",
    content:
      "Relevant funds are segregated daily into safeguarded accounts with daily reconciliation and contingency funding arrangements, overseen by the safeguarding officer.",
    category: "operations",
    appliesTo: ["SAFEGUARDING"],
  },
];
