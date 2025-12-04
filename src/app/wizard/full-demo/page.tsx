'use client'

/**
 * Full Policy Wizard Demo with Live Preview
 * Demonstrates wizard + real-time clause preview
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PolicyWizard from '@/components/policies/PolicyWizard'
import ClausePreviewPanel from '@/components/policies/ClausePreviewPanel'
import type { Question, Rule, Clause, JsonValue, RulesEngineResult } from '@/lib/policies/types'

// Mock clauses for demonstration
const MOCK_CLAUSES: Clause[] = [
  {
    id: '1',
    policy_id: 'aml',
    code: 'aml_edd_domestic_pep',
    title: 'Enhanced Due Diligence for Domestic PEPs',
    body_md: `## Enhanced Due Diligence for Domestic Politically Exposed Persons

{{ firm_name }} has identified that it serves clients who are Domestic Politically Exposed Persons (PEPs).

### Requirements

The firm must apply enhanced due diligence (EDD) measures for all Domestic PEP clients, including:

- Enhanced identity verification procedures
- Source of wealth and source of funds verification
- Ongoing monitoring with increased frequency
- Senior management approval for establishing business relationships

### Approval Authority

All Domestic PEP relationships must be approved by: **{{ approver_role }}**

### Review Frequency

EDD reviews for Domestic PEPs must be conducted at least **quarterly**.`,
    tags: ['aml', 'pep', 'edd'],
    risk_refs: ['AML-001', 'PEP-DOM'],
    is_mandatory: false,
    display_order: 1,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    policy_id: 'aml',
    code: 'aml_retail_cdd',
    title: 'Customer Due Diligence for Retail Clients',
    body_md: `## Customer Due Diligence for Retail Clients

{{ firm_name }} serves retail clients and must apply appropriate customer due diligence (CDD) measures.

### Standard CDD Requirements

For all retail clients, the firm must:

- Verify identity using reliable, independent source documents
- Understand the nature and purpose of the business relationship
- Conduct ongoing monitoring of the business relationship
- Keep records of all CDD measures for at least 5 years

### Risk-Based Approach

CDD measures must be applied on a risk-sensitive basis, with enhanced measures for higher-risk clients.

{% if client_types %}
### Client Types Served

This policy applies to the following client categories:
{% for type in client_types %}
- **{{ type }}**
{% endfor %}
{% endif %}`,
    tags: ['aml', 'cdd', 'retail'],
    risk_refs: ['AML-002', 'CDD-RET'],
    is_mandatory: false,
    display_order: 2,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    policy_id: 'aml',
    code: 'aml_enhanced_monitoring',
    title: 'Enhanced Transaction Monitoring',
    body_md: `## Enhanced Transaction Monitoring

Based on {{ firm_name }}'s risk assessment (Risk Score: **{{ risk_score }}**), enhanced transaction monitoring procedures are recommended.

### Enhanced Monitoring Triggers

The firm must implement automated monitoring for:

- Transactions exceeding £10,000
- Unusual patterns or behaviors
- Transactions involving high-risk jurisdictions
- Multiple transactions just below reporting thresholds

### Alert Investigation

All monitoring alerts must be:

1. Reviewed within 24 hours
2. Investigated by trained compliance staff
3. Escalated to the MLRO if suspicious
4. Documented with investigation findings

### System Requirements

The firm must maintain transaction monitoring systems capable of:

- Real-time screening against sanctions lists
- Pattern detection and anomaly analysis
- Automated alert generation
- Comprehensive audit trails`,
    tags: ['aml', 'monitoring', 'transaction'],
    risk_refs: ['AML-003', 'TM-ENH'],
    is_mandatory: false,
    display_order: 3,
    version: '1.0.0',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function FullWizardDemoPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for preview
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, JsonValue>>({})
  const [currentRulesResult, setCurrentRulesResult] = useState<RulesEngineResult>({
    included_clauses: [],
    excluded_clauses: [],
    suggested_clauses: [],
    variables: {},
    rules_fired: [],
  })

  // Load wizard data
  useEffect(() => {
    async function loadWizardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/policies/aml/wizard')

        if (!response.ok) {
          throw new Error('Failed to load wizard data')
        }

        const data = await response.json()
        setQuestions(data.questions)
        setRules(data.rules)
      } catch (err) {
        console.error('Error loading wizard:', err)
        setError(err instanceof Error ? err.message : 'Failed to load wizard')
      } finally {
        setLoading(false)
      }
    }

    loadWizardData()
  }, [])

  // Handle save - update preview
  async function handleSave(answers: Record<string, JsonValue>, rulesResult: RulesEngineResult) {
    console.log('Updating preview:', { answers, rulesResult })
    setCurrentAnswers(answers)
    setCurrentRulesResult(rulesResult)
    // In production, also save to API
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading wizard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-xl p-8">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-slate-400 hover:text-slate-300 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Full Wizard Demo
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Interactive wizard with live clause preview and real-time rendering
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left: Wizard */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-300">
                  Questionnaire
                </span>
              </div>
            </div>

            <PolicyWizard
              policyId="aml"
              policyName="AML/CTF Policy"
              firmId="00000000-0000-0000-0000-000000000001"
              questions={questions}
              rules={rules}
              onSave={handleSave}
              onComplete={() => router.push('/documents/review/demo-run')}
            />
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl px-4 py-3 sticky top-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-300">
                  Live Preview
                </span>
              </div>
            </div>

            <div className="sticky top-28 max-h-[calc(100vh-10rem)] overflow-y-auto">
              <ClausePreviewPanel
                clauses={MOCK_CLAUSES}
                rulesResult={currentRulesResult}
                answers={currentAnswers}
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">
            How This Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-violet-400 font-semibold">1</span>
                </div>
                <h4 className="font-medium text-slate-300">Answer Questions</h4>
              </div>
              <p className="text-slate-400">
                The wizard shows conditional questions based on your previous answers.
                Questions appear/disappear dynamically.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-violet-400 font-semibold">2</span>
                </div>
                <h4 className="font-medium text-slate-300">Rules Evaluate</h4>
              </div>
              <p className="text-slate-400">
                The rules engine evaluates your answers in real-time and selects
                appropriate policy clauses automatically.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-violet-400 font-semibold">3</span>
                </div>
                <h4 className="font-medium text-slate-300">Preview Updates</h4>
              </div>
              <p className="text-slate-400">
                Selected clauses are rendered with your answers as variables, showing
                exactly how your policy document will look.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
