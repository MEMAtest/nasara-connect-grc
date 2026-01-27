import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_CONFLICTS: PolicyTemplate[] = [
  {
    code: "CONFLICTS",
    name: "Conflicts of Interest",
    category: "Governance",
    description: "Identify, manage, and evidence conflicts of interest across the firm.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define conflicts management objectives",
        suggestedClauses: ["clause-conflicts-purpose"],
      },
      {
        id: "identification",
        title: "Identification & assessment",
        summary: "Define conflicts sources and assessment approach",
        suggestedClauses: ["clause-conflicts-identification"],
      },
      {
        id: "register",
        title: "Conflicts register",
        summary: "Record conflicts and controls",
        suggestedClauses: ["clause-conflicts-register"],
      },
      {
        id: "controls",
        title: "Control framework",
        summary: "Define mitigation controls",
        suggestedClauses: ["clause-conflicts-controls"],
      },
      {
        id: "disclosure",
        title: "Customer disclosure",
        summary: "Define disclosure expectations",
        suggestedClauses: ["clause-conflicts-disclosure"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define oversight and review cadence",
        suggestedClauses: ["clause-conflicts-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-conflicts-purpose",
      "clause-conflicts-identification",
      "clause-conflicts-register",
      "clause-conflicts-controls",
      "clause-conflicts-disclosure",
      "clause-conflicts-governance",
    ],
  },
];
