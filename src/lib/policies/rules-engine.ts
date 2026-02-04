/**
 * Policy Creator - Rules Engine
 * Evaluates rule conditions and executes actions for dynamic clause selection
 */

import type {
  Rule,
  RuleCondition,
  RuleAction,
  RulesEngineResult,
  EvaluateRulesInput,
  FirmAttributes,
  Question,
  QuestionDependency,
  JsonValue,
} from './types';

type AnswersMap = Record<string, JsonValue | undefined>;
type QuestionWithDependencies = Pick<Question, 'depends_on'>;
type QuestionWithValidation = Pick<Question, 'code' | 'validation'>;
type QuestionForVisibility = Pick<Question, 'code' | 'depends_on'>;

// =====================================================
// CONDITION EVALUATOR
// =====================================================

/**
 * Evaluates a single rule condition against answers and firm attributes
 */
export function evaluateCondition(
  condition: RuleCondition,
  answers: AnswersMap,
  firmAttributes?: FirmAttributes
): boolean {
  // Handle logical operators first
  if (condition.all) {
    return condition.all.every((cond) => evaluateCondition(cond, answers, firmAttributes));
  }

  if (condition.any) {
    return condition.any.some((cond) => evaluateCondition(cond, answers, firmAttributes));
  }

  if (condition.not) {
    return !evaluateCondition(condition.not, answers, firmAttributes);
  }

  // Get the value to test (from answers or firm attributes)
  const questionCode = condition.q;
  if (!questionCode) {
    console.warn('Rule condition missing "q" (question code)');
    return false;
  }

  // Check both answers and firm attributes
  let value: JsonValue | undefined = answers[questionCode];
  if (value === undefined && firmAttributes) {
    value = firmAttributes[questionCode];
  }

  // If value is still undefined, condition fails
  if (value === undefined) {
    return false;
  }

  // Equality operators
  if ('eq' in condition) {
    return value === condition.eq;
  }

  if ('neq' in condition) {
    return value !== condition.neq;
  }

  // Array membership operators
  if ('in' in condition) {
    return Array.isArray(condition.in) && condition.in.includes(value);
  }

  if ('nin' in condition) {
    return Array.isArray(condition.nin) && !condition.nin.includes(value);
  }

  // Array includes operator (for multiselect answers)
  if ('includes' in condition) {
    if (!Array.isArray(value)) {
      return false;
    }
    return value.includes(condition.includes as JsonValue);
  }

  // Numeric comparison operators
  if ('gt' in condition && typeof condition.gt === 'number') {
    return typeof value === 'number' && value > condition.gt;
  }

  if ('lt' in condition && typeof condition.lt === 'number') {
    return typeof value === 'number' && value < condition.lt;
  }

  if ('gte' in condition && typeof condition.gte === 'number') {
    return typeof value === 'number' && value >= condition.gte;
  }

  if ('lte' in condition && typeof condition.lte === 'number') {
    return typeof value === 'number' && value <= condition.lte;
  }

  // No matching operator
  console.warn(`Unknown rule operator in condition:`, condition);
  return false;
}

// =====================================================
// ACTION EXECUTOR
// =====================================================

/**
 * Executes rule actions and accumulates results
 */
function executeAction(
  action: RuleAction,
  ruleName: string,
  result: RulesEngineResult
): void {
  // Include clauses
  if (action.include_clause_codes && Array.isArray(action.include_clause_codes)) {
    for (const code of action.include_clause_codes) {
      if (!result.included_clauses.includes(code)) {
        result.included_clauses.push(code);
      }
    }
  }

  // Exclude clauses
  if (action.exclude_clause_codes && Array.isArray(action.exclude_clause_codes)) {
    for (const code of action.exclude_clause_codes) {
      if (!result.excluded_clauses.includes(code)) {
        result.excluded_clauses.push(code);
      }
    }
  }

  // Suggest clauses
  if (action.suggest_clause_codes && Array.isArray(action.suggest_clause_codes)) {
    for (const code of action.suggest_clause_codes) {
      // Avoid duplicate suggestions
      const existing = result.suggested_clauses.find((s) => s.code === code);
      if (!existing) {
        result.suggested_clauses.push({
          code,
          reason: action.reason || `Suggested by rule: ${ruleName}`,
        });
      }
    }
  }

  // Set variables
  if (action.set_vars && typeof action.set_vars === 'object') {
    Object.assign(result.variables, action.set_vars);
  }
}

// =====================================================
// MAIN RULES ENGINE
// =====================================================

/**
 * Evaluates all rules for a policy and returns clause selections and variables
 */
export function evaluateRules(
  rules: Rule[],
  input: EvaluateRulesInput
): RulesEngineResult {
  const result: RulesEngineResult = {
    included_clauses: [],
    excluded_clauses: [],
    suggested_clauses: [],
    variables: {},
    rules_fired: [],
  };

  // Sort rules by priority (higher first)
  const sortedRules = [...rules]
    .filter((rule) => rule.is_active)
    .sort((a, b) => b.priority - a.priority);

  // Evaluate each rule
  for (const rule of sortedRules) {
    try {
      const conditionMet = evaluateCondition(
        rule.condition,
        input.answers,
        input.firm_attributes
      );

      // Log which rules fired
      result.rules_fired.push({
        rule_id: rule.id,
        rule_name: rule.name,
        condition_met: conditionMet,
      });

      // Execute action if condition is met
      if (conditionMet) {
        executeAction(rule.action, rule.name, result);
      }
    } catch (error) {
      console.error(`Error evaluating rule "${rule.name}":`, error);
    }
  }

  // Remove excluded clauses from included clauses
  result.included_clauses = result.included_clauses.filter(
    (code) => !result.excluded_clauses.includes(code)
  );

  return result;
}

// =====================================================
// QUESTION VISIBILITY
// =====================================================

/**
 * Determines if a question should be displayed based on dependencies
 */
export function isQuestionVisible(
  question: QuestionWithDependencies,
  answers: AnswersMap
): boolean {
  if (!question.depends_on) {
    return true; // No dependencies = always visible
  }

  const deps: QuestionDependency[] = Array.isArray(question.depends_on)
    ? question.depends_on
    : [question.depends_on];

  // All dependencies must be satisfied
  return deps.every((dep) => {
    const { question_code, operator = 'eq', value } = dep;
    const answer = answers[question_code];

    if (answer === undefined) {
      return false;
    }

    switch (operator) {
      case 'eq':
        return answer === value;
      case 'neq':
        return answer !== value;
      case 'in':
        return Array.isArray(value) && value.includes(answer);
      case 'nin':
        return Array.isArray(value) && !value.includes(answer);
      case 'gt':
        return typeof answer === 'number' && typeof value === 'number' && answer > value;
      case 'lt':
        return typeof answer === 'number' && typeof value === 'number' && answer < value;
      default:
        console.warn(`Unknown dependency operator: ${operator}`);
        return false;
    }
  });
}

// =====================================================
// VALIDATION
// =====================================================

/**
 * Validates answers against question requirements
 */
export function validateAnswers(
  questions: QuestionWithValidation[],
  answers: AnswersMap,
  visibleQuestionCodes: string[]
): Array<{ field: string; message: string; code: string }> {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  for (const question of questions) {
    // Skip validation for hidden questions
    if (!visibleQuestionCodes.includes(question.code)) {
      continue;
    }

    const validation = question.validation;
    if (!validation) {
      continue;
    }

    const answer = answers[question.code];

    // Required validation
    if (validation.required && (answer === undefined || answer === null || answer === '')) {
      errors.push({
        field: question.code,
        message: 'This field is required',
        code: 'REQUIRED',
      });
      continue;
    }

    // Skip other validations if no answer provided
    if (answer === undefined || answer === null || answer === '') {
      continue;
    }

    // Min/Max for numbers
    if (typeof answer === 'number') {
      if (validation.min !== undefined && answer < validation.min) {
        errors.push({
          field: question.code,
          message: `Value must be at least ${validation.min}`,
          code: 'MIN_VALUE',
        });
      }
      if (validation.max !== undefined && answer > validation.max) {
        errors.push({
          field: question.code,
          message: `Value must be at most ${validation.max}`,
          code: 'MAX_VALUE',
        });
      }
    }

    // Pattern validation for strings
    if (typeof answer === 'string' && validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(answer)) {
        errors.push({
          field: question.code,
          message: 'Invalid format',
          code: 'PATTERN_MISMATCH',
        });
      }
    }
  }

  return errors;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Merges firm profile attributes with wizard answers for rule evaluation
 */
export function mergeAnswersWithFirmProfile(
  answers: AnswersMap,
  firmAttributes?: FirmAttributes
): AnswersMap {
  if (!firmAttributes) {
    return answers;
  }

  // Firm attributes are defaults; answers override them
  const merged: AnswersMap = {
    ...(firmAttributes ?? {}),
    ...answers,
  };
  return merged;
}

/**
 * Computes progress percentage based on answered questions
 */
export function calculateProgress(
  questions: QuestionWithValidation[],
  answers: AnswersMap,
  visibleQuestionCodes: string[]
): number {
  const visibleQuestions = questions.filter((q) =>
    visibleQuestionCodes.includes(q.code)
  );

  if (visibleQuestions.length === 0) {
    return 0;
  }

  const answeredCount = visibleQuestions.filter((q) => {
    const answer = answers[q.code];
    return answer !== undefined && answer !== null && answer !== '';
  }).length;

  return Math.round((answeredCount / visibleQuestions.length) * 100);
}

/**
 * Gets all visible question codes based on current answers
 */
export function getVisibleQuestionCodes(
  questions: QuestionForVisibility[],
  answers: AnswersMap
): string[] {
  return questions
    .filter((q) => isQuestionVisible(q, answers))
    .map((q) => q.code);
}
