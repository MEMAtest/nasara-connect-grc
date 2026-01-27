import type { FirmPermissions } from "./permissions";
import amlCtfSeedClauses from "./seeds/nasara_policy_aml_ctf.clauses.json";
import vulnerableSeedClauses from "./seeds/nasara_policy_vulnerable_customers.clauses.json";
import finPromotionsSeedClauses from "./seeds/nasara_fin_promotions.clauses.json";
import conflictsSeedClauses from "./seeds/nasara_conflicts.clauses.json";
import infoSecuritySeedClauses from "./seeds/nasara_info_security.clauses.json";
import outsourcingSeedClauses from "./seeds/nasara_outsourcing.clauses.json";
import vulnerableCustomersModuleSeedClauses from "./seeds/nasara_vulnerable_customers_module.clauses.json";
import antiBriberySeedClauses from "./seeds/nasara_anti_bribery.clauses.json";
import smcrSeedClauses from "./seeds/nasara_smcr.clauses.json";
import whistleblowingSeedClauses from "./seeds/nasara_whistleblowing.clauses.json";
import { NASARA_POLICY_SCAFFOLDS } from "./seeds/nasara_policy_scaffolds";
import mfsFinancialCrimeClauses from "./seeds/mfs_financial_crime.clauses.json";
import mfsConsumerDutyClauses from "./seeds/mfs_consumer_duty.clauses.json";
import mfsComplaintsClauses from "./seeds/mfs_complaints.clauses.json";
import mfsComplaintsFragments from "./seeds/mfs_complaints.fragments.json";
import mfsFinancialCrimeTemplate from "./seeds/mfs_financial_crime.template.json";
import mfsConsumerDutyTemplate from "./seeds/mfs_consumer_duty.template.json";
import mfsComplaintsTemplate from "./seeds/mfs_complaints.template.json";
import finPromotionsTemplate from "./seeds/nasara_fin_promotions.template.json";
import conflictsTemplate from "./seeds/nasara_conflicts.template.json";
import infoSecurityTemplate from "./seeds/nasara_info_security.template.json";
import outsourcingTemplate from "./seeds/nasara_outsourcing.template.json";
import vulnerableCustomersModuleTemplate from "./seeds/nasara_vulnerable_customers_module.template.json";
import antiBriberyTemplate from "./seeds/nasara_anti_bribery.template.json";
import smcrTemplate from "./seeds/nasara_smcr.template.json";
import whistleblowingTemplate from "./seeds/nasara_whistleblowing.template.json";
import { CORE_POLICY_TEMPLATE_CLAUSES } from "./templates.core-clauses";
import { CORE_POLICY_TEMPLATES } from "./templates.core-templates";

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

export const GOLD_STANDARD_POLICY_CODES = [
  "AML_CTF",
  "CONSUMER_DUTY",
  "COMPLAINTS",
  "FIN_PROMOTIONS",
  "CONFLICTS",
  "INFO_SECURITY",
  "OUTSOURCING",
  "VULNERABLE_CUST",
  "ANTI_BRIBERY",
  "SMCR",
  "WHISTLEBLOWING",
] as const;

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

const NASARA_MODULE_SEED_CLAUSES: PolicyClause[] = ([] as DocxSeedClause[])
  .concat(finPromotionsSeedClauses as unknown as DocxSeedClause[])
  .concat(conflictsSeedClauses as unknown as DocxSeedClause[])
  .concat(infoSecuritySeedClauses as unknown as DocxSeedClause[])
  .concat(outsourcingSeedClauses as unknown as DocxSeedClause[])
  .concat(vulnerableCustomersModuleSeedClauses as unknown as DocxSeedClause[])
  .concat(antiBriberySeedClauses as unknown as DocxSeedClause[])
  .concat(smcrSeedClauses as unknown as DocxSeedClause[])
  .concat(whistleblowingSeedClauses as unknown as DocxSeedClause[])
  .map((clause) => {
    const appliesTo =
      clause.policy_key === "fin_promotions"
        ? "FIN_PROMOTIONS"
        : clause.policy_key === "conflicts"
          ? "CONFLICTS"
          : clause.policy_key === "info_security"
            ? "INFO_SECURITY"
            : clause.policy_key === "outsourcing"
              ? "OUTSOURCING"
              : clause.policy_key === "vulnerable_customers_module"
                ? "VULNERABLE_CUST"
                : clause.policy_key === "anti_bribery"
                  ? "ANTI_BRIBERY"
                  : clause.policy_key === "smcr"
                    ? "SMCR"
                    : clause.policy_key === "whistleblowing"
                      ? "WHISTLEBLOWING"
                      : undefined;
    const category: ClauseCategory =
      clause.policy_key === "fin_promotions"
        ? "market"
        : clause.policy_key === "conflicts"
          ? "governance"
          : clause.policy_key === "info_security"
            ? "operations"
            : clause.policy_key === "outsourcing"
              ? "operations"
              : clause.policy_key === "vulnerable_customers_module"
                ? "customer"
                : clause.policy_key === "anti_bribery"
                  ? "financial-crime"
                  : clause.policy_key === "smcr"
                    ? "governance"
                    : clause.policy_key === "whistleblowing"
                      ? "governance"
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

export const POLICY_TEMPLATE_CLAUSES: PolicyClause[] = [
  ...MFS_SEED_CLAUSES,
  ...NASARA_SEED_CLAUSES,
  ...NASARA_MODULE_SEED_CLAUSES,
  ...NASARA_SCAFFOLD_CLAUSES,
  ...CORE_POLICY_TEMPLATE_CLAUSES,
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

const NASARA_MODULE_TEMPLATES: PolicyTemplate[] = [
  finPromotionsTemplate as unknown as PolicyTemplate,
  conflictsTemplate as unknown as PolicyTemplate,
  infoSecurityTemplate as unknown as PolicyTemplate,
  outsourcingTemplate as unknown as PolicyTemplate,
  vulnerableCustomersModuleTemplate as unknown as PolicyTemplate,
  antiBriberyTemplate as unknown as PolicyTemplate,
  smcrTemplate as unknown as PolicyTemplate,
  whistleblowingTemplate as unknown as PolicyTemplate,
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
  ...NASARA_POLICY_TEMPLATES.filter((template) => !["AML_CTF", "VULNERABLE_CUST"].includes(template.code)),
  ...NASARA_MODULE_TEMPLATES,
  ...CORE_POLICY_TEMPLATES.filter(
    (template) =>
      ![
        "AML_CTF",
        "VULNERABLE_CUST",
        "CONSUMER_DUTY",
        "COMPLAINTS",
        "FIN_PROMOTIONS",
        "CONFLICTS",
        "OUTSOURCING",
        "INFO_SECURITY",
      ].includes(template.code),
  ),
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
