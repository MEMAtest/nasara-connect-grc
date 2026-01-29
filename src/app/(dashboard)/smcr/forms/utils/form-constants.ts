import type { FormAState, FormCState, FormDState, FormEState, EmploymentEntry, DirectorshipEntry, PrescribedResponsibility } from '../types/form-types';

// LocalStorage keys for form persistence
export const FORM_A_STORAGE_KEY = 'nasara-form-a-draft';
export const FORM_C_STORAGE_KEY = 'nasara-form-c-draft';

// Generate unique ID with fallback for older browsers
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const createEmptyEmployment = (): EmploymentEntry => ({
  id: generateId(),
  employer: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  reasonForLeaving: "",
  isRegulated: false,
  regulatorName: "",
});

export const createEmptyDirectorship = (): DirectorshipEntry => ({
  id: generateId(),
  companyName: "",
  position: "",
  appointedDate: "",
  resignedDate: "",
  isActive: false,
  natureOfBusiness: "",
});

export const initialFormA: FormAState = {
  firmName: "",
  firmFRN: "",
  firmAddress: "",
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  submitterPosition: "",
  title: "",
  surname: "",
  forenames: "",
  previousNames: "",
  dateOfBirth: "",
  townOfBirth: "",
  countryOfBirth: "",
  nationality: "",
  nationalInsurance: "",
  hasRightToWork: true,
  rightToWorkDetails: "",
  homeAddress: "",
  homePostcode: "",
  homeCountry: "United Kingdom",
  correspondenceAddress: "",
  personalEmail: "",
  personalPhone: "",
  workEmail: "",
  workPhone: "",
  functionApplied: "",
  effectiveDate: "",
  arrangementType: "employed",
  jobTitle: "",
  timeCommitment: "full-time",
  hoursPerWeek: "",
  reportingTo: "",
  directReports: "",
  employmentHistory: [createEmptyEmployment()],
  directorships: [],
  hasCriminalConviction: false,
  criminalDetails: "",
  hasPendingProsecution: false,
  pendingProsecutionDetails: "",
  hasCivilProceedings: false,
  civilDetails: "",
  hasJudgmentAgainst: false,
  judgmentDetails: "",
  hasRegulatoryAction: false,
  regulatoryActionDetails: "",
  hasRefusedAuthorisation: false,
  refusedAuthorisationDetails: "",
  hasSuspendedLicense: false,
  suspendedLicenseDetails: "",
  hasDisciplinaryAction: false,
  disciplinaryDetails: "",
  hasDismissed: false,
  dismissedDetails: "",
  hasResignedInvestigation: false,
  resignedInvestigationDetails: "",
  hasBankruptcy: false,
  bankruptcyDetails: "",
  hasIVA: false,
  ivaDetails: "",
  hasCCJ: false,
  ccjDetails: "",
  hasCompanyInsolvency: false,
  companyInsolvencyDetails: "",
  sorResponsibilities: "",
  prescribedResponsibilities: [],
  additionalResponsibilities: "",
  relevantExperience: "",
  qualifications: "",
  trainingPlanned: "",
  candidateDeclaration: false,
  firmDeclaration: false,
  candidateSignature: "",
  candidateSignatureDate: "",
  firmSignature: "",
  firmSignatureDate: "",
};

export const prescribedResponsibilitiesList: PrescribedResponsibility[] = [
  { id: "pr-overall", label: "Overall responsibility for the firm's compliance with the FCA's and/or PRA's requirements" },
  { id: "pr-policies", label: "Responsibility for the firm's policies and procedures for countering financial crime" },
  { id: "pr-mlro", label: "Responsibility for the firm's compliance with CASS (client money and assets)" },
  { id: "pr-complaints", label: "Responsibility for the firm's complaints handling procedures" },
  { id: "pr-culture", label: "Responsibility for developing and maintaining the firm's culture" },
  { id: "pr-governance", label: "Responsibility for the firm's governance arrangements" },
  { id: "pr-risk", label: "Responsibility for the firm's risk management framework" },
  { id: "pr-conduct", label: "Responsibility for ensuring the conduct rules are embedded" },
];

// Form C - Ceasing controlled function
export const initialFormC: FormCState = {
  // Section 1: Firm Details
  firmName: "",
  firmFRN: "",
  firmAddress: "",
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  submitterPosition: "",

  // Section 2: Individual Details
  title: "",
  surname: "",
  forenames: "",
  individualReferenceNumber: "",
  dateOfBirth: "",
  nationalInsurance: "",

  // Section 3: Function Details
  functionCeasing: "",
  effectiveDate: "",
  dateApproved: "",

  // Section 4: Reason for Leaving
  reasonCategory: "",
  reasonDetails: "",
  isRelocating: false,
  newEmployerName: "",
  newEmployerFRN: "",

  // Section 5: Circumstances
  hasPerformanceIssues: false,
  performanceDetails: "",
  hasConductIssues: false,
  conductDetails: "",
  hasInvestigation: false,
  investigationDetails: "",
  hasDisciplinaryAction: false,
  disciplinaryDetails: "",
  hasRegulatoryBreach: false,
  regulatoryBreachDetails: "",

  // Section 6: Handover
  hasHandoverPlan: false,
  handoverDetails: "",
  interimArrangements: "",
  replacementName: "",
  replacementApplicationSubmitted: false,

  // Section 7: Declaration
  firmDeclaration: false,
  declarantName: "",
  declarantPosition: "",
  declarantSignature: "",
  declarantDate: "",
};

// Reason categories for Form C
export const reasonCategories = [
  { value: "resignation", label: "Resignation" },
  { value: "retirement", label: "Retirement" },
  { value: "redundancy", label: "Redundancy" },
  { value: "dismissal", label: "Dismissal" },
  { value: "mutual-agreement", label: "Mutual Agreement" },
  { value: "end-of-contract", label: "End of Fixed-Term Contract" },
  { value: "internal-transfer", label: "Internal Transfer (use Form E instead)" },
  { value: "other", label: "Other" },
];

// SMF/CF functions list for Form C
export const controlledFunctions = [
  { value: "SMF1", label: "SMF1 - Chief Executive" },
  { value: "SMF2", label: "SMF2 - Chief Finance" },
  { value: "SMF3", label: "SMF3 - Executive Director" },
  { value: "SMF4", label: "SMF4 - Chief Risk" },
  { value: "SMF5", label: "SMF5 - Head of Internal Audit" },
  { value: "SMF9", label: "SMF9 - Chair" },
  { value: "SMF10", label: "SMF10 - Chair of Risk Committee" },
  { value: "SMF11", label: "SMF11 - Chair of Audit Committee" },
  { value: "SMF12", label: "SMF12 - Chair of Remuneration Committee" },
  { value: "SMF13", label: "SMF13 - Chair of Nominations Committee" },
  { value: "SMF14", label: "SMF14 - Senior Independent Director" },
  { value: "SMF16", label: "SMF16 - Compliance Oversight" },
  { value: "SMF17", label: "SMF17 - Money Laundering Reporting Officer" },
  { value: "SMF21", label: "SMF21 - EEA Branch Senior Manager" },
  { value: "SMF24", label: "SMF24 - Chief Operations" },
  { value: "SMF27", label: "SMF27 - Partner" },
  { value: "SMF29", label: "SMF29 - Limited Scope" },
  { value: "CF", label: "Certification Function" },
];

// Form D - Amendment to Details
export const FORM_D_STORAGE_KEY = 'nasara-form-d-draft';

export const changeCategories = [
  { value: "name", label: "Name Change" },
  { value: "contact", label: "Contact Details" },
  { value: "ni", label: "National Insurance Correction" },
  { value: "fitness", label: "Fitness & Propriety Update" },
  { value: "other", label: "Other Changes" },
];

export const fitnessCategories = [
  { value: "criminal", label: "Criminal Matter" },
  { value: "civil", label: "Civil Proceedings" },
  { value: "regulatory", label: "Regulatory Action" },
  { value: "financial", label: "Financial Soundness" },
  { value: "employment", label: "Employment Matter" },
  { value: "other", label: "Other" },
];

export const initialFormD: FormDState = {
  // Section 1: Firm Details
  firmName: "",
  firmFRN: "",
  firmAddress: "",
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  submitterPosition: "",

  // Section 2: Individual Details
  title: "",
  surname: "",
  forenames: "",
  individualReferenceNumber: "",
  dateOfBirth: "",
  currentFunction: "",

  // Section 3: Change Category
  changeCategory: "",

  // Section 3a: Name Change
  previousSurname: "",
  previousForenames: "",
  newSurname: "",
  newForenames: "",
  reasonForNameChange: "",
  nameChangeDate: "",

  // Section 3b: Contact Changes
  previousAddress: "",
  newAddress: "",
  previousEmail: "",
  newEmail: "",
  previousPhone: "",
  newPhone: "",

  // Section 3c: NI Number Correction
  previousNI: "",
  correctedNI: "",
  niCorrectionReason: "",

  // Section 3d: Fitness & Propriety Updates
  fitnessCategory: "",
  fitnessDetails: "",
  dateOfOccurrence: "",

  // Section 3e: Other Changes
  otherChangeDescription: "",
  otherChangeDetails: "",

  // Section 4: Declaration
  firmDeclaration: false,
  declarantName: "",
  declarantPosition: "",
  declarantSignature: "",
  declarantDate: "",
};

// Form E - Internal Transfer
export const FORM_E_STORAGE_KEY = 'nasara-form-e-draft';

export const transferReasons = [
  { value: "promotion", label: "Promotion" },
  { value: "restructure", label: "Organizational Restructure" },
  { value: "business-need", label: "Business Need" },
  { value: "personal-request", label: "Personal Request" },
  { value: "succession", label: "Succession Planning" },
  { value: "other", label: "Other" },
];

export const initialFormE: FormEState = {
  // Section 1: Firm Details
  firmName: "",
  firmFRN: "",
  firmAddress: "",
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  submitterPosition: "",

  // Section 2: Individual Details
  title: "",
  surname: "",
  forenames: "",
  individualReferenceNumber: "",
  dateOfBirth: "",
  nationalInsurance: "",

  // Section 3: Current Function(s) Being Ceased
  currentFunctions: [],
  ceasingDate: "",

  // Section 4: New Function(s) Being Applied For
  newFunctions: [],
  newFunctionStartDate: "",
  newJobTitle: "",
  newReportingTo: "",
  newDirectReports: "",
  timeCommitment: "full-time",
  hoursPerWeek: "",

  // Section 5: Reason for Transfer
  transferReason: "",
  transferDetails: "",

  // Section 6: Statement of Responsibilities (for SMF)
  newResponsibilities: "",
  prescribedResponsibilities: [],
  additionalResponsibilities: "",

  // Section 7: Competency for New Role
  relevantExperience: "",
  additionalTraining: "",

  // Section 8: Fitness & Propriety
  hasNewFitnessMatters: false,
  fitnessMattersDetails: "",

  // Section 9: Declarations
  candidateDeclaration: false,
  candidateSignature: "",
  candidateSignatureDate: "",
  firmDeclaration: false,
  firmSignature: "",
  firmSignatureDate: "",
};
