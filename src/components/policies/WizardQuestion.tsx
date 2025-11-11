'use client'

/**
 * Wizard Question Component
 * Renders individual questions with various input types
 */

import type { Question } from '@/lib/policies/types'

interface WizardQuestionProps {
  question: Question
  value: any
  onChange: (value: any) => void
  error?: string
}

export default function WizardQuestion({
  question,
  value,
  onChange,
  error,
}: WizardQuestionProps) {
  const isRequired = question.validation?.required

  // Render based on question type
  function renderInput() {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.help}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={question.validation?.min}
            max={question.validation?.max}
            placeholder={question.help}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
          />
        )

      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange(true)}
              className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                value === true
                  ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                  : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onChange(false)}
              className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                value === false
                  ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                  : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              No
            </button>
          </div>
        )

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
          >
            <option value="">Select an option...</option>
            {Array.isArray(question.options) &&
              question.options.map((option) => {
                if (typeof option === 'string') {
                  return (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  )
                } else {
                  return (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                }
              })}
          </select>
        )

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {Array.isArray(question.options) &&
              question.options.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value
                const optionLabel = typeof option === 'string' ? option : option.label
                const isSelected = selectedValues.includes(optionValue)

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onChange(selectedValues.filter((v) => v !== optionValue))
                      } else {
                        onChange([...selectedValues, optionValue])
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                        : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{optionLabel}</span>
                      {isSelected && (
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
          </div>
        )

      default:
        return (
          <div className="text-sm text-slate-500">
            Unsupported question type: {question.type}
          </div>
        )
    }
  }

  return (
    <div className="space-y-3">
      {/* Question Label */}
      <label className="block">
        <span className="text-base font-medium text-slate-200">
          {question.text}
          {isRequired && <span className="text-red-400 ml-1">*</span>}
        </span>
        {question.help && (
          <span className="block mt-1 text-sm text-slate-400">{question.help}</span>
        )}
      </label>

      {/* Input */}
      {renderInput()}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
