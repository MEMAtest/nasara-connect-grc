/**
 * Predictive Risk Scorer for FCA Authorization
 * Calculates approval likelihood based on profile responses and provides educational guidance
 */

// ============================================================================
// Score Thresholds and Constants (imported from shared constants)
// ============================================================================

import {
  SCORE_THRESHOLDS,
  ANSWER_SCORES,
  MAX_ANSWER_SCORE,
  DEFAULT_MISSING_SECTION_SCORE,
  DEFAULT_UNANSWERED_SECTION_SCORE,
  ANSWER_NEEDS_STRENGTHENING_RATIO,
  DEFAULT_HARD_GATE_THRESHOLD,
} from "./constants";

// Re-export for backwards compatibility
export { SCORE_THRESHOLDS };

// ============================================================================
// Enhanced FCA Guidance Types and Data
// ============================================================================

interface CaseReference {
  caseName: string;
  thematicReview?: string;
  educationalContext: string;
}

interface StrengthMessages {
  low: string;
  medium: string;
  high: string;
}

interface EnhancedFCAGuidance {
  areaLabel: string;
  regulatoryExpectation: string;
  caseReference: CaseReference;
  strengthMessages: StrengthMessages;
  actionableGuidance: string[];
}

const FCA_ENHANCED_GUIDANCE: Record<string, EnhancedFCAGuidance> = {
  'uk_presence': {
    areaLabel: 'UK Presence',
    regulatoryExpectation: 'The FCA expects firms to demonstrate that decision-making authority resides in the UK.',
    caseReference: {
      caseName: 'Authorisation Review (2022-2023)',
      thematicReview: 'TR22/3',
      educationalContext: 'In recent decisions, the FCA has emphasised genuine UK-based oversight. You need to be aware that applications have been refused where mind and management appeared to be exercised from outside the UK.',
    },
    strengthMessages: {
      low: "This is where your application needs strengthening. We will help you build the evidence needed.",
      medium: "You have a foundation here. Let's strengthen the documentation.",
      high: "Your UK presence documentation is developing well.",
    },
    actionableGuidance: [
      'Document at least 2 UK-resident directors with time commitments',
      'Evidence board meetings occur in the UK with minutes',
      'Show key operational decisions are made by UK-based staff',
    ],
  },
  'effective_supervision': {
    areaLabel: 'Effective Supervision',
    regulatoryExpectation: 'The FCA expects to be able to effectively supervise your firm given its structure and activities.',
    caseReference: {
      caseName: 'Threshold Conditions Review',
      thematicReview: 'TR22/3',
      educationalContext: 'Applications have been refused where complex group structures, overseas dependencies, or opaque arrangements impede the FCA\'s ability to supervise effectively. Clear reporting lines and transparency are essential.',
    },
    strengthMessages: {
      low: "Your corporate structure may impede FCA supervision. We will help you simplify and document your arrangements.",
      medium: "You have some clarity but gaps remain. Let's strengthen the transparency of your structure.",
      high: "Your structure supports effective FCA supervision.",
    },
    actionableGuidance: [
      'Prepare clear group structure chart showing all entities',
      'Document any overseas dependencies and mitigation measures',
      'Establish clear UK regulatory reporting arrangements',
      'Define communication and escalation procedures with FCA',
    ],
  },
  'safeguarding': {
    areaLabel: 'Safeguarding',
    regulatoryExpectation: 'The FCA expects payment and e-money institutions to have robust safeguarding arrangements to protect customer funds.',
    caseReference: {
      caseName: 'Safeguarding Thematic Review',
      thematicReview: 'TR22/3',
      educationalContext: 'The FCA has found significant weaknesses in safeguarding arrangements across the sector. Firms must demonstrate segregation or insurance arrangements, daily reconciliation, and auditable records.',
    },
    strengthMessages: {
      low: "Your safeguarding arrangements need immediate attention. We will help you establish compliant procedures.",
      medium: "You have basic safeguarding but gaps exist. Let's strengthen your reconciliation and audit trail.",
      high: "Your safeguarding arrangements are developing well.",
    },
    actionableGuidance: [
      'Establish segregated safeguarding account at a credit institution',
      'Implement daily reconciliation procedures with documented shortfall handling',
      'Create auditable records of all safeguarding activities',
      'Arrange for annual safeguarding audit (required for EMIs)',
    ],
  },
  'senior_management': {
    areaLabel: 'Senior Management',
    regulatoryExpectation: 'The FCA expects SMF holders to have demonstrable competence, capability, and sufficient time commitment.',
    caseReference: {
      caseName: 'SMF Competence Review',
      thematicReview: 'TR18/3',
      educationalContext: "The FCA's thematic review on SMF competence highlighted the importance of documented time commitment and relevant sector experience. We will ensure your application addresses these expectations.",
    },
    strengthMessages: {
      low: "Your senior management documentation needs strengthening. We will help you evidence competence and commitment.",
      medium: "You have some elements in place. Let's build on this foundation.",
      high: "Your senior management arrangements are progressing well.",
    },
    actionableGuidance: [
      'Document relevant sector experience for all SMF holders',
      'Specify time allocation commitments (hours per week)',
      'Prepare evidence of qualifications and training',
      'Show clear accountability and reporting lines',
    ],
  },
  'aml_framework': {
    areaLabel: 'AML Framework',
    regulatoryExpectation: 'The FCA expects firms to have robust systems and controls to identify and mitigate financial crime risks.',
    caseReference: {
      caseName: 'Financial Crime Controls Review',
      thematicReview: 'TR22/3',
      educationalContext: "The FCA's safeguarding thematic review found that firms with strong applications had documented risk assessments and clear MLRO arrangements. We will help you build this framework.",
    },
    strengthMessages: {
      low: "Your AML framework needs development. We will guide you through building the necessary controls.",
      medium: "You have basic elements. Let's strengthen the documentation and procedures.",
      high: "Your AML framework documentation is developing well.",
    },
    actionableGuidance: [
      'Complete a documented business-wide risk assessment',
      'Appoint a qualified MLRO with dedicated time allocation',
      'Implement CDD procedures with clear documentation',
      'Establish ongoing monitoring and reporting processes',
    ],
  },
  'capital_resources': {
    areaLabel: 'Capital & Resources',
    regulatoryExpectation: 'The FCA expects firms to demonstrate adequate financial resources and credible financial projections.',
    caseReference: {
      caseName: 'PSR Capital Adequacy Reviews',
      thematicReview: 'PS21/3',
      educationalContext: 'Capital adequacy reviews have shown that projections must include stress testing and demonstrate viability. We will help you prepare projections that meet regulatory expectations.',
    },
    strengthMessages: {
      low: "Your capital and financial documentation needs strengthening. We will help you build credible projections.",
      medium: "You have a foundation. Let's strengthen the financial evidence.",
      high: "Your capital resources documentation is progressing well.",
    },
    actionableGuidance: [
      'Calculate regulatory capital requirements accurately',
      'Prepare realistic 3-year financial projections',
      'Include stress testing scenarios in your model',
      'Document a credible wind-down plan',
    ],
  },
  'governance': {
    areaLabel: 'Governance',
    regulatoryExpectation: 'The FCA expects firms to have clear governance arrangements ensuring effective oversight and accountability.',
    caseReference: {
      caseName: 'Portfolio Governance Review',
      educationalContext: 'Portfolio work on governance found that successful applications clearly documented board structures and NED arrangements with relevant sector experience. We will help you demonstrate these.',
    },
    strengthMessages: {
      low: "Your governance documentation needs development. We will help you establish clear structures.",
      medium: "You have basic governance in place. Let's strengthen the documentation.",
      high: "Your governance arrangements are developing well.",
    },
    actionableGuidance: [
      'Establish clear board and committee structures',
      'Document Terms of Reference for each committee',
      'Implement regular meeting cadence with minutes',
      'Define clear reporting lines and escalation processes',
    ],
  },
  'systems_controls': {
    areaLabel: 'Systems & Controls',
    regulatoryExpectation: 'The FCA expects firms to have appropriate systems and controls to manage operational risks.',
    caseReference: {
      caseName: 'Operational Resilience Review',
      thematicReview: 'PS21/3',
      educationalContext: 'Operational resilience requirements emphasise business continuity and IT security. We will help you document controls that meet these expectations.',
    },
    strengthMessages: {
      low: "Your systems and controls documentation needs strengthening. We will help you build this framework.",
      medium: "You have some controls in place. Let's strengthen the documentation.",
      high: "Your systems and controls are developing well.",
    },
    actionableGuidance: [
      'Document key operational processes and procedures',
      'Implement IT security controls and access management',
      'Develop business continuity and disaster recovery plans',
      'Establish change management procedures',
    ],
  },
  'consumer_protection': {
    areaLabel: 'Consumer Protection',
    regulatoryExpectation: 'The FCA expects firms to demonstrate appropriate arrangements for protecting consumers.',
    caseReference: {
      caseName: 'Consumer Duty Implementation',
      thematicReview: 'FG22/5',
      educationalContext: 'Consumer Duty implementation reviews have emphasised fair value assessments and vulnerable customer considerations. We will help you build compliant processes.',
    },
    strengthMessages: {
      low: "Your consumer protection arrangements need development. We will guide you through the requirements.",
      medium: "You have foundation elements. Let's strengthen your consumer focus.",
      high: "Your consumer protection arrangements are developing well.",
    },
    actionableGuidance: [
      'Implement fair value assessments for all products',
      'Establish vulnerable customer policies and procedures',
      'Create clear complaints handling procedures',
      'Document product governance arrangements',
    ],
  },
  'business_plan': {
    areaLabel: 'Business Plan',
    regulatoryExpectation: 'The FCA expects firms to present a viable business model with realistic financial projections.',
    caseReference: {
      caseName: 'Business Model Assessment',
      educationalContext: 'Successful applications demonstrate clear revenue models with well-documented assumptions. We will help you present a compelling and realistic business case.',
    },
    strengthMessages: {
      low: "Your business plan documentation needs strengthening. We will help you build a compelling case.",
      medium: "You have a foundation. Let's strengthen the evidence and projections.",
      high: "Your business plan documentation is progressing well.",
    },
    actionableGuidance: [
      'Prepare realistic 3-year financial projections with clear assumptions',
      'Document revenue sources and key dependencies',
      'Define target market and competitive positioning',
      'Stress-test the business model',
    ],
  },
  'data_protection': {
    areaLabel: 'Data Protection',
    regulatoryExpectation: 'The FCA expects firms to comply with UK GDPR and have appropriate data protection arrangements.',
    caseReference: {
      caseName: 'Data Protection Compliance',
      educationalContext: 'Firms must demonstrate documented processing activities, lawful bases for processing, and appropriate technical and organisational measures. Breach response plans are essential.',
    },
    strengthMessages: {
      low: "Your data protection documentation needs development. We will help you establish GDPR compliance.",
      medium: "You have some elements in place. Let's strengthen your data protection framework.",
      high: "Your data protection arrangements are developing well.",
    },
    actionableGuidance: [
      'Complete a Record of Processing Activities (ROPA)',
      'Document lawful bases for all processing activities',
      'Implement technical and organisational measures (TOMs)',
      'Prepare a data breach response plan with 72-hour notification capability',
    ],
  },
};

// Legacy format for backwards compatibility (to be deprecated)
const FCA_DECISION_QUOTES: Record<string, { quote: string; pattern: string; mitigation: string }> = {
  'uk_presence': {
    quote: FCA_ENHANCED_GUIDANCE.uk_presence.regulatoryExpectation,
    pattern: 'UK Presence',
    mitigation: FCA_ENHANCED_GUIDANCE.uk_presence.actionableGuidance.join('; '),
  },
  'effective_supervision': {
    quote: FCA_ENHANCED_GUIDANCE.effective_supervision.regulatoryExpectation,
    pattern: 'Effective Supervision',
    mitigation: FCA_ENHANCED_GUIDANCE.effective_supervision.actionableGuidance.join('; '),
  },
  'senior_management': {
    quote: FCA_ENHANCED_GUIDANCE.senior_management.regulatoryExpectation,
    pattern: 'Senior Management',
    mitigation: FCA_ENHANCED_GUIDANCE.senior_management.actionableGuidance.join('; '),
  },
  'aml_framework': {
    quote: FCA_ENHANCED_GUIDANCE.aml_framework.regulatoryExpectation,
    pattern: 'AML Framework',
    mitigation: FCA_ENHANCED_GUIDANCE.aml_framework.actionableGuidance.join('; '),
  },
  'capital_resources': {
    quote: FCA_ENHANCED_GUIDANCE.capital_resources.regulatoryExpectation,
    pattern: 'Capital & Resources',
    mitigation: FCA_ENHANCED_GUIDANCE.capital_resources.actionableGuidance.join('; '),
  },
  'safeguarding': {
    quote: FCA_ENHANCED_GUIDANCE.safeguarding.regulatoryExpectation,
    pattern: 'Safeguarding',
    mitigation: FCA_ENHANCED_GUIDANCE.safeguarding.actionableGuidance.join('; '),
  },
  'governance': {
    quote: FCA_ENHANCED_GUIDANCE.governance.regulatoryExpectation,
    pattern: 'Governance',
    mitigation: FCA_ENHANCED_GUIDANCE.governance.actionableGuidance.join('; '),
  },
  'systems_controls': {
    quote: FCA_ENHANCED_GUIDANCE.systems_controls.regulatoryExpectation,
    pattern: 'Systems & Controls',
    mitigation: FCA_ENHANCED_GUIDANCE.systems_controls.actionableGuidance.join('; '),
  },
  'consumer_protection': {
    quote: FCA_ENHANCED_GUIDANCE.consumer_protection.regulatoryExpectation,
    pattern: 'Consumer Protection',
    mitigation: FCA_ENHANCED_GUIDANCE.consumer_protection.actionableGuidance.join('; '),
  },
  'business_plan': {
    quote: FCA_ENHANCED_GUIDANCE.business_plan.regulatoryExpectation,
    pattern: 'Business Plan',
    mitigation: FCA_ENHANCED_GUIDANCE.business_plan.actionableGuidance.join('; '),
  },
  'data_protection': {
    quote: FCA_ENHANCED_GUIDANCE.data_protection.regulatoryExpectation,
    pattern: 'Data Protection',
    mitigation: FCA_ENHANCED_GUIDANCE.data_protection.actionableGuidance.join('; '),
  },
};

// Section weights for calculating overall score
// Threshold sections have higher weights
const SECTION_WEIGHTS: Record<string, number> = {
  uk_presence: 1.0,           // Threshold: COND 2.3
  effective_supervision: 1.0, // Threshold: COND 2.4
  senior_management: 0.95,    // Threshold: COND 2.5
  aml_framework: 0.95,        // Threshold: MLR 2017
  capital_resources: 0.90,    // Threshold: COND 2.4
  safeguarding: 0.90,         // Threshold: PSRs 2017
  business_plan: 0.85,        // Threshold: COND 2.5
  governance: 0.80,
  systems_controls: 0.75,
  consumer_protection: 0.70,
  data_protection: 0.65,
};

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// Exported Types and Interfaces
// ============================================================================

/** Valid types for profile response values */
export type ProfileResponseValue = string | boolean | number | string[] | null | undefined;

/** Insight linking a user's answer to strengthening guidance */
export interface AnswerLinkedInsight {
  questionId: string;
  questionPrompt: string;
  userAnswer: ProfileResponseValue;
  strengtheningSuggestion: string;
}

export interface EnhancedRiskArea {
  area: string;
  sectionKey: string;
  score: number;
  supportiveMessage: string;
  regulatoryExpectation: string;
  caseReference?: {
    caseName: string;
    thematicReview?: string;
    educationalContext: string;
  };
  linkedAnswers: AnswerLinkedInsight[];
  actionItems: string[];
}

// Legacy interface for backwards compatibility
export interface RiskArea {
  area: string;
  score: number;
  fcaPattern: string;
  quote: string;
  mitigation: string;
}

export interface PredictiveScore {
  approvalLikelihood: number;
  riskLevel: RiskLevel;
  topRisks: RiskArea[];
  enhancedRisks: EnhancedRiskArea[];
  sectionScores: Record<string, number>;
  recommendations: string[];
}

// Question to section mapping for profile questions
const QUESTION_SECTION_MAP: Record<string, string> = {
  // UK Presence
  'uk_office_address': 'uk_presence',
  'uk_directors': 'uk_presence',
  'uk_decision_making': 'uk_presence',
  'registered_office': 'uk_presence',

  // Senior Management
  'smf_experience': 'senior_management',
  'smf_qualifications': 'senior_management',
  'smf_time_commitment': 'senior_management',
  'smf_fitness_propriety': 'senior_management',

  // AML Framework
  'mlro_appointed': 'aml_framework',
  'aml_risk_assessment': 'aml_framework',
  'cdd_procedures': 'aml_framework',
  'transaction_monitoring': 'aml_framework',

  // Capital Resources
  'capital_calculation': 'capital_resources',
  'financial_projections': 'capital_resources',
  'wind_down_plan': 'capital_resources',
  'capital_buffer': 'capital_resources',

  // Governance
  'board_structure': 'governance',
  'committee_structure': 'governance',
  'meeting_cadence': 'governance',
  'reporting_lines': 'governance',

  // Systems & Controls
  'it_systems': 'systems_controls',
  'access_controls': 'systems_controls',
  'bcp_drp': 'systems_controls',
  'change_management': 'systems_controls',

  // Consumer Protection
  'fair_value_assessment': 'consumer_protection',
  'vulnerable_customers': 'consumer_protection',
  'complaints_handling': 'consumer_protection',
  'product_governance': 'consumer_protection',

  // Business Plan
  'business_model': 'business_plan',
  'revenue_model': 'business_plan',
  'target_market': 'business_plan',
  'competitive_position': 'business_plan',

  // Business Plan Profile - Scope & Geography
  'core-geography': 'uk_presence',
  'core-jurisdiction': 'uk_presence',

  // Business Plan Profile - Governance
  'gov-board-composition': 'governance',
  'gov-committee-structure': 'governance',
  'gov-meeting-frequency': 'governance',

  // Business Plan Profile - Capital & Financials
  'pay-capital-method': 'capital_resources',
  'pay-monthly-opex': 'capital_resources',
  'pay-volume': 'capital_resources',
  'pay-headcount': 'business_plan',

  // Business Plan Profile - Operations
  'pay-services': 'business_plan',
  'pay-target-market': 'business_plan',
  'pay-client-segments': 'consumer_protection',

  // Business Plan Profile - AML/Compliance
  'pay-aml-approach': 'aml_framework',
  'pay-kyc-provider': 'aml_framework',
  'pay-transaction-monitoring': 'aml_framework',

  // Business Plan Profile - Systems
  'pay-tech-stack': 'systems_controls',
  'pay-outsourcing': 'systems_controls',
};

// ============================================================================
// Main Scoring Functions
// ============================================================================

/**
 * Calculate predictive score from profile responses
 * @param responses - User's profile responses keyed by question ID
 * @param _permissionCode - Reserved for future permission-specific scoring adjustments
 * @returns Predictive score with approval likelihood, risks, and recommendations
 */
export function calculatePredictiveScore(
  responses: Record<string, unknown>,
  _permissionCode?: string // TODO: Implement permission-specific scoring (e.g., EMI vs PI thresholds)
): PredictiveScore {
  // Handle empty responses - return insufficient data state
  if (Object.keys(responses).length === 0) {
    return {
      approvalLikelihood: 0,
      riskLevel: "critical",
      topRisks: [],
      enhancedRisks: [],
      sectionScores: {},
      recommendations: [
        "Please complete the readiness assessment to receive personalised guidance on strengthening your application.",
      ],
    };
  }

  // Calculate section scores based on responses
  const sectionScores: Record<string, { total: number; count: number }> = {};

  for (const [questionId, value] of Object.entries(responses)) {
    const section = QUESTION_SECTION_MAP[questionId] || inferSection(questionId);
    if (!section) continue;

    if (!sectionScores[section]) {
      sectionScores[section] = { total: 0, count: 0 };
    }

    // Score based on response quality
    const score = scoreResponse(value);
    sectionScores[section].total += score;
    sectionScores[section].count += 1;
  }

  // Convert to percentage scores using helper function
  const finalSectionScores: Record<string, number> = {};
  for (const [section, data] of Object.entries(sectionScores)) {
    finalSectionScores[section] = data.count > 0
      ? calculateSectionPercentage(data.total, data.count)
      : DEFAULT_UNANSWERED_SECTION_SCORE;
  }

  // Add default scores for missing critical sections
  for (const section of Object.keys(SECTION_WEIGHTS)) {
    if (!finalSectionScores[section]) {
      finalSectionScores[section] = DEFAULT_MISSING_SECTION_SCORE;
    }
  }

  // Calculate weighted overall score
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [section, score] of Object.entries(finalSectionScores)) {
    const weight = SECTION_WEIGHTS[section] || 0.5;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const approvalLikelihood = totalWeight > 0
    ? Math.round(weightedSum / totalWeight)
    : 50;

  // Determine risk level
  const riskLevel = determineRiskLevel(approvalLikelihood);

  // Identify top risks (legacy format)
  const topRisks = identifyTopRisks(finalSectionScores);

  // Identify enhanced risks with supportive framing
  const enhancedRisks = identifyEnhancedRisks(finalSectionScores, responses);

  // Generate recommendations
  const recommendations = generateRecommendations(finalSectionScores, topRisks);

  return {
    approvalLikelihood,
    riskLevel,
    topRisks,
    enhancedRisks,
    sectionScores: finalSectionScores,
    recommendations,
  };
}

// ============================================================================
// Scoring Helper Functions
// ============================================================================

/**
 * Calculate section percentage from total score and count
 * @param total - Sum of individual answer scores
 * @param count - Number of answers in section
 * @returns Percentage score (0-100)
 */
function calculateSectionPercentage(total: number, count: number): number {
  return Math.round((total / (count * MAX_ANSWER_SCORE)) * 100);
}

/**
 * Score a response value (0-10 scale)
 * @param value - The response value to score
 * @returns Numeric score from 0-10
 */
function scoreResponse(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return ANSWER_SCORES.EMPTY;
  }

  // Boolean responses
  if (typeof value === "boolean") {
    return value ? ANSWER_SCORES.GOOD : ANSWER_SCORES.BOOLEAN_FALSE;
  }

  // String responses - score based on length/completeness
  if (typeof value === "string") {
    const len = value.trim().length;
    if (len === 0) return ANSWER_SCORES.EMPTY;
    if (len < 20) return ANSWER_SCORES.MINIMAL_TEXT;
    if (len < 100) return ANSWER_SCORES.PARTIAL_TEXT;
    if (len < 300) return ANSWER_SCORES.GOOD;
    return ANSWER_SCORES.EXCELLENT;
  }

  // Number responses
  if (typeof value === "number") {
    return Math.min(MAX_ANSWER_SCORE, Math.max(0, value * 3));
  }

  // Array responses
  if (Array.isArray(value)) {
    if (value.length === 0) return ANSWER_SCORES.EMPTY_ARRAY;
    if (value.length < 3) return ANSWER_SCORES.PARTIAL_ARRAY;
    return ANSWER_SCORES.FULL_ARRAY;
  }

  return ANSWER_SCORES.DEFAULT_OBJECT;
}

/**
 * Infer section from question ID
 */
function inferSection(questionId: string): string | null {
  const id = questionId.toLowerCase();

  // Business Plan Profile question patterns (pay-, core-, gov- prefixes)
  if (id.includes('pay-') || id.includes('core-') || id.includes('gov-')) {
    if (id.includes('capital') || id.includes('opex') || id.includes('volume')) return 'capital_resources';
    if (id.includes('aml') || id.includes('kyc') || id.includes('monitoring')) return 'aml_framework';
    if (id.includes('gov') || id.includes('board') || id.includes('committee')) return 'governance';
    if (id.includes('geography') || id.includes('jurisdiction')) return 'uk_presence';
    if (id.includes('tech') || id.includes('outsourc')) return 'systems_controls';
    if (id.includes('client') || id.includes('customer')) return 'consumer_protection';
    return 'business_plan'; // Default for other pay- questions
  }

  if (id.includes('uk') || id.includes('presence') || id.includes('office')) return 'uk_presence';
  if (id.includes('smf') || id.includes('senior') || id.includes('management')) return 'senior_management';
  if (id.includes('aml') || id.includes('mlro') || id.includes('money_laundering')) return 'aml_framework';
  if (id.includes('capital') || id.includes('financial') || id.includes('resource')) return 'capital_resources';
  if (id.includes('govern') || id.includes('board') || id.includes('committee')) return 'governance';
  if (id.includes('system') || id.includes('control') || id.includes('it_')) return 'systems_controls';
  if (id.includes('consumer') || id.includes('customer') || id.includes('complaint')) return 'consumer_protection';
  if (id.includes('business') || id.includes('model') || id.includes('plan')) return 'business_plan';

  return null;
}

/**
 * Determine risk level from approval likelihood
 */
function determineRiskLevel(likelihood: number): RiskLevel {
  if (likelihood >= 75) return 'low';
  if (likelihood >= 50) return 'medium';
  if (likelihood >= 25) return 'high';
  return 'critical';
}

/**
 * Identify top risk areas (legacy format)
 * @param sectionScores - Map of section keys to scores
 * @returns Array of risk areas sorted by severity
 */
function identifyTopRisks(sectionScores: Record<string, number>): RiskArea[] {
  const risks: RiskArea[] = [];

  // Sort sections by score (lowest first), filtering those below developing threshold
  const sortedSections = Object.entries(sectionScores)
    .filter(([, score]) => score < SCORE_THRESHOLDS.DEVELOPING)
    .sort(([, a], [, b]) => a - b);

  for (const [section, score] of sortedSections.slice(0, 5)) {
    const fcaData = FCA_DECISION_QUOTES[section];

    risks.push({
      area: formatSectionName(section),
      score,
      fcaPattern: fcaData?.pattern || `${formatSectionName(section)} Risk`,
      quote: fcaData?.quote || `The FCA requires adequate arrangements for ${formatSectionName(section).toLowerCase()}.`,
      mitigation: fcaData?.mitigation || `Review and strengthen your ${formatSectionName(section).toLowerCase()} documentation.`,
    });
  }

  return risks;
}

/**
 * Get supportive message based on score band
 * @param section - The section key
 * @param score - The section score (0-100)
 * @returns Supportive message appropriate for the score level
 */
function getSupportiveMessage(section: string, score: number): string {
  const guidance = FCA_ENHANCED_GUIDANCE[section];
  if (!guidance) {
    if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) {
      return "This area needs strengthening. We will help you build the evidence needed.";
    }
    if (score < SCORE_THRESHOLDS.DEVELOPING) {
      return "You have a foundation here. Let's strengthen the documentation.";
    }
    return "This area is progressing well.";
  }

  if (score < SCORE_THRESHOLDS.NEEDS_FOCUS) return guidance.strengthMessages.low;
  if (score < SCORE_THRESHOLDS.DEVELOPING) return guidance.strengthMessages.medium;
  return guidance.strengthMessages.high;
}

/**
 * Question prompts for answer linking
 */
const QUESTION_PROMPTS: Record<string, string> = {
  // UK Presence
  'uk_office_address': 'Do you have a permanent UK office address?',
  'uk_directors': 'How many UK-resident directors do you have?',
  'uk_decision_making': 'Are key decisions made in the UK?',
  'registered_office': 'Is your registered office in the UK?',
  // Senior Management
  'smf_experience': 'Do your SMF holders have relevant sector experience?',
  'smf_qualifications': 'Do your SMF holders have necessary qualifications?',
  'smf_time_commitment': 'Have you documented SMF time commitments?',
  'smf_fitness_propriety': 'Have you assessed fitness and propriety?',
  // AML Framework
  'mlro_appointed': 'Have you appointed an MLRO?',
  'aml_risk_assessment': 'Have you completed a business-wide risk assessment?',
  'cdd_procedures': 'Do you have documented CDD procedures?',
  'transaction_monitoring': 'Do you have transaction monitoring in place?',
  // Capital Resources
  'capital_calculation': 'Have you calculated your regulatory capital requirements?',
  'financial_projections': 'Do you have 3-year financial projections?',
  'wind_down_plan': 'Have you prepared a wind-down plan?',
  'capital_buffer': 'Do you have an adequate capital buffer?',
  // Governance
  'board_structure': 'Do you have a clear board structure?',
  'committee_structure': 'Have you established committee structures?',
  'meeting_cadence': 'Do you have regular meeting schedules?',
  'reporting_lines': 'Are reporting lines clearly defined?',
  // Systems & Controls
  'it_systems': 'Do you have documented IT systems?',
  'access_controls': 'Do you have access management controls?',
  'bcp_drp': 'Do you have business continuity and DR plans?',
  'change_management': 'Do you have change management procedures?',
  // Consumer Protection
  'fair_value_assessment': 'Have you completed fair value assessments?',
  'vulnerable_customers': 'Do you have vulnerable customer policies?',
  'complaints_handling': 'Do you have complaints handling procedures?',
  'product_governance': 'Do you have product governance arrangements?',
  // Business Plan
  'business_model': 'Is your business model documented?',
  'revenue_model': 'Is your revenue model clearly defined?',
  'target_market': 'Have you defined your target market?',
  'competitive_position': 'Have you analysed your competitive position?',
};

/**
 * Strengthening suggestions for specific question/answer combinations
 */
const STRENGTHENING_SUGGESTIONS: Record<string, Record<string, string>> = {
  'mlro_appointed': {
    'false': 'Appointing a qualified MLRO with dedicated time allocation will strengthen your AML framework documentation.',
    'no': 'Appointing a qualified MLRO with dedicated time allocation will strengthen your AML framework documentation.',
    'default': 'Ensure your MLRO has documented qualifications and sufficient time commitment.',
  },
  'uk_directors': {
    '0': 'Having at least 2 UK-resident directors demonstrates genuine UK presence and oversight.',
    '1': 'Adding another UK-resident director will strengthen your mind and management arrangements.',
    'default': 'Document the time commitments and responsibilities of your UK directors.',
  },
  'aml_risk_assessment': {
    'false': 'A documented business-wide risk assessment is essential for demonstrating your AML controls.',
    'no': 'A documented business-wide risk assessment is essential for demonstrating your AML controls.',
    'default': 'Keep your risk assessment up to date and ensure it covers all relevant risks.',
  },
  'wind_down_plan': {
    'false': 'Preparing a credible wind-down plan demonstrates financial responsibility and planning.',
    'no': 'Preparing a credible wind-down plan demonstrates financial responsibility and planning.',
    'default': 'Ensure your wind-down plan includes realistic timelines and cost estimates.',
  },
  'smf_time_commitment': {
    'false': 'Documenting SMF time commitments shows the FCA your leadership is sufficiently dedicated.',
    'no': 'Documenting SMF time commitments shows the FCA your leadership is sufficiently dedicated.',
    'default': 'Ensure documented time commitments align with the complexity of your business.',
  },
};

/**
 * Get strengthening suggestion for a question/answer
 */
function getStrengtheningSuggestion(questionId: string, value: unknown): string {
  const suggestions = STRENGTHENING_SUGGESTIONS[questionId];
  if (!suggestions) {
    return 'Strengthening this area will improve your application.';
  }

  const valueStr = String(value).toLowerCase();
  return suggestions[valueStr] || suggestions['default'] || 'Strengthening this area will improve your application.';
}

/**
 * Link user answers to risk area for contextual guidance
 * @param sectionKey - The section key to find answers for
 * @param responses - User's profile responses
 * @returns Array of insights linking answers to strengthening suggestions
 */
export function linkAnswersToRiskArea(
  sectionKey: string,
  responses: Record<string, unknown>
): AnswerLinkedInsight[] {
  const linkedInsights: AnswerLinkedInsight[] = [];

  // Find questions that belong to this section
  for (const [questionId, section] of Object.entries(QUESTION_SECTION_MAP)) {
    if (section !== sectionKey) continue;

    const userAnswer = responses[questionId];
    if (userAnswer === undefined) continue;

    // Score the answer to determine if it needs strengthening
    const answerScore = scoreResponse(userAnswer);
    if (answerScore >= ANSWER_SCORES.GOOD) continue; // Skip well-answered questions

    linkedInsights.push({
      questionId,
      questionPrompt: QUESTION_PROMPTS[questionId] || questionId.replace(/_/g, " "),
      userAnswer: userAnswer as ProfileResponseValue,
      strengtheningSuggestion: getStrengtheningSuggestion(questionId, userAnswer),
    });
  }

  return linkedInsights;
}

/**
 * Identify enhanced risk areas with supportive framing
 * @param sectionScores - Map of section keys to scores
 * @param responses - User's profile responses
 * @returns Array of enhanced risk areas with linked answers and guidance
 */
function identifyEnhancedRisks(
  sectionScores: Record<string, number>,
  responses: Record<string, unknown>
): EnhancedRiskArea[] {
  const risks: EnhancedRiskArea[] = [];

  // Sort sections by score (lowest first), filtering those below strong threshold
  const sortedSections = Object.entries(sectionScores)
    .filter(([, score]) => score < SCORE_THRESHOLDS.STRONG)
    .sort(([, a], [, b]) => a - b);

  for (const [section, score] of sortedSections.slice(0, 5)) {
    const guidance = FCA_ENHANCED_GUIDANCE[section];
    const linkedAnswers = linkAnswersToRiskArea(section, responses);

    risks.push({
      area: guidance?.areaLabel || formatSectionName(section),
      sectionKey: section,
      score,
      supportiveMessage: getSupportiveMessage(section, score),
      regulatoryExpectation: guidance?.regulatoryExpectation || `The FCA expects adequate arrangements for ${formatSectionName(section).toLowerCase()}.`,
      caseReference: guidance?.caseReference,
      linkedAnswers,
      actionItems: guidance?.actionableGuidance || [
        `We will strengthen your ${formatSectionName(section).toLowerCase()} documentation together.`,
      ],
    });
  }

  return risks;
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendations(
  sectionScores: Record<string, number>,
  topRisks: RiskArea[]
): string[] {
  const recommendations: string[] = [];

  // Add specific recommendations for low-scoring sections
  for (const risk of topRisks.slice(0, 3)) {
    recommendations.push(risk.mitigation);
  }

  // Add general recommendations if needed
  const overallAvg = Object.values(sectionScores).reduce((a, b) => a + b, 0) / Object.values(sectionScores).length;

  if (overallAvg < 50) {
    recommendations.push('Consider engaging professional regulatory support to strengthen your application before submission.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue documenting your regulatory arrangements and maintain evidence of compliance readiness.');
  }

  return recommendations;
}

/**
 * Format section name for display
 */
function formatSectionName(section: string): string {
  const names: Record<string, string> = {
    uk_presence: 'UK Presence',
    senior_management: 'Senior Management',
    aml_framework: 'AML Framework',
    capital_resources: 'Capital & Resources',
    governance: 'Governance',
    systems_controls: 'Systems & Controls',
    consumer_protection: 'Consumer Protection',
    business_plan: 'Business Plan',
  };

  return names[section] || section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export { FCA_ENHANCED_GUIDANCE };

// ============================================================================
// Question Bank Integration
// ============================================================================

import {
  QUESTION_TO_SECTION_MAP,
  THRESHOLD_QUESTIONS,
  SECTION_METADATA,
  isThresholdSection,
} from "./question-section-mapping";

import type { QuestionDefinition } from "@/app/(dashboard)/authorization-pack/lib/questionBank";
import type { QuestionResponse } from "@/lib/assessment-question-bank";

/**
 * Calculate section scores from question bank responses
 * @param questionResponses - Map of question ID to response with score
 * @param questionDefinitions - Array of question definitions with weights
 * @returns Map of section keys to percentage scores
 */
function calculateSectionScoresFromQuestionBank(
  questionResponses: Record<string, QuestionResponse>,
  questionDefinitions: QuestionDefinition[]
): Record<string, number> {
  const sectionScores: Record<string, { earned: number; possible: number; count: number }> = {};

  // Build a map of question ID to definition for quick lookup
  const questionMap = new Map<string, QuestionDefinition>();
  for (const question of questionDefinitions) {
    questionMap.set(question.id, question);
  }

  // Process each question response
  for (const [questionId, response] of Object.entries(questionResponses)) {
    const section = QUESTION_TO_SECTION_MAP[questionId];
    if (!section) continue;

    const question = questionMap.get(questionId);
    if (!question) continue;

    // Initialize section if needed
    if (!sectionScores[section]) {
      sectionScores[section] = { earned: 0, possible: 0, count: 0 };
    }

    // Calculate max possible score for this question
    let maxScore = 3; // Default max for scale questions
    if (question.options && question.options.length > 0) {
      maxScore = question.options.reduce((max, opt) => {
        const optScore = typeof opt.value === "number" ? opt.value : (opt.score ?? 0);
        return Math.max(max, optScore);
      }, 0);
    }

    // Get earned score from response
    let earnedScore = 0;
    if (response.score !== undefined) {
      earnedScore = response.score;
    } else if (typeof response.value === "number") {
      earnedScore = response.value;
    } else if (response.value !== null && response.value !== undefined && response.value !== "") {
      // Non-empty response gets at least partial credit
      earnedScore = maxScore * 0.5;
    }

    // Apply weight
    const weight = question.weight ?? 1;
    sectionScores[section].earned += earnedScore * weight;
    sectionScores[section].possible += maxScore * weight;
    sectionScores[section].count += 1;
  }

  // Convert to percentage scores
  const finalScores: Record<string, number> = {};
  for (const [section, data] of Object.entries(sectionScores)) {
    if (data.possible > 0) {
      finalScores[section] = Math.round((data.earned / data.possible) * 100);
    } else {
      finalScores[section] = DEFAULT_UNANSWERED_SECTION_SCORE;
    }
  }

  return finalScores;
}

/**
 * Identify hard gate failures from question responses
 * @param questionResponses - Map of question ID to response
 * @param questionDefinitions - Array of question definitions
 * @returns Array of failed hard gate questions
 */
export function identifyHardGateFailures(
  questionResponses: Record<string, QuestionResponse>,
  questionDefinitions: QuestionDefinition[]
): Array<{
  questionId: string;
  question: string;
  score: number;
  threshold: number;
  message: string;
  fcaReference?: string;
}> {
  const failures: Array<{
    questionId: string;
    question: string;
    score: number;
    threshold: number;
    message: string;
    fcaReference?: string;
  }> = [];

  for (const question of questionDefinitions) {
    if (!question.hardGate) continue;

    const response = questionResponses[question.id];
    if (!response) continue;

    // Fix: Check response.score first (set by scoring logic), then fall back to numeric value
    let score = response.score ?? 0;
    if (score === 0 && typeof response.value === "number") {
      score = response.value;
    }

    // Warn if hard gate question is missing explicit threshold
    if (question.hardGateThreshold === undefined) {
      console.warn(
        `[FCA Scorer] Hard gate question "${question.id}" missing hardGateThreshold, using default: ${DEFAULT_HARD_GATE_THRESHOLD}`
      );
    }
    const threshold = question.hardGateThreshold ?? DEFAULT_HARD_GATE_THRESHOLD;

    if (score < threshold) {
      failures.push({
        questionId: question.id,
        question: question.question ?? question.title ?? question.id,
        score,
        threshold,
        message: question.hardGateMessage ?? "This is a threshold condition that must be met.",
        fcaReference: question.fcaReference,
      });
    }
  }

  return failures;
}

/**
 * Calculate predictive score from question bank responses
 * This function bridges the question bank to the predictive scorer
 *
 * @param questionResponses - Map of question ID to response with value and optional score
 * @param questionDefinitions - Array of question definitions from question bank
 * @param permissionCode - Optional permission code for permission-specific adjustments
 * @returns PredictiveScore with approval likelihood, risks, and recommendations
 */
export function calculateFromQuestionBank(
  questionResponses: Record<string, QuestionResponse>,
  questionDefinitions: QuestionDefinition[],
  permissionCode?: string
): PredictiveScore {
  // Handle empty responses
  if (Object.keys(questionResponses).length === 0) {
    return {
      approvalLikelihood: 0,
      riskLevel: "critical",
      topRisks: [],
      enhancedRisks: [],
      sectionScores: {},
      recommendations: [
        "Please complete the readiness assessment to receive personalised guidance on strengthening your application.",
      ],
    };
  }

  // Calculate section scores from question bank responses
  const questionBankScores = calculateSectionScoresFromQuestionBank(
    questionResponses,
    questionDefinitions
  );

  // Add default scores for missing sections
  for (const section of Object.keys(SECTION_WEIGHTS)) {
    if (!questionBankScores[section]) {
      questionBankScores[section] = DEFAULT_MISSING_SECTION_SCORE;
    }
  }

  // Check for hard gate failures
  const hardGateFailures = identifyHardGateFailures(questionResponses, questionDefinitions);
  const hasHardGateFailure = hardGateFailures.length > 0;

  // Calculate weighted overall score
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [section, score] of Object.entries(questionBankScores)) {
    const weight = SECTION_WEIGHTS[section] || 0.5;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  let approvalLikelihood = totalWeight > 0
    ? Math.round(weightedSum / totalWeight)
    : 50;

  // Cap approval likelihood if there are hard gate failures
  if (hasHardGateFailure) {
    approvalLikelihood = Math.min(approvalLikelihood, 25);
  }

  // Determine risk level
  const riskLevel = determineRiskLevel(approvalLikelihood);

  // Convert question responses to format expected by risk identification
  const profileResponses: Record<string, unknown> = {};
  for (const [questionId, response] of Object.entries(questionResponses)) {
    profileResponses[questionId] = response.value;
  }

  // Identify top risks (legacy format)
  const topRisks = identifyTopRisks(questionBankScores);

  // Identify enhanced risks with supportive framing
  const enhancedRisks = identifyEnhancedRisksFromQuestionBank(
    questionBankScores,
    questionResponses,
    questionDefinitions
  );

  // Generate recommendations
  const recommendations = generateQuestionBankRecommendations(
    questionBankScores,
    topRisks,
    hardGateFailures
  );

  return {
    approvalLikelihood,
    riskLevel,
    topRisks,
    enhancedRisks,
    sectionScores: questionBankScores,
    recommendations,
  };
}

/**
 * Identify enhanced risks from question bank data
 */
function identifyEnhancedRisksFromQuestionBank(
  sectionScores: Record<string, number>,
  questionResponses: Record<string, QuestionResponse>,
  questionDefinitions: QuestionDefinition[]
): EnhancedRiskArea[] {
  const risks: EnhancedRiskArea[] = [];

  // Sort sections by score (lowest first), filtering those below strong threshold
  const sortedSections = Object.entries(sectionScores)
    .filter(([, score]) => score < SCORE_THRESHOLDS.STRONG)
    .sort(([, a], [, b]) => a - b);

  for (const [section, score] of sortedSections.slice(0, 5)) {
    const guidance = FCA_ENHANCED_GUIDANCE[section];
    const metadata = SECTION_METADATA[section];

    // Build linked answers from question bank responses
    const linkedAnswers: AnswerLinkedInsight[] = [];
    for (const [questionId, sectionKey] of Object.entries(QUESTION_TO_SECTION_MAP)) {
      if (sectionKey !== section) continue;

      const response = questionResponses[questionId];
      if (!response) continue;

      const question = questionDefinitions.find(q => q.id === questionId);
      if (!question) continue;

      // Check if answer needs strengthening
      const responseScore = typeof response.value === "number" ? response.value : (response.score ?? 0);
      const maxScore = question.options?.reduce((max, opt) => {
        const optScore = typeof opt.value === "number" ? opt.value : (opt.score ?? 0);
        return Math.max(max, optScore);
      }, 3) ?? 3;

      if (responseScore < maxScore * ANSWER_NEEDS_STRENGTHENING_RATIO) {
        linkedAnswers.push({
          questionId,
          questionPrompt: question.question ?? question.title ?? questionId,
          userAnswer: response.value as ProfileResponseValue,
          strengtheningSuggestion: question.helpText ?? `Strengthen your response to improve your ${section} score.`,
        });
      }
    }

    risks.push({
      area: guidance?.areaLabel || metadata?.label || formatSectionName(section),
      sectionKey: section,
      score,
      supportiveMessage: getSupportiveMessage(section, score),
      regulatoryExpectation: guidance?.regulatoryExpectation || `The FCA expects adequate arrangements for ${formatSectionName(section).toLowerCase()}.`,
      caseReference: guidance?.caseReference,
      linkedAnswers: linkedAnswers.slice(0, 3), // Limit to 3 most relevant
      actionItems: guidance?.actionableGuidance || [
        `We will strengthen your ${formatSectionName(section).toLowerCase()} documentation together.`,
      ],
    });
  }

  return risks;
}

/**
 * Generate recommendations from question bank scores
 */
function generateQuestionBankRecommendations(
  sectionScores: Record<string, number>,
  topRisks: RiskArea[],
  hardGateFailures: Array<{ questionId: string; message: string }>
): string[] {
  const recommendations: string[] = [];

  // Add hard gate failure recommendations first (most critical)
  for (const failure of hardGateFailures.slice(0, 2)) {
    recommendations.push(failure.message);
  }

  // Add recommendations for low-scoring threshold sections
  for (const [section, score] of Object.entries(sectionScores)) {
    if (score < SCORE_THRESHOLDS.NEEDS_FOCUS && isThresholdSection(section)) {
      const guidance = FCA_ENHANCED_GUIDANCE[section];
      if (guidance && guidance.actionableGuidance.length > 0) {
        recommendations.push(guidance.actionableGuidance[0]);
      }
    }
  }

  // Add general recommendations from top risks
  for (const risk of topRisks.slice(0, 2)) {
    if (!recommendations.includes(risk.mitigation)) {
      recommendations.push(risk.mitigation);
    }
  }

  // Limit to 5 recommendations
  if (recommendations.length === 0) {
    recommendations.push('Continue documenting your regulatory arrangements and maintain evidence of compliance readiness.');
  }

  return recommendations.slice(0, 5);
}

const predictiveScorer = {
  calculatePredictiveScore,
  calculateFromQuestionBank,
  identifyHardGateFailures,
  linkAnswersToRiskArea,
  FCA_DECISION_QUOTES,
  FCA_ENHANCED_GUIDANCE,
};

export default predictiveScorer;
