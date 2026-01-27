import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_PROD: PolicyTemplate[] = [
  {
    code: "PROD",
    name: "PROD & Distribution Oversight",
    category: "Governance",
    description: "Define product governance and distribution oversight for insurance and retail products.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define PROD governance objectives",
        suggestedClauses: ["clause-prod-purpose"],
      },
      {
        id: "target-market",
        title: "Target market assessment",
        summary: "Define target market and distribution strategy",
        suggestedClauses: ["clause-prod-target-market"],
      },
      {
        id: "approval",
        title: "Product approval",
        summary: "Define product approval and review process",
        suggestedClauses: ["clause-prod-approval"],
      },
      {
        id: "distribution",
        title: "Distribution oversight",
        summary: "Define distributor monitoring and oversight",
        suggestedClauses: ["clause-prod-distribution"],
      },
      {
        id: "monitoring",
        title: "Outcome monitoring",
        summary: "Track product performance and customer outcomes",
        suggestedClauses: ["clause-prod-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance, MI, and review cadence",
        suggestedClauses: ["clause-prod-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-prod-purpose",
      "clause-prod-target-market",
      "clause-prod-approval",
      "clause-prod-distribution",
      "clause-prod-monitoring",
      "clause-prod-governance",
    ],
  },
];
