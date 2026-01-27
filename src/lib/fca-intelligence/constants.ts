/**
 * Shared constants for FCA Intelligence scoring
 * These constants are used across predictive-scorer.ts and UI components
 */

/** Score thresholds for categorizing readiness levels */
export const SCORE_THRESHOLDS = {
  /** Below this score: needs focus / critical attention */
  NEEDS_FOCUS: 40,
  /** Below this score: developing / medium attention */
  DEVELOPING: 70,
  /** Below this score: shown in risk areas (not yet strong) */
  STRONG: 80,
} as const;

/** Answer scoring values (0-10 scale) */
export const ANSWER_SCORES = {
  EMPTY: 0,
  BOOLEAN_FALSE: 2,
  MINIMAL_TEXT: 4,
  PARTIAL_TEXT: 6,
  GOOD: 8,
  EXCELLENT: 10,
  DEFAULT_OBJECT: 5,
  EMPTY_ARRAY: 2,
  PARTIAL_ARRAY: 5,
  FULL_ARRAY: 8,
} as const;

/** Maximum score per answer for percentage calculation */
export const MAX_ANSWER_SCORE = 10;

/** Default score for sections with no answers */
export const DEFAULT_MISSING_SECTION_SCORE = 30;

/** Default score for unanswered sections */
export const DEFAULT_UNANSWERED_SECTION_SCORE = 50;

/** Threshold below which an answer is considered needing strengthening */
export const ANSWER_NEEDS_STRENGTHENING_RATIO = 0.7;

/** Default hard gate threshold if not specified on a question */
export const DEFAULT_HARD_GATE_THRESHOLD = 1;
