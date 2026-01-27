import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_VULNERABLE_CUST: PolicyTemplate[] = [
  {
    code: "VULNERABLE_CUST",
    name: "Vulnerable Customers",
    category: "Customer",
    description: "Identify, support, and evidence fair outcomes for customers with characteristics of vulnerability.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Describe why the policy exists and what outcomes it targets",
        suggestedClauses: ["clause-vc-purpose"],
      },
      {
        id: "scope",
        title: "Scope",
        summary: "Confirm client segments, channels, and teams covered",
        suggestedClauses: ["clause-vc-scope"],
      },
      {
        id: "definitions",
        title: "Definitions",
        summary: "Define vulnerability drivers and key terms",
        suggestedClauses: ["clause-vc-definitions"],
      },
      {
        id: "roles",
        title: "Roles & responsibilities",
        summary: "Set governance and ownership across the three lines",
        suggestedClauses: ["clause-vc-roles"],
      },
      {
        id: "identification",
        title: "Identification & flagging",
        summary: "Define how vulnerabilities are identified, recorded, and supported",
        suggestedClauses: ["clause-vc-flags"],
      },
      {
        id: "communications",
        title: "Communications & accessibility",
        summary: "Record accessible formats, reasonable adjustments, and escalation routes",
        suggestedClauses: ["clause-vc-communications", "clause-vc-adjustments"],
      },
      {
        id: "product",
        title: "Product & service design",
        summary: "Ensure products and servicing enable fair outcomes",
        suggestedClauses: ["clause-vc-product-design"],
      },
      {
        id: "mi",
        title: "MI & outcomes",
        summary: "Define MI, outcome testing, and management reporting",
        suggestedClauses: ["clause-vc-mi-outcomes"],
      },
      {
        id: "training",
        title: "Training & competence",
        summary: "Define training and competence requirements",
        suggestedClauses: ["clause-vc-training"],
      },
      {
        id: "review",
        title: "Review & governance",
        summary: "Define review cadence, approvals, and versioning",
        suggestedClauses: ["clause-vc-review"],
      },
    ],
    mandatoryClauses: [
      "clause-vc-purpose",
      "clause-vc-scope",
      "clause-vc-definitions",
      "clause-vc-roles",
      "clause-vc-flags",
      "clause-vc-communications",
      "clause-vc-product-design",
      "clause-vc-mi-outcomes",
      "clause-vc-training",
      "clause-vc-review",
    ],
  },
];
