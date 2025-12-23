'use client'

/**
 * Clause Preview Panel
 * Live preview of selected clauses with rendered Liquid variables
 */

import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { renderPolicyMarkdown } from "@/lib/policies/markdown";
import { renderClause } from '@/lib/policies/liquid-renderer'
import type { Clause, RulesEngineResult, JsonValue } from '@/lib/policies/types'

interface ClausePreviewPanelProps {
  clauses: Clause[]
  rulesResult: RulesEngineResult
  answers: Record<string, JsonValue>
}

export default function ClausePreviewPanel({
  clauses,
  rulesResult,
  answers,
}: ClausePreviewPanelProps) {
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set())

  // Filter and render selected clauses
  const renderedClauses = useMemo(() => {
    return clauses
      .filter((clause) => rulesResult.included_clauses.includes(clause.code))
      .sort((a, b) => a.display_order - b.display_order)
      .map((clause) => ({
        ...clause,
        rendered_body: renderClause(clause.body_md, rulesResult.variables, answers),
      }))
  }, [clauses, rulesResult, answers])

  // Toggle clause expansion
  function toggleClause(code: string) {
    setExpandedClauses((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  // Expand all
  function expandAll() {
    setExpandedClauses(new Set(renderedClauses.map((c) => c.code)))
  }

  // Collapse all
  function collapseAll() {
    setExpandedClauses(new Set())
  }

  if (renderedClauses.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
        <div className="text-center text-slate-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
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
          <p className="text-lg font-medium mb-2">No Clauses Selected Yet</p>
          <p className="text-sm">
            Answer the wizard questions to see your policy document preview
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">Policy Preview</h3>
          <p className="text-sm text-slate-400">
            {renderedClauses.length} clause{renderedClauses.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-3">
        {renderedClauses.map((clause, index) => {
          const isExpanded = expandedClauses.has(clause.code)
          const isSuggested = rulesResult.suggested_clauses.some(
            (s) => s.code === clause.code
          )
          const suggestion = rulesResult.suggested_clauses.find(
            (s) => s.code === clause.code
          )

          return (
            <div
              key={clause.code}
              className={`bg-slate-900/50 backdrop-blur-sm border rounded-xl overflow-hidden transition-colors ${
                clause.is_mandatory
                  ? 'border-violet-500/30'
                  : isSuggested
                    ? 'border-amber-500/30'
                    : 'border-slate-800'
              }`}
            >
              {/* Clause Header */}
              <button
                onClick={() => toggleClause(clause.code)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-500 font-mono text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-200">{clause.title}</h4>
                      {clause.is_mandatory && (
                        <span className="px-2 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300">
                          Mandatory
                        </span>
                      )}
                      {isSuggested && (
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-xs text-amber-300">
                          Suggested
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      {clause.code}
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Suggestion Reason */}
              {isSuggested && suggestion && (
                <div className="px-6 py-3 bg-amber-500/5 border-t border-amber-500/10">
                  <div className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0"
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
                    <span className="text-amber-300">{suggestion.reason}</span>
                  </div>
                </div>
              )}

              {/* Clause Body (Expanded) */}
              {isExpanded && (
                <div className="px-6 py-4 border-t border-slate-800">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div
                      className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(clause.rendered_body) }}
                    />
                  </div>

                  {/* Tags */}
                  {clause.tags && clause.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(clause.tags) ? (
                          clause.tags.map((tag) => (
                            <span
                              key={typeof tag === 'string' ? tag : JSON.stringify(tag)}
                              className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400"
                            >
                              {typeof tag === 'string' ? tag : JSON.stringify(tag)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">Invalid tags format</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Variables Display (Debug) */}
      {Object.keys(rulesResult.variables).length > 0 && (
        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Template Variables
          </h4>
          <div className="space-y-2">
            {Object.entries(rulesResult.variables).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-400 font-mono">{key}</span>
                <span className="text-slate-300">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function renderMarkdown(markdown: string): string {
  const html = renderPolicyMarkdown(markdown ?? "");
  return DOMPurify.sanitize(html)
}
