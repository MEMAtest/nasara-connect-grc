import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_RISK_MGMT: PolicyTemplate[] = [
  {
    code: "RISK_MGMT",
    name: "Risk Management Framework",
    category: "Governance",
    description: "Define the firm-wide risk assessment framework, appetite, and reporting cadence.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define risk management objectives",
        suggestedClauses: ["clause-risk-purpose"],
      },
      {
        id: "perimeter",
        title: "Regulatory perimeter",
        summary: "Confirm permissions and perimeter boundaries",
        suggestedClauses: ["clause-risk-perimeter"],
      },
      {
        id: "appetite",
        title: "Risk appetite",
        summary: "Define appetite and tolerance statements",
        suggestedClauses: ["clause-risk-appetite"],
      },
      {
        id: "assessment",
        title: "Risk assessment process",
        summary: "Define risk identification and assessment",
        suggestedClauses: ["clause-risk-assessment"],
      },
      {
        id: "controls",
        title: "Control framework",
        summary: "Define controls and ownership",
        suggestedClauses: ["clause-risk-controls"],
      },
      {
        id: "reporting",
        title: "Risk reporting",
        summary: "Define MI and reporting cadence",
        suggestedClauses: ["clause-risk-reporting"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance and review cadence",
        suggestedClauses: ["clause-risk-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-risk-purpose",
      "clause-risk-perimeter",
      "clause-risk-appetite",
      "clause-risk-assessment",
      "clause-risk-controls",
      "clause-risk-reporting",
      "clause-risk-governance",
    ],
  },
];
