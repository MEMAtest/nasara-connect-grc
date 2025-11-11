'use client'

/**
 * Rules Management Interface
 * List, search, and manage policy rules
 */

import { useState } from 'react'
import Link from 'next/link'

// Mock data
const MOCK_RULES = [
  {
    id: '1',
    policy_id: 'aml',
    name: 'Include PEP clause for domestic PEPs',
    priority: 100,
    is_active: true,
    condition_summary: 'pep_domestic = true',
    action_summary: 'Include aml_edd_domestic_pep',
  },
  {
    id: '2',
    policy_id: 'aml',
    name: 'Include retail client clauses',
    priority: 90,
    is_active: true,
    condition_summary: 'client_types includes retail',
    action_summary: 'Include aml_retail_cdd',
  },
  {
    id: '3',
    policy_id: 'aml',
    name: 'Suggest enhanced monitoring for high risk',
    priority: 80,
    is_active: true,
    condition_summary: 'risk_score > 70',
    action_summary: 'Suggest aml_enhanced_monitoring',
  },
]

export default function RulesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPolicy, setFilterPolicy] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')

  const filteredRules = MOCK_RULES.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.condition_summary.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPolicy = filterPolicy === 'all' || rule.policy_id === filterPolicy
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && rule.is_active) ||
      (filterActive === 'inactive' && !rule.is_active)
    return matchesSearch && matchesPolicy && matchesActive
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-200 mb-2">Rules</h1>
          <p className="text-slate-400 text-lg">
            Manage rules for dynamic clause selection
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/rules/test"
            className="px-6 py-3 border border-violet-500/50 text-violet-400 rounded-lg hover:bg-violet-500/10 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Test Rules
          </Link>
          <Link
            href="/admin/rules/new"
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Rule
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or condition..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="policy" className="block text-sm font-medium text-slate-300 mb-2">
              Policy
            </label>
            <select
              id="policy"
              value={filterPolicy}
              onChange={(e) => setFilterPolicy(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">All Policies</option>
              <option value="aml">AML/CTF</option>
              <option value="smcr">SMCR</option>
            </select>
          </div>

          <div>
            <label htmlFor="active" className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              id="active"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">All Rules</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-slate-400">
        Showing {filteredRules.length} of {MOCK_RULES.length} rules
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl p-6 hover:border-slate-700 transition-colors ${
              rule.is_active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-200">{rule.name}</h3>
                  {!rule.is_active && (
                    <span className="px-2 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-400">
                      Inactive
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300">
                    Priority: {rule.priority}
                  </span>
                </div>
                <div className="mb-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-500 min-w-20">Condition:</span>
                    <span className="text-sm text-slate-300 font-mono">{rule.condition_summary}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-slate-500 min-w-20">Action:</span>
                    <span className="text-sm text-slate-300 font-mono">{rule.action_summary}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/rules/${rule.id}`}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this rule?')) {
                      alert('Delete functionality would go here')
                    }
                  }}
                  className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRules.length === 0 && (
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
            <p className="text-slate-400">No rules found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
