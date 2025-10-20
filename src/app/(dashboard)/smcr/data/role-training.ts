"use client";

export type TrainingStatus = "not_started" | "in_progress" | "completed";

export interface TrainingModuleDefinition {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  recommendedDueWithinDays?: number;
}

const smfModules: Record<string, TrainingModuleDefinition[]> = {
  smf1: [
    {
      id: "smf1-introduction",
      title: "SMF1 Induction & Statement of Responsibilities Workshop",
      description: "Deep dive on governance expectations, SoR drafting, and handover obligations.",
      required: true,
      recommendedDueWithinDays: 30,
    },
    {
      id: "board-governance-masterclass",
      title: "Board Governance & Accountability Masterclass",
      description: "Covers PRA/FCA expectations on board oversight, risk culture, and accountability.",
      required: true,
      recommendedDueWithinDays: 60,
    },
  ],
  smf16: [
    {
      id: "compliance-oversight-programme",
      title: "Compliance Oversight Programme",
      description: "Advanced programme covering compliance monitoring, regulatory change, and reporting.",
      required: true,
      recommendedDueWithinDays: 45,
    },
    {
      id: "regulatory-reporting-clinic",
      title: "Regulatory Reporting Clinic",
      description: "Workshop on statutory reporting timetables and submission quality controls.",
      required: false,
    },
  ],
  smf17: [
    {
      id: "financial-crime-masterclass",
      title: "Financial Crime Masterclass",
      description: "Updates on AML, sanctions, and fraud frameworks for MLROs.",
      required: true,
      recommendedDueWithinDays: 30,
    },
  ],
};

const cfModules: Record<string, TrainingModuleDefinition[]> = {
  cf30: [
    {
      id: "customer-duty-foundation",
      title: "Consumer Duty & Conduct Refresher",
      description: "Focus on delivering good customer outcomes and evidencing conduct compliance.",
      required: true,
      recommendedDueWithinDays: 30,
    },
    {
      id: "vulnerable-customer-lab",
      title: "Vulnerable Customer Scenario Lab",
      description: "Practical scenarios covering identification, fair treatment, and escalation.",
      required: false,
    },
  ],
  cf28: [
    {
      id: "systems-controls-deepdive",
      title: "Systems & Controls Deep Dive",
      description: "Advanced training on control frameworks, MI, and remediation tracking.",
      required: true,
      recommendedDueWithinDays: 60,
    },
  ],
};

export function getTrainingModulesForRole(functionId: string): TrainingModuleDefinition[] {
  return smfModules[functionId] ?? cfModules[functionId] ?? [];
}
