import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_CASS_RESOLUTION: PolicyTemplate[] = [
  {
    code: "CASS_RESOLUTION",
    name: "CASS Resolution Pack",
    category: "Ops",
    description: "CASS resolution pack maintenance for orderly return of client assets.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define CASS resolution pack objectives",
        suggestedClauses: ["clause-cassrp-purpose"],
      },
      {
        id: "pack",
        title: "Resolution pack content",
        summary: "Define required pack documents",
        suggestedClauses: ["clause-cassrp-pack"],
      },
      {
        id: "data",
        title: "Data integrity",
        summary: "Define data quality and inventory",
        suggestedClauses: ["clause-cassrp-data"],
      },
      {
        id: "testing",
        title: "Testing & updates",
        summary: "Define testing and update cadence",
        suggestedClauses: ["clause-cassrp-testing"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define ownership and review cadence",
        suggestedClauses: ["clause-cassrp-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-cassrp-purpose",
      "clause-cassrp-pack",
      "clause-cassrp-data",
      "clause-cassrp-testing",
      "clause-cassrp-governance",
    ],
  },
];
