'use client'

/**
 * Document Review Page
 * Review and download generated policy documents
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { AuditBundle } from '@/lib/documents/document-generator'

interface GeneratedDocuments {
  run_id: string
  filename: string
  docx_url: string
  pdf_url: string | null
  audit_url: string
  audit_bundle: AuditBundle
  generated_at: string
}

export default function DocumentReviewPage() {
  const params = useParams()
  const runId = params.runId as string

  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documents, setDocuments] = useState<GeneratedDocuments | null>(null)
  const [showAuditDetails, setShowAuditDetails] = useState(false)

  // Generate documents
  async function handleGenerate() {
    try {
      setGenerating(true)
      setError(null)

      const response = await fetch(`/api/runs/${runId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generated_by: 'System',
          effective_date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generation failed')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate documents')
    } finally {
      setGenerating(false)
    }
  }

  // Download file
  async function handleDownload(url: string, filename: string) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download file')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <a
              href="/wizard/full-demo"
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
              Document Review
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Generate and download your policy documents
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Generate Section */}
        {!documents && (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-violet-400"
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
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-3">
                Ready to Generate Documents
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Click the button below to generate your policy documents based on the
                wizard responses. This will create DOCX and audit bundle files.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-lg font-medium rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate Documents'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {documents && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-green-400"
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
                <div>
                  <h3 className="text-lg font-semibold text-green-400">
                    Documents Generated Successfully
                  </h3>
                  <p className="text-sm text-green-300">
                    Generated at{' '}
                    {new Date(documents.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DOCX Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">
                        Policy Document
                      </h3>
                      <p className="text-sm text-slate-400">DOCX Format</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Microsoft Word format with full formatting, branding, and clause content.
                  Compatible with Word, Google Docs, and LibreOffice.
                </p>
                <button
                  onClick={() =>
                    handleDownload(documents.docx_url, `${documents.filename}.docx`)
                  }
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download DOCX
                </button>
              </div>

              {/* Audit Bundle Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">
                        Audit Bundle
                      </h3>
                      <p className="text-sm text-slate-400">JSON Format</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Complete audit trail with all answers, rules fired, clauses selected,
                  and metadata for compliance records.
                </p>
                <button
                  onClick={() =>
                    handleDownload(
                      documents.audit_url,
                      `${documents.filename}_audit.json`
                    )
                  }
                  className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download Audit Bundle
                </button>
              </div>
            </div>

            {/* Audit Summary */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-200">
                  Generation Summary
                </h3>
                <button
                  onClick={() => setShowAuditDetails(!showAuditDetails)}
                  className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {showAuditDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-violet-400">
                    {documents.audit_bundle.included_clauses.length}
                  </div>
                  <div className="text-sm text-slate-400">Clauses Included</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-400">
                    {documents.audit_bundle.rules_fired.length}
                  </div>
                  <div className="text-sm text-slate-400">Rules Fired</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {Object.keys(documents.audit_bundle.answers).length}
                  </div>
                  <div className="text-sm text-slate-400">Questions Answered</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3">
                  <div className="text-2xl font-bold text-amber-400">
                    {Object.keys(documents.audit_bundle.variables).length}
                  </div>
                  <div className="text-sm text-slate-400">Variables Set</div>
                </div>
              </div>

              {/* Detailed Audit Info */}
              {showAuditDetails && (
                <div className="mt-6 space-y-4">
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">
                      Policy Information
                    </h4>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <span>Policy:</span>
                        <span className="text-slate-300">
                          {documents.audit_bundle.policy_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span className="text-slate-300">
                          {documents.audit_bundle.policy_version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Firm:</span>
                        <span className="text-slate-300">
                          {documents.audit_bundle.firm_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">
                      Included Clauses
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {documents.audit_bundle.included_clauses.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-xs text-violet-300"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDocuments(null)}
                className="px-6 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                Generate New Version
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
