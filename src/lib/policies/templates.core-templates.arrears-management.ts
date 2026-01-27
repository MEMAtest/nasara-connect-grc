import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_ARREARS_MANAGEMENT: PolicyTemplate[] = [
  {
    code: "ARREARS_MANAGEMENT",
    name: "Arrears Management & Forbearance",
    category: "Customer",
    description: "Define early arrears detection, forbearance options, and fair customer treatment.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define arrears management objectives",
        suggestedClauses: ["clause-arrears-purpose"],
      },
      {
        id: "early",
        title: "Early arrears detection",
        summary: "Define early warning indicators",
        suggestedClauses: ["clause-arrears-early"],
      },
      {
        id: "forbearance",
        title: "Forbearance options",
        summary: "Define available forbearance tools",
        suggestedClauses: ["clause-arrears-forbearance"],
      },
      {
        id: "communications",
        title: "Customer communications",
        summary: "Define communication standards and timing",
        suggestedClauses: ["clause-arrears-communications"],
      },
      {
        id: "vulnerable",
        title: "Vulnerable customers",
        summary: "Embed vulnerability support in arrears processes",
        suggestedClauses: ["clause-arrears-vulnerability"],
      },
      {
        id: "governance",
        title: "Governance & MI",
        summary: "Define arrears MI and oversight",
        suggestedClauses: ["clause-arrears-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-arrears-purpose",
      "clause-arrears-early",
      "clause-arrears-forbearance",
      "clause-arrears-communications",
      "clause-arrears-vulnerability",
      "clause-arrears-governance",
    ],
  },
];
