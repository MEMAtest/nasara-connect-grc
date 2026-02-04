"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Settings, FileCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepSetup } from "./StepSetup";
import { StepConfigure } from "./StepConfigure";
import { StepContentBuilder } from "./StepContentBuilder";
import { StepReviewFinish } from "./StepReviewFinish";
import type { FirmProfile, WizardFormState, WizardStepDefinition } from "./types";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";
import { assembleComplaintsPolicy, DEFAULT_COMPLAINTS_ANSWERS } from "@/lib/policies/assemblers/complaints";
import { toComplaintsDetailLevel } from "./detail-level";
import type { DetailLevel } from "@/lib/policies/clause-tiers";
import { getApplicableClauses, getTemplateByCode, type PolicyTemplate } from "@/lib/policies/templates";

const STEP_DEFINITIONS: WizardStepDefinition[] = [
  {
    id: "setup",
    title: "Setup",
    description: "Firm details & permissions",
  },
  {
    id: "configure",
    title: "Configure",
    description: "Template & detail level",
  },
  {
    id: "assemble",
    title: "Assemble",
    description: "Modules & clause blocks",
  },
  {
    id: "review",
    title: "Review",
    description: "Review & create",
  },
];

const STEP_ICONS = {
  setup: Building2,
  configure: Settings,
  assemble: Layers,
  review: FileCheck,
};

const wizardSpring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 20,
};

const DEFAULT_DETAIL_LEVEL: DetailLevel = "standard";

const buildInitialState = (
  permissionsOverride?: typeof DEFAULT_PERMISSIONS,
  firmProfileOverride?: Partial<FirmProfile>
): WizardFormState => ({
  firmProfile: {
    name: "",
    tradingName: "",
    registeredAddress: "",
    companyNumber: "",
    sicCodes: [],
    fcaReference: "",
    website: "",
    ...(firmProfileOverride ?? {}),
  },
  permissions: { ...(permissionsOverride ?? DEFAULT_PERMISSIONS) },
  selectedTemplate: undefined,
  detailLevel: DEFAULT_DETAIL_LEVEL,
  complaintsAnswers: {
    ...DEFAULT_COMPLAINTS_ANSWERS,
    detailLevel: toComplaintsDetailLevel(DEFAULT_DETAIL_LEVEL),
  },
  sectionOptions: {},
  sectionClauses: {},
  sectionNotes: {},
  clauseVariables: {},
  selectedClauses: [],
  approvals: {
    requiresSMF: true,
    smfRole: "SMF16 - Compliance Oversight",
    requiresBoard: true,
    boardFrequency: "annual",
    additionalApprovers: [],
  },
});

interface PolicyWizardProps {
  initialPermissions?: typeof DEFAULT_PERMISSIONS;
  initialTemplateCode?: string;
  initialFirmProfile?: Partial<FirmProfile>;
  availableTemplates?: PolicyTemplate[];
  onFinish?: (state: WizardFormState) => void;
  isSubmitting?: boolean;
}

function applyTemplateSelection(state: WizardFormState, template: PolicyTemplate): WizardFormState {
  const detailLevel = state.detailLevel || DEFAULT_DETAIL_LEVEL;
  const complaintsAnswers = {
    ...(state.complaintsAnswers ?? DEFAULT_COMPLAINTS_ANSWERS),
    detailLevel: toComplaintsDetailLevel(detailLevel),
  };
  const applicableClauses = getApplicableClauses(template.code, state.permissions);
  const initialSectionClauses =
    template.code === "COMPLAINTS"
      ? assembleComplaintsPolicy(template, complaintsAnswers).sectionClauses
      : template.sections.reduce<Record<string, string[]>>((acc, section) => {
          acc[section.id] = [...section.suggestedClauses];
          return acc;
        }, {});

  const clauseIds = Array.from(new Set(Object.values(initialSectionClauses).flatMap((ids) => ids)));
  const selectedClauses = clauseIds
    .map((id) => applicableClauses.find((clause) => clause.id === id))
    .filter((clause): clause is NonNullable<typeof clause> => Boolean(clause));

  return {
    ...state,
    selectedTemplate: template,
    complaintsAnswers,
    sectionOptions: {},
    sectionClauses: initialSectionClauses,
    sectionNotes: {},
    clauseVariables: {},
    selectedClauses,
  };
}

export function PolicyWizard({
  initialPermissions,
  initialTemplateCode,
  initialFirmProfile,
  availableTemplates,
  onFinish,
  isSubmitting,
}: PolicyWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formState, setFormState] = useState<WizardFormState>(
    buildInitialState(initialPermissions, initialFirmProfile)
  );
  const currentStep = STEP_DEFINITIONS[currentStepIndex];

  const totalSteps = STEP_DEFINITIONS.length;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const updateState = (updater: (state: WizardFormState) => WizardFormState) => {
    setFormState((state) => updater(JSON.parse(JSON.stringify(state))));
  };

  useEffect(() => {
    if (!initialPermissions && !initialFirmProfile) return;
    setFormState((state) => {
      let nextState = state;
      if (initialPermissions) {
        nextState = {
          ...nextState,
          permissions: { ...initialPermissions },
        };
      }
      if (initialFirmProfile) {
        nextState = {
          ...nextState,
          firmProfile: {
            ...nextState.firmProfile,
            ...initialFirmProfile,
          },
        };
      }
      if (!initialTemplateCode || nextState.selectedTemplate) {
        return nextState;
      }
      const template = getTemplateByCode(initialTemplateCode);
      if (!template) {
        return nextState;
      }
      return applyTemplateSelection(nextState, template);
    });
  }, [initialPermissions, initialFirmProfile, initialTemplateCode]);

  const handleFinish = () => {
    onFinish?.(formState);
  };

  const goNext = () => setCurrentStepIndex((index) => Math.min(index + 1, totalSteps - 1));
  const goBack = () => setCurrentStepIndex((index) => Math.max(index - 1, 0));

  const renderStep = () => {
    switch (currentStep.id) {
      case "setup":
        return (
          <StepSetup state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />
        );
      case "configure":
        return (
          <StepConfigure
            state={formState}
            updateState={updateState}
            onNext={goNext}
            onBack={goBack}
            availableTemplates={availableTemplates}
          />
        );
      case "assemble":
        return (
          <StepContentBuilder state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />
        );
      case "review":
      default:
        return (
          <StepReviewFinish
            state={formState}
            updateState={updateState}
            onNext={handleFinish}
            onBack={goBack}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Policy Wizard</h1>
              <p className="text-sm text-slate-500">
                Create a professional policy document in 4 simple steps
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Step {currentStepIndex + 1} of {totalSteps}
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {STEP_DEFINITIONS.map((step, index) => {
              const Icon = STEP_ICONS[step.id as keyof typeof STEP_ICONS];
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => index < currentStepIndex && setCurrentStepIndex(index)}
                    disabled={index > currentStepIndex}
                    className={`
                      flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all
                      ${isActive
                        ? "bg-indigo-50 border-2 border-indigo-500"
                        : isCompleted
                          ? "bg-teal-50 border border-teal-200 cursor-pointer hover:bg-teal-100"
                          : "bg-slate-50 border border-slate-200"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-lg
                        ${isActive
                          ? "bg-indigo-500 text-white"
                          : isCompleted
                            ? "bg-teal-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="hidden sm:block">
                      <div
                        className={`font-semibold ${
                          isActive
                            ? "text-indigo-900"
                            : isCompleted
                              ? "text-teal-900"
                              : "text-slate-500"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.description}</div>
                    </div>
                  </button>

                  {index < STEP_DEFINITIONS.length - 1 && (
                    <div
                      className={`
                        mx-2 hidden h-0.5 w-8 lg:block
                        ${isCompleted ? "bg-teal-300" : "bg-slate-200"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={wizardSpring}
            />
          </div>
        </div>
      </header>

      {/* Step Content */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={wizardSpring}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        {renderStep()}
      </motion.div>

      {/* Help Text */}
      {currentStep.id === "review" && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
          <p>
            <strong>Next steps after creation:</strong> Schedule attestations, publish to the
            policy register, and connect the policy to relevant risks and controls.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-auto p-0 text-indigo-600 hover:text-indigo-800"
            onClick={() => setCurrentStepIndex(0)}
          >
            ← Restart wizard
          </Button>
        </div>
      )}
    </div>
  );
}
