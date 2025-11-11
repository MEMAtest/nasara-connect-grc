/**
 * Rules Engine - Unit Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  evaluateCondition,
  evaluateRules,
  isQuestionVisible,
  validateAnswers,
  calculateProgress,
  getVisibleQuestionCodes,
} from './rules-engine';
import type { Rule, RuleCondition, Question } from './types';

describe('Rules Engine - Condition Evaluator', () => {
  const answers = {
    firm_role: 'principal',
    pep_domestic: true,
    client_types: ['retail', 'professional'],
    risk_score: 75,
  };

  describe('Basic operators', () => {
    it('should evaluate eq (equals)', () => {
      const condition: RuleCondition = { q: 'firm_role', eq: 'principal' };
      expect(evaluateCondition(condition, answers)).toBe(true);

      const condition2: RuleCondition = { q: 'firm_role', eq: 'ar' };
      expect(evaluateCondition(condition2, answers)).toBe(false);
    });

    it('should evaluate neq (not equals)', () => {
      const condition: RuleCondition = { q: 'firm_role', neq: 'ar' };
      expect(evaluateCondition(condition, answers)).toBe(true);
    });

    it('should evaluate includes (array includes)', () => {
      const condition: RuleCondition = { q: 'client_types', includes: 'retail' };
      expect(evaluateCondition(condition, answers)).toBe(true);

      const condition2: RuleCondition = { q: 'client_types', includes: 'ecp' };
      expect(evaluateCondition(condition2, answers)).toBe(false);
    });

    it('should evaluate numeric comparisons', () => {
      expect(evaluateCondition({ q: 'risk_score', gt: 50 }, answers)).toBe(true);
      expect(evaluateCondition({ q: 'risk_score', gt: 100 }, answers)).toBe(false);
      expect(evaluateCondition({ q: 'risk_score', lt: 100 }, answers)).toBe(true);
      expect(evaluateCondition({ q: 'risk_score', gte: 75 }, answers)).toBe(true);
      expect(evaluateCondition({ q: 'risk_score', lte: 75 }, answers)).toBe(true);
    });
  });

  describe('Logical operators', () => {
    it('should evaluate all (AND)', () => {
      const condition: RuleCondition = {
        all: [
          { q: 'firm_role', eq: 'principal' },
          { q: 'pep_domestic', eq: true },
        ],
      };
      expect(evaluateCondition(condition, answers)).toBe(true);

      const condition2: RuleCondition = {
        all: [
          { q: 'firm_role', eq: 'principal' },
          { q: 'pep_domestic', eq: false },
        ],
      };
      expect(evaluateCondition(condition2, answers)).toBe(false);
    });

    it('should evaluate any (OR)', () => {
      const condition: RuleCondition = {
        any: [
          { q: 'firm_role', eq: 'ar' },
          { q: 'pep_domestic', eq: true },
        ],
      };
      expect(evaluateCondition(condition, answers)).toBe(true);

      const condition2: RuleCondition = {
        any: [
          { q: 'firm_role', eq: 'ar' },
          { q: 'pep_domestic', eq: false },
        ],
      };
      expect(evaluateCondition(condition2, answers)).toBe(false);
    });

    it('should evaluate not (negation)', () => {
      const condition: RuleCondition = {
        not: { q: 'firm_role', eq: 'ar' },
      };
      expect(evaluateCondition(condition, answers)).toBe(true);
    });

    it('should handle nested logical operators', () => {
      const condition: RuleCondition = {
        all: [
          { q: 'firm_role', eq: 'principal' },
          {
            any: [
              { q: 'client_types', includes: 'retail' },
              { q: 'risk_score', gt: 80 },
            ],
          },
        ],
      };
      expect(evaluateCondition(condition, answers)).toBe(true);
    });
  });
});

describe('Rules Engine - Full Evaluation', () => {
  it('should evaluate multiple rules and combine results', () => {
    const rules: Rule[] = [
      {
        id: '1',
        policy_id: 'aml',
        name: 'Include PEP clause for domestic PEPs',
        priority: 100,
        condition: { q: 'pep_domestic', eq: true },
        action: {
          include_clause_codes: ['aml_edd_domestic_pep'],
          set_vars: { approver_role: 'SMF17' },
        },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        policy_id: 'aml',
        name: 'Include retail client clauses',
        priority: 90,
        condition: { q: 'client_types', includes: 'retail' },
        action: {
          include_clause_codes: ['aml_retail_cdd'],
        },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      },
    ];

    const result = evaluateRules(rules, {
      policy_id: 'aml',
      answers: {
        pep_domestic: true,
        client_types: ['retail', 'professional'],
      },
    });

    expect(result.included_clauses).toContain('aml_edd_domestic_pep');
    expect(result.included_clauses).toContain('aml_retail_cdd');
    expect(result.variables.approver_role).toBe('SMF17');
    expect(result.rules_fired).toHaveLength(2);
    expect(result.rules_fired[0].condition_met).toBe(true);
  });

  it('should handle clause exclusions', () => {
    const rules: Rule[] = [
      {
        id: '1',
        policy_id: 'test',
        name: 'Include clause A',
        priority: 100,
        condition: { q: 'include_a', eq: true },
        action: { include_clause_codes: ['clause_a'] },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        policy_id: 'test',
        name: 'Exclude clause A for high risk',
        priority: 110, // Higher priority
        condition: { q: 'high_risk', eq: true },
        action: { exclude_clause_codes: ['clause_a'] },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      },
    ];

    const result = evaluateRules(rules, {
      policy_id: 'test',
      answers: { include_a: true, high_risk: true },
    });

    expect(result.included_clauses).not.toContain('clause_a');
    expect(result.excluded_clauses).toContain('clause_a');
  });

  it('should handle suggestions', () => {
    const rules: Rule[] = [
      {
        id: '1',
        policy_id: 'test',
        name: 'Suggest enhanced monitoring',
        priority: 100,
        condition: { q: 'risk_score', gt: 70 },
        action: {
          suggest_clause_codes: ['enhanced_monitoring'],
          reason: 'High risk score detected',
        },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      },
    ];

    const result = evaluateRules(rules, {
      policy_id: 'test',
      answers: { risk_score: 85 },
    });

    expect(result.suggested_clauses).toHaveLength(1);
    expect(result.suggested_clauses[0].code).toBe('enhanced_monitoring');
    expect(result.suggested_clauses[0].reason).toBe('High risk score detected');
  });
});

describe('Question Visibility', () => {
  it('should show questions with no dependencies', () => {
    const question = { code: 'firm_role', depends_on: undefined };
    expect(isQuestionVisible(question, {})).toBe(true);
  });

  it('should show questions when dependencies are met', () => {
    const question = {
      code: 'pep_domestic',
      depends_on: { question_code: 'firm_role', value: 'principal' },
    };
    expect(isQuestionVisible(question, { firm_role: 'principal' })).toBe(true);
    expect(isQuestionVisible(question, { firm_role: 'ar' })).toBe(false);
  });

  it('should handle multiple dependencies', () => {
    const question = {
      code: 'advanced_question',
      depends_on: [
        { question_code: 'firm_role', value: 'principal' },
        { question_code: 'high_risk', value: true },
      ],
    };
    expect(
      isQuestionVisible(question, { firm_role: 'principal', high_risk: true })
    ).toBe(true);
    expect(
      isQuestionVisible(question, { firm_role: 'principal', high_risk: false })
    ).toBe(false);
  });
});

describe('Answer Validation', () => {
  const questions: Question[] = [
    {
      id: '1',
      policy_id: 'test',
      code: 'firm_name',
      text: 'Firm name',
      type: 'text',
      validation: { required: true },
      display_order: 0,
      metadata: {},
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      policy_id: 'test',
      code: 'risk_score',
      text: 'Risk score',
      type: 'number',
      validation: { required: true, min: 0, max: 100 },
      display_order: 1,
      metadata: {},
      created_at: '',
      updated_at: '',
    },
  ];

  it('should validate required fields', () => {
    const errors = validateAnswers(questions, {}, ['firm_name', 'risk_score']);
    expect(errors).toHaveLength(2);
    expect(errors[0].code).toBe('REQUIRED');
  });

  it('should validate numeric ranges', () => {
    const errors = validateAnswers(
      questions,
      { firm_name: 'Test', risk_score: 150 },
      ['firm_name', 'risk_score']
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('MAX_VALUE');
  });

  it('should skip validation for hidden questions', () => {
    const errors = validateAnswers(questions, {}, ['firm_name']); // risk_score not visible
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('firm_name');
  });

  it('should pass with valid answers', () => {
    const errors = validateAnswers(
      questions,
      { firm_name: 'Test Firm', risk_score: 50 },
      ['firm_name', 'risk_score']
    );
    expect(errors).toHaveLength(0);
  });
});

describe('Progress Calculation', () => {
  const questions: Question[] = [
    { id: '1', policy_id: 'test', code: 'q1', text: 'Q1', type: 'text', display_order: 0, metadata: {}, created_at: '', updated_at: '' },
    { id: '2', policy_id: 'test', code: 'q2', text: 'Q2', type: 'text', display_order: 1, metadata: {}, created_at: '', updated_at: '' },
    { id: '3', policy_id: 'test', code: 'q3', text: 'Q3', type: 'text', display_order: 2, metadata: {}, created_at: '', updated_at: '' },
    { id: '4', policy_id: 'test', code: 'q4', text: 'Q4', type: 'text', display_order: 3, metadata: {}, created_at: '', updated_at: '' },
  ];

  it('should calculate 0% for no answers', () => {
    const progress = calculateProgress(questions, {}, ['q1', 'q2', 'q3', 'q4']);
    expect(progress).toBe(0);
  });

  it('should calculate 50% for half answered', () => {
    const progress = calculateProgress(
      questions,
      { q1: 'answer1', q2: 'answer2' },
      ['q1', 'q2', 'q3', 'q4']
    );
    expect(progress).toBe(50);
  });

  it('should calculate 100% for all answered', () => {
    const progress = calculateProgress(
      questions,
      { q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4' },
      ['q1', 'q2', 'q3', 'q4']
    );
    expect(progress).toBe(100);
  });

  it('should only count visible questions', () => {
    const progress = calculateProgress(
      questions,
      { q1: 'a1', q2: 'a2' },
      ['q1', 'q2'] // only q1 and q2 visible
    );
    expect(progress).toBe(100);
  });
});

describe('Visible Question Codes', () => {
  it('should return all questions when no dependencies', () => {
    const questions = [
      { code: 'q1', depends_on: undefined },
      { code: 'q2', depends_on: undefined },
    ];
    const visible = getVisibleQuestionCodes(questions, {});
    expect(visible).toEqual(['q1', 'q2']);
  });

  it('should filter based on dependencies', () => {
    const questions = [
      { code: 'q1', depends_on: undefined },
      { code: 'q2', depends_on: { question_code: 'q1', value: 'yes' } },
      { code: 'q3', depends_on: { question_code: 'q1', value: 'no' } },
    ];
    const visible = getVisibleQuestionCodes(questions, { q1: 'yes' });
    expect(visible).toEqual(['q1', 'q2']);
  });
});
