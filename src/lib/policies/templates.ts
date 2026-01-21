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
  {
    id: "clause-finprom-purpose",
    title: "Purpose",
    summary: "Define the objectives for compliant financial promotions",
    content: "Set the firm's commitment to fair, clear, and not misleading communications across all channels.",
    category: "market",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-scope",
    title: "Scope & applicability",
    summary: "Define channels, products, and audiences covered",
    content: "This policy applies to all marketing materials, websites, emails, social media, and third-party promotions.",
    category: "market",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-approval",
    title: "Approval & sign-off",
    summary: "Set review, approval, and record keeping controls",
    content: "All promotions must be reviewed and approved by Compliance before release, with approvals logged.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-risk",
    title: "Risk warnings & disclosures",
    summary: "Define prominence and balance expectations",
    content: "Risk warnings must be prominent, balanced with benefits, and tailored to the target audience.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-finprom-monitoring",
    title: "Monitoring & ongoing review",
    summary: "Define post-release monitoring and refresh cadence",
    content: "Promotions are monitored for performance and customer understanding, with periodic reviews and updates.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["FIN_PROMOTIONS"],
  },
  {
    id: "clause-bcp-purpose",
    title: "Purpose",
    summary: "Define the resilience and continuity objectives",
    content: "Set how the firm prevents, responds to, and recovers from operational disruption.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-bcp-ibs",
    title: "Important business services",
    summary: "Identify important business services and dependencies",
    content: "Define the services whose disruption could cause intolerable harm and map key dependencies.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-bcp-impact",
    title: "Impact tolerances",
    summary: "Set impact tolerances and escalation triggers",
    content: "Document impact tolerances for each service and escalation paths when tolerances are at risk.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-bcp-incident",
    title: "Incident management",
    summary: "Define incident response roles and communications",
    content: "Incident response roles, internal communications, regulatory notifications, and customer updates.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-bcp-testing",
    title: "Testing & remediation",
    summary: "Define scenario testing and remediation expectations",
    content: "Perform severe but plausible scenario testing with documented remediation plans.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-bcp-governance",
    title: "Governance & review",
    summary: "Define board oversight and review cadence",
    content: "Board-approved resilience strategy, annual review, and MI reporting.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BCP_RESILIENCE"],
  },
  {
    id: "clause-conflicts-purpose",
    title: "Purpose",
    summary: "Define conflicts management objectives",
    content: "Set how the firm identifies, prevents, and manages conflicts of interest.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-conflicts-identification",
    title: "Identification & assessment",
    summary: "Define conflict sources and assessment approach",
    content: "Identify conflicts across products, remuneration, and third parties, and assess materiality.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-conflicts-register",
    title: "Conflicts register",
    summary: "Record conflicts and controls in a register",
    content: "Maintain a conflicts register with owners, controls, and remediation actions.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-conflicts-controls",
    title: "Control framework",
    summary: "Define controls to mitigate conflicts",
    content: "Implement controls including separation of duties, disclosures, and approval checks.",
    category: "market",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-conflicts-disclosure",
    title: "Customer disclosure",
    summary: "Define when and how conflicts are disclosed",
    content: "Disclose residual conflicts to customers in a clear and timely manner.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-conflicts-governance",
    title: "Governance & review",
    summary: "Define oversight and review cadence",
    content: "Compliance monitors conflicts and reports to senior management at least annually.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CONFLICTS"],
  },
  {
    id: "clause-bestex-purpose",
    title: "Purpose",
    summary: "Define best execution objectives and scope",
    content: "Ensure client orders achieve the best possible result considering price, cost, and speed.",
    category: "market",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-factors",
    title: "Execution factors",
    summary: "Define execution factors and prioritization",
    content: "Document the relative importance of price, costs, speed, likelihood, and size for each client type.",
    category: "market",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-venues",
    title: "Execution venues & counterparties",
    summary: "Define venue selection and monitoring",
    content: "Select, monitor, and periodically review execution venues and counterparties.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-monitoring",
    title: "Monitoring & evidence",
    summary: "Define monitoring and evidence requirements",
    content: "Monitor execution quality and retain evidence to demonstrate compliance.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-bestex-governance",
    title: "Governance & review",
    summary: "Define oversight and policy review cadence",
    content: "Annual review by Compliance with board oversight and documented changes.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["BEST_EXECUTION"],
  },
  {
    id: "clause-reslend-purpose",
    title: "Purpose",
    summary: "Define responsible lending objectives",
    content: "Ensure lending decisions are fair, affordable, and aligned to customer interests.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-affordability",
    title: "Affordability assessment",
    summary: "Define affordability criteria and evidence",
    content: "Assess income, expenditure, and sustainability before lending or broking decisions.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-creditworthiness",
    title: "Creditworthiness & decisioning",
    summary: "Define creditworthiness checks and approvals",
    content: "Define data sources, scoring, and approval thresholds for credit decisions.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-vulnerability",
    title: "Vulnerability considerations",
    summary: "Embed vulnerability and forbearance triggers",
    content: "Identify vulnerable customers and adjust lending decisions accordingly.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-reslend-monitoring",
    title: "Monitoring & governance",
    summary: "Define monitoring and MI reporting",
    content: "Monitor outcomes, default trends, and fairness indicators with board oversight.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RESPONSIBLE_LENDING"],
  },
  {
    id: "clause-arrears-purpose",
    title: "Purpose",
    summary: "Define arrears management objectives",
    content: "Support customers in arrears with fair, consistent, and compliant forbearance.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-arrears-early",
    title: "Early arrears detection",
    summary: "Define early warning indicators",
    content: "Use early warning indicators, missed payments, and behavioral triggers to identify arrears.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-arrears-forbearance",
    title: "Forbearance options",
    summary: "Define available forbearance tools",
    content: "Offer tailored repayment plans, payment holidays, or reduced payments where appropriate.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-arrears-communications",
    title: "Customer communications",
    summary: "Define communication standards and timing",
    content: "Communications must be clear, supportive, and considerate of vulnerability.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-arrears-vulnerability",
    title: "Vulnerable customers",
    summary: "Embed vulnerability support in arrears processes",
    content: "Apply additional support and escalation for vulnerable customers in arrears.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-arrears-governance",
    title: "Governance & MI",
    summary: "Define arrears MI and oversight",
    content: "Track arrears outcomes, complaints, and fair treatment indicators for governance review.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["ARREARS_MANAGEMENT"],
  },
  {
    id: "clause-prod-purpose",
    title: "Purpose",
    summary: "Define PROD governance objectives",
    content: "Ensure products deliver fair value and meet target market needs.",
    category: "market",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-prod-target-market",
    title: "Target market assessment",
    summary: "Define target market and distribution strategy",
    content: "Identify target market characteristics, exclusions, and distribution channels.",
    category: "market",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-prod-approval",
    title: "Product approval",
    summary: "Define product approval and review process",
    content: "Document product approval, sign-off, and periodic review requirements.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-prod-distribution",
    title: "Distribution oversight",
    summary: "Define distributor monitoring and oversight",
    content: "Monitor distributors, MI, and customer outcomes to ensure alignment to target market.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-prod-monitoring",
    title: "Outcome monitoring",
    summary: "Track product performance and customer outcomes",
    content: "Monitor complaints, cancellations, and claims to assess ongoing suitability.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-prod-governance",
    title: "Governance & review",
    summary: "Define governance, MI, and review cadence",
    content: "Report to senior management with scheduled reviews and approvals.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["PROD", "PRODUCT_GOV", "TARGET_MARKET"],
  },
  {
    id: "clause-risk-purpose",
    title: "Purpose",
    summary: "Define risk management objectives",
    content: "Set how the firm identifies, assesses, mitigates, and reports risk.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-perimeter",
    title: "Regulatory perimeter",
    summary: "Confirm permissions, perimeter boundaries, and change triggers",
    content: "Maintain documented permission scope (PERG) with change triggers, approvals, and ongoing monitoring.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-appetite",
    title: "Risk appetite",
    summary: "Define risk appetite and tolerance statements",
    content: "Document risk appetite statements, thresholds, and escalation triggers.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-assessment",
    title: "Risk assessment process",
    summary: "Define risk identification and assessment",
    content: "Identify inherent risks, assess impact/likelihood, and define residual risk.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-controls",
    title: "Control framework",
    summary: "Define controls and ownership",
    content: "Document control ownership, testing, and remediation expectations.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-reporting",
    title: "Risk reporting",
    summary: "Define MI and reporting cadence",
    content: "Report key risks, incidents, and KRIs to senior management and the board.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-risk-governance",
    title: "Governance & review",
    summary: "Define governance and review cadence",
    content: "Annual review with board oversight and evidence of changes.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["RISK_MGMT"],
  },
  {
    id: "clause-compmon-purpose",
    title: "Purpose",
    summary: "Define compliance monitoring objectives",
    content: "Set how the firm evidences ongoing compliance with FCA rules and permissions.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-compmon-scope",
    title: "Scope",
    summary: "Define regulatory obligations in scope",
    content: "Cover business areas, permissions, and regulatory obligations monitored each cycle.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-compmon-risk",
    title: "Risk-based plan",
    summary: "Set the risk-based monitoring plan",
    content: "Maintain an annual monitoring plan aligned to the risk assessment and FCA priorities.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-compmon-testing",
    title: "Testing methodology",
    summary: "Define testing and sampling approach",
    content: "Define testing methods, sample sizes, and documentation standards for reviews.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-compmon-reporting",
    title: "Reporting",
    summary: "Define MI and reporting cadence",
    content: "Report findings, themes, and remediation status to senior management and the board.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-compmon-remediation",
    title: "Remediation",
    summary: "Define issue management and follow-up",
    content: "Track actions, owners, and deadlines, with verification of remediation completion.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["COMPLIANCE_MON"],
  },
  {
    id: "clause-outsourcing-purpose",
    title: "Purpose",
    summary: "Define outsourcing governance objectives",
    content: "Ensure outsourcing does not impair controls, customer outcomes, or FCA supervision.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-outsourcing-scope",
    title: "Scope & classification",
    summary: "Define material outsourcing and IBS",
    content: "Classify material outsourcing and important business services with risk tiers.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-outsourcing-due-diligence",
    title: "Due diligence",
    summary: "Define pre-outsourcing assessments",
    content: "Assess financial stability, controls, data security, and regulatory impact before engagement.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-outsourcing-contracts",
    title: "Contract standards",
    summary: "Define contractual requirements",
    content: "Include audit rights, data access, incident notification, and regulatory cooperation clauses.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-outsourcing-oversight",
    title: "Ongoing oversight",
    summary: "Define monitoring and review cadence",
    content: "Monitor SLAs, performance, and risk indicators with escalation and remediation paths.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-outsourcing-exit",
    title: "Exit planning",
    summary: "Define exit strategy and contingency",
    content: "Maintain exit plans, data migration steps, and contingency arrangements for failures.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["OUTSOURCING"],
  },
  {
    id: "clause-infosec-purpose",
    title: "Purpose",
    summary: "Define information security objectives",
    content: "Protect confidentiality, integrity, and availability of systems and data.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-infosec-governance",
    title: "Governance & ownership",
    summary: "Define security roles and oversight",
    content: "Assign security ownership, escalation paths, and board reporting requirements.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-infosec-access",
    title: "Access controls",
    summary: "Define access management requirements",
    content: "Apply least privilege, MFA, and periodic access reviews for all systems.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-infosec-data",
    title: "Data protection",
    summary: "Define data handling and encryption",
    content: "Classify data, encrypt sensitive information, and enforce retention and disposal rules.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-infosec-incident",
    title: "Incident response",
    summary: "Define detection and response workflow",
    content: "Detect, contain, and report security incidents with post-incident reviews.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-infosec-testing",
    title: "Testing & assurance",
    summary: "Define testing and vulnerability management",
    content: "Conduct penetration tests, vulnerability scans, and remediation tracking.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["INFO_SECURITY"],
  },
  {
    id: "clause-opsec-purpose",
    title: "Purpose",
    summary: "Define operational & security risk objectives",
    content: "Manage operational and security risks in line with PSRs/EMRs expectations.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-opsec-risk",
    title: "Risk assessment",
    summary: "Define operational risk assessment approach",
    content: "Assess operational, technology, and third-party risks with controls and owners.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-opsec-sca",
    title: "Strong customer authentication",
    summary: "Define SCA and secure communication controls",
    content: "Apply SCA, secure communication standards, and fraud prevention for payment journeys.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-opsec-incident",
    title: "Incident reporting",
    summary: "Define major incident reporting",
    content: "Report major incidents within regulatory timelines and track remediation actions.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-opsec-fraud",
    title: "Fraud monitoring",
    summary: "Define fraud monitoring and reimbursement controls",
    content: "Monitor fraud trends, dispute handling, and reimbursement obligations where applicable.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-opsec-resilience",
    title: "Operational resilience",
    summary: "Define resilience and testing expectations",
    content: "Align scenario testing, impact tolerances, and recovery plans with resilience requirements.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["OP_SEC_RISK"],
  },
  {
    id: "clause-mabuse-purpose",
    title: "Purpose",
    summary: "Define market abuse prevention objectives",
    content: "Prevent insider dealing, unlawful disclosure, and market manipulation.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-inside",
    title: "Inside information",
    summary: "Define inside information handling",
    content: "Identify inside information, maintain insider lists, and control access.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-pad",
    title: "Personal account dealing",
    summary: "Define PAD controls and approvals",
    content: "Set pre-clearance, restricted lists, and conflicts management for staff trading.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-surveillance",
    title: "Surveillance & monitoring",
    summary: "Define surveillance and alert reviews",
    content: "Implement trade surveillance, alerts, and escalation for suspicious activity.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-mabuse-reporting",
    title: "Reporting",
    summary: "Define STOR reporting",
    content: "Escalate and submit suspicious transaction and order reports as required.",
    category: "market",
    isMandatory: true,
    appliesTo: ["MARKET_ABUSE"],
  },
  {
    id: "clause-inducements-purpose",
    title: "Purpose",
    summary: "Define inducements governance objectives",
    content: "Ensure inducements do not impair client outcomes or conflict with duty of care.",
    category: "market",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-assessment",
    title: "Assessment",
    summary: "Define assessment of payments and benefits",
    content: "Assess inducements for suitability, independence, and conflict impact.",
    category: "market",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-disclosure",
    title: "Disclosure",
    summary: "Define disclosure standards",
    content: "Disclose inducements clearly, fairly, and in a way clients can understand.",
    category: "customer",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-conflicts",
    title: "Conflicts linkage",
    summary: "Define conflicts management linkage",
    content: "Record inducements in the conflicts register and apply mitigation measures.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-inducements-monitoring",
    title: "Monitoring",
    summary: "Define ongoing monitoring and review",
    content: "Review inducements, MI, and exceptions with regular governance oversight.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["INDUCEMENTS"],
  },
  {
    id: "clause-cass-purpose",
    title: "Purpose",
    summary: "Define client asset protection objectives",
    content: "Protect client money and assets in line with CASS requirements.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cass-scope",
    title: "Scope & classification",
    summary: "Define CASS applicability and classifications",
    content: "Document client money/asset classifications and CASS applicability by business line.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cass-segregation",
    title: "Segregation",
    summary: "Define segregation and trust status",
    content: "Segregate client money/assets with appropriate trust and account structures.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cass-reconciliations",
    title: "Reconciliations",
    summary: "Define reconciliation requirements",
    content: "Perform internal and external reconciliations with defined frequency and tolerance.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cass-records",
    title: "Record keeping",
    summary: "Define record keeping and audit trail",
    content: "Maintain client ledgers, account records, and audit trails with retention standards.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cass-governance",
    title: "Governance",
    summary: "Define oversight and accountability",
    content: "Assign CASS oversight, reporting cadence, and SMF accountability.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CASS"],
  },
  {
    id: "clause-cassrp-purpose",
    title: "Purpose",
    summary: "Define CASS resolution pack objectives",
    content: "Enable timely return of client assets in an insolvency scenario.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-pack",
    title: "Resolution pack content",
    summary: "Define required pack documents",
    content: "Maintain key documents, account lists, and contact details in the CASS pack.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-data",
    title: "Data integrity",
    summary: "Define data quality and inventory",
    content: "Ensure data is accurate, complete, and retrievable for resolution needs.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-testing",
    title: "Testing & updates",
    summary: "Define testing and update cadence",
    content: "Test the pack regularly and update after material changes or incidents.",
    category: "operations",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
  },
  {
    id: "clause-cassrp-governance",
    title: "Governance & review",
    summary: "Define ownership and review cadence",
    content: "Assign ownership and governance sign-off for pack maintenance.",
    category: "governance",
    isMandatory: true,
    appliesTo: ["CASS_RESOLUTION"],
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
  {
    code: "FIN_PROMOTIONS",
    name: "Financial Promotions",
    category: "Markets",
    description: "Govern the creation, approval, and monitoring of financial promotions and communications.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define the objectives for compliant promotions",
        suggestedClauses: ["clause-finprom-purpose"],
      },
      {
        id: "scope",
        title: "Scope & applicability",
        summary: "Define channels, products, and audiences covered",
        suggestedClauses: ["clause-finprom-scope"],
      },
      {
        id: "approval",
        title: "Approval & sign-off",
        summary: "Define review and approval controls",
        suggestedClauses: ["clause-finprom-approval"],
      },
      {
        id: "risk",
        title: "Risk warnings & disclosures",
        summary: "Define prominence and balance requirements",
        suggestedClauses: ["clause-finprom-risk"],
      },
      {
        id: "monitoring",
        title: "Monitoring & review",
        summary: "Define monitoring and refresh cadence",
        suggestedClauses: ["clause-finprom-monitoring"],
      },
    ],
    mandatoryClauses: [
      "clause-finprom-purpose",
      "clause-finprom-scope",
      "clause-finprom-approval",
      "clause-finprom-risk",
      "clause-finprom-monitoring",
    ],
  },
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
  {
    code: "BEST_EXECUTION",
    name: "Best Execution",
    category: "Markets",
    description: "Ensure client orders achieve the best possible outcome and evidence execution quality.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define best execution objectives and scope",
        suggestedClauses: ["clause-bestex-purpose"],
      },
      {
        id: "factors",
        title: "Execution factors",
        summary: "Define execution factors and prioritization",
        suggestedClauses: ["clause-bestex-factors"],
      },
      {
        id: "venues",
        title: "Execution venues",
        summary: "Define venue selection and monitoring",
        suggestedClauses: ["clause-bestex-venues"],
      },
      {
        id: "monitoring",
        title: "Monitoring & evidence",
        summary: "Define monitoring and evidence requirements",
        suggestedClauses: ["clause-bestex-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define oversight and review cadence",
        suggestedClauses: ["clause-bestex-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-bestex-purpose",
      "clause-bestex-factors",
      "clause-bestex-venues",
      "clause-bestex-monitoring",
      "clause-bestex-governance",
    ],
  },
  {
    code: "RESPONSIBLE_LENDING",
    name: "Responsible Lending & Affordability",
    category: "Customer",
    description: "Define affordability, creditworthiness, and fair treatment expectations for lending decisions.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define responsible lending objectives",
        suggestedClauses: ["clause-reslend-purpose"],
      },
      {
        id: "affordability",
        title: "Affordability assessment",
        summary: "Define affordability assessment requirements",
        suggestedClauses: ["clause-reslend-affordability"],
      },
      {
        id: "creditworthiness",
        title: "Creditworthiness & decisioning",
        summary: "Define decisioning and evidence requirements",
        suggestedClauses: ["clause-reslend-creditworthiness"],
      },
      {
        id: "vulnerability",
        title: "Vulnerability considerations",
        summary: "Embed vulnerability and forbearance triggers",
        suggestedClauses: ["clause-reslend-vulnerability"],
      },
      {
        id: "monitoring",
        title: "Monitoring & governance",
        summary: "Define monitoring and MI reporting",
        suggestedClauses: ["clause-reslend-monitoring"],
      },
    ],
    mandatoryClauses: [
      "clause-reslend-purpose",
      "clause-reslend-affordability",
      "clause-reslend-creditworthiness",
      "clause-reslend-vulnerability",
      "clause-reslend-monitoring",
    ],
  },
  {
    code: "ARREARS_MANAGEMENT",
    name: "Arrears Management & Forbearance",
    category: "Customer",
    description: "Define early arrears detection, forbearance options, and fair customer treatment.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define arrears management objectives",
        suggestedClauses: ["clause-arrears-purpose"],
      },
      {
        id: "early",
        title: "Early arrears detection",
        summary: "Define early warning indicators",
        suggestedClauses: ["clause-arrears-early"],
      },
      {
        id: "forbearance",
        title: "Forbearance options",
        summary: "Define available forbearance tools",
        suggestedClauses: ["clause-arrears-forbearance"],
      },
      {
        id: "communications",
        title: "Customer communications",
        summary: "Define communication standards and timing",
        suggestedClauses: ["clause-arrears-communications"],
      },
      {
        id: "vulnerable",
        title: "Vulnerable customers",
        summary: "Embed vulnerability support in arrears processes",
        suggestedClauses: ["clause-arrears-vulnerability"],
      },
      {
        id: "governance",
        title: "Governance & MI",
        summary: "Define arrears MI and oversight",
        suggestedClauses: ["clause-arrears-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-arrears-purpose",
      "clause-arrears-early",
      "clause-arrears-forbearance",
      "clause-arrears-communications",
      "clause-arrears-vulnerability",
      "clause-arrears-governance",
    ],
  },
  {
    code: "PROD",
    name: "PROD & Distribution Oversight",
    category: "Governance",
    description: "Define product governance and distribution oversight for insurance and retail products.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define PROD governance objectives",
        suggestedClauses: ["clause-prod-purpose"],
      },
      {
        id: "target-market",
        title: "Target market assessment",
        summary: "Define target market and distribution strategy",
        suggestedClauses: ["clause-prod-target-market"],
      },
      {
        id: "approval",
        title: "Product approval",
        summary: "Define product approval and review process",
        suggestedClauses: ["clause-prod-approval"],
      },
      {
        id: "distribution",
        title: "Distribution oversight",
        summary: "Define distributor monitoring and oversight",
        suggestedClauses: ["clause-prod-distribution"],
      },
      {
        id: "monitoring",
        title: "Outcome monitoring",
        summary: "Track product performance and customer outcomes",
        suggestedClauses: ["clause-prod-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance, MI, and review cadence",
        suggestedClauses: ["clause-prod-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-prod-purpose",
      "clause-prod-target-market",
      "clause-prod-approval",
      "clause-prod-distribution",
      "clause-prod-monitoring",
      "clause-prod-governance",
    ],
  },
  {
    code: "RISK_MGMT",
    name: "Risk Management Framework",
    category: "Governance",
    description: "Define the firm-wide risk assessment framework, appetite, and reporting cadence.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define risk management objectives",
        suggestedClauses: ["clause-risk-purpose"],
      },
      {
        id: "perimeter",
        title: "Regulatory perimeter",
        summary: "Confirm permissions and perimeter boundaries",
        suggestedClauses: ["clause-risk-perimeter"],
      },
      {
        id: "appetite",
        title: "Risk appetite",
        summary: "Define appetite and tolerance statements",
        suggestedClauses: ["clause-risk-appetite"],
      },
      {
        id: "assessment",
        title: "Risk assessment process",
        summary: "Define risk identification and assessment",
        suggestedClauses: ["clause-risk-assessment"],
      },
      {
        id: "controls",
        title: "Control framework",
        summary: "Define controls and ownership",
        suggestedClauses: ["clause-risk-controls"],
      },
      {
        id: "reporting",
        title: "Risk reporting",
        summary: "Define MI and reporting cadence",
        suggestedClauses: ["clause-risk-reporting"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance and review cadence",
        suggestedClauses: ["clause-risk-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-risk-purpose",
      "clause-risk-perimeter",
      "clause-risk-appetite",
      "clause-risk-assessment",
      "clause-risk-controls",
      "clause-risk-reporting",
      "clause-risk-governance",
    ],
  },
  {
    code: "COMPLIANCE_MON",
    name: "Compliance Monitoring Plan",
    category: "Governance",
    description: "Risk-based monitoring plan covering FCA obligations, testing, and remediation.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define compliance monitoring objectives",
        suggestedClauses: ["clause-compmon-purpose"],
      },
      {
        id: "scope",
        title: "Scope",
        summary: "Define the regulatory obligations in scope",
        suggestedClauses: ["clause-compmon-scope"],
      },
      {
        id: "plan",
        title: "Risk-based plan",
        summary: "Set the monitoring plan and cadence",
        suggestedClauses: ["clause-compmon-risk"],
      },
      {
        id: "testing",
        title: "Testing methodology",
        summary: "Define testing and sampling approach",
        suggestedClauses: ["clause-compmon-testing"],
      },
      {
        id: "reporting",
        title: "Reporting",
        summary: "Define MI and escalation",
        suggestedClauses: ["clause-compmon-reporting"],
      },
      {
        id: "remediation",
        title: "Remediation",
        summary: "Define action tracking and closure",
        suggestedClauses: ["clause-compmon-remediation"],
      },
    ],
    mandatoryClauses: [
      "clause-compmon-purpose",
      "clause-compmon-scope",
      "clause-compmon-risk",
      "clause-compmon-testing",
      "clause-compmon-reporting",
      "clause-compmon-remediation",
    ],
  },
  {
    code: "OUTSOURCING",
    name: "Outsourcing & Third Party",
    category: "Ops",
    description: "Govern material outsourcing, third-party risk, and regulatory oversight expectations.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define outsourcing governance objectives",
        suggestedClauses: ["clause-outsourcing-purpose"],
      },
      {
        id: "classification",
        title: "Scope & classification",
        summary: "Define material outsourcing and IBS",
        suggestedClauses: ["clause-outsourcing-scope"],
      },
      {
        id: "due-diligence",
        title: "Due diligence",
        summary: "Define pre-outsourcing assessments",
        suggestedClauses: ["clause-outsourcing-due-diligence"],
      },
      {
        id: "contracts",
        title: "Contract standards",
        summary: "Define contractual requirements",
        suggestedClauses: ["clause-outsourcing-contracts"],
      },
      {
        id: "oversight",
        title: "Ongoing oversight",
        summary: "Define monitoring and review cadence",
        suggestedClauses: ["clause-outsourcing-oversight"],
      },
      {
        id: "exit",
        title: "Exit planning",
        summary: "Define exit strategy and contingency",
        suggestedClauses: ["clause-outsourcing-exit"],
      },
    ],
    mandatoryClauses: [
      "clause-outsourcing-purpose",
      "clause-outsourcing-scope",
      "clause-outsourcing-due-diligence",
      "clause-outsourcing-contracts",
      "clause-outsourcing-oversight",
      "clause-outsourcing-exit",
    ],
  },
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
  {
    code: "MARKET_ABUSE",
    name: "Market Abuse Policy",
    category: "Markets",
    description: "Prevent insider dealing, market manipulation, and meet STOR obligations.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define market abuse prevention objectives",
        suggestedClauses: ["clause-mabuse-purpose"],
      },
      {
        id: "inside-information",
        title: "Inside information",
        summary: "Define inside information handling",
        suggestedClauses: ["clause-mabuse-inside"],
      },
      {
        id: "pad",
        title: "Personal account dealing",
        summary: "Define PAD controls and approvals",
        suggestedClauses: ["clause-mabuse-pad"],
      },
      {
        id: "surveillance",
        title: "Surveillance & monitoring",
        summary: "Define surveillance and alert reviews",
        suggestedClauses: ["clause-mabuse-surveillance"],
      },
      {
        id: "reporting",
        title: "Reporting",
        summary: "Define STOR reporting",
        suggestedClauses: ["clause-mabuse-reporting"],
      },
    ],
    mandatoryClauses: [
      "clause-mabuse-purpose",
      "clause-mabuse-inside",
      "clause-mabuse-pad",
      "clause-mabuse-surveillance",
      "clause-mabuse-reporting",
    ],
  },
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
  {
    code: "CASS",
    name: "Client Assets Policy",
    category: "Ops",
    description: "Safeguarding of client money and assets under CASS.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define client asset protection objectives",
        suggestedClauses: ["clause-cass-purpose"],
      },
      {
        id: "scope",
        title: "Scope & classification",
        summary: "Define CASS applicability and classifications",
        suggestedClauses: ["clause-cass-scope"],
      },
      {
        id: "segregation",
        title: "Segregation",
        summary: "Define segregation and trust status",
        suggestedClauses: ["clause-cass-segregation"],
      },
      {
        id: "reconciliations",
        title: "Reconciliations",
        summary: "Define reconciliation requirements",
        suggestedClauses: ["clause-cass-reconciliations"],
      },
      {
        id: "records",
        title: "Record keeping",
        summary: "Define record keeping and audit trail",
        suggestedClauses: ["clause-cass-records"],
      },
      {
        id: "governance",
        title: "Governance",
        summary: "Define oversight and accountability",
        suggestedClauses: ["clause-cass-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-cass-purpose",
      "clause-cass-scope",
      "clause-cass-segregation",
      "clause-cass-reconciliations",
      "clause-cass-records",
      "clause-cass-governance",
    ],
  },
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
  {
    code: "PRODUCT_GOV",
    name: "Product Governance",
    category: "Markets",
    description: "PROD-aligned product governance for manufacturers and distributors.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define PROD governance objectives",
        suggestedClauses: ["clause-prod-purpose"],
      },
      {
        id: "target-market",
        title: "Target market assessment",
        summary: "Define target market and distribution strategy",
        suggestedClauses: ["clause-prod-target-market"],
      },
      {
        id: "approval",
        title: "Product approval",
        summary: "Define product approval and review process",
        suggestedClauses: ["clause-prod-approval"],
      },
      {
        id: "distribution",
        title: "Distribution oversight",
        summary: "Define distributor monitoring and oversight",
        suggestedClauses: ["clause-prod-distribution"],
      },
      {
        id: "monitoring",
        title: "Outcome monitoring",
        summary: "Track product performance and customer outcomes",
        suggestedClauses: ["clause-prod-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance, MI, and review cadence",
        suggestedClauses: ["clause-prod-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-prod-purpose",
      "clause-prod-target-market",
      "clause-prod-approval",
      "clause-prod-distribution",
      "clause-prod-monitoring",
      "clause-prod-governance",
    ],
  },
  {
    code: "TARGET_MARKET",
    name: "Target Market Assessment",
    category: "Markets",
    description: "Define target market, exclusions, and distribution alignment.",
    sections: [
      {
        id: "purpose",
        title: "Purpose",
        summary: "Define target market assessment objectives",
        suggestedClauses: ["clause-prod-purpose"],
      },
      {
        id: "target-market",
        title: "Target market definition",
        summary: "Define target market characteristics and exclusions",
        suggestedClauses: ["clause-prod-target-market"],
      },
      {
        id: "distribution",
        title: "Distribution alignment",
        summary: "Align distribution to target market",
        suggestedClauses: ["clause-prod-distribution"],
      },
      {
        id: "monitoring",
        title: "Outcome monitoring",
        summary: "Monitor target market outcomes",
        suggestedClauses: ["clause-prod-monitoring"],
      },
      {
        id: "governance",
        title: "Governance & review",
        summary: "Define governance, MI, and review cadence",
        suggestedClauses: ["clause-prod-governance"],
      },
    ],
    mandatoryClauses: [
      "clause-prod-purpose",
      "clause-prod-target-market",
      "clause-prod-distribution",
      "clause-prod-monitoring",
      "clause-prod-governance",
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
