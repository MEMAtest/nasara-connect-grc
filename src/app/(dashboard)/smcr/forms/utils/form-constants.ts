import type { FormAState, EmploymentEntry, DirectorshipEntry, PrescribedResponsibility } from '../types/form-types';

// LocalStorage key for form persistence
export const FORM_A_STORAGE_KEY = 'nasara-form-a-draft';

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
