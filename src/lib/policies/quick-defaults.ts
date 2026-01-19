import type { DetailLevel } from "@/lib/policies/clause-tiers";
import type { FirmPermissions } from "@/lib/policies/permissions";
import type { PolicyTemplate } from "@/lib/policies/templates";
import type { WizardApprovals } from "@/components/policies/policy-wizard/types";
import {
  DEFAULT_PERMISSIONS,
} from "@/lib/policies/permissions";
import {
  DEFAULT_COMPLAINTS_ANSWERS,
  assembleComplaintsPolicy,
  type ComplaintsAssemblerAnswers,
} from "@/lib/policies/assemblers/complaints";
import { getTemplateByCode } from "@/lib/policies/templates";

export type QuickAnswer = string | boolean;
export type QuickAnswers = Record<string, QuickAnswer>;

export interface QuickQuestion {
  id: string;
  label: string;
  type: "text" | "boolean";
  required?: boolean;
  description?: string;
}

const DEFAULT_DETAIL_LEVEL: DetailLevel = "standard";

const DEFAULT_APPROVALS: WizardApprovals = {
  requiresSMF: true,
  smfRole: "SMF16 - Compliance Oversight",
  requiresBoard: true,
  boardFrequency: "annual",
  additionalApprovers: [],
};

const FIRM_NAME_QUESTION: QuickQuestion = {
  id: "firmName",
  label: "Firm name",
  type: "text",
  required: true,
  description: "Used on the policy cover and document headers.",
};

const RETAIL_QUESTION: QuickQuestion = {
  id: "retailClients",
  label: "Serve retail customers?",
  type: "boolean",
  description: "Include retail consumer-facing obligations.",
};

const PROFESSIONAL_QUESTION: QuickQuestion = {
  id: "professionalClients",
  label: "Serve professional clients?",
  type: "boolean",
  description: "Include professional and wholesale client expectations.",
};

const PAYMENT_QUESTION: QuickQuestion = {
  id: "paymentServices",
  label: "Regulated for payment services?",
  type: "boolean",
  description: "Includes PSD/PSRs permissions and safeguarding controls.",
};

const EMONEY_QUESTION: QuickQuestion = {
  id: "eMoney",
  label: "Issue or distribute e-money?",
  type: "boolean",
  description: "Cover e-money issuance and safeguarding scope.",
};

const INVESTMENT_QUESTION: QuickQuestion = {
  id: "investmentServices",
  label: "Provide investment services?",
  type: "boolean",
  description: "Advising, arranging, or dealing in investments.",
};

const CREDIT_QUESTION: QuickQuestion = {
  id: "creditBroking",
  label: "Provide consumer credit or lending?",
  type: "boolean",
  description: "Include credit broking or lending permissions.",
};

const INSURANCE_QUESTION: QuickQuestion = {
  id: "insuranceMediation",
  label: "Carry out insurance mediation?",
  type: "boolean",
  description: "Relevant for distribution oversight and PROD requirements.",
};

const COMPLEX_PRODUCTS_QUESTION: QuickQuestion = {
  id: "complexProducts",
  label: "Offer complex products?",
  type: "boolean",
  description: "Include enhanced governance and suitability controls.",
};

const EEA_COMPLAINTS_QUESTION: QuickQuestion = {
  id: "eeaPassporting",
  label: "Handle EEA passporting complaints?",
  type: "boolean",
  description: "Include cross-border complaint obligations.",
};

const DEFAULT_QUESTIONS: QuickQuestion[] = [FIRM_NAME_QUESTION, RETAIL_QUESTION, PAYMENT_QUESTION];

export const QUICK_QUESTIONS: Record<string, QuickQuestion[]> = {
  AML_CTF: [FIRM_NAME_QUESTION, PAYMENT_QUESTION, EMONEY_QUESTION],
  CONSUMER_DUTY: [FIRM_NAME_QUESTION, RETAIL_QUESTION, PROFESSIONAL_QUESTION],
  COMPLAINTS: [FIRM_NAME_QUESTION, PAYMENT_QUESTION, EEA_COMPLAINTS_QUESTION],
  VULNERABLE_CUST: [FIRM_NAME_QUESTION, RETAIL_QUESTION, COMPLEX_PRODUCTS_QUESTION],
  SAFEGUARDING: [FIRM_NAME_QUESTION, PAYMENT_QUESTION, EMONEY_QUESTION],
  SUITABILITY_ADVICE: [FIRM_NAME_QUESTION, INVESTMENT_QUESTION, PROFESSIONAL_QUESTION],
  FIN_PROMOTIONS: [FIRM_NAME_QUESTION, RETAIL_QUESTION, PROFESSIONAL_QUESTION],
  BCP_RESILIENCE: [FIRM_NAME_QUESTION, PAYMENT_QUESTION, INVESTMENT_QUESTION],
  CONFLICTS: [FIRM_NAME_QUESTION, INVESTMENT_QUESTION, PAYMENT_QUESTION],
  BEST_EXECUTION: [FIRM_NAME_QUESTION, INVESTMENT_QUESTION, PROFESSIONAL_QUESTION],
  RESPONSIBLE_LENDING: [FIRM_NAME_QUESTION, CREDIT_QUESTION, RETAIL_QUESTION],
  ARREARS_MANAGEMENT: [FIRM_NAME_QUESTION, CREDIT_QUESTION, RETAIL_QUESTION],
  PROD: [FIRM_NAME_QUESTION, INSURANCE_QUESTION, RETAIL_QUESTION],
  RISK_MGMT: [FIRM_NAME_QUESTION, PAYMENT_QUESTION, INVESTMENT_QUESTION],
};

const PERMISSION_KEYS: Array<keyof FirmPermissions> = [
  "investmentServices",
  "paymentServices",
  "eMoney",
  "creditBroking",
  "clientMoney",
  "clientAssets",
  "insuranceMediation",
  "mortgageMediation",
  "dealingAsAgent",
  "dealingAsPrincipal",
  "arrangingDeals",
  "advising",
  "managing",
  "safeguarding",
  "retailClients",
  "professionalClients",
  "eligibleCounterparties",
  "complexProducts",
];

function toComplaintsDetailLevel(level: DetailLevel): ComplaintsAssemblerAnswers["detailLevel"] {
  if (level === "essential") return "focused";
  if (level === "comprehensive") return "enterprise";
  return "standard";
}

function buildSectionClauses(template: PolicyTemplate): Record<string, string[]> {
  return template.sections.reduce<Record<string, string[]>>((acc, section) => {
    acc[section.id] = [...section.suggestedClauses];
    return acc;
  }, {});
}

function buildComplaintsAnswers(answers: QuickAnswers, detailLevel: DetailLevel): ComplaintsAssemblerAnswers {
  const complaintsAnswers: ComplaintsAssemblerAnswers = {
    ...DEFAULT_COMPLAINTS_ANSWERS,
    detailLevel: toComplaintsDetailLevel(detailLevel),
  };

  if (answers.eeaPassporting === true) {
    complaintsAnswers.jurisdiction = "uk-eea";
  }

  return complaintsAnswers;
}

function applyAnswersToPermissions(base: FirmPermissions, answers: QuickAnswers): FirmPermissions {
  const next = { ...base };
  PERMISSION_KEYS.forEach((key) => {
    const value = answers[key];
    if (typeof value === "boolean") {
      next[key] = value;
    }
  });
  return next;
}

export function getQuickQuestions(templateCode?: string): QuickQuestion[] {
  if (!templateCode) return DEFAULT_QUESTIONS;
  return QUICK_QUESTIONS[templateCode] ?? DEFAULT_QUESTIONS;
}

export function generateQuickPolicy(input: {
  templateCode: string;
  answers: QuickAnswers;
  basePermissions?: FirmPermissions;
}) {
  const template = getTemplateByCode(input.templateCode);
  if (!template) {
    throw new Error("Template not found");
  }

  const permissions = applyAnswersToPermissions(
    { ...DEFAULT_PERMISSIONS, ...(input.basePermissions ?? {}) },
    input.answers,
  );

  const detailLevel = DEFAULT_DETAIL_LEVEL;
  const firmName = typeof input.answers.firmName === "string" ? input.answers.firmName.trim() : "";

  const sectionClauses =
    template.code === "COMPLAINTS"
      ? assembleComplaintsPolicy(template, buildComplaintsAnswers(input.answers, detailLevel)).sectionClauses
      : buildSectionClauses(template);

  return {
    templateCode: template.code,
    permissions,
    sectionClauses,
    sectionOptions: {},
    sectionNotes: {},
    clauseVariables: {},
    firmProfile: {
      name: firmName,
    },
    approvals: DEFAULT_APPROVALS,
    detailLevel,
  };
}
