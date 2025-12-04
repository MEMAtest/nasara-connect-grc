'use client'

/**
 * Rule Test Harness
 * Test rules with sample inputs to verify behavior
 */

import { useState } from 'react'
import { evaluateRules } from '@/lib/policies/rules-engine'
import type { Rule, RuleCondition, RuleAction, JsonValue, RulesEngineResult } from '@/lib/policies/types'

export default function RuleTestHarnessPage() {
  const [policyId, setPolicyId] = useState('aml')
  const [answersJson, setAnswersJson] = useState(`{
  "firm_role": "principal",
  "pep_domestic": true,
  "client_types": ["retail", "professional"],
  "risk_score": 75
}`)
  const [firmAttributesJson, setFirmAttributesJson] = useState(`{
  "permissions": ["credit_broking", "insurance_mediation"],
  "client_types": ["retail"],
  "ar_or_principal": "principal",
  "size": "medium"
}`)

  const [testResult, setTestResult] = useState<RulesEngineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  // Mock rules - in production, fetch from API
  const MOCK_RULES: Rule[] = [
    {
      id: '1',
      policy_id: 'aml',
      name: 'Include PEP clause for domestic PEPs',
      priority: 100,
      condition: { q: 'pep_domestic', eq: true } as RuleCondition,
      action: {
        include_clause_codes: ['aml_edd_domestic_pep'],
        set_vars: { approver_role: 'SMF17' },
      } as RuleAction,
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
      condition: { q: 'client_types', includes: 'retail' } as RuleCondition,
      action: {
        include_clause_codes: ['aml_retail_cdd'],
      } as RuleAction,
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
      condition: { q: 'risk_score', gt: 70 } as RuleCondition,
      action: {
        suggest_clause_codes: ['aml_enhanced_monitoring'],
        reason: 'High risk score detected - consider enhanced monitoring',
      } as RuleAction,
      is_active: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  // Run test
  async function handleTest() {
    try {
      setTesting(true)
      setError(null)
      setTestResult(null)

      // Parse JSON inputs
      let answers: Record<string, JsonValue>
      let firmAttributes: Record<string, JsonValue> | undefined

      try {
        answers = JSON.parse(answersJson)
      } catch (err) {
        throw new Error('Invalid answers JSON: ' + (err instanceof Error ? err.message : 'Parse error'))
      }

      try {
        firmAttributes = firmAttributesJson.trim() ? JSON.parse(firmAttributesJson) : undefined
      } catch (err) {
        throw new Error('Invalid firm attributes JSON: ' + (err instanceof Error ? err.message : 'Parse error'))
      }

      // Filter rules for selected policy
      const rules = MOCK_RULES.filter((r) => r.policy_id === policyId)

      // Evaluate rules
      const result = evaluateRules(rules, {
        policy_id: policyId,
        answers,
        firm_attributes: firmAttributes,
      })

      setTestResult(result)
    } catch (err) {
      console.error('Test error:', err)
      setError(err instanceof Error ? err.message : 'Test failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-200 mb-2">Rule Test Harness</h1>
        <p className="text-slate-400 text-lg">
          Test rules with sample inputs to verify their behavior before deployment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Test Inputs</h2>

            {/* Policy Selection */}
            <div className="mb-6">
              <label htmlFor="policy" className="block text-sm font-medium text-slate-300 mb-2">
                Policy
              </label>
              <select
                id="policy"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="aml">AML/CTF</option>
                <option value="smcr">SMCR</option>
              </select>
            </div>

            {/* Answers JSON */}
            <div className="mb-6">
              <label htmlFor="answers" className="block text-sm font-medium text-slate-300 mb-2">
                Answers (JSON)
              </label>
              <textarea
                id="answers"
                value={answersJson}
                onChange={(e) => setAnswersJson(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono text-sm"
              />
            </div>

            {/* Firm Attributes JSON */}
            <div className="mb-6">
              <label
                htmlFor="attributes"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Firm Attributes (JSON, optional)
              </label>
              <textarea
                id="attributes"
                value={firmAttributesJson}
                onChange={(e) => setFirmAttributesJson(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono text-sm"
              />
            </div>

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={testing}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'Running Test...' : 'Run Test'}
            </button>
          </div>

          {/* Active Rules */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">
              Active Rules ({MOCK_RULES.filter((r) => r.policy_id === policyId).length})
            </h2>
            <div className="space-y-3">
              {MOCK_RULES.filter((r) => r.policy_id === policyId).map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg"
                >
                  <div className="text-sm font-medium text-slate-200 mb-1">{rule.name}</div>
                  <div className="text-xs text-slate-400">Priority: {rule.priority}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <>
              {/* Summary */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Test Results</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-violet-400">
                      {testResult.included_clauses.length}
                    </div>
                    <div className="text-sm text-violet-300">Clauses Included</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">
                      {testResult.rules_fired.filter((r) => r.condition_met).length}
                    </div>
                    <div className="text-sm text-blue-300">Rules Fired</div>
                  </div>
                </div>

                {/* Included Clauses */}
                {testResult.included_clauses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">
                      Included Clauses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {testResult.included_clauses.map((code: string) => (
                        <span
                          key={code}
                          className="px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-sm text-violet-300"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Excluded Clauses */}
                {testResult.excluded_clauses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">
                      Excluded Clauses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {testResult.excluded_clauses.map((code: string) => (
                        <span
                          key={code}
                          className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-300"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Clauses */}
                {testResult.suggested_clauses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">
                      Suggested Clauses
                    </h3>
                    <div className="space-y-2">
                      {testResult.suggested_clauses.map((suggestion, i) => (
                        <div
                          key={i}
                          className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                        >
                          <div className="font-medium text-amber-300 text-sm">
                            {suggestion.code}
                          </div>
                          <div className="text-xs text-amber-400/70 mt-1">
                            {suggestion.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variables */}
                {Object.keys(testResult.variables).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">
                      Variables Set
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(testResult.variables).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-slate-800/30 rounded"
                        >
                          <span className="text-sm text-slate-400 font-mono">{key}</span>
                          <span className="text-sm text-slate-300">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rules Fired Detail */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Rules Evaluation</h2>
                <div className="space-y-3">
                  {testResult.rules_fired.map((fired, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        fired.condition_met
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-slate-800/30 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-slate-200 text-sm">
                          {fired.rule_name}
                        </div>
                        {fired.condition_met ? (
                          <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                            ✓ Fired
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-400">
                            Not Fired
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!testResult && !error && (
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="text-slate-400">Run a test to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
