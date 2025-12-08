'use client'

/**
 * Policy Wizard Component
 * Smart, branching questionnaire with dynamic clause selection
 */

import { useMemo, useEffect } from 'react'
import { useWizardState } from '@/hooks/useWizardState'
import { validateAnswers } from '@/lib/policies/rules-engine'
import WizardQuestion from './WizardQuestion'
import { useAssistantContext } from '@/components/dashboard/useAssistantContext'
import type { Question, Rule, FirmAttributes, JsonValue, RulesEngineResult } from '@/lib/policies/types'

interface PolicyWizardProps {
  policyId: string
  policyName: string
  runId?: string
  firmId: string
  questions: Question[]
  rules: Rule[]
  firmAttributes?: FirmAttributes
  onComplete?: () => void
  onSave?: (answers: Record<string, JsonValue>, rulesResult: RulesEngineResult) => Promise<void>
}

export default function PolicyWizard({
  policyId,
  policyName,
  runId,
  firmId,
  questions,
  rules,
  firmAttributes,
  onComplete,
  onSave,
}: PolicyWizardProps) {
  const { setContext } = useAssistantContext()
  const {
    state,
    updateAnswer,
    save,
    hasUnsavedChanges,
  } = useWizardState({
    policyId,
    runId,
    firmId,
    questions,
    rules,
    firmAttributes,
    onSave,
    autoSaveInterval: 30000, // 30 seconds
  })

  // Prefill assistant context so chat uses policy/run grounding
  useEffect(() => {
    setContext({ policyId, runId, path: `/wizard/${policyId}` })
  }, [policyId, runId, setContext])

  // Group questions by section
  const sections = useMemo(() => {
    const sectionMap = new Map<string, Question[]>()

    for (const question of questions) {
      const section = question.section || 'General'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section)!.push(question)
    }

    return Array.from(sectionMap.entries()).map(([name, questions]) => ({
      name,
      questions: questions.sort((a, b) => a.display_order - b.display_order),
    }))
  }, [questions])

  // Get visible questions
  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => state.visibleQuestionCodes.includes(q.code))
  }, [questions, state.visibleQuestionCodes])

  // Validate current answers
  const validationErrors = useMemo(() => {
    const errors = validateAnswers(
      visibleQuestions,
      state.answers,
      state.visibleQuestionCodes
    )
    return new Map(errors.map((err) => [err.field, err.message]))
  }, [visibleQuestions, state.answers, state.visibleQuestionCodes])

  // Calculate section completion
  function getSectionCompletion(sectionQuestions: Question[]): number {
    const visible = sectionQuestions.filter((q) =>
      state.visibleQuestionCodes.includes(q.code)
    )
    if (visible.length === 0) return 100

    const answered = visible.filter((q) => {
      const answer = state.answers[q.code]
      return answer !== undefined && answer !== null && answer !== ''
    })

    return Math.round((answered.length / visible.length) * 100)
  }

  // Handle manual save
  async function handleSave() {
    try {
      await save()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading wizard...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-red-400">{state.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{policyName}</h2>
          <p className="text-slate-400 mt-1">
            Answer the questions below to generate a tailored policy document
          </p>
        </div>

        {/* Save Status */}
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm">
            {state.isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                <span className="text-slate-400">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-slate-400">Unsaved changes</span>
              </>
            ) : state.lastSavedAt ? (
              <>
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-slate-400">
                  Saved {new Date(state.lastSavedAt).toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>
          <button
            onClick={handleSave}
            disabled={state.isSaving || !hasUnsavedChanges}
            className="mt-2 px-4 py-2 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Now
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Overall Progress</span>
          <span className="text-violet-400 font-medium">{state.progress}%</span>
        </div>
        <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section) => {
          const visibleInSection = section.questions.filter((q) =>
            state.visibleQuestionCodes.includes(q.code)
          )

          if (visibleInSection.length === 0) {
            return null
          }

          const sectionCompletion = getSectionCompletion(section.questions)

          return (
            <div
              key={section.name}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8"
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-200">
                  {section.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">
                    {sectionCompletion}% complete
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 transition-all duration-300"
                      style={{ width: `${sectionCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {visibleInSection.map((question) => (
                  <WizardQuestion
                    key={question.id}
                    question={question}
                    value={state.answers[question.code]}
                    onChange={(value) => updateAnswer(question.code, value)}
                    error={validationErrors.get(question.code)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Clauses Summary */}
      {state.rulesResult.included_clauses.length > 0 && (
        <div className="bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-violet-300 mb-3">
            Selected Clauses ({state.rulesResult.included_clauses.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {state.rulesResult.included_clauses.map((code) => (
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

      {/* Suggested Clauses */}
      {state.rulesResult.suggested_clauses.length > 0 && (
        <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-300 mb-3">
            Suggested Clauses
          </h3>
          <div className="space-y-3">
            {state.rulesResult.suggested_clauses.map((suggestion, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div className="font-medium text-amber-300">{suggestion.code}</div>
                  <div className="text-sm text-amber-400/70 mt-1">
                    {suggestion.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleSave}
          disabled={state.isSaving || !hasUnsavedChanges}
          className="px-6 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Draft
        </button>
        <button
          onClick={onComplete}
          disabled={state.progress < 100 || validationErrors.size > 0}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}
