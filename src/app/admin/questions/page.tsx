'use client'

/**
 * Questions Management Interface
 * List, search, and manage wizard questions
 */

import { useState } from 'react'
import Link from 'next/link'

// Mock data
const MOCK_QUESTIONS = [
  {
    id: '1',
    policy_id: 'aml',
    code: 'firm_role',
    text: 'Is your firm a Principal or Appointed Representative?',
    type: 'select',
    section: 'Firm Details',
    display_order: 0,
    has_dependencies: false,
  },
  {
    id: '2',
    policy_id: 'aml',
    code: 'pep_domestic',
    text: 'Do you have any Domestic PEPs as clients?',
    type: 'boolean',
    section: 'Risk Assessment',
    display_order: 1,
    has_dependencies: true,
  },
  {
    id: '3',
    policy_id: 'aml',
    code: 'client_types',
    text: 'What types of clients do you serve?',
    type: 'multiselect',
    section: 'Firm Details',
    display_order: 2,
    has_dependencies: false,
  },
]

export default function QuestionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPolicy, setFilterPolicy] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPolicy = filterPolicy === 'all' || q.policy_id === filterPolicy
    const matchesType = filterType === 'all' || q.type === filterType
    return matchesSearch && matchesPolicy && matchesType
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-200 mb-2">Questions</h1>
          <p className="text-slate-400 text-lg">
            Manage wizard questions and dependencies
          </p>
        </div>
        <Link
          href="/admin/questions/new"
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
          Create Question
        </Link>
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
                placeholder="Search by text or code..."
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
            <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">
              Question Type
            </label>
            <select
              id="type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="select">Select</option>
              <option value="multiselect">Multiselect</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-slate-400">
        Showing {filteredQuestions.length} of {MOCK_QUESTIONS.length} questions
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-200">{question.text}</h3>
                  {question.has_dependencies && (
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Conditional
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mb-3">
                  <span className="font-mono">{question.code}</span> •{' '}
                  <span className="capitalize">{question.type}</span> •{' '}
                  <span>{question.section}</span>
                </div>
                <div className="text-xs text-slate-500">Display Order: {question.display_order}</div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link
                  href={`/admin/questions/${question.id}`}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this question?')) {
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

        {filteredQuestions.length === 0 && (
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-400">No questions found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
