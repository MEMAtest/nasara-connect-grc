'use client'

/**
 * Clause Editor
 * Create or edit individual clauses
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Clause } from '@/lib/policies/types'

export default function ClauseEditorPage() {
  const params = useParams()
  const router = useRouter()
  const clauseId = params.id as string
  const isNew = clauseId === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [policyId, setPolicyId] = useState('aml')
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [bodyMd, setBodyMd] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [riskRefs, setRiskRefs] = useState<string[]>([])
  const [riskRefInput, setRiskRefInput] = useState('')
  const [isMandatory, setIsMandatory] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(100)
  const [version, setVersion] = useState('1.0.0')

  // Load existing clause
  useEffect(() => {
    if (!isNew) {
      // In production, fetch from API
      // For now, use mock data
      setTimeout(() => {
        setCode('aml_edd_domestic_pep')
        setTitle('Enhanced Due Diligence for Domestic PEPs')
        setBodyMd(`## Enhanced Due Diligence for Domestic Politically Exposed Persons

{{ firm_name }} has identified that it serves clients who are Domestic Politically Exposed Persons (PEPs).

### Requirements

The firm must apply enhanced due diligence (EDD) measures for all Domestic PEP clients, including:

- Enhanced identity verification procedures
- Source of wealth and source of funds verification
- Ongoing monitoring with increased frequency
- Senior management approval for establishing business relationships

### Approval Authority

All Domestic PEP relationships must be approved by: **{{ approver_role }}**`)
        setTags(['aml', 'pep', 'edd'])
        setRiskRefs(['AML-001', 'PEP-DOM'])
        setIsMandatory(false)
        setDisplayOrder(100)
        setLoading(false)
      }, 500)
    }
  }, [isNew, clauseId])

  // Handle save
  async function handleSave() {
    try {
      setSaving(true)
      setError(null)

      // Validate
      if (!code || !title || !bodyMd) {
        throw new Error('Code, title, and body are required')
      }

      // In production, call API
      // await saveClause({ ... })

      console.log('Saving clause:', {
        policy_id: policyId,
        code,
        title,
        body_md: bodyMd,
        tags,
        risk_refs: riskRefs,
        is_mandatory: isMandatory,
        display_order: displayOrder,
        version,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('Clause saved successfully!')
      router.push('/admin/clauses')
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save clause')
    } finally {
      setSaving(false)
    }
  }

  // Add tag
  function addTag() {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput('')
    }
  }

  // Remove tag
  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  // Add risk ref
  function addRiskRef() {
    if (riskRefInput && !riskRefs.includes(riskRefInput)) {
      setRiskRefs([...riskRefs, riskRefInput])
      setRiskRefInput('')
    }
  }

  // Remove risk ref
  function removeRiskRef(ref: string) {
    setRiskRefs(riskRefs.filter((r) => r !== ref))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading clause...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-200 mb-2">
          {isNew ? 'Create New Clause' : 'Edit Clause'}
        </h1>
        <p className="text-slate-400 text-lg">
          {isNew ? 'Add a new clause to the policy library' : `Editing: ${code}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="policy" className="block text-sm font-medium text-slate-300 mb-2">
                Policy *
              </label>
              <select
                id="policy"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="aml">AML/CTF</option>
                <option value="smcr">SMCR</option>
                <option value="data_protection">Data Protection</option>
              </select>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-2">
                Clause Code *
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., aml_edd_domestic_pep"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enhanced Due Diligence for Domestic PEPs"
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-200">Content</h2>
            <span className="text-sm text-slate-400">Markdown with Liquid variables</span>
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-slate-300 mb-2">
              Clause Body *
            </label>
            <textarea
              id="body"
              value={bodyMd}
              onChange={(e) => setBodyMd(e.target.value)}
              rows={20}
              placeholder="Enter markdown content with {{ variables }}"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono text-sm"
            />
          </div>

          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Available Liquid Variables
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
              <span className="text-violet-400">{'{{ firm_name }}'}</span>
              <span className="text-violet-400">{'{{ approver_role }}'}</span>
              <span className="text-violet-400">{'{{ risk_score }}'}</span>
              <span className="text-violet-400">{'{{ client_types }}'}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Metadata</h2>

          <div className="space-y-6">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Risk References */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Risk References
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={riskRefInput}
                  onChange={(e) => setRiskRefInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRiskRef())}
                  placeholder="e.g., AML-001"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <button
                  onClick={addRiskRef}
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskRefs.map((ref) => (
                  <span
                    key={ref}
                    className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-2"
                  >
                    {ref}
                    <button
                      onClick={() => removeRiskRef(ref)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  id="mandatory"
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="w-4 h-4 text-violet-500 bg-slate-800 border-slate-700 rounded focus:ring-violet-500"
                />
                <label htmlFor="mandatory" className="ml-2 text-sm text-slate-300">
                  Mandatory Clause
                </label>
              </div>

              <div>
                <label
                  htmlFor="display"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Display Order
                </label>
                <input
                  id="display"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label htmlFor="version" className="block text-sm font-medium text-slate-300 mb-2">
                  Version
                </label>
                <input
                  id="version"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.push('/admin/clauses')}
            className="px-6 py-3 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Clause'}
          </button>
        </div>
      </div>
    </div>
  )
}
