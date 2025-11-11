/**
 * Phase 1 Integration Tests
 * Tests the complete workflow: Rules Engine → Wizard → Clause Preview
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateRules,
  getVisibleQuestionCodes,
  calculateProgress,
  validateAnswers,
} from './rules-engine';
import { renderClause, renderLiquidTemplate } from './liquid-renderer';
import type {
  Question,
  Rule,
  FirmAttributes,
  RulesEngineResult,
} from './types';

describe('Phase 1 Integration Tests', () => {
  // Sample firm profile
  const firmAttributes: FirmAttributes = {
    permissions: ['credit_broking', 'insurance_mediation'],
    client_types: ['retail', 'professional'],
    channels: ['online', 'telephone'],
    ar_or_principal: 'principal',
    size: 'medium',
    outsourcing: ['kyc_vendor'],
  };

  // Sample questions
  const questions: Question[] = [
    {
      id: '1',
      policy_id: 'aml',
      code: 'firm_role',
      text: 'Firm role',
      type: 'select',
      validation: { required: true },
      display_order: 0,
      metadata: {},
      created_at: '',
      updated_at: '',
    },
    {
      id: '2',
      policy_id: 'aml',
      code: 'pep_domestic',
      text: 'Domestic PEPs',
      type: 'boolean',
      validation: { required: true },
      depends_on: { question_code: 'firm_role', value: 'principal' },
      display_order: 1,
      metadata: {},
      created_at: '',
      updated_at: '',
    },
    {
      id: '3',
      policy_id: 'aml',
      code: 'client_types',
      text: 'Client types',
      type: 'multiselect',
      validation: { required: true },
      display_order: 2,
      metadata: {},
      created_at: '',
      updated_at: '',
    },
  ];

  // Sample rules
  const rules: Rule[] = [
    {
      id: '1',
      policy_id: 'aml',
      name: 'PEP rule',
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
      name: 'Retail rule',
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

  describe('Complete Workflow', () => {
    it('should process entire wizard workflow with firm defaults', () => {
      // Step 1: Get visible questions (initially only those without dependencies)
      const initialAnswers = {};
      let visibleCodes = getVisibleQuestionCodes(questions, initialAnswers);
      expect(visibleCodes).toContain('firm_role');
      expect(visibleCodes).toContain('client_types');
      expect(visibleCodes).not.toContain('pep_domestic'); // Hidden until firm_role is answered

      // Step 2: Answer first question
      const answers1 = { firm_role: 'principal' };
      visibleCodes = getVisibleQuestionCodes(questions, answers1);
      expect(visibleCodes).toContain('pep_domestic'); // Now visible

      // Step 3: Calculate progress
      let progress = calculateProgress(questions, answers1, visibleCodes);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);

      // Step 4: Validate partial answers
      let errors = validateAnswers(questions, answers1, visibleCodes);
      expect(errors.length).toBeGreaterThan(0); // Not all required fields answered

      // Step 5: Complete all answers
      const completeAnswers = {
        firm_role: 'principal',
        pep_domestic: true,
        client_types: ['retail', 'professional'],
      };
      visibleCodes = getVisibleQuestionCodes(questions, completeAnswers);
      progress = calculateProgress(questions, completeAnswers, visibleCodes);
      expect(progress).toBe(100);

      // Step 6: Validate complete answers
      errors = validateAnswers(questions, completeAnswers, visibleCodes);
      expect(errors).toHaveLength(0);

      // Step 7: Evaluate rules
      const rulesResult = evaluateRules(rules, {
        policy_id: 'aml',
        answers: completeAnswers,
        firm_attributes: firmAttributes,
      });

      expect(rulesResult.included_clauses).toContain('aml_edd_domestic_pep');
      expect(rulesResult.included_clauses).toContain('aml_retail_cdd');
      expect(rulesResult.variables.approver_role).toBe('SMF17');
      expect(rulesResult.rules_fired).toHaveLength(2);
    });

    it('should integrate firm profile attributes with wizard answers', () => {
      // Firm profile has default client types
      const answers = {
        firm_role: 'principal',
        pep_domestic: true,
        // client_types NOT answered - should use firm profile
      };

      const rulesResult = evaluateRules(rules, {
        policy_id: 'aml',
        answers,
        firm_attributes: firmAttributes,
      });

      // Rule should fire using firm_attributes.client_types
      expect(rulesResult.included_clauses).toContain('aml_retail_cdd');
    });
  });

  describe('Clause Rendering Integration', () => {
    it('should render clause with answers and variables', () => {
      const clauseTemplate = `## Enhanced Due Diligence

Firm: {{ firm_name }}
Approver: {{ approver_role }}

{% if pep_domestic %}
This firm serves Domestic PEPs and must apply enhanced due diligence.
{% endif %}

Client types:
{% for type in client_types %}
- {{ type }}
{% endfor %}`;

      const answers = {
        firm_name: 'Acme Financial Ltd',
        pep_domestic: true,
        client_types: ['retail', 'professional'],
      };

      const variables = {
        approver_role: 'SMF17',
      };

      const rendered = renderClause(clauseTemplate, variables, answers);

      expect(rendered).toContain('Acme Financial Ltd');
      expect(rendered).toContain('SMF17');
      expect(rendered).toContain('must apply enhanced due diligence');
      expect(rendered).toContain('retail');
      expect(rendered).toContain('professional');
    });

    it('should handle missing variables gracefully', () => {
      const template = 'Firm: {{ firm_name }}, Missing: {{ missing_var }}';
      const context = { firm_name: 'Test Firm' };

      const rendered = renderLiquidTemplate(template, context);

      expect(rendered).toContain('Test Firm');
      expect(rendered).toContain('Missing: '); // Empty string for missing var
    });

    it('should handle nested conditionals', () => {
      const template = `
{% if pep_domestic %}
Domestic PEP detected.
{% if high_risk %}
High risk - additional measures required.
{% endif %}
{% endif %}`;

      const context1 = { pep_domestic: true, high_risk: true };
      const rendered1 = renderLiquidTemplate(template, context1);
      expect(rendered1).toContain('Domestic PEP detected');
      expect(rendered1).toContain('additional measures required');

      const context2 = { pep_domestic: true, high_risk: false };
      const rendered2 = renderLiquidTemplate(template, context2);
      expect(rendered2).toContain('Domestic PEP detected');
      expect(rendered2).not.toContain('additional measures required');
    });
  });

  describe('Complex Rule Scenarios', () => {
    it('should handle rule priorities correctly', () => {
      const complexRules: Rule[] = [
        {
          id: '1',
          policy_id: 'test',
          name: 'Include A',
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
          name: 'Exclude A (higher priority)',
          priority: 110,
          condition: { q: 'exclude_a', eq: true },
          action: { exclude_clause_codes: ['clause_a'] },
          is_active: true,
          metadata: {},
          created_at: '',
          updated_at: '',
        },
      ];

      const result = evaluateRules(complexRules, {
        policy_id: 'test',
        answers: { include_a: true, exclude_a: true },
      });

      // Exclusion should win due to higher priority and post-processing
      expect(result.included_clauses).not.toContain('clause_a');
      expect(result.excluded_clauses).toContain('clause_a');
    });

    it('should handle complex logical conditions', () => {
      const complexRule: Rule = {
        id: '1',
        policy_id: 'test',
        name: 'Complex condition',
        priority: 100,
        condition: {
          all: [
            { q: 'firm_role', eq: 'principal' },
            {
              any: [
                { q: 'client_types', includes: 'retail' },
                { q: 'high_risk', eq: true },
              ],
            },
          ],
        },
        action: { include_clause_codes: ['complex_clause'] },
        is_active: true,
        metadata: {},
        created_at: '',
        updated_at: '',
      };

      // Should match: principal AND (retail OR high_risk)
      const result1 = evaluateRules([complexRule], {
        policy_id: 'test',
        answers: {
          firm_role: 'principal',
          client_types: ['retail'],
          high_risk: false,
        },
      });
      expect(result1.included_clauses).toContain('complex_clause');

      // Should not match: AR (not principal)
      const result2 = evaluateRules([complexRule], {
        policy_id: 'test',
        answers: {
          firm_role: 'appointed_representative',
          client_types: ['retail'],
        },
      });
      expect(result2.included_clauses).not.toContain('complex_clause');
    });
  });

  describe('Question Dependency Chains', () => {
    it('should handle multi-level dependencies', () => {
      const chainQuestions: Question[] = [
        {
          id: '1',
          policy_id: 'test',
          code: 'level1',
          text: 'Level 1',
          type: 'boolean',
          display_order: 0,
          metadata: {},
          created_at: '',
          updated_at: '',
        },
        {
          id: '2',
          policy_id: 'test',
          code: 'level2',
          text: 'Level 2',
          type: 'boolean',
          depends_on: { question_code: 'level1', value: true },
          display_order: 1,
          metadata: {},
          created_at: '',
          updated_at: '',
        },
        {
          id: '3',
          policy_id: 'test',
          code: 'level3',
          text: 'Level 3',
          type: 'boolean',
          depends_on: { question_code: 'level2', value: true },
          display_order: 2,
          metadata: {},
          created_at: '',
          updated_at: '',
        },
      ];

      // Only level1 visible initially
      let visible = getVisibleQuestionCodes(chainQuestions, {});
      expect(visible).toEqual(['level1']);

      // Answer level1 = true, level2 appears
      visible = getVisibleQuestionCodes(chainQuestions, { level1: true });
      expect(visible).toEqual(['level1', 'level2']);

      // Answer level2 = true, level3 appears
      visible = getVisibleQuestionCodes(chainQuestions, {
        level1: true,
        level2: true,
      });
      expect(visible).toEqual(['level1', 'level2', 'level3']);

      // Answer level1 = false, cascade hides level2 and level3
      visible = getVisibleQuestionCodes(chainQuestions, { level1: false });
      expect(visible).toEqual(['level1']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty answers', () => {
      const result = evaluateRules(rules, {
        policy_id: 'aml',
        answers: {},
      });

      expect(result.included_clauses).toHaveLength(0);
      expect(result.rules_fired.every((r) => !r.condition_met)).toBe(true);
    });

    it('should handle inactive rules', () => {
      const inactiveRules = rules.map((r) => ({ ...r, is_active: false }));

      const result = evaluateRules(inactiveRules, {
        policy_id: 'aml',
        answers: { pep_domestic: true, client_types: ['retail'] },
      });

      expect(result.included_clauses).toHaveLength(0);
    });

    it('should handle malformed question dependencies', () => {
      const malformedQuestion = {
        id: '1',
        policy_id: 'test',
        code: 'test',
        text: 'Test',
        type: 'text' as const,
        depends_on: { question_code: 'nonexistent', value: 'something' },
        display_order: 0,
        metadata: {},
        created_at: '',
        updated_at: '',
      };

      const visible = getVisibleQuestionCodes([malformedQuestion], {});
      expect(visible).toHaveLength(0); // Hidden because dependency not satisfied
    });
  });
});
