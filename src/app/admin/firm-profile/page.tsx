'use client'

/**
 * Firm Profile Management Page
 * Admin interface for managing firm profile attributes and branding
 */

import { useState } from 'react'
import FirmProfileForm from '@/components/policies/FirmProfileForm'
import type { FirmProfile } from '@/lib/policies/types'

export default function FirmProfilePage() {
  const [savedProfile, setSavedProfile] = useState<FirmProfile | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // In a real app, you would get the firmId from authentication context
  const firmId = '00000000-0000-0000-0000-000000000001' // Default firm from migration

  function handleSaved(profile: FirmProfile) {
    setSavedProfile(profile)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Firm Profile Settings
          </h1>
          <p className="text-slate-400">
            Configure your firm&apos;s attributes and branding preferences. These settings
            will be used to pre-fill policy questionnaires and customize generated
            documents.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-sm text-green-400">
              Profile saved successfully! Your changes will be reflected in new policy
              generation runs.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
          <FirmProfileForm firmId={firmId} onSaved={handleSaved} />
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-3">
            How Profile Settings Work
          </h2>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>
                <strong className="text-slate-300">Firm Attributes:</strong> These
                settings pre-populate questionnaire answers and drive conditional logic
                in the policy wizard
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>
                <strong className="text-slate-300">Branding:</strong> Customize the
                appearance of generated policy documents with your colors, logo, and font
                preferences
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>
                <strong className="text-slate-300">Rules Engine:</strong> Your attribute
                selections automatically include or exclude relevant policy clauses based
                on your regulatory permissions and business model
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>
                <strong className="text-slate-300">Watermarking:</strong> Draft documents
                can be automatically watermarked to prevent accidental distribution before
                approval
              </span>
            </li>
          </ul>
        </div>

        {/* Current Profile Display (Debug) */}
        {savedProfile && (
          <div className="mt-8 bg-slate-900/30 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">
              Current Profile (Debug)
            </h2>
            <pre className="text-xs text-slate-400 overflow-auto max-h-96 bg-slate-950/50 rounded p-4">
              {JSON.stringify(savedProfile, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
