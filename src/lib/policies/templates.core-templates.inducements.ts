import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_INDUCEMENTS: PolicyTemplate[] = [
  {
    code: "INDUCEMENTS",
    name: "Inducements Policy",
    category: "Markets",
    description: "Govern inducements, disclosures, and conflicts for investment activities.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define inducements governance objectives",
        suggestedClauses: ["clause-inducements-purpose"],
      },
      {
        id: "assessment",
        title: "Assessment",
        summary: "Define assessment of payments and benefits",
        suggestedClauses: ["clause-inducements-assessment"],
      },
      {
        id: "disclosure",
        title: "Disclosure",
        summary: "Define disclosure standards",
        suggestedClauses: ["clause-inducements-disclosure"],
      },
      {
        id: "conflicts",
        title: "Conflicts linkage",
        summary: "Define conflicts management linkage",
        suggestedClauses: ["clause-inducements-conflicts"],
      },
      {
        id: "monitoring",
        title: "Monitoring",
        summary: "Define ongoing monitoring and review",
        suggestedClauses: ["clause-inducements-monitoring"],
      },
    ],
    mandatoryClauses: [
      "clause-inducements-purpose",
      "clause-inducements-assessment",
      "clause-inducements-disclosure",
      "clause-inducements-conflicts",
      "clause-inducements-monitoring",
    ],
  },
];
