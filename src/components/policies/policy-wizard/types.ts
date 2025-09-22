import type { FirmPermissions } from "@/lib/policies";
import type { PolicyClause, PolicyTemplate } from "@/lib/policies/templates";

export interface WizardApprovals {
  requiresSMF: boolean;
  smfRole?: string;
  requiresBoard: boolean;
  boardFrequency: "annual" | "semi-annual" | "quarterly";
  additionalApprovers: string[];
}

export interface WizardFormState {
  permissions: FirmPermissions;
  selectedTemplate?: PolicyTemplate;
  selectedClauses: PolicyClause[];
  customContent: Record<string, string>;
  approvals: WizardApprovals;
}

export interface WizardStepProps {
  state: WizardFormState;
  updateState: (updater: (state: WizardFormState) => WizardFormState) => void;
  onNext: () => void;
  onBack: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export interface WizardStepDefinition {
  id: string;
  title: string;
  description: string;
  optional?: boolean;
}
