// Employment entry type
export interface EmploymentEntry {
  id: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  reasonForLeaving: string;
  isRegulated: boolean;
  regulatorName: string;
}

// Directorship entry type
export interface DirectorshipEntry {
  id: string;
  companyName: string;
  position: string;
  appointedDate: string;
  resignedDate: string;
  isActive: boolean;
  natureOfBusiness: string;
}

// Form A comprehensive state
export interface FormAState {
  // Section 1: Firm Reference
  firmName: string;
  firmFRN: string;
  firmAddress: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterPosition: string;

  // Section 2: Candidate Personal Details
  title: string;
  surname: string;
  forenames: string;
  previousNames: string;
  dateOfBirth: string;
  townOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  nationalInsurance: string;
  hasRightToWork: boolean;
  rightToWorkDetails: string;

  // Section 3: Contact Details
  homeAddress: string;
  homePostcode: string;
  homeCountry: string;
  correspondenceAddress: string;
  personalEmail: string;
  personalPhone: string;
  workEmail: string;
  workPhone: string;

  // Section 4: Function Details
  functionApplied: string;
  effectiveDate: string;
  arrangementType: string;
  jobTitle: string;
  timeCommitment: string;
  hoursPerWeek: string;
  reportingTo: string;
  directReports: string;

  // Section 5: Employment History (10 years)
  employmentHistory: EmploymentEntry[];

  // Section 6: Directorships
  directorships: DirectorshipEntry[];

  // Section 7: Fitness & Propriety - Criminal
  hasCriminalConviction: boolean;
  criminalDetails: string;
  hasPendingProsecution: boolean;
  pendingProsecutionDetails: string;

  // Section 8: Fitness & Propriety - Civil
  hasCivilProceedings: boolean;
  civilDetails: string;
  hasJudgmentAgainst: boolean;
  judgmentDetails: string;

  // Section 9: Fitness & Propriety - Regulatory
  hasRegulatoryAction: boolean;
  regulatoryActionDetails: string;
  hasRefusedAuthorisation: boolean;
  refusedAuthorisationDetails: string;
  hasSuspendedLicense: boolean;
  suspendedLicenseDetails: string;

  // Section 10: Fitness & Propriety - Business
  hasDisciplinaryAction: boolean;
  disciplinaryDetails: string;
  hasDismissed: boolean;
  dismissedDetails: string;
  hasResignedInvestigation: boolean;
  resignedInvestigationDetails: string;

  // Section 11: Fitness & Propriety - Financial
  hasBankruptcy: boolean;
  bankruptcyDetails: string;
  hasIVA: boolean;
  ivaDetails: string;
  hasCCJ: boolean;
  ccjDetails: string;
  hasCompanyInsolvency: boolean;
  companyInsolvencyDetails: string;

  // Section 12: Statement of Responsibilities (SMF only)
  sorResponsibilities: string;
  prescribedResponsibilities: string[];
  additionalResponsibilities: string;

  // Section 13: Competency
  relevantExperience: string;
  qualifications: string;
  trainingPlanned: string;

  // Section 14: Declarations
  candidateDeclaration: boolean;
  firmDeclaration: boolean;
  candidateSignature: string;
  candidateSignatureDate: string;
  firmSignature: string;
  firmSignatureDate: string;
}

// Section props pattern for component extraction
export interface SectionProps {
  formData: FormAState;
  updateField: <K extends keyof FormAState>(field: K, value: FormAState[K]) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: string, validator?: string) => boolean;
  onNext?: () => void;
  onBack?: () => void;
}

// Prescribed responsibility type
export interface PrescribedResponsibility {
  id: string;
  label: string;
}

// Form C - Ceasing controlled function
export interface FormCState {
  // Section 1: Firm Details
  firmName: string;
  firmFRN: string;
  firmAddress: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterPosition: string;

  // Section 2: Individual Details
  title: string;
  surname: string;
  forenames: string;
  individualReferenceNumber: string; // IRN from FCA Register
  dateOfBirth: string;
  nationalInsurance: string;

  // Section 3: Function Details
  functionCeasing: string;
  effectiveDate: string;
  dateApproved: string; // When they were originally approved

  // Section 4: Reason for Leaving
  reasonCategory: string; // resignation, retirement, redundancy, dismissal, mutual-agreement, other
  reasonDetails: string;
  isRelocating: boolean;
  newEmployerName: string;
  newEmployerFRN: string;

  // Section 5: Circumstances (Fitness & Propriety)
  hasPerformanceIssues: boolean;
  performanceDetails: string;
  hasConductIssues: boolean;
  conductDetails: string;
  hasInvestigation: boolean;
  investigationDetails: string;
  hasDisciplinaryAction: boolean;
  disciplinaryDetails: string;
  hasRegulatoryBreach: boolean;
  regulatoryBreachDetails: string;

  // Section 6: Handover Arrangements
  hasHandoverPlan: boolean;
  handoverDetails: string;
  interimArrangements: string;
  replacementName: string;
  replacementApplicationSubmitted: boolean;

  // Section 7: Declaration
  firmDeclaration: boolean;
  declarantName: string;
  declarantPosition: string;
  declarantSignature: string;
  declarantDate: string;
}

// Form C Section props
export interface FormCSectionProps {
  formData: FormCState;
  updateField: <K extends keyof FormCState>(field: K, value: FormCState[K]) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: string, validator?: string) => boolean;
  onNext?: () => void;
  onBack?: () => void;
}

// Section navigation type
export interface SectionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
