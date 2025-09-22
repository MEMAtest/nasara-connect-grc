export const RISK_CATEGORIES = [
  "operational",
  "financial",
  "compliance",
  "strategic",
  "conduct",
  "prudential",
  "cyber",
  "reputational",
] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const RISK_STATUSES = [
  "open",
  "under_review",
  "mitigated",
  "archived",
] as const;

export type RiskStatus = (typeof RISK_STATUSES)[number];

export const RISK_VELOCITY = ["slow", "medium", "fast"] as const;
export type RiskVelocity = (typeof RISK_VELOCITY)[number];

export const RISK_REVIEW_FREQUENCIES = [
  "monthly",
  "quarterly",
  "semi-annually",
  "annually",
] as const;

export type RiskReviewFrequency = (typeof RISK_REVIEW_FREQUENCIES)[number];

export const RISK_SCORE_LABELS: Record<string, string> = {
  "1": "Very Low",
  "2": "Low",
  "3": "Moderate",
  "4": "High",
  "5": "Critical",
};

export const LIKELIHOOD_LABELS = [
  "Very Unlikely",
  "Unlikely",
  "Possible",
  "Likely",
  "Very Likely",
];

export const IMPACT_LABELS = [
  "Negligible",
  "Minor",
  "Moderate",
  "Major",
  "Severe",
];

export interface RiskKeyRiskIndicator {
  id: string;
  name: string;
  metric: string;
  threshold: {
    green: number;
    amber: number;
    red: number;
  };
  currentValue: number;
  direction?: "up" | "down" | "steady";
}

export interface RiskRecord {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: RiskCategory;
  subCategory?: string;
  likelihood: number;
  impact: number;
  residualLikelihood: number;
  residualImpact: number;
  velocity: RiskVelocity;
  riskOwner: string;
  businessUnit?: string;
  process?: string;
  controlCount?: number;
  controlEffectiveness?: number;
  status: RiskStatus;
  reviewFrequency: RiskReviewFrequency;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  regulatoryCategory?: string[];
  reportableToFCA?: boolean;
  consumerDutyRelevant?: boolean;
  keyRiskIndicators?: RiskKeyRiskIndicator[];
}

export interface RiskFiltersState {
  category: RiskCategory | "all";
  status: RiskStatus | "all";
  riskLevel: "all" | "low" | "medium" | "high";
  search: string;
}

export const DEFAULT_RISK_FILTERS: RiskFiltersState = {
  category: "all",
  status: "all",
  riskLevel: "all",
  search: "",
};
