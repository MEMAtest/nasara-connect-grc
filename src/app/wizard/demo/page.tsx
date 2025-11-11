'use client'

/**
 * Policy Wizard Demo Page
 * Demonstrates the enhanced wizard with branching questions
 */

import { useState, useEffect } from 'react'
import PolicyWizard from '@/components/policies/PolicyWizard'
import type { Question, Rule } from '@/lib/policies/types'

export default function WizardDemoPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  // Handle save
  async function handleSave(answers: Record<string, any>, rulesResult: any) {
    console.log('Saving wizard state:', { answers, rulesResult })
    // In production, save to /api/runs/:runId
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
  }

  // Handle completion
  function handleComplete() {
    console.log('Wizard completed!')
    alert('Wizard completed! In production, this would navigate to the review page.')
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/"
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
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
            </a>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Policy Wizard Demo
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Experience the smart, branching questionnaire with dynamic clause selection
          </p>
        </div>

        {/* Features Banner */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Smart Branching</div>
                <div className="text-xs text-slate-500">Conditional questions</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Auto-Save</div>
                <div className="text-xs text-slate-500">Every 30 seconds</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-violet-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Dynamic Rules</div>
                <div className="text-xs text-slate-500">Real-time clauses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <PolicyWizard
          policyId="aml"
          policyName="AML/CTF Policy"
          firmId="00000000-0000-0000-0000-000000000001"
          questions={questions}
          rules={rules}
          onSave={handleSave}
          onComplete={handleComplete}
        />

        {/* Developer Info */}
        <div className="mt-12 bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">
            Developer Information
          </h3>
          <div className="space-y-2 text-sm text-slate-400">
            <p>
              <strong className="text-slate-300">Questions Loaded:</strong>{' '}
              {questions.length}
            </p>
            <p>
              <strong className="text-slate-300">Rules Loaded:</strong> {rules.length}
            </p>
            <p>
              <strong className="text-slate-300">Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Conditional question visibility based on dependencies</li>
              <li>Real-time rules engine evaluation</li>
              <li>Dynamic clause inclusion/exclusion</li>
              <li>Clause suggestions with reasoning</li>
              <li>Progress tracking per section</li>
              <li>Auto-save every 30 seconds</li>
              <li>Form validation with error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
