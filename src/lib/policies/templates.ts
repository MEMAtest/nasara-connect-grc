import type { FirmPermissions } from "./permissions";
import amlCtfSeedClauses from "./seeds/nasara_policy_aml_ctf.clauses.json";
import vulnerableSeedClauses from "./seeds/nasara_policy_vulnerable_customers.clauses.json";
import { NASARA_POLICY_SCAFFOLDS } from "./seeds/nasara_policy_scaffolds";
import mfsFinancialCrimeClauses from "./seeds/mfs_financial_crime.clauses.json";
import mfsConsumerDutyClauses from "./seeds/mfs_consumer_duty.clauses.json";
import mfsComplaintsClauses from "./seeds/mfs_complaints.clauses.json";
import mfsComplaintsFragments from "./seeds/mfs_complaints.fragments.json";
import mfsFinancialCrimeTemplate from "./seeds/mfs_financial_crime.template.json";
import mfsConsumerDutyTemplate from "./seeds/mfs_consumer_duty.template.json";
import mfsComplaintsTemplate from "./seeds/mfs_complaints.template.json";

export type ClauseCategory = "governance" | "operations" | "customer" | "financial-crime" | "market";

export type ClauseVariableType = "text" | "number" | "boolean" | "date";

export interface ClauseVariableDefinition {
  name: string;
  description?: string;
  type?: ClauseVariableType;
  required?: boolean;
  defaultValue?: string;
}

export interface PolicyClause {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ClauseCategory;
  appliesTo?: string[];
  variables?: ClauseVariableDefinition[];
  isMandatory?: boolean;
  permissions?: Partial<FirmPermissions>;
  source?: "mfs" | "nasara" | "core";
}

export interface PolicyTemplateSection {
  id: string;
  title: string;
  summary: string;
  suggestedClauses: string[];
  sectionType?: "policy" | "procedure" | "appendix";
  requiresFirmNotes?: boolean;
}

export type PolicyMappingTargetType = "risk" | "control" | "training" | "evidence";

export interface PolicySuggestedMapping {
  toType: PolicyMappingTargetType;
  toId: string;
  metadata?: Record<string, unknown>;
}

export interface PolicyTemplateBadge {
  label: string;
  tone?: "emerald" | "amber" | "sky" | "slate";
}

export interface PolicyTemplate {
  code: string;
  name: string;
  category: "Customer" | "Complaints" | "FinCrime" | "Ops" | "Governance" | "Markets";
  description: string;
  sections: PolicyTemplateSection[];
  mandatoryClauses: string[];
  badges?: PolicyTemplateBadge[];
  suggestedMappings?: PolicySuggestedMapping[];
}

type NasaraSeedClause = {
  id: string;
  policy_key: string;
  title: string;
  body_md: string;
  variables?: ClauseVariableDefinition[];
};

function summariseMarkdown(value: string) {
  const clean = value
    .replace(/^#+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  return clean.length > 90 ? `${clean.slice(0, 87)}…` : clean;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractScaffoldSections(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const sections: Array<{ title: string; body: string }> = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = /^##\s+(.*)\s*$/.exec(line);
    if (match) {
      if (currentTitle) {
        sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
      }
      currentTitle = match[1].trim();
      currentBody = [];
      continue;
    }
    if (currentTitle) currentBody.push(line);
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }
  return sections.filter((section) => section.title.length > 0);
}

function titleMatchesSection(sectionTitle: string, clauseTitle: string) {
  const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const section = normalise(sectionTitle);
  const clause = normalise(clauseTitle);
  return section === clause || section.includes(clause) || clause.includes(section);
}

const NASARA_SEED_CLAUSES: PolicyClause[] = ([] as NasaraSeedClause[])
  .concat(amlCtfSeedClauses as unknown as NasaraSeedClause[])
  .concat(vulnerableSeedClauses as unknown as NasaraSeedClause[])
  .map((clause) => {
    const appliesTo =
      clause.policy_key === "aml_ctf"
        ? "AML_CTF"
        : clause.policy_key === "vulnerable_customers"
          ? "VULNERABLE_CUST"
          : undefined;
    const category: ClauseCategory =
      clause.policy_key === "aml_ctf"
        ? "financial-crime"
        : clause.policy_key === "vulnerable_customers"
          ? "customer"
          : "governance";
    return {
      id: clause.id,
      title: clause.title,
      summary: summariseMarkdown(clause.body_md),
      content: clause.body_md,
      category,
      appliesTo: appliesTo ? [appliesTo] : undefined,
      variables: clause.variables ?? [],
      source: "nasara",
    };
  });

type DocxSeedClause = {
  id: string;
  policy_key: string;
  title: string;
  body_md: string;
  variables?: ClauseVariableDefinition[];
};

const MFS_SEED_CLAUSES: PolicyClause[] = ([] as DocxSeedClause[])
  .concat(mfsFinancialCrimeClauses as unknown as DocxSeedClause[])
  .concat(mfsConsumerDutyClauses as unknown as DocxSeedClause[])
  .concat(mfsComplaintsClauses as unknown as DocxSeedClause[])
  .concat(mfsComplaintsFragments as unknown as DocxSeedClause[])
  .map((clause) => {
    const appliesTo =
      clause.policy_key === "mfs_financial_crime"
        ? "AML_CTF"
        : clause.policy_key === "mfs_consumer_duty"
          ? "CONSUMER_DUTY"
          : clause.policy_key === "mfs_complaints"
            ? "COMPLAINTS"
            : undefined;
    const category: ClauseCategory =
      clause.policy_key === "mfs_financial_crime" ? "financial-crime" : "customer";

    return {
      id: clause.id,
      title: clause.title,
      summary: summariseMarkdown(clause.body_md),
      content: clause.body_md,
      category,
      appliesTo: appliesTo ? [appliesTo] : undefined,
      variables: clause.variables ?? [],
      source: "mfs",
    };
  });

const NASARA_SCAFFOLD_CLAUSES: PolicyClause[] = [
  ...extractScaffoldSections(NASARA_POLICY_SCAFFOLDS.AML_CTF).map((section) => ({
    id: `aml_ctf-scaffold-${slugify(section.title)}`,
    title: section.title,
    summary: summariseMarkdown(section.body),
    content: section.body || "Add firm-specific content for this section.",
    category: "financial-crime" as const,
    appliesTo: ["AML_CTF"],
    source: "nasara" as const,
  })),
  ...extractScaffoldSections(NASARA_POLICY_SCAFFOLDS.VULNERABLE_CUST).map((section) => ({
    id: `vulnerable_customers-scaffold-${slugify(section.title)}`,
    title: section.title,
    summary: summariseMarkdown(section.body),
    content: section.body || "Add firm-specific content for this section.",
    category: "customer" as const,
    appliesTo: ["VULNERABLE_CUST"],
    source: "nasara" as const,
  })),
];

const CORE_POLICY_TEMPLATE_CLAUSES: PolicyClause[] = [
  {
    id: "clause-vc-purpose",
    title: "Purpose",
    summary: "Define why the vulnerable customer policy exists",
    content: "Describe how the firm identifies and supports customers in vulnerable circumstances.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-scope",
    title: "Scope",
    summary: "Confirm who and what the policy covers",
    content: "Applies to all retail client interactions across channels.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-definitions",
    title: "Definitions",
    summary: "Capture the FCA vulnerability drivers",
    content: "- Health\n- Life events\n- Resilience\n- Capability",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-roles",
    title: "Roles & responsibilities",
    summary: "Set governance and first/second line ownership",
    content: "Board/SMF oversight, first-line ownership, compliance monitoring.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-flags",
    title: "Vulnerability Flagging",
    summary: "Capture disclosed vulnerabilities with consent and support preferences",
    content:
      "We maintain a central register of customer vulnerability disclosures including context, consent, and support preferences. Adjustments are recorded and reviewed quarterly.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-adjustments",
    title: "Reasonable Adjustments",
    summary: "Set out adjustments offered to vulnerable customers",
    content:
      "Reasonable adjustments (communication formats, dedicated contacts, pace adjustments) are offered on disclosure and tracked through resolution.",
    category: "customer",
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-communications",
    title: "Communications & accessibility",
    summary: "Record accessible formats and support routes",
    content: "Large print, TTS, BSL, language support, reasonable adjustments.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-product-design",
    title: "Product & service design",
    summary: "Ensure product design supports fair outcomes",
    content: "Needs assessments, outcome testing, and periodic reviews.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-mi-outcomes",
    title: "MI & outcomes",
    summary: "Define MI and outcome testing expectations",
    content: "Complaints, error rates, cancellations, support metrics, and outcome testing.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-training",
    title: "Training & competence",
    summary: "Set induction and annual refresher expectations",
    content: "Induction, annual refreshers, and QA checks aligned to vulnerable customer obligations.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-vc-review",
    title: "Review & governance",
    summary: "Set review cadence, approvals, and versioning",
    content: "Review cadence, approvals, and versioning controls for ongoing governance.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["VULNERABLE_CUST"],
  },
  {
    id: "clause-aml-purpose",
    title: "Purpose",
    summary: "Define why the AML/CTF policy exists",
    content: "Prevent ML/TF and comply with the MLRs and relevant FCA rules.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-bra",
    title: "Business-wide Risk Assessment",
    summary: "Annual refresh of BRA with board oversight",
    content:
      "The MLRO oversees an annual business-wide risk assessment covering products, customers, delivery channels, and geography with board sign-off and action tracking.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-cra",
    title: "Customer Risk Assessment (CRA)",
    summary: "Define customer risk factors and scoring",
    content: "Risk factors: customer, geography, product/service, delivery channel.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-cdd-edd",
    title: "Customer Due Diligence (CDD) & EDD",
    summary: "Set standard and enhanced due diligence requirements",
    content: "Standard/Enhanced due diligence, PEPs (domestic/foreign), and high-risk third countries.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-monitoring",
    title: "Ongoing monitoring & transaction monitoring",
    summary: "Define monitoring scenarios and investigation steps",
    content: "Scenarios, alerts, investigations, and QA.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-sars",
    title: "Suspicious Activity Reporting (SARs)",
    summary: "Define internal escalation and external reporting controls",
    content: "Internal escalation, MLRO review, external reporting, and tipping-off controls.",
    category: "financial-crime",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-record-keeping",
    title: "Record keeping",
    summary: "Define retention periods and secure storage expectations",
    content: "Retention periods and secure storage requirements for AML/CTF records.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-training",
    title: "Training & awareness",
    summary: "Define induction and annual AML/CTF training",
    content: "Induction, annual training, role-specific modules, and MI reporting.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-aml-governance",
    title: "Governance & oversight",
    summary: "Define MLRO reporting cadence and board oversight",
    content: "SMF17/MLRO reporting, escalations, and board updates.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["AML_CTF"],
  },
  {
    id: "clause-psd-safeguarding",
    title: "Safeguarding of Relevant Funds",
    summary: "Segregation and reconciliations for payment/e-money firms",
    content:
      "Relevant funds are segregated daily into safeguarded accounts with daily reconciliation and contingency funding arrangements, overseen by the safeguarding officer.",
    category: "operations",
    appliesTo: ["SAFEGUARDING"],
  },
  {
    id: "clause-suit-purpose",
    title: "Purpose",
    summary: "Define why suitability of advice requirements apply",
    content: "Ensure personal recommendations are suitable and in clients' best interests.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-scope",
    title: "Scope & permissions",
    summary: "Confirm advisory scope and client types covered",
    content: "Advisory vs execution-only scope, permissions, and client type coverage.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-fact-finding",
    title: "Fact-finding & information gathering",
    summary: "Define the minimum information captured before advice",
    content: "KYC, objectives, financial situation, risk profile, and capacity for loss.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-assessment",
    title: "Assessment of suitability",
    summary: "Define methodology and documentation standards",
    content: "Methodology, tools (e.g., IAAT), and documentation standards.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-disclosure",
    title: "Disclosure & communication",
    summary: "Confirm disclosure of costs, risks, and conflicts",
    content: "Costs/charges, risks, limitations, and conflicts disclosures.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-reviews",
    title: "Ongoing reviews",
    summary: "Define review cadence and trigger events",
    content: "Cadence, triggers, and change-of-circumstance reviews.",
    category: "market",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-qa",
    title: "Quality assurance & file reviews",
    summary: "Define sampling and remediation expectations",
    content: "Sampling, grading, remediation, and MI reporting.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
  {
    id: "clause-suit-governance",
    title: "Governance & record keeping",
    summary: "Define approvals, versioning, and retention",
    content: "Approvals, versioning, and retention requirements.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["SUITABILITY_ADVICE"],
  },
];

export const POLICY_TEMPLATE_CLAUSES: PolicyClause[] = [
  ...MFS_SEED_CLAUSES,
  ...NASARA_SEED_CLAUSES,
  ...NASARA_SCAFFOLD_CLAUSES,
  ...CORE_POLICY_TEMPLATE_CLAUSES,
];

const CORE_POLICY_TEMPLATES: PolicyTemplate[] = [
  {
    code: "VULNERABLE_CUST",
    name: "Vulnerable Customers",
    category: "Customer",
    description: "Identify, support, and evidence fair outcomes for customers with characteristics of vulnerability.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Describe why the policy exists and what outcomes it targets",
        suggestedClauses: ["clause-vc-purpose"],
      },
      {
        id: "scope",
        title: "Scope",
        summary: "Confirm client segments, channels, and teams covered",
        suggestedClauses: ["clause-vc-scope"],
      },
      {
        id: "definitions",
        title: "Definitions",
        summary: "Define vulnerability drivers and key terms",
        suggestedClauses: ["clause-vc-definitions"],
      },
      {
        id: "roles",
        title: "Roles & responsibilities",
        summary: "Set governance and ownership across the three lines",
        suggestedClauses: ["clause-vc-roles"],
      },
      {
        id: "identification",
        title: "Identification & flagging",
        summary: "Define how vulnerabilities are identified, recorded, and supported",
        suggestedClauses: ["clause-vc-flags"],
      },
      {
        id: "communications",
        title: "Communications & accessibility",
        summary: "Record accessible formats, reasonable adjustments, and escalation routes",
        suggestedClauses: ["clause-vc-communications", "clause-vc-adjustments"],
      },
      {
        id: "product",
        title: "Product & service design",
        summary: "Ensure products and servicing enable fair outcomes",
        suggestedClauses: ["clause-vc-product-design"],
      },
      {
        id: "mi",
        title: "MI & outcomes",
        summary: "Define MI, outcome testing, and management reporting",
        suggestedClauses: ["clause-vc-mi-outcomes"],
      },
      {
        id: "training",
        title: "Training & competence",
        summary: "Define training and competence requirements",
        suggestedClauses: ["clause-vc-training"],
      },
      {
        id: "review",
        title: "Review & governance",
        summary: "Define review cadence, approvals, and versioning",
        suggestedClauses: ["clause-vc-review"],
      },
    ],
    mandatoryClauses: [
      "clause-vc-purpose",
      "clause-vc-scope",
      "clause-vc-definitions",
      "clause-vc-roles",
      "clause-vc-flags",
      "clause-vc-communications",
      "clause-vc-product-design",
      "clause-vc-mi-outcomes",
      "clause-vc-training",
      "clause-vc-review",
    ],
  },
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

function buildNasaraTemplate(input: {
  code: "AML_CTF" | "VULNERABLE_CUST";
  name: string;
  category: PolicyTemplate["category"];
  description: string;
  scaffoldMarkdown: string;
}) {
  const policyKey = input.code === "AML_CTF" ? "aml_ctf" : "vulnerable_customers";
  const sectionsFromScaffold = extractScaffoldSections(input.scaffoldMarkdown);
  const sectionClauses = NASARA_SEED_CLAUSES.filter((clause) => clause.appliesTo?.includes(input.code));
  const scaffoldClauses = NASARA_SCAFFOLD_CLAUSES.filter((clause) => clause.appliesTo?.includes(input.code));

  const sections = sectionsFromScaffold.map((section) => {
    const sectionId = slugify(section.title);
    const scaffoldClauseId = `${policyKey}-scaffold-${sectionId}`;
    const matchingSeedClauses = sectionClauses.filter((clause) => titleMatchesSection(section.title, clause.title));
    const suggestedClauses = [
      ...(scaffoldClauses.some((clause) => clause.id === scaffoldClauseId) ? [scaffoldClauseId] : []),
      ...matchingSeedClauses.map((clause) => clause.id),
    ];
    return {
      id: sectionId,
      title: section.title,
      summary: section.body ? summariseMarkdown(section.body) : `Configure ${section.title} for your firm.`,
      suggestedClauses: suggestedClauses.length ? suggestedClauses : [scaffoldClauseId],
    };
  });

  const mandatoryClauses = Array.from(new Set(sections.flatMap((section) => section.suggestedClauses)));

  return {
    code: input.code,
    name: input.name,
    category: input.category,
    description: input.description,
    sections,
    mandatoryClauses,
  } satisfies PolicyTemplate;
}

const NASARA_POLICY_TEMPLATES: PolicyTemplate[] = [
  buildNasaraTemplate({
    code: "AML_CTF",
    name: "AML/CTF & Sanctions",
    category: "FinCrime",
    description: "Risk-based AML/CTF and sanctions framework covering onboarding, monitoring, and SAR escalation.",
    scaffoldMarkdown: NASARA_POLICY_SCAFFOLDS.AML_CTF,
  }),
  buildNasaraTemplate({
    code: "VULNERABLE_CUST",
    name: "Vulnerable Customers",
    category: "Customer",
    description: "Identify, support, and evidence fair outcomes for customers with characteristics of vulnerability.",
    scaffoldMarkdown: NASARA_POLICY_SCAFFOLDS.VULNERABLE_CUST,
  }),
];

const MFS_POLICY_TEMPLATES: PolicyTemplate[] = [
  mfsFinancialCrimeTemplate as unknown as PolicyTemplate,
  {
    ...(mfsConsumerDutyTemplate as unknown as PolicyTemplate),
    suggestedMappings: [
      {
        toType: "training",
        toId: "consumer-duty",
        metadata: { title: "Consumer Duty implementation training", category: "customer-protection" },
      },
      {
        toType: "training",
        toId: "vulnerable-customers",
        metadata: { title: "Vulnerable customers training", category: "customer-protection" },
      },
      {
        toType: "control",
        toId: "CMP-001",
        metadata: { title: "Target Market & Client Segmentation" },
      },
      {
        toType: "control",
        toId: "CMP-007",
        metadata: { title: "Suitability Report Process" },
      },
    ],
  },
  {
    ...(mfsComplaintsTemplate as unknown as PolicyTemplate),
    suggestedMappings: [
      {
        toType: "training",
        toId: "complaints-handling",
        metadata: { title: "Complaints handling training", category: "customer-protection" },
      },
    ],
  },
];

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  ...MFS_POLICY_TEMPLATES,
  ...NASARA_POLICY_TEMPLATES.filter((template) => !["AML_CTF"].includes(template.code)),
  ...CORE_POLICY_TEMPLATES.filter((template) => !["AML_CTF", "VULNERABLE_CUST", "CONSUMER_DUTY", "COMPLAINTS"].includes(template.code)),
];

export function getTemplateByCode(code: string): PolicyTemplate | undefined {
  return POLICY_TEMPLATES.find((template) => template.code === code);
}

export function getApplicableClauses(code: string, permissions: FirmPermissions): PolicyClause[] {
  const scoped = POLICY_TEMPLATE_CLAUSES.filter((clause) => {
    if (clause.appliesTo && !clause.appliesTo.includes(code)) {
      return false;
    }
    if (clause.permissions) {
      return Object.entries(clause.permissions).every(([key, value]) => {
        return permissions[key as keyof FirmPermissions] === value;
      });
    }
    return true;
  });

  const hasMfsClauses = scoped.some((clause) => clause.source === "mfs");
  if (hasMfsClauses) {
    return scoped.filter((clause) => clause.source === "mfs");
  }

  const hasNasaraClauses = scoped.some((clause) => clause.source === "nasara");
  if (hasNasaraClauses) {
    return scoped.filter((clause) => clause.source === "nasara");
  }
  return scoped;
}
