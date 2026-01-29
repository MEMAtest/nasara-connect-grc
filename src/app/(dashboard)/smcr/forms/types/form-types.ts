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

// Form D - Amendment to Details of Approved Person
export interface FormDState {
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
  individualReferenceNumber: string;
  dateOfBirth: string;
  currentFunction: string;

  // Section 3: Change Category
  changeCategory: string; // name, contact, ni, fitness, other

  // Section 3a: Name Change
  previousSurname: string;
  previousForenames: string;
  newSurname: string;
  newForenames: string;
  reasonForNameChange: string;
  nameChangeDate: string;

  // Section 3b: Contact Changes
  previousAddress: string;
  newAddress: string;
  previousEmail: string;
  newEmail: string;
  previousPhone: string;
  newPhone: string;

  // Section 3c: NI Number Correction
  previousNI: string;
  correctedNI: string;
  niCorrectionReason: string;

  // Section 3d: Fitness & Propriety Updates
  fitnessCategory: string; // criminal, civil, regulatory, financial, other
  fitnessDetails: string;
  dateOfOccurrence: string;

  // Section 3e: Other Changes
  otherChangeDescription: string;
  otherChangeDetails: string;

  // Section 4: Declaration
  firmDeclaration: boolean;
  declarantName: string;
  declarantPosition: string;
  declarantSignature: string;
  declarantDate: string;
}

// Form D Section props
export interface FormDSectionProps {
  formData: FormDState;
  updateField: <K extends keyof FormDState>(field: K, value: FormDState[K]) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: string, validator?: string) => boolean;
  onNext?: () => void;
  onBack?: () => void;
}

// Form E - Internal Transfer
export interface FormEState {
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
  individualReferenceNumber: string;
  dateOfBirth: string;
  nationalInsurance: string;

  // Section 3: Current Function(s) Being Ceased
  currentFunctions: string[];
  ceasingDate: string;

  // Section 4: New Function(s) Being Applied For
  newFunctions: string[];
  newFunctionStartDate: string;
  newJobTitle: string;
  newReportingTo: string;
  newDirectReports: string;
  timeCommitment: string;
  hoursPerWeek: string;

  // Section 5: Reason for Transfer
  transferReason: string; // promotion, restructure, business-need, personal-request, other
  transferDetails: string;

  // Section 6: Statement of Responsibilities (for SMF)
  newResponsibilities: string;
  prescribedResponsibilities: string[];
  additionalResponsibilities: string;

  // Section 7: Competency for New Role
  relevantExperience: string;
  additionalTraining: string;

  // Section 8: Fitness & Propriety
  hasNewFitnessMatters: boolean;
  fitnessMattersDetails: string;

  // Section 9: Declarations
  candidateDeclaration: boolean;
  candidateSignature: string;
  candidateSignatureDate: string;
  firmDeclaration: boolean;
  firmSignature: string;
  firmSignatureDate: string;
}

// Form E Section props
export interface FormESectionProps {
  formData: FormEState;
  updateField: <K extends keyof FormEState>(field: K, value: FormEState[K]) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: string, validator?: string) => boolean;
  onNext?: () => void;
  onBack?: () => void;
}

// PSD Employment entry for Payment Services Individual form
export interface PSDEmploymentEntry {
  id: string;
  period: string; // from-to mm/yy
  fromDate: string;
  toDate: string;
  natureOfEmployment: string; // employed, self-employed, unemployed, education
  employmentDetails: string; // if unemployed or education
  employerName: string;
  employerAddress: string;
  previousEmployerNames: string;
  natureOfBusiness: string;
  isRegulated: boolean;
  regulatorName: string;
  positionHeld: string;
  responsibilities: string;
  reasonForLeaving: string; // resignation, redundancy, retirement, termination, end-of-contract, other
  reasonDetails: string;
}

// PSD Qualification entry
export interface PSDQualificationEntry {
  id: string;
  fromDate: string;
  toDate: string;
  qualification: string;
  issuingOrganisation: string;
}

// Previous address entry for PSD
export interface PSDAddressEntry {
  id: string;
  address: string;
  postcode: string;
  fromDate: string;
  toDate: string;
}

// PSD Individual Form - Payment Services Regulations 2017
export interface PSDIndividualFormState {
  // Section 1: Personal identification details
  fcaIRN: string; // 1.1a - FCA Individual Reference Number
  previousRegulatoryBody: string; // 1.1b
  previousReferenceNumber: string; // 1.1c
  title: string; // 1.2
  surname: string; // 1.3
  forenames: string; // 1.4
  nameKnownBy: string; // 1.5
  previousNames: string; // 1.6
  dateOfNameChange: string; // 1.7
  gender: string; // 1.8
  dateOfBirth: string; // 1.9
  placeOfBirth: string; // 1.10
  nationalInsurance: string; // 1.11
  passportNumber: string; // 1.12
  nationality: string; // 1.13
  currentAddress: string; // 1.14
  currentPostcode: string;
  currentAddressFromDate: string;
  previousAddresses: PSDAddressEntry[]; // 1.15

  // Section 2: Firm identification details
  firmName: string; // 2.1
  firmFRN: string; // 2.2
  contactName: string; // 2.3
  contactPosition: string;
  contactPhone: string;
  contactFax: string;
  contactEmail: string;

  // Section 3: Arrangements
  positionType: string; // 3.1 - executive-director, non-executive, other
  positionOtherDetails: string;
  attachedDocuments: string[]; // 3.2 - letter, contract, offer
  plannedStartDate: string; // 3.3
  hasExpectedEndDate: boolean; // 3.4
  expectedEndDate: string;
  keyDutiesResponsibilities: string; // 3.5

  // Section 4: Employment history and qualifications
  employmentHistory: PSDEmploymentEntry[]; // 4.1
  qualifications: PSDQualificationEntry[]; // 4.2
  cvAvailable: boolean; // 4.3
  suitabilityAssessmentAttached: boolean; // 4.4

  // Section 5: Fitness and propriety - Part A Criminal
  hasCriminalConviction: boolean; // 5.1i
  hasPendingInvestigation: boolean; // 5.1ii
  hasCurrentCriminalProceedings: boolean; // 5.2i
  hasPastCriminalProceedings: boolean; // 5.2ii
  hasCriminalRecordCheck: boolean; // 5.2iii
  hasOrganisationInsolvency: boolean; // 5.3
  partADetailsProvided: boolean; // 5.4

  // Section 5: Part B Civil and administrative
  hasCivilInvestigations: boolean; // 5.5i
  hasCivilDecisionsAgainst: boolean; // 5.5ii
  hasCivilEnforcement: boolean; // 5.5iii
  hasSupervisoryInvolvement: boolean; // 5.5iv
  civilCertificateAttached: boolean; // 5.6
  hasBankruptcyFiled: boolean; // 5.7i
  hasBeenBankrupt: boolean; // 5.7ii
  hasBankruptcyRestrictions: boolean; // 5.7iii
  hasCreditorArrangements: boolean; // 5.7iv
  hasAssetsSequestrated: boolean; // 5.7v
  hasBankruptcyProceedings: boolean; // 5.7vi
  hasCurrentBankruptcyProceedings: boolean; // 5.8
  hasOutstandingFinancialObligations: boolean; // 5.9
  partBDetailsProvided: boolean; // 5.10

  // Section 5: Part C Business and employment
  hasBeenDismissed: boolean; // 5.11i
  hasBeenAskedToResign: boolean; // 5.11ii
  hasBeenSuspended: boolean; // 5.11iii
  hasBeenDisqualifiedDirector: boolean; // 5.12i
  hasDisciplinaryProceedings: boolean; // 5.12ii
  hasDisciplinaryInvestigation: boolean; // 5.12iii
  hasNotifiedDisciplinary: boolean; // 5.12iv
  hasMalpracticeAllegations: boolean; // 5.12v
  partCDetailsProvided: boolean; // 5.13

  // Section 5: Part D Regulatory matters
  hasRefusedAuthorisation: boolean; // 5.14i
  hasBeenExcluded: boolean; // 5.14ii
  hasPreviousReputationAssessment: boolean; // 5.15
  previousAssessmentDetails: string;
  partDDetailsProvided: boolean; // 5.16

  // Section 6: Supplementary information
  supplementaryInfo: string;
  additionalSheets: number;

  // Section 7: Declarations
  individualFullName: string;
  individualSignature: string;
  individualSignatureDate: string;
  firmNameDeclaration: string;
  firmSignatoryName: string;
  firmSignatoryJobTitle: string;
  firmSignature: string;
  firmSignatureDate: string;
}

// PSD Individual Form Section props
export interface PSDFormSectionProps {
  formData: PSDIndividualFormState;
  updateField: <K extends keyof PSDIndividualFormState>(field: K, value: PSDIndividualFormState[K]) => void;
  validationErrors: Record<string, string>;
  validateField: (field: string, value: string, validator?: string) => boolean;
  onNext?: () => void;
  onBack?: () => void;
}
