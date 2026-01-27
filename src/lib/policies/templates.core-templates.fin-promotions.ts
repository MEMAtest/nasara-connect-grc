import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_FIN_PROMOTIONS: PolicyTemplate[] = [
  {
    code: "FIN_PROMOTIONS",
    name: "Financial Promotions",
    category: "Markets",
    description: "Govern the creation, approval, and monitoring of financial promotions and communications.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define the objectives for compliant promotions",
        suggestedClauses: ["clause-finprom-purpose"],
      },
      {
        id: "scope",
        title: "Scope & applicability",
        summary: "Define channels, products, and audiences covered",
        suggestedClauses: ["clause-finprom-scope"],
      },
      {
        id: "approval",
        title: "Approval & sign-off",
        summary: "Define review and approval controls",
        suggestedClauses: ["clause-finprom-approval"],
      },
      {
        id: "risk",
        title: "Risk warnings & disclosures",
        summary: "Define prominence and balance requirements",
        suggestedClauses: ["clause-finprom-risk"],
      },
      {
        id: "monitoring",
        title: "Monitoring & review",
        summary: "Define monitoring and refresh cadence",
        suggestedClauses: ["clause-finprom-monitoring"],
      },
    ],
    mandatoryClauses: [
      "clause-finprom-purpose",
      "clause-finprom-scope",
      "clause-finprom-approval",
      "clause-finprom-risk",
      "clause-finprom-monitoring",
    ],
  },
];
