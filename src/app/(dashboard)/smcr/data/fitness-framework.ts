"use client";

export type FitnessCategory = "honesty_integrity" | "competence_capability" | "financial_soundness";

export type FitnessQuestionType = "boolean" | "text";

export interface FitnessQuestionDefinition {
  id: string;
  category: FitnessCategory;
  prompt: string;
  guidance?: string;
  type: FitnessQuestionType;
  followUpPrompt?: string;
}

export interface FitnessQuestionGroup {
  id: FitnessCategory;
  title: string;
  description: string;
  questions: FitnessQuestionDefinition[];
}

export const fitnessQuestionGroups: FitnessQuestionGroup[] = [
  {
    id: "honesty_integrity",
    title: "Honesty & Integrity",
    description: "Assess criminal records, regulatory references, and financial diligence for the individual.",
    questions: [
      {
        id: "honesty-criminal-records",
        category: "honesty_integrity",
        prompt: "Did the criminal records check return any adverse findings?",
        guidance: "Review DBS/Disclosure Scotland certificates for unspent or relevant spent convictions.",
        type: "boolean",
        followUpPrompt: "If yes, capture context and mitigation steps.",
      },
      {
        id: "honesty-regulatory-references",
        category: "honesty_integrity",
        prompt: "Are regulatory references complete and satisfactory?",
        guidance: "References should cover the previous six years using the FCA standard template.",
        type: "boolean",
        followUpPrompt: "Detail any gaps or issues raised by prior employers.",
      },
      {
        id: "honesty-credit-checks",
        category: "honesty_integrity",
        prompt: "Have credit checks confirmed acceptable financial conduct?",
        guidance: "Confirm no unsatisfied CCJs > £1,000, bankruptcy, IVAs, or multiple defaults.",
        type: "boolean",
        followUpPrompt: "Summarise financial issues or explain tolerance decisions.",
      },
      {
        id: "honesty-summary",
        category: "honesty_integrity",
        prompt: "Summarise overall honesty & integrity assessment.",
        guidance: "Record rationale for the determination and any supporting evidence references.",
        type: "text",
      },
    ],
  },
  {
    id: "competence_capability",
    title: "Competence & Capability",
    description: "Assess qualifications, experience, and training alignments for the proposed role.",
    questions: [
      {
        id: "competence-qualifications",
        category: "competence_capability",
        prompt: "Do qualifications meet regulatory and role-specific requirements?",
        guidance: "Confirm evidence of mandatory certifications or recognised equivalents.",
        type: "boolean",
        followUpPrompt: "Detail any qualification gaps and remediation plans.",
      },
      {
        id: "competence-experience",
        category: "competence_capability",
        prompt: "Does experience meet the minimum threshold for the function?",
        guidance: "Check years in relevant roles and sector alignment against the role matrix.",
        type: "boolean",
        followUpPrompt: "Outline experience gaps or supporting mitigations (e.g. mentoring).",
      },
      {
        id: "competence-training",
        category: "competence_capability",
        prompt: "Have required training and CPD obligations been satisfied?",
        guidance: "Reference CPD logs, recent workshops, and completed SMCR training modules.",
        type: "boolean",
        followUpPrompt: "Capture outstanding training actions and target completion dates.",
      },
      {
        id: "competence-summary",
        category: "competence_capability",
        prompt: "Summarise competence & capability determination.",
        guidance: "Record strengths, development needs, and planned oversight.",
        type: "text",
      },
    ],
  },
  {
    id: "financial_soundness",
    title: "Financial Soundness",
    description: "Review personal financial questionnaires, related-party disclosures, and outside interests.",
    questions: [
      {
        id: "financial-pfq",
        category: "financial_soundness",
        prompt: "Any concerns identified from the personal financial questionnaire?",
        guidance: "Assess debt positions, income stability, and declarations in PFQ documentation.",
        type: "boolean",
        followUpPrompt: "Document concerns and mitigating actions agreed with the individual.",
      },
      {
        id: "financial-related-parties",
        category: "financial_soundness",
        prompt: "Have related party transactions been declared and reviewed?",
        guidance: "Ensure board approval and conflict management plans where applicable.",
        type: "boolean",
        followUpPrompt: "Summarise review outcomes or escalation steps.",
      },
      {
        id: "financial-outside-interests",
        category: "financial_soundness",
        prompt: "Are outside business interests documented and managed?",
        guidance: "Confirm registers are up to date and conflicts have mitigation plans.",
        type: "boolean",
        followUpPrompt: "Capture conflicts or conditions imposed by the firm.",
      },
      {
        id: "financial-summary",
        category: "financial_soundness",
        prompt: "Summarise financial soundness assessment.",
        guidance: "Include final view on financial resilience and conflict management.",
        type: "text",
      },
    ],
  },
];

export function getAllFitnessQuestions(): FitnessQuestionDefinition[] {
  return fitnessQuestionGroups.flatMap((group) => group.questions);
}
