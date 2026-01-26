/**
 * FCA Intelligence Platform Types
 * Authorization Pack 2.0 - Predictive Regulatory Intelligence
 */

// ============================================
// Decision Letter Types
// ============================================

export interface FCADecisionLetter {
  id: string;
  frn?: string;
  firmName: string;
  noticeType: 'decision' | 'final' | 'warning';
  decisionDate?: Date;
  decisionOutcome: 'refused' | 'cancelled' | 'withdrawn';
  pdfUrl?: string;
  extractedText?: string;

  // Structured failure reasons
  failureCategories: FailureCategory[];
  thresholdConditionsViolated: string[];
  seniorManagementIssues: string[];
  resourceDeficiencies: string[];
  governanceWeaknesses: string[];
  amlFindings: string[];

  // Regulatory references cited
  regulatoryCitations: string[];

  // Metadata
  permissionType?: string;
  firmType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FailureCategory =
  | 'threshold_conditions'
  | 'aml_deficiencies'
  | 'senior_management'
  | 'resource_inadequacy'
  | 'governance_weaknesses'
  | 'uk_presence'
  | 'consumer_protection'
  | 'systems_controls'
  | 'financial_crime'
  | 'capital_inadequacy'
  | 'unready_unorganized';

// ============================================
// Failure Pattern Types
// ============================================

export interface FailurePattern {
  id: string;
  patternName: string;
  patternCode: string;
  description: string;
  category: FailurePatternCategory;

  // Pattern matching
  frequencyScore: number; // 0-100, how often this appears
  questionIds: string[];
  regulatoryRefs: string[];

  // Evidence and guidance
  exampleQuotes: string[];
  mitigationGuidance: string;
  redFlags: string[];

  // Weights
  severityWeight: number; // 1-10

  createdAt: Date;
  updatedAt: Date;
}

export type FailurePatternCategory =
  | 'senior_management'
  | 'aml'
  | 'governance'
  | 'resources'
  | 'systems'
  | 'capital'
  | 'uk_presence'
  | 'consumer_protection'
  | 'threshold_conditions';

// ============================================
// FCA Handbook Types
// ============================================

export interface HandbookParagraph {
  id: string;
  module: HandbookModule;
  chapter?: string;
  section?: string;
  paragraphNumber?: string;
  title?: string;
  content: string;
  contentEmbedding?: number[];
  effectiveDate?: Date;
  lastUpdated?: Date;
  url?: string;
}

export type HandbookModule = 'PERG' | 'COND' | 'SUP' | 'SYSC' | 'COBS' | 'FEES' | 'CONC' | 'MCOB' | 'FIT' | 'DISP' | 'PRIN' | 'PROD';

export interface HandbookReference {
  module: HandbookModule;
  reference: string; // e.g., "PERG 15.3.1G"
  text: string;
  url?: string;
}

// ============================================
// Question & Guidance Types
// ============================================

export interface FCAGuidance {
  primarySource: HandbookReference;
  relatedSources?: HandbookReference[];
  decisionLetterExamples?: DecisionExample[];
  failurePatternWarning?: string;
}

export interface DecisionExample {
  firmName: string;
  date: Date;
  outcome: string;
  relevantQuote: string;
  lessonsLearned?: string;
}

export interface AuthPackQuestion {
  id: string;
  section: QuestionSection;
  prompt: string;
  helpText?: string;
  weight: number;
  options: AuthPackOption[];
  evidencePrompt?: string;
  conditionalOn?: string; // Question ID dependency
  permissionTypes?: string[]; // Only show for certain permissions

  // FCA Intelligence
  fcaGuidance?: FCAGuidance;
  relatedPatterns?: string[]; // Pattern codes
  hardGate?: boolean; // If failed, blocks progress
}

export type QuestionSection =
  | 'firm_profile'
  | 'uk_presence'
  | 'governance'
  | 'senior_management'
  | 'aml_framework'
  | 'capital_resources'
  | 'systems_controls'
  | 'consumer_protection'
  | 'business_plan'
  | 'permissions'
  | 'policies_procedures';

export interface AuthPackOption {
  value: string;
  label: string;
  score: number;
  narrative: string;
  isRedFlag?: boolean;
}

// ============================================
// Project Types
// ============================================

export interface AuthorizationPackProject {
  id: string;
  firmName: string;
  frn?: string;
  companiesHouseNumber?: string;
  primaryContactEmail: string;
  primaryContactName?: string;
  status: ProjectStatus;
  permissionTypes: string[];
  responses: Record<string, QuestionResponse>;
  overallScore?: number;
  sectionScores: Record<string, number>;
  approvalLikelihood?: number;
  riskLevel?: RiskLevel;
  failurePatternMatches: PatternMatch[];
  uploadedDocuments: UploadedDocument[];
  perimeterOpinionId?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  completedAt?: Date;
}

export type ProjectStatus =
  | 'draft'
  | 'in_progress'
  | 'review'
  | 'submitted'
  | 'approved'
  | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface QuestionResponse {
  questionId: string;
  section: QuestionSection;
  value: string;
  score: number;
  evidenceNotes?: string;
  evidenceDocuments?: string[];
  matchedPatterns?: string[];
  answeredAt: Date;
}

export interface UploadedDocument {
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

// ============================================
// Predictive Scoring Types
// ============================================

export interface PredictiveScore {
  overallLikelihood: number; // 0-100% likelihood of approval
  riskLevel: RiskLevel;
  riskAreas: RiskArea[];
  failurePatternMatches: PatternMatch[];
  regulatoryInsights: RegulatoryInsight[];
  benchmarkComparison?: BenchmarkComparison;
}

export interface RiskArea {
  area: string;
  score: number;
  benchmark?: number;
  gap?: number;
  status: 'above' | 'at' | 'below' | 'critical';
  recommendations: string[];
}

export interface PatternMatch {
  patternId: string;
  patternCode: string;
  patternName: string;
  matchStrength: number; // 0-100
  triggeredByQuestions: string[];
  fcaQuote?: string;
  mitigationSteps: string[];
  severityWeight: number;
}

export interface RegulatoryInsight {
  questionId: string;
  fcaGuidance: string;
  decisionLetterExample?: string;
  recommendation: string;
  regulatoryRef?: string;
}

export interface BenchmarkComparison {
  permissionType: string;
  firmSizeBand: string;
  sampleSize: number;
  comparisons: {
    area: string;
    yourScore: number;
    benchmarkScore: number;
    percentile?: number;
  }[];
}

// ============================================
// Benchmark Types
// ============================================

export interface AuthorizationBenchmark {
  id: string;
  permissionType: string;
  firmSizeBand: 'small' | 'medium' | 'large';
  avgGovernanceScore: number;
  avgAmlScore: number;
  avgCapitalScore: number;
  avgSystemsScore: number;
  avgSeniorManagementScore: number;
  avgOverallScore: number;
  avgApprovalLikelihood: number;
  avgCompletionWeeks: number;
  sampleSize: number;
  successfulApplications: number;
  periodStart?: Date;
  periodEnd?: Date;
}

// ============================================
// Regulatory Alert Types
// ============================================

export interface RegulatoryAlert {
  id: string;
  title: string;
  source: 'press_release' | 'policy_statement' | 'consultation' | 'dear_ceo';
  sourceUrl?: string;
  publishedDate?: Date;
  relevantPermissions: string[];
  impactAssessment: 'high' | 'medium' | 'low';
  affectedQuestions: string[];
  summary?: string;
  actionRequired?: string;
  fullContent?: string;
  processed: boolean;
  createdAt: Date;
}

// ============================================
// Opinion Document Types
// ============================================

export interface PerimeterOpinionDocument {
  id: string;
  projectId?: string;
  version: number;
  status: 'draft' | 'review' | 'final';

  // Content sections
  executiveSummary?: string;
  perimeterAnalysis?: string;
  permissionsAnalysis?: string;
  obligationsMapping?: string;
  riskAssessment?: string;
  recommendations?: string;

  // AI metadata
  aiModel?: string;
  generationContext?: Record<string, unknown>;

  // PDF
  pdfUrl?: string;
  pdfGeneratedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API Response Types
// ============================================

export interface PredictResponse {
  approvalLikelihood: number;
  riskLevel: RiskLevel;
  topRisks: {
    area: string;
    score: number;
    fcaPattern?: string;
    quote?: string;
    mitigation: string;
  }[];
  sectionScores: Record<string, number>;
  patternMatches: PatternMatch[];
  benchmarkComparison?: BenchmarkComparison;
  recommendations: string[];
}

export interface HandbookSearchResult {
  paragraphs: HandbookParagraph[];
  totalResults: number;
  query: string;
}
