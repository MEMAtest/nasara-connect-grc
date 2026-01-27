import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_RESPONSIBLE_LENDING: PolicyTemplate[] = [
  {
    code: "RESPONSIBLE_LENDING",
    name: "Responsible Lending & Affordability",
    category: "Customer",
    description: "Define affordability, creditworthiness, and fair treatment expectations for lending decisions.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define responsible lending objectives",
        suggestedClauses: ["clause-reslend-purpose"],
      },
      {
        id: "affordability",
        title: "Affordability assessment",
        summary: "Define affordability assessment requirements",
        suggestedClauses: ["clause-reslend-affordability"],
      },
      {
        id: "creditworthiness",
        title: "Creditworthiness & decisioning",
        summary: "Define decisioning and evidence requirements",
        suggestedClauses: ["clause-reslend-creditworthiness"],
      },
      {
        id: "vulnerability",
        title: "Vulnerability considerations",
        summary: "Embed vulnerability and forbearance triggers",
        suggestedClauses: ["clause-reslend-vulnerability"],
      },
      {
        id: "monitoring",
        title: "Monitoring & governance",
        summary: "Define monitoring and MI reporting",
        suggestedClauses: ["clause-reslend-monitoring"],
      },
    ],
    mandatoryClauses: [
      "clause-reslend-purpose",
      "clause-reslend-affordability",
      "clause-reslend-creditworthiness",
      "clause-reslend-vulnerability",
      "clause-reslend-monitoring",
    ],
  },
];
