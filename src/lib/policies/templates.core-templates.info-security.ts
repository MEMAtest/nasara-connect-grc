import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_INFO_SECURITY: PolicyTemplate[] = [
  {
    code: "INFO_SECURITY",
    name: "Information & Cyber Security",
    category: "Ops",
    description: "Information security policy covering access, data protection, incident response, and testing.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define information security objectives",
        suggestedClauses: ["clause-infosec-purpose"],
      },
      {
        id: "governance",
        title: "Governance & ownership",
        summary: "Define security oversight and ownership",
        suggestedClauses: ["clause-infosec-governance"],
      },
      {
        id: "access",
        title: "Access controls",
        summary: "Define access management requirements",
        suggestedClauses: ["clause-infosec-access"],
      },
      {
        id: "data",
        title: "Data protection",
        summary: "Define data handling and encryption",
        suggestedClauses: ["clause-infosec-data"],
      },
      {
        id: "incident",
        title: "Incident response",
        summary: "Define detection and response workflow",
        suggestedClauses: ["clause-infosec-incident"],
      },
      {
        id: "testing",
        title: "Testing & assurance",
        summary: "Define testing and vulnerability management",
        suggestedClauses: ["clause-infosec-testing"],
      },
    ],
    mandatoryClauses: [
      "clause-infosec-purpose",
      "clause-infosec-governance",
      "clause-infosec-access",
      "clause-infosec-data",
      "clause-infosec-incident",
      "clause-infosec-testing",
    ],
  },
];
