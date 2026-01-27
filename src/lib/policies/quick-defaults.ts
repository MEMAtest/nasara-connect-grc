import type { DetailLevel } from "@/lib/policies/clause-tiers";
import type { FirmPermissions } from "@/lib/policies/permissions";
import type { PolicyTemplate } from "@/lib/policies/templates";
import type { FirmProfile, WizardApprovals } from "@/components/policies/policy-wizard/types";
import type { QuickAnswer, QuickAnswers, QuickQuestion } from "./quick-types";
import {
  DEFAULT_PERMISSIONS,
} from "@/lib/policies/permissions";
import {
  DEFAULT_COMPLAINTS_ANSWERS,
  assembleComplaintsPolicy,
  type ComplaintsAssemblerAnswers,
} from "@/lib/policies/assemblers/complaints";
import { getTemplateByCode } from "@/lib/policies/templates";
import { DEFAULT_QUESTIONS, QUICK_QUESTIONS } from "./quick-questions";

export type { QuickAnswer, QuickAnswers, QuickQuestion } from "./quick-types";

const PERMISSION_KEYS = Object.keys(DEFAULT_PERMISSIONS) as Array<keyof FirmPermissions>;

const DEFAULT_DETAIL_LEVEL: DetailLevel = "standard";

const DEFAULT_APPROVALS: WizardApprovals = {
  requiresSMF: true,
  smfRole: "SMF16 - Compliance Oversight",
  requiresBoard: true,
  boardFrequency: "annual",
  additionalApprovers: [],
};

const LIST_DERIVATIONS: Record<string, string> = {
  abcRiskAreas: "abcRiskAreasList",
  smcrPopulations: "smcrPopulationsList",
  smcrEvidence: "smcrEvidenceList",
  smcrCertificationCadence: "smcrCertificationCadenceList",
  whistleChannels: "whistleChannelsList",
  whistleConcernTypes: "whistleConcernTypesList",
};

function buildList(value: QuickAnswer | undefined): string {
  if (!Array.isArray(value)) return "";
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!items.length) return "";
  return items.map((item) => `- ${item}`).join("\n");
}

function buildPolicyInputs(answers: QuickAnswers): QuickAnswers {
  const next: QuickAnswers = { ...answers };
  Object.entries(LIST_DERIVATIONS).forEach(([sourceKey, targetKey]) => {
    next[targetKey] = buildList(answers[sourceKey]);
  });
  return next;
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

export function getQuickQuestions(templateCode?: string): QuickQuestion[] {
  if (!templateCode) return DEFAULT_QUESTIONS;
  return QUICK_QUESTIONS[templateCode] ?? DEFAULT_QUESTIONS;
}

export function generateQuickPolicy(input: {
  templateCode: string;
  answers: QuickAnswers;
  basePermissions?: FirmPermissions;
  firmProfile?: Partial<FirmProfile> & Record<string, unknown>;
  sectionNotes?: Record<string, string>;
  clauseVariables?: Record<string, Record<string, string>>;
  governance?: Record<string, unknown>;
  approvals?: WizardApprovals;
  detailLevel?: DetailLevel;
}) {
  const template = getTemplateByCode(input.templateCode);
  if (!template) {
    throw new Error("Template not found");
  }

  const permissions = applyAnswersToPermissions(
    { ...DEFAULT_PERMISSIONS, ...(input.basePermissions ?? {}) },
    input.answers,
  );

  const detailLevel = input.detailLevel ?? DEFAULT_DETAIL_LEVEL;
  const firmProfile = { ...(input.firmProfile ?? {}) };
  const firmName =
    typeof firmProfile.name === "string" && firmProfile.name.trim().length
      ? firmProfile.name.trim()
      : typeof input.answers.firmName === "string"
        ? input.answers.firmName.trim()
        : "";
  if (firmName && !firmProfile.name) {
    firmProfile.name = firmName;
  }

  const sectionClauses =
    template.code === "COMPLAINTS"
      ? assembleComplaintsPolicy(template, buildComplaintsAnswers(input.answers, detailLevel)).sectionClauses
      : buildSectionClauses(template);
  const policyInputs = buildPolicyInputs(input.answers ?? {});

  return {
    templateCode: template.code,
    permissions,
    sectionClauses,
    sectionOptions: {},
    sectionNotes: input.sectionNotes ?? {},
    policyInputs,
    clauseVariables: input.clauseVariables ?? {},
    firmProfile,
    governance: input.governance,
    approvals: input.approvals ?? DEFAULT_APPROVALS,
    detailLevel,
  };
}
