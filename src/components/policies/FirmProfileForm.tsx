'use client'

/**
 * Firm Profile Form
 * Allows editing of firm attributes and branding
 */

import { useState, useEffect } from 'react'
import type { FirmProfile, FirmAttributes, FirmBranding } from '@/lib/policies/types'

const PRINCIPAL_OPTIONS = ['principal', 'appointed_representative'] as const
const FIRM_SIZES = ['small', 'medium', 'large'] as const

interface FirmProfileFormProps {
  firmId: string
  onSaved?: (profile: FirmProfile) => void
  onCancel?: () => void
}

export default function FirmProfileForm({
  firmId,
  onSaved,
  onCancel,
}: FirmProfileFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [attributes, setAttributes] = useState<FirmAttributes>({
    permissions: [],
    client_types: [],
    channels: [],
    ar_or_principal: 'principal',
    size: 'medium',
    outsourcing: [],
    high_risk_jurisdictions: [],
    products: [],
  })
  const [branding, setBranding] = useState<FirmBranding>({
    logo_url: '',
    primary_color: '#4F46E5',
    secondary_color: '#10B981',
    font: 'Inter',
    watermark_drafts: true,
  })

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const response = await fetch(`/api/firms/${firmId}/profile`)

        if (response.ok) {
          const profile: FirmProfile = await response.json()
          setName(profile.name)
          setAttributes(profile.attributes)
          setBranding(profile.branding)
        } else if (response.status === 404) {
          // Profile doesn't exist yet, use defaults
          setName('')
        } else {
          throw new Error('Failed to load profile')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [firmId])

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/firms/${firmId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, attributes, branding }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const profile: FirmProfile = await response.json()
      onSaved?.(profile)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Helper to toggle array values
  function toggleArrayValue(
    array: string[] | undefined,
    value: string,
    setter: (arr: string[]) => void
  ) {
    const current = array || []
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value))
    } else {
      setter([...current, value])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Basic Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Firm Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder="e.g., Acme Financial Services Ltd"
          />
        </div>
      </section>

      {/* Firm Attributes */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-200">Firm Attributes</h3>

        {/* Principal or AR */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Principal or Appointed Representative
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PRINCIPAL_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setAttributes({ ...attributes, ar_or_principal: type })
                }
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  attributes.ar_or_principal === type
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {type === 'principal' ? 'Principal' : 'Appointed Representative'}
              </button>
            ))}
          </div>
        </div>

        {/* Firm Size */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Firm Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FIRM_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setAttributes({ ...attributes, size })}
                className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  attributes.size === size
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* FCA Permissions */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            FCA Permissions
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              'credit_broking',
              'insurance_mediation',
              'investments_advice',
              'retail_lending',
              'psd2_payment_services',
              'emoney_issuance',
            ].map((permission) => {
              const isSelected = attributes.permissions?.includes(permission)
              return (
                <button
                  key={permission}
                  type="button"
                  onClick={() =>
                    toggleArrayValue(
                      attributes.permissions,
                      permission,
                      (val) => setAttributes({ ...attributes, permissions: val })
                    )
                  }
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors text-left ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {permission.replace(/_/g, ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Client Types */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Client Types
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['retail', 'professional', 'ecp'].map((type) => {
              const isSelected = attributes.client_types?.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    toggleArrayValue(
                      attributes.client_types,
                      type,
                      (val) => setAttributes({ ...attributes, client_types: val })
                    )
                  }
                  className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {type === 'ecp' ? 'ECP' : type}
                </button>
              )
            })}
          </div>
        </div>

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Distribution Channels
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['online', 'telephone', 'face_to_face'].map((channel) => {
              const isSelected = attributes.channels?.includes(channel)
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() =>
                    toggleArrayValue(
                      attributes.channels,
                      channel,
                      (val) => setAttributes({ ...attributes, channels: val })
                    )
                  }
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                      : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {channel.replace(/_/g, ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Outsourcing */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Outsourced Functions
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['kyc_vendor', 'tm_system', 'call_center', 'payment_processing'].map(
              (outsource) => {
                const isSelected = attributes.outsourcing?.includes(outsource)
                return (
                  <button
                    key={outsource}
                    type="button"
                    onClick={() =>
                      toggleArrayValue(
                        attributes.outsourcing,
                        outsource,
                        (val) => setAttributes({ ...attributes, outsourcing: val })
                      )
                    }
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors text-left ${
                      isSelected
                        ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                        : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {outsource.replace(/_/g, ' ')}
                  </button>
                )
              }
            )}
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Branding</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-slate-300 mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="primary_color"
                value={branding.primary_color}
                onChange={(e) =>
                  setBranding({ ...branding, primary_color: e.target.value })
                }
                className="h-10 w-20 rounded border border-slate-700"
              />
              <input
                type="text"
                value={branding.primary_color}
                onChange={(e) =>
                  setBranding({ ...branding, primary_color: e.target.value })
                }
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-slate-300 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="secondary_color"
                value={branding.secondary_color}
                onChange={(e) =>
                  setBranding({ ...branding, secondary_color: e.target.value })
                }
                className="h-10 w-20 rounded border border-slate-700"
              />
              <input
                type="text"
                value={branding.secondary_color}
                onChange={(e) =>
                  setBranding({ ...branding, secondary_color: e.target.value })
                }
                className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-slate-300 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            id="logo_url"
            value={branding.logo_url}
            onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div>
          <label htmlFor="font" className="block text-sm font-medium text-slate-300 mb-2">
            Font Family
          </label>
          <select
            id="font"
            value={branding.font}
            onChange={(e) => setBranding({ ...branding, font: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="watermark_drafts"
            checked={branding.watermark_drafts}
            onChange={(e) =>
              setBranding({ ...branding, watermark_drafts: e.target.checked })
            }
            className="w-4 h-4 text-violet-500 bg-slate-800 border-slate-700 rounded focus:ring-violet-500"
          />
          <label htmlFor="watermark_drafts" className="ml-2 text-sm text-slate-300">
            Watermark draft documents
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !name}
          className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}
