"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepPermissionCheck } from "./StepPermissionCheck";
import { StepTemplateSelect } from "./StepTemplateSelect";
import { StepContentBuilder } from "./StepContentBuilder";
import { StepApprovals } from "./StepApprovals";
import { StepReview } from "./StepReview";
import type { WizardFormState, WizardStepDefinition } from "./types";
import { DEFAULT_PERMISSIONS } from "@/lib/policies";

const STEP_DEFINITIONS: WizardStepDefinition[] = [
  {
    id: "permissions",
    title: "Permissions",
    description: "Confirm firm permissions",
  },
  {
    id: "template",
    title: "Template",
    description: "Select starting template",
  },
  {
    id: "content",
    title: "Content",
    description: "Compose policy content",
  },
  {
    id: "approvals",
    title: "Approvals",
    description: "Set attestation workflow",
  },
  {
    id: "review",
    title: "Review",
    description: "Final checks",
  },
];

const wizardSpring = {
  type: "spring",
  stiffness: 180,
  damping: 20,
};

const buildInitialState = (permissionsOverride?: typeof DEFAULT_PERMISSIONS): WizardFormState => ({
  permissions: { ...(permissionsOverride ?? DEFAULT_PERMISSIONS) },
  selectedTemplate: undefined,
  selectedClauses: [],
  customContent: {},
  approvals: {
    requiresSMF: true,
    smfRole: "SMF16 - Compliance Monitoring",
    requiresBoard: true,
    boardFrequency: "annual",
    additionalApprovers: [],
  },
});

interface PolicyWizardProps {
  initialPermissions?: typeof DEFAULT_PERMISSIONS;
  onFinish?: (state: WizardFormState) => void;
  isSubmitting?: boolean;
}

export function PolicyWizard({ initialPermissions, onFinish, isSubmitting }: PolicyWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formState, setFormState] = useState<WizardFormState>(buildInitialState(initialPermissions));
  const currentStep = STEP_DEFINITIONS[currentStepIndex];

  const totalSteps = STEP_DEFINITIONS.length;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const updateState = (updater: (state: WizardFormState) => WizardFormState) => {
    setFormState((state) => updater(JSON.parse(JSON.stringify(state))));
  };
  useEffect(() => {
    if (initialPermissions) {
      setFormState((state) => ({
        ...state,
        permissions: { ...initialPermissions },
      }));
    }
  }, [initialPermissions]);

  const handleFinish = () => {
    onFinish?.(formState);
  };

  const goNext = () => setCurrentStepIndex((index) => Math.min(index + 1, totalSteps - 1));
  const goBack = () => setCurrentStepIndex((index) => Math.max(index - 1, 0));

  const renderStep = () => {
    switch (currentStep.id) {
      case "permissions":
        return (
          <StepPermissionCheck state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />
        );
      case "template":
        return (
          <StepTemplateSelect state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />
        );
      case "content":
        return (
          <StepContentBuilder state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />
        );
      case "approvals":
        return <StepApprovals state={formState} updateState={updateState} onNext={goNext} onBack={goBack} />;
      case "review":
      default:
        return (
          <StepReview
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
    <div className="space-y-8">
      <header className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-500">
            Step {currentStepIndex + 1} of {totalSteps}
          </p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Policy wizard</h1>
              <p className="text-sm text-slate-500">Generate a policy draft tailored to your permissions and controls.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {STEP_DEFINITIONS.map((step, index) => (
                <StepIndicator
                  key={step.id}
                  label={step.title}
                  active={index === currentStepIndex}
                  completed={index < currentStepIndex}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={wizardSpring}
          />
        </div>
      </header>

      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={wizardSpring}
        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg"
      >
        {renderStep()}
      </motion.div>

      {currentStep.id === "review" ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
          <p>
            Next steps: schedule attestations, publish to the policy register, and connect the policy to relevant risks and
            controls.
          </p>
          <Button variant="ghost" className="mt-2 p-0 text-indigo-600" onClick={() => setCurrentStepIndex(0)}>
            Restart wizard
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface StepIndicatorProps {
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ label, active, completed }: StepIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
        active
          ? "border-indigo-400 bg-indigo-50 text-indigo-600"
          : completed
          ? "border-teal-200 bg-teal-50 text-teal-600"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.28em]">{label}</span>
    </div>
  );
}
