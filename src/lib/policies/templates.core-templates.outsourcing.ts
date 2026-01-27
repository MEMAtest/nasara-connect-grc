import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_OUTSOURCING: PolicyTemplate[] = [
  {
    code: "OUTSOURCING",
    name: "Outsourcing & Third Party",
    category: "Ops",
    description: "Govern material outsourcing, third-party risk, and regulatory oversight expectations.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define outsourcing governance objectives",
        suggestedClauses: ["clause-outsourcing-purpose"],
      },
      {
        id: "classification",
        title: "Scope & classification",
        summary: "Define material outsourcing and IBS",
        suggestedClauses: ["clause-outsourcing-scope"],
      },
      {
        id: "due-diligence",
        title: "Due diligence",
        summary: "Define pre-outsourcing assessments",
        suggestedClauses: ["clause-outsourcing-due-diligence"],
      },
      {
        id: "contracts",
        title: "Contract standards",
        summary: "Define contractual requirements",
        suggestedClauses: ["clause-outsourcing-contracts"],
      },
      {
        id: "oversight",
        title: "Ongoing oversight",
        summary: "Define monitoring and review cadence",
        suggestedClauses: ["clause-outsourcing-oversight"],
      },
      {
        id: "exit",
        title: "Exit planning",
        summary: "Define exit strategy and contingency",
        suggestedClauses: ["clause-outsourcing-exit"],
      },
    ],
    mandatoryClauses: [
      "clause-outsourcing-purpose",
      "clause-outsourcing-scope",
      "clause-outsourcing-due-diligence",
      "clause-outsourcing-contracts",
      "clause-outsourcing-oversight",
      "clause-outsourcing-exit",
    ],
  },
];
