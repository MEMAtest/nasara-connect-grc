import type { FirmPermissions } from "./permissions";

export type ClauseCategory = "governance" | "operations" | "customer" | "financial-crime" | "market";

export interface PolicyClause {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ClauseCategory;
  isMandatory?: boolean;
  permissions?: Partial<FirmPermissions>;
}

export interface PolicyTemplateSection {
  id: string;
  title: string;
  summary: string;
  suggestedClauses: string[];
}

export interface PolicyTemplate {
  code: string;
  name: string;
  category: "Customer" | "FinCrime" | "Ops" | "Governance" | "Markets";
  description: string;
  sections: PolicyTemplateSection[];
  mandatoryClauses: string[];
}

export const POLICY_TEMPLATE_CLAUSES: PolicyClause[] = [
  {
    id: "clause-vc-flags",
    title: "Vulnerability Flagging",
    summary: "Capture disclosed vulnerabilities with consent and support preferences",
    content:
      "We maintain a central register of customer vulnerability disclosures including context, consent, and support preferences. Adjustments are recorded and reviewed quarterly.",
    category: "customer",
    isMandatory: true,
  },
  {
    id: "clause-vc-adjustments",
    title: "Reasonable Adjustments",
    summary: "Set out adjustments offered to vulnerable customers",
    content:
      "Reasonable adjustments (communication formats, dedicated contacts, pace adjustments) are offered on disclosure and tracked through resolution.",
    category: "customer",
  },
  {
    id: "clause-aml-bra",
    title: "Business-wide Risk Assessment",
    summary: "Annual refresh of BRA with board oversight",
    content:
      "The MLRO oversees an annual business-wide risk assessment covering products, customers, delivery channels, and geography with board sign-off and action tracking.",
    category: "financial-crime",
    isMandatory: true,
  },
  {
    id: "clause-psd-safeguarding",
    title: "Safeguarding of Relevant Funds",
    summary: "Segregation and reconciliations for payment/e-money firms",
    content:
      "Relevant funds are segregated daily into safeguarded accounts with daily reconciliation and contingency funding arrangements, overseen by the safeguarding officer.",
    category: "operations",
    permissions: { paymentServices: true, eMoney: true },
  },
];

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    code: "VULNERABLE_CUST",
    name: "Vulnerable Customers",
    category: "Customer",
    description: "Identify, support, and evidence fair outcomes for customers with characteristics of vulnerability.",
    sections: [
      {
        id: "scope",
        title: "Scope & Purpose",
        summary: "Define vulnerability, desired outcomes, and guiding principles",
        suggestedClauses: ["clause-vc-flags"],
      },
      {
        id: "adjustments",
        title: "Reasonable Adjustments",
        summary: "Document adjustments offered and escalation paths",
        suggestedClauses: ["clause-vc-adjustments"],
      },
    ],
    mandatoryClauses: ["clause-vc-flags"],
  },
  {
    code: "AML_CTF",
    name: "AML/CTF & Sanctions",
    category: "FinCrime",
    description: "Risk-based AML/CTF and sanctions framework covering onboarding, monitoring, and SAR escalation.",
    sections: [
      {
        id: "governance",
        title: "Governance & BRA",
        summary: "Outline MLRO responsibilities and BRA cadence",
        suggestedClauses: ["clause-aml-bra"],
      },
      {
        id: "monitoring",
        title: "Screening & Monitoring",
        summary: "Set rules for screening, alert triage, and SAR decisioning",
        suggestedClauses: [],
      },
    ],
    mandatoryClauses: ["clause-aml-bra"],
  },
  {
    code: "SAFEGUARDING",
    name: "Safeguarding Policy",
    category: "Ops",
    description: "How relevant funds are protected for payment and e-money firms, including reconciliations and contingency.",
    sections: [
      {
        id: "segregation",
        title: "Segregation of Funds",
        summary: "Process for separating relevant funds and reconciliations",
        suggestedClauses: ["clause-psd-safeguarding"],
      },
      {
        id: "contingency",
        title: "Contingency & Governance",
        summary: "Oversight, audits, and contingency planning",
        suggestedClauses: [],
      },
    ],
    mandatoryClauses: ["clause-psd-safeguarding"],
  },
];

export function getTemplateByCode(code: string): PolicyTemplate | undefined {
  return POLICY_TEMPLATES.find((template) => template.code === code);
}

export function getApplicableClauses(code: string, permissions: FirmPermissions): PolicyClause[] {
  return POLICY_TEMPLATE_CLAUSES.filter((clause) => {
    if (clause.permissions) {
      return Object.entries(clause.permissions).every(([key, value]) => {
        return permissions[key as keyof FirmPermissions] === value;
      });
    }
    return true;
  });
}
