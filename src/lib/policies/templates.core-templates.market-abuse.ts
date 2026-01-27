import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_MARKET_ABUSE: PolicyTemplate[] = [
  {
    code: "MARKET_ABUSE",
    name: "Market Abuse Policy",
    category: "Markets",
    description: "Prevent insider dealing, market manipulation, and meet STOR obligations.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define market abuse prevention objectives",
        suggestedClauses: ["clause-mabuse-purpose"],
      },
      {
        id: "inside-information",
        title: "Inside information",
        summary: "Define inside information handling",
        suggestedClauses: ["clause-mabuse-inside"],
      },
      {
        id: "pad",
        title: "Personal account dealing",
        summary: "Define PAD controls and approvals",
        suggestedClauses: ["clause-mabuse-pad"],
      },
      {
        id: "surveillance",
        title: "Surveillance & monitoring",
        summary: "Define surveillance and alert reviews",
        suggestedClauses: ["clause-mabuse-surveillance"],
      },
      {
        id: "reporting",
        title: "Reporting",
        summary: "Define STOR reporting",
        suggestedClauses: ["clause-mabuse-reporting"],
      },
    ],
    mandatoryClauses: [
      "clause-mabuse-purpose",
      "clause-mabuse-inside",
      "clause-mabuse-pad",
      "clause-mabuse-surveillance",
      "clause-mabuse-reporting",
    ],
  },
];
