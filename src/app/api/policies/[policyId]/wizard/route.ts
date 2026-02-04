/**
 * Policy Wizard Data API
 * GET /api/policies/:policyId/wizard - Get questions, rules, and metadata for wizard
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from "@/lib/rbac";
// import { getQuestionsForPolicy, getRulesForPolicy } from '@/lib/server/policy-store';

// Mock data for demonstration - replace with actual database queries
const MOCK_QUESTIONS = [
  {
    id: '1',
    policy_id: 'aml',
    code: 'firm_role',
    text: 'Is your firm a Principal or Appointed Representative?',
    help: 'This determines your compliance obligations',
    type: 'select' as const,
    options: [
      { value: 'principal', label: 'Principal Firm' },
      { value: 'appointed_representative', label: 'Appointed Representative' },
    ],
    validation: { required: true },
    display_order: 0,
    section: 'Firm Details',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    policy_id: 'aml',
    code: 'pep_domestic',
    text: 'Do you have any Domestic PEPs as clients?',
    help: 'Politically Exposed Persons require enhanced due diligence',
    type: 'boolean' as const,
    validation: { required: true },
    depends_on: { question_code: 'firm_role', value: 'principal' },
    display_order: 1,
    section: 'Risk Assessment',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    policy_id: 'aml',
    code: 'client_types',
    text: 'What types of clients do you serve?',
    help: 'Select all that apply',
    type: 'multiselect' as const,
    options: ['retail', 'professional', 'ecp'],
    validation: { required: true },
    display_order: 2,
    section: 'Firm Details',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    policy_id: 'aml',
    code: 'risk_score',
    text: 'What is your overall risk assessment score?',
    help: 'Enter a score from 0 to 100',
    type: 'number' as const,
    validation: { required: true, min: 0, max: 100 },
    display_order: 3,
    section: 'Risk Assessment',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_RULES = [
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    policy_id: 'aml',
    name: 'Suggest enhanced monitoring for high risk',
    priority: 80,
    condition: { q: 'risk_score', gt: 70 },
    action: {
      suggest_clause_codes: ['aml_enhanced_monitoring'],
      reason: 'High risk score detected - consider enhanced monitoring',
    },
    is_active: true,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// =====================================================
// GET - Get wizard data for policy
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const { error } = await requireRole("member");
    if (error) return error;
    const { policyId } = await params;

    // In production, fetch from database:
    // const questions = await getQuestionsForPolicy(policyId);
    // const rules = await getRulesForPolicy(policyId);

    // For now, return mock data
    const questions = MOCK_QUESTIONS.filter((q) => q.policy_id === policyId);
    const rules = MOCK_RULES.filter((r) => r.policy_id === policyId);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Policy not found or has no questions configured',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        policy_id: policyId,
        questions,
        rules,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching wizard data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch wizard data',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
