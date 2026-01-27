/**
 * Question Bank to Predictive Scorer Section Mapping
 *
 * Maps question IDs from the question bank to readiness assessment sections
 * for calculating predictive approval likelihood.
 */

/**
 * Maps question IDs to their corresponding predictive section
 * Used to aggregate question responses into section scores
 */
export const QUESTION_TO_SECTION_MAP: Record<string, string> = {
  // ============================================================================
  // Threshold: UK Presence (COND 2.3)
  // ============================================================================
  "pc-001": "uk_presence", // UK-resident directors

  // ============================================================================
  // Threshold: Effective Supervision (COND 2.4)
  // ============================================================================
  "tc-001": "effective_supervision", // FCA supervision capability

  // ============================================================================
  // Threshold: Suitability - Senior Management (COND 2.5)
  // ============================================================================
  "pc-002": "senior_management", // Fit and proper assessments
  "pc-004": "senior_management", // Resourcing plan
  "pc-005": "senior_management", // Staff incentive structures
  "gov-001": "senior_management", // SMF identification
  "gov-002": "senior_management", // SMF fit and proper

  // ============================================================================
  // Threshold: AML Framework (MLR 2017)
  // ============================================================================
  "fc-001": "aml_framework", // MLRO appointment
  "fc-002": "aml_framework", // CDD/EDD procedures
  "fc-003": "aml_framework", // Screening and monitoring
  "fc-004": "aml_framework", // AML training

  // ============================================================================
  // Threshold: Capital Resources (COND 2.4)
  // ============================================================================
  "fin-001": "capital_resources", // Minimum capital requirements
  "fin-002": "capital_resources", // Financial projections
  "fin-003": "capital_resources", // Funding strategy
  "fin-004": "capital_resources", // PI insurance
  "ps-007": "capital_resources", // Payment volume projections

  // ============================================================================
  // Threshold: Business Model (COND 2.5)
  // ============================================================================
  "bm-001": "business_plan", // Financial services type
  "bm-002": "business_plan", // Target customer segments
  "bm-003": "business_plan", // Revenue model (text)
  "bm-004": "business_plan", // Consumer Duty readiness
  "bm-005": "business_plan", // 3-year business plan

  // ============================================================================
  // Non-Threshold: Risk Management (legacy questions)
  // ============================================================================
  "risk-001": "governance", // Risk appetite statement
  "risk-002": "governance", // Risk identification
  "risk-003": "governance", // Risk controls
  "risk-004": "governance", // Risk monitoring (text)
  "risk-005": "governance", // Operational risk

  // ============================================================================
  // Threshold: Safeguarding (PSRs 2017)
  // ============================================================================
  "ps-001": "safeguarding", // Payment services selection
  "ps-002": "safeguarding", // PI/EMI type
  "ps-003": "safeguarding", // Safeguarding approach
  "ps-004": "safeguarding", // Daily reconciliation
  "ps-012": "safeguarding", // Safeguarding audits

  // ============================================================================
  // Non-Threshold: Governance
  // ============================================================================
  "gov-003": "governance", // Governance structure
  "gov-004": "governance", // Organizational structure
  "gov-005": "governance", // Board/committee

  // ============================================================================
  // Non-Threshold: Systems & Controls
  // ============================================================================
  "sys-001": "systems_controls", // IT systems
  "sys-002": "systems_controls", // Data protection/cyber
  "sys-003": "systems_controls", // Record keeping
  "sys-004": "systems_controls", // BCP/DR
  "sys-005": "systems_controls", // Internal controls
  "sys-006": "systems_controls", // AML procedures (legacy)
  "or-001": "systems_controls", // Important Business Services
  "or-002": "systems_controls", // Critical outsourcing
  "or-003": "systems_controls", // IT security
  "or-004": "systems_controls", // BCP testing

  // ============================================================================
  // Non-Threshold: Consumer Protection
  // ============================================================================
  "cd-001": "consumer_protection", // Target market/fair value
  "cd-002": "consumer_protection", // Financial promotions
  "cd-003": "consumer_protection", // Vulnerable customers
  "cd-004": "consumer_protection", // Complaints handling

  // ============================================================================
  // Non-Threshold: Data Protection
  // ============================================================================
  "dp-001": "data_protection", // ROPA and lawful bases
  "dp-002": "data_protection", // TOMs and breach response
  "dp-003": "data_protection", // Data retention

  // ============================================================================
  // Payments-Specific (non-threshold)
  // ============================================================================
  "ps-005": "systems_controls", // Strong Customer Authentication
  "ps-006": "systems_controls", // Agent network oversight
  "ps-008": "systems_controls", // Fraud prevention
  "ps-009": "systems_controls", // Execution times
  "ps-010": "consumer_protection", // APP fraud reimbursement
  "ps-011": "systems_controls", // Payment scheme memberships

  // ============================================================================
  // Ownership (non-threshold but important)
  // ============================================================================
  "pc-003": "governance", // Ownership and controllers
};

/**
 * Questions that map to FCA threshold conditions
 * These are critical for authorization decisions
 */
export const THRESHOLD_QUESTIONS: string[] = [
  // UK Presence (COND 2.3)
  "pc-001",

  // Effective Supervision (COND 2.4)
  "tc-001",

  // Suitability - Senior Management (COND 2.5)
  "pc-002",

  // AML Framework (MLR 2017)
  "fc-001",

  // Capital Resources (COND 2.4)
  "fin-001",
  "fin-002",

  // Business Model (COND 2.5)
  "bm-001",

  // Safeguarding (PSRs 2017)
  "ps-003",
  "ps-004",
];

/**
 * Sections that represent FCA threshold conditions
 */
export const THRESHOLD_SECTIONS: string[] = [
  "uk_presence",
  "effective_supervision",
  "senior_management",
  "aml_framework",
  "capital_resources",
  "business_plan",
  "safeguarding",
];

/**
 * Section metadata including FCA references
 */
export const SECTION_METADATA: Record<string, {
  label: string;
  fcaReference?: string;
  isThreshold: boolean;
  description: string;
}> = {
  uk_presence: {
    label: "UK Presence",
    fcaReference: "COND 2.3 - Location of Offices",
    isThreshold: true,
    description: "Mind and management exercised in the UK with UK-resident directors",
  },
  effective_supervision: {
    label: "Effective Supervision",
    fcaReference: "COND 2.4 - Effective Supervision",
    isThreshold: true,
    description: "FCA must be able to effectively supervise the firm",
  },
  senior_management: {
    label: "Senior Management",
    fcaReference: "COND 2.5 - Suitability",
    isThreshold: true,
    description: "SMF holders must be fit and proper with adequate time commitment",
  },
  aml_framework: {
    label: "AML Framework",
    fcaReference: "MLR 2017",
    isThreshold: true,
    description: "Robust AML/CTF systems and controls with appointed MLRO",
  },
  capital_resources: {
    label: "Capital & Resources",
    fcaReference: "COND 2.4 - Appropriate Resources",
    isThreshold: true,
    description: "Adequate capital and financial resources to meet obligations",
  },
  business_plan: {
    label: "Business Plan",
    fcaReference: "COND 2.5 - Business Model",
    isThreshold: true,
    description: "Viable business model with realistic financial projections",
  },
  safeguarding: {
    label: "Safeguarding",
    fcaReference: "PSRs 2017 Regulation 23",
    isThreshold: true,
    description: "Customer funds protected through segregation or insurance",
  },
  governance: {
    label: "Governance",
    fcaReference: "SYSC 4 - General Organisational Requirements",
    isThreshold: false,
    description: "Clear governance structures and accountability",
  },
  systems_controls: {
    label: "Systems & Controls",
    fcaReference: "SYSC 3 - Systems and Controls",
    isThreshold: false,
    description: "Appropriate operational systems, IT security, and business continuity",
  },
  consumer_protection: {
    label: "Consumer Protection",
    fcaReference: "PRIN 2A - Consumer Duty",
    isThreshold: false,
    description: "Fair treatment of customers and vulnerable customer policies",
  },
  data_protection: {
    label: "Data Protection",
    fcaReference: "UK GDPR",
    isThreshold: false,
    description: "GDPR compliance with documented processing activities",
  },
};

/**
 * Get the section for a given question ID
 */
export function getSectionForQuestion(questionId: string): string | null {
  return QUESTION_TO_SECTION_MAP[questionId] || null;
}

/**
 * Get all question IDs for a given section
 */
export function getQuestionsForSection(sectionId: string): string[] {
  return Object.entries(QUESTION_TO_SECTION_MAP)
    .filter(([, section]) => section === sectionId)
    .map(([questionId]) => questionId);
}

/**
 * Check if a question is a threshold question
 */
export function isThresholdQuestion(questionId: string): boolean {
  return THRESHOLD_QUESTIONS.includes(questionId);
}

/**
 * Check if a section is a threshold section
 */
export function isThresholdSection(sectionId: string): boolean {
  return THRESHOLD_SECTIONS.includes(sectionId);
}
