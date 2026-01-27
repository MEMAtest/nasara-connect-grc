import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_BEST_EXECUTION: PolicyTemplate[] = [
  {
    code: "BEST_EXECUTION",
    name: "Best Execution",
    category: "Markets",
    description: "Ensure client orders achieve the best possible outcome and evidence execution quality.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define best execution objectives and scope",
        suggestedClauses: ["clause-bestex-purpose"],
      },
      {
        id: "factors",
        title: "Execution factors",
        summary: "Define execution factors and prioritization",
        suggestedClauses: ["clause-bestex-factors"],
      },
      {
        id: "venues",
        title: "Execution venues",
        summary: "Define venue selection and monitoring",
        suggestedClauses: ["clause-bestex-venues"],
      },
      {
        id: "monitoring",
        title: "Monitoring & evidence",
        summary: "Define monitoring and evidence requirements",
        suggestedClauses: ["clause-bestex-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define oversight and review cadence",
        suggestedClauses: ["clause-bestex-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-bestex-purpose",
      "clause-bestex-factors",
      "clause-bestex-venues",
      "clause-bestex-monitoring",
      "clause-bestex-governance",
    ],
  },
];
