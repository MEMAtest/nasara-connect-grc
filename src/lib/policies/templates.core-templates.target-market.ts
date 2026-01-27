import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_TARGET_MARKET: PolicyTemplate[] = [
  {
    code: "TARGET_MARKET",
    name: "Target Market Assessment",
    category: "Markets",
    description: "Define target market, exclusions, and distribution alignment.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define target market assessment objectives",
        suggestedClauses: ["clause-prod-purpose"],
      },
      {
        id: "target-market",
        title: "Target market definition",
        summary: "Define target market characteristics and exclusions",
        suggestedClauses: ["clause-prod-target-market"],
      },
      {
        id: "distribution",
        title: "Distribution alignment",
        summary: "Align distribution to target market",
        suggestedClauses: ["clause-prod-distribution"],
      },
      {
        id: "monitoring",
        title: "Outcome monitoring",
        summary: "Monitor target market outcomes",
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
      "clause-prod-distribution",
      "clause-prod-monitoring",
      "clause-prod-governance",
    ],
  },
];
