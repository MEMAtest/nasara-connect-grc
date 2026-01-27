import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_SUITABILITY_ADVICE: PolicyTemplate[] = [
  {
    code: "SUITABILITY_ADVICE",
    name: "Suitability of Advice",
    category: "Markets",
    description: "Ensure personal recommendations are suitable, evidenced, and aligned to clients' best interests.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Describe suitability objectives and regulatory intent",
        suggestedClauses: ["clause-suit-purpose"],
      },
      {
        id: "scope",
        title: "Scope & permissions",
        summary: "Define advisory scope and client segments covered",
        suggestedClauses: ["clause-suit-scope"],
      },
      {
        id: "fact-finding",
        title: "Fact-finding & information gathering",
        summary: "Define the minimum information gathered before advice",
        suggestedClauses: ["clause-suit-fact-finding"],
      },
      {
        id: "assessment",
        title: "Assessment of suitability",
        summary: "Define methodology and documentation expectations",
        suggestedClauses: ["clause-suit-assessment"],
      },
      {
        id: "disclosure",
        title: "Disclosure & communication",
        summary: "Define disclosure of costs, risks, and conflicts",
        suggestedClauses: ["clause-suit-disclosure"],
      },
      {
        id: "reviews",
        title: "Ongoing reviews",
        summary: "Define review cadence and trigger events",
        suggestedClauses: ["clause-suit-reviews"],
      },
      {
        id: "qa",
        title: "Quality assurance & file reviews",
        summary: "Define sampling and remediation expectations",
        suggestedClauses: ["clause-suit-qa"],
      },
      {
        id: "governance",
        title: "Governance & record keeping",
        summary: "Define approvals, versioning, and retention",
        suggestedClauses: ["clause-suit-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-suit-purpose",
      "clause-suit-scope",
      "clause-suit-fact-finding",
      "clause-suit-assessment",
      "clause-suit-disclosure",
      "clause-suit-reviews",
      "clause-suit-qa",
      "clause-suit-governance",
    ],
  },
];
