import type { PolicyTemplate } from "./templates";

export const CORE_POLICY_TEMPLATES_AML_CTF: PolicyTemplate[] = [
  {
    code: "AML_CTF",
    name: "AML/CTF & Sanctions",
    category: "FinCrime",
    description: "Risk-based AML/CTF and sanctions framework covering onboarding, monitoring, and SAR escalation.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define why the AML/CTF policy exists",
        suggestedClauses: ["clause-aml-purpose"],
      },
      {
        id: "bwra",
        title: "Business-wide Risk Assessment (BWRA)",
        summary: "Set methodology, frequency, and approvals",
        suggestedClauses: ["clause-aml-bra"],
      },
      {
        id: "cra",
        title: "Customer Risk Assessment (CRA)",
        summary: "Define risk factors and scoring",
        suggestedClauses: ["clause-aml-cra"],
      },
      {
        id: "cdd",
        title: "Customer due diligence (CDD) & EDD",
        summary: "Define standard and enhanced due diligence controls",
        suggestedClauses: ["clause-aml-cdd-edd"],
      },
      {
        id: "monitoring",
        title: "Ongoing monitoring & transaction monitoring",
        summary: "Define monitoring scenarios and investigation requirements",
        suggestedClauses: ["clause-aml-monitoring"],
      },
      {
        id: "sars",
        title: "Suspicious activity reporting (SARs)",
        summary: "Define escalation and reporting controls",
        suggestedClauses: ["clause-aml-sars"],
      },
      {
        id: "records",
        title: "Record keeping",
        summary: "Define retention periods and storage",
        suggestedClauses: ["clause-aml-record-keeping"],
      },
      {
        id: "training",
        title: "Training & awareness",
        summary: "Define induction and annual training requirements",
        suggestedClauses: ["clause-aml-training"],
      },
      {
        id: "governance",
        title: "Governance & oversight",
        summary: "Define MLRO reporting cadence and oversight",
        suggestedClauses: ["clause-aml-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-aml-purpose",
      "clause-aml-bra",
      "clause-aml-cra",
      "clause-aml-cdd-edd",
      "clause-aml-monitoring",
      "clause-aml-sars",
      "clause-aml-record-keeping",
      "clause-aml-training",
      "clause-aml-governance",
    ],
  },
];
