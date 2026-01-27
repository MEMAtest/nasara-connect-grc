import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_OP_SEC_RISK: PolicyTemplate[] = [
  {
    code: "OP_SEC_RISK",
    name: "Operational & Security Risk",
    category: "Ops",
    description: "Operational and security risk management for payments firms, including PSD2 SCA and incident reporting.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define operational & security risk objectives",
        suggestedClauses: ["clause-opsec-purpose"],
      },
      {
        id: "assessment",
        title: "Risk assessment",
        summary: "Define operational risk assessment approach",
        suggestedClauses: ["clause-opsec-risk"],
      },
      {
        id: "sca",
        title: "Strong customer authentication",
        summary: "Define SCA and secure communication controls",
        suggestedClauses: ["clause-opsec-sca"],
      },
      {
        id: "incident",
        title: "Incident reporting",
        summary: "Define major incident reporting",
        suggestedClauses: ["clause-opsec-incident"],
      },
      {
        id: "fraud",
        title: "Fraud monitoring",
        summary: "Define fraud monitoring and reimbursement controls",
        suggestedClauses: ["clause-opsec-fraud"],
      },
      {
        id: "resilience",
        title: "Operational resilience",
        summary: "Define resilience and testing expectations",
        suggestedClauses: ["clause-opsec-resilience"],
      },
    ],
    mandatoryClauses: [
      "clause-opsec-purpose",
      "clause-opsec-risk",
      "clause-opsec-sca",
      "clause-opsec-incident",
      "clause-opsec-fraud",
      "clause-opsec-resilience",
    ],
  },
];
