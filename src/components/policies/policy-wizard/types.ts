import type { FirmPermissions } from "@/lib/policies";
import type { PolicyClause, PolicyTemplate } from "@/lib/policies/templates";

export interface FirmProfile {
  name: string;
  tradingName?: string;
  registeredAddress?: string;
  fcaReference?: string;
  website?: string;
}

export interface WizardApprovals {
  requiresSMF: boolean;
  smfRole?: string;
  requiresBoard: boolean;
  boardFrequency: "annual" | "semi-annual" | "quarterly";
  additionalApprovers: string[];
}

export interface WizardFormState {
  firmProfile: FirmProfile;
  permissions: FirmPermissions;
  selectedTemplate?: PolicyTemplate;
  sectionClauses: Record<string, string[]>;
  sectionNotes: Record<string, string>;
  clauseVariables: Record<string, Record<string, string>>;
  selectedClauses: PolicyClause[]; // derived convenience for review/preview
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
