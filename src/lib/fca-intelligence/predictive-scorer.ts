/**
 * Predictive Risk Scorer for FCA Authorization
 * Calculates approval likelihood based on profile responses and FCA failure patterns
 */

// FCA Decision quotes by area
const FCA_DECISION_QUOTES: Record<string, { quote: string; pattern: string; mitigation: string }> = {
  'uk_presence': {
    quote: 'The FCA was not satisfied that the firm\'s mind and management would be exercised from within the United Kingdom.',
    pattern: 'Insufficient UK Presence',
    mitigation: 'Ensure at least 2 UK-resident directors with day-to-day oversight, establish a permanent UK office address, and document that key decisions are made in the UK.',
  },
  'senior_management': {
    quote: 'The proposed SMF holders did not have the competence and capability, or sufficient time and commitment, to discharge their responsibilities.',
    pattern: 'Senior Management Competence',
    mitigation: 'Demonstrate relevant sector experience for all SMF holders, document time allocation commitments, and provide evidence of necessary qualifications.',
  },
  'aml_framework': {
    quote: 'The firm\'s anti-money laundering systems and controls were inadequate to identify and mitigate financial crime risks.',
    pattern: 'Inadequate AML Framework',
    mitigation: 'Complete a documented business-wide risk assessment, appoint a qualified MLRO with dedicated time, and implement CDD and ongoing monitoring procedures.',
  },
  'capital_resources': {
    quote: 'The firm failed to demonstrate adequate financial resources to carry on business and meet regulatory capital requirements.',
    pattern: 'Capital Inadequacy',
    mitigation: 'Calculate regulatory capital requirements accurately, demonstrate access to sufficient funds, and prepare a credible wind-down plan.',
  },
  'governance': {
    quote: 'The governance arrangements were insufficient to ensure effective oversight and accountability.',
    pattern: 'Weak Governance',
    mitigation: 'Establish clear board and committee structures with documented Terms of Reference, implement regular meeting cadence with minutes, and define reporting lines.',
  },
  'systems_controls': {
    quote: 'The firm did not have appropriate systems and controls in place to manage the risks to which it would be exposed.',
    pattern: 'Inadequate Systems & Controls',
    mitigation: 'Document key operational processes, implement IT security controls and access management, and develop business continuity and disaster recovery plans.',
  },
  'consumer_protection': {
    quote: 'The firm\'s arrangements for protecting consumers were inadequate given the nature of its proposed business.',
    pattern: 'Consumer Protection Weakness',
    mitigation: 'Implement fair value assessments for products, establish vulnerable customer policies, and create clear complaints handling procedures.',
  },
  'business_plan': {
    quote: 'The business model presented was not viable and the financial projections were unrealistic.',
    pattern: 'Unviable Business Plan',
    mitigation: 'Prepare realistic 3-year financial projections with clear assumptions, document revenue sources and key dependencies, and stress-test the model.',
  },
};

// Section weights for calculating overall score
const SECTION_WEIGHTS: Record<string, number> = {
  uk_presence: 1.0,
  senior_management: 0.95,
  aml_framework: 0.95,
  capital_resources: 0.90,
  governance: 0.85,
  systems_controls: 0.80,
  business_plan: 0.75,
  consumer_protection: 0.70,
};

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

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
};

/**
 * Calculate predictive score from profile responses
 */
export function calculatePredictiveScore(
  responses: Record<string, unknown>,
  permissionCode?: string
): PredictiveScore {
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

  // Convert to percentage scores
  const finalSectionScores: Record<string, number> = {};
  for (const [section, data] of Object.entries(sectionScores)) {
    finalSectionScores[section] = data.count > 0
      ? Math.round((data.total / (data.count * 10)) * 100)
      : 50; // Default score for unanswered sections
  }

  // Add default scores for missing critical sections
  for (const section of Object.keys(SECTION_WEIGHTS)) {
    if (!finalSectionScores[section]) {
      finalSectionScores[section] = 30; // Low score for missing sections
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

  // Identify top risks
  const topRisks = identifyTopRisks(finalSectionScores);

  // Generate recommendations
  const recommendations = generateRecommendations(finalSectionScores, topRisks);

  return {
    approvalLikelihood,
    riskLevel,
    topRisks,
    sectionScores: finalSectionScores,
    recommendations,
  };
}

/**
 * Score a response value (0-10 scale)
 */
function scoreResponse(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;

  // Boolean responses
  if (typeof value === 'boolean') return value ? 8 : 2;

  // String responses - score based on length/completeness
  if (typeof value === 'string') {
    const len = value.trim().length;
    if (len === 0) return 0;
    if (len < 20) return 4;
    if (len < 100) return 6;
    if (len < 300) return 8;
    return 10;
  }

  // Number responses
  if (typeof value === 'number') {
    return Math.min(10, Math.max(0, value * 3));
  }

  // Array responses
  if (Array.isArray(value)) {
    if (value.length === 0) return 2;
    if (value.length < 3) return 5;
    return 8;
  }

  return 5; // Default for objects
}

/**
 * Infer section from question ID
 */
function inferSection(questionId: string): string | null {
  const id = questionId.toLowerCase();

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
 * Identify top risk areas
 */
function identifyTopRisks(sectionScores: Record<string, number>): RiskArea[] {
  const risks: RiskArea[] = [];

  // Sort sections by score (lowest first)
  const sortedSections = Object.entries(sectionScores)
    .filter(([, score]) => score < 70)
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

export default {
  calculatePredictiveScore,
  FCA_DECISION_QUOTES,
};
