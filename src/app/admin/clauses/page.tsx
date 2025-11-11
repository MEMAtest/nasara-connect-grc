'use client'

/**
 * Clause Management Interface
 * List, search, and manage policy clauses
 */

import { useState } from 'react'
import Link from 'next/link'

// Mock data - in production, fetch from API
const MOCK_CLAUSES = [
  {
    id: '1',
    policy_id: 'aml',
    code: 'aml_edd_domestic_pep',
    title: 'Enhanced Due Diligence for Domestic PEPs',
    tags: ['aml', 'pep', 'edd'],
    is_mandatory: false,
    version: '1.0.0',
    updated_at: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    policy_id: 'aml',
    code: 'aml_retail_cdd',
    title: 'Customer Due Diligence for Retail Clients',
    tags: ['aml', 'cdd', 'retail'],
    is_mandatory: true,
    version: '1.0.0',
    updated_at: '2025-01-14T14:20:00Z',
  },
  {
    id: '3',
    policy_id: 'aml',
    code: 'aml_enhanced_monitoring',
    title: 'Enhanced Transaction Monitoring',
    tags: ['aml', 'monitoring', 'transaction'],
    is_mandatory: false,
    version: '1.0.0',
    updated_at: '2025-01-13T09:15:00Z',
  },
]

export default function ClausesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPolicy, setFilterPolicy] = useState<string>('all')
  const [filterMandatory, setFilterMandatory] = useState<string>('all')

  // Filter clauses
  const filteredClauses = MOCK_CLAUSES.filter((clause) => {
    const matchesSearch =
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPolicy = filterPolicy === 'all' || clause.policy_id === filterPolicy

    const matchesMandatory =
      filterMandatory === 'all' ||
      (filterMandatory === 'mandatory' && clause.is_mandatory) ||
      (filterMandatory === 'optional' && !clause.is_mandatory)

    return matchesSearch && matchesPolicy && matchesMandatory
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-200 mb-2">Clauses</h1>
          <p className="text-slate-400 text-lg">
            Manage policy clauses and their content
          </p>
        </div>
        <Link
          href="/admin/clauses/new"
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
          Create Clause
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
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
                placeholder="Search by title or code..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          {/* Policy Filter */}
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
              <option value="data_protection">Data Protection</option>
            </select>
          </div>

          {/* Mandatory Filter */}
          <div>
            <label
              htmlFor="mandatory"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Type
            </label>
            <select
              id="mandatory"
              value={filterMandatory}
              onChange={(e) => setFilterMandatory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">All Types</option>
              <option value="mandatory">Mandatory Only</option>
              <option value="optional">Optional Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-400">
        Showing {filteredClauses.length} of {MOCK_CLAUSES.length} clauses
      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {filteredClauses.map((clause) => (
          <div
            key={clause.id}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-200">{clause.title}</h3>
                  {clause.is_mandatory && (
                    <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300">
                      Mandatory
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-3">
                  <span className="font-mono">{clause.code}</span> • Version {clause.version}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {clause.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-slate-500">
                  Updated {new Date(clause.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/clauses/${clause.id}`}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this clause?')) {
                      // In production: call delete API
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

        {filteredClauses.length === 0 && (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400">No clauses found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
