/**
 * Document Generation Tests
 * Tests DOCX generation, Liquid rendering, and audit bundle creation
 */

import { describe, it, expect } from 'vitest';
import { generateDocument, generateAuditBundleJson } from './document-generator';
import { parseMarkdownToStructure, parseInlineFormatting } from './docx-generator';
import type { Run, FirmProfile, Clause } from '../policies/types';

describe('Document Generation - Phase 2 Tests', () => {
  // Test data
  const mockRun: Run = {
    id: 'test-run-001',
    firm_id: 'firm-001',
    policy_id: 'aml',
    status: 'draft',
    answers: {
      firm_name: 'Test Financial Ltd',
      firm_role: 'principal',
      pep_domestic: true,
      client_types: ['retail', 'professional'],
      risk_score: 75,
    },
    selected_clause_codes: ['test_clause_1', 'test_clause_2'],
    variables: {
      approver_role: 'SMF17',
    },
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockFirmProfile: FirmProfile = {
    firm_id: 'firm-001',
    name: 'Test Financial Ltd',
    attributes: {
      permissions: ['credit_broking'],
      client_types: ['retail'],
      channels: ['online'],
      ar_or_principal: 'principal',
      size: 'small',
      outsourcing: [],
    },
    branding: {
      logo_url: '',
      primary_color: '#4F46E5',
      secondary_color: '#10B981',
      font: 'Calibri',
      watermark_drafts: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockClauses: Clause[] = [
    {
      id: '1',
      policy_id: 'aml',
      code: 'test_clause_1',
      title: 'Test Clause 1',
      body_md: `## Test Clause

This is a test clause for {{ firm_name }}.

### Requirements

The firm must:
- Requirement 1
- Requirement 2

Approver: **{{ approver_role }}**`,
      tags: ['test'],
      risk_refs: [],
      is_mandatory: true,
      display_order: 1,
      version: '1.0.0',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      policy_id: 'aml',
      code: 'test_clause_2',
      title: 'Test Clause 2',
      body_md: `## Second Test Clause

Risk score: {{ risk_score }}

This clause applies to all firms.`,
      tags: ['test'],
      risk_refs: [],
      is_mandatory: false,
      display_order: 2,
      version: '1.0.0',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockPolicy = {
    id: 'aml',
    name: 'Test Policy',
    version: '1.0.0',
  };

  const mockRulesResult = {
    included_clauses: ['test_clause_1', 'test_clause_2'],
    excluded_clauses: [],
    suggested_clauses: [],
    variables: {
      approver_role: 'SMF17',
    },
    rules_fired: [
      {
        rule_name: 'Test Rule 1',
        condition_met: true,
      },
    ],
  };

  describe('Markdown Parsing', () => {
    it('should parse headings correctly', () => {
      const markdown = `# Heading 1
## Heading 2
### Heading 3`;

      const parsed = parseMarkdownToStructure(markdown);

      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toMatchObject({ type: 'heading', level: 1, text: 'Heading 1' });
      expect(parsed[1]).toMatchObject({ type: 'heading', level: 2, text: 'Heading 2' });
      expect(parsed[2]).toMatchObject({ type: 'heading', level: 3, text: 'Heading 3' });
    });

    it('should parse unordered lists', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`;

      const parsed = parseMarkdownToStructure(markdown);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'list',
        ordered: false,
        items: ['Item 1', 'Item 2', 'Item 3'],
      });
    });

    it('should parse ordered lists', () => {
      const markdown = `1. First item
2. Second item
3. Third item`;

      const parsed = parseMarkdownToStructure(markdown);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'list',
        ordered: true,
        items: ['First item', 'Second item', 'Third item'],
      });
    });

    it('should parse blockquotes', () => {
      const markdown = `> This is a blockquote`;

      const parsed = parseMarkdownToStructure(markdown);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'blockquote',
        text: 'This is a blockquote',
      });
    });

    it('should parse regular paragraphs', () => {
      const markdown = `This is a regular paragraph.`;

      const parsed = parseMarkdownToStructure(markdown);

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'paragraph',
        text: 'This is a regular paragraph.',
      });
    });
  });

  describe('Inline Formatting', () => {
    it('should parse bold text', () => {
      const text = 'This is **bold** text';
      const runs = parseInlineFormatting(text);

      // Should create multiple runs (at least 3: "This is ", "bold", " text")
      expect(runs.length).toBeGreaterThan(2);
      // Verify runs are TextRun objects
      expect(runs[0]).toBeDefined();
    });

    it('should parse italic text', () => {
      const text = 'This is *italic* text';
      const runs = parseInlineFormatting(text);

      expect(runs.length).toBeGreaterThan(1);
    });

    it('should parse code text', () => {
      const text = 'This is `code` text';
      const runs = parseInlineFormatting(text);

      expect(runs.length).toBeGreaterThan(1);
    });

    it('should parse multiple formatting types', () => {
      const text = 'This has **bold** and *italic* and `code`';
      const runs = parseInlineFormatting(text);

      expect(runs.length).toBeGreaterThan(3);
    });
  });

  describe('Document Generation', () => {
    it('should generate complete document', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      expect(result).toHaveProperty('docx_buffer');
      expect(result).toHaveProperty('audit_bundle');
      expect(result).toHaveProperty('filename');

      // Check buffer is not empty
      expect(result.docx_buffer.length).toBeGreaterThan(0);

      // Check filename format
      expect(result.filename).toContain('test_policy');
      expect(result.filename).toContain('v1.0.0');
    });

    it('should include all selected clauses in document', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      const audit = result.audit_bundle;
      expect(audit.included_clauses).toContain('test_clause_1');
      expect(audit.included_clauses).toContain('test_clause_2');
    });

    it('should apply Liquid variable substitution', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      // Audit bundle should have variables
      expect(result.audit_bundle.variables).toHaveProperty('approver_role');
      expect(result.audit_bundle.variables.approver_role).toBe('SMF17');
    });
  });

  describe('Audit Bundle', () => {
    it('should generate valid JSON audit bundle', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      const json = generateAuditBundleJson(result.audit_bundle);

      // Should be valid JSON
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('run_id');
      expect(parsed).toHaveProperty('policy_id');
      expect(parsed).toHaveProperty('firm_name');
      expect(parsed).toHaveProperty('answers');
      expect(parsed).toHaveProperty('included_clauses');
      expect(parsed).toHaveProperty('rules_fired');
    });

    it('should include all answers in audit bundle', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      const audit = result.audit_bundle;
      expect(audit.answers).toHaveProperty('firm_name');
      expect(audit.answers).toHaveProperty('pep_domestic');
      expect(audit.answers.firm_name).toBe('Test Financial Ltd');
      expect(audit.answers.pep_domestic).toBe(true);
    });

    it('should include rules fired in audit bundle', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      const audit = result.audit_bundle;
      expect(audit.rules_fired).toHaveLength(1);
      expect(audit.rules_fired[0].rule_name).toBe('Test Rule 1');
      expect(audit.rules_fired[0].condition_met).toBe(true);
    });

    it('should include metadata', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
        metadata: {
          generated_by: 'Test User',
          effective_date: '2025-01-01',
        },
      });

      const audit = result.audit_bundle;
      expect(audit.generated_by).toBe('Test User');
    });
  });

  describe('Branding Integration', () => {
    it('should apply firm name to document', async () => {
      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      expect(result.audit_bundle.firm_name).toBe('Test Financial Ltd');
    });

    it('should respect watermark setting', async () => {
      // Test with watermark enabled
      const result1 = await generateDocument({
        run: { ...mockRun, status: 'draft' },
        policy: mockPolicy,
        firmProfile: { ...mockFirmProfile, branding: { ...mockFirmProfile.branding, watermark_drafts: true } },
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      expect(result1.docx_buffer.length).toBeGreaterThan(0);

      // Test with watermark disabled
      const result2 = await generateDocument({
        run: { ...mockRun, status: 'approved' },
        policy: mockPolicy,
        firmProfile: { ...mockFirmProfile, branding: { ...mockFirmProfile.branding, watermark_drafts: false } },
        clauses: mockClauses,
        rulesResult: mockRulesResult,
      });

      expect(result2.docx_buffer.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty clause list', async () => {
      const result = await generateDocument({
        run: { ...mockRun, selected_clause_codes: [] },
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: [],
        rulesResult: { ...mockRulesResult, included_clauses: [] },
      });

      expect(result.docx_buffer.length).toBeGreaterThan(0);
      expect(result.audit_bundle.included_clauses).toHaveLength(0);
    });

    it('should handle missing variables gracefully', async () => {
      const clauseWithMissingVar: Clause = {
        ...mockClauses[0],
        body_md: 'Missing variable: {{ missing_var }}',
      };

      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: [clauseWithMissingVar],
        rulesResult: {
          included_clauses: [clauseWithMissingVar.code],
          excluded_clauses: [],
          suggested_clauses: [],
          variables: {},
          rules_fired: [],
        },
      });

      expect(result.docx_buffer.length).toBeGreaterThan(0);
    });

    it('should handle special characters in clause content', async () => {
      const specialClause: Clause = {
        ...mockClauses[0],
        body_md: 'Special chars: £100,000 & €50,000 @ 2.5%',
      };

      const result = await generateDocument({
        run: mockRun,
        policy: mockPolicy,
        firmProfile: mockFirmProfile,
        clauses: [specialClause],
        rulesResult: {
          included_clauses: [specialClause.code],
          excluded_clauses: [],
          suggested_clauses: [],
          variables: {},
          rules_fired: [],
        },
      });

      expect(result.docx_buffer.length).toBeGreaterThan(0);
    });
  });
});
