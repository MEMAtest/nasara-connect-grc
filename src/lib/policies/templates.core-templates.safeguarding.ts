import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_SAFEGUARDING: PolicyTemplate[] = [
  {
    code: "SAFEGUARDING",
    name: "Safeguarding Policy",
    category: "Ops",
    description: "How relevant funds are protected for payment and e-money firms, including reconciliations and contingency.",
    sections: [
      {
        id: "segregation",
        title: "Segregation of Funds",
        summary: "Process for separating relevant funds and reconciliations",
        suggestedClauses: ["clause-psd-safeguarding"],
      },
      {
        id: "contingency",
        title: "Contingency & Governance",
        summary: "Oversight, audits, and contingency planning",
        suggestedClauses: [],
      },
    ],
    mandatoryClauses: ["clause-psd-safeguarding"],
  },
];
