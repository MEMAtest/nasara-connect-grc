import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_BCP_RESILIENCE: PolicyTemplate[] = [
  {
    code: "BCP_RESILIENCE",
    name: "Business Continuity & Operational Resilience",
    category: "Ops",
    description: "Define operational resilience, business continuity planning, and incident response expectations.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define resilience and continuity objectives",
        suggestedClauses: ["clause-bcp-purpose"],
      },
      {
        id: "services",
        title: "Important business services",
        summary: "Define important services and dependencies",
        suggestedClauses: ["clause-bcp-ibs"],
      },
      {
        id: "tolerances",
        title: "Impact tolerances",
        summary: "Define impact tolerances and escalation triggers",
        suggestedClauses: ["clause-bcp-impact"],
      },
      {
        id: "incident",
        title: "Incident management",
        summary: "Define incident response roles and communications",
        suggestedClauses: ["clause-bcp-incident"],
      },
      {
        id: "testing",
        title: "Testing & remediation",
        summary: "Define scenario testing and remediation expectations",
        suggestedClauses: ["clause-bcp-testing"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define board oversight and review cadence",
        suggestedClauses: ["clause-bcp-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-bcp-purpose",
      "clause-bcp-ibs",
      "clause-bcp-impact",
      "clause-bcp-incident",
      "clause-bcp-testing",
      "clause-bcp-governance",
    ],
  },
];
