'use client'

/**
 * Approvals Interface
 * Review and approve/reject policy documents
 */

import { useState } from 'react'
import Link from 'next/link'

// Mock data
const MOCK_APPROVALS = [
  {
    id: '1',
    run_id: 'run-001',
    policy_name: 'AML/CTF Policy',
    policy_version: '1.2.0',
    firm_name: 'Acme Financial Services Ltd',
    status: 'pending' as const,
    requested_by: 'Compliance Team',
    requested_at: '2025-01-15T14:30:00Z',
    approver_role: 'SMF17',
    comments_count: 2,
  },
  {
    id: '2',
    run_id: 'run-002',
    policy_name: 'SMCR Conduct Rules',
    policy_version: '2.0.0',
    firm_name: 'Acme Financial Services Ltd',
    status: 'pending' as const,
    requested_by: 'HR Department',
    requested_at: '2025-01-14T09:15:00Z',
    approver_role: 'SMF16',
    comments_count: 0,
  },
  {
    id: '3',
    run_id: 'run-003',
    policy_name: 'Data Protection Policy',
    policy_version: '1.0.1',
    firm_name: 'Acme Financial Services Ltd',
    status: 'approved' as const,
    requested_by: 'IT Department',
    requested_at: '2025-01-13T16:45:00Z',
    approver_role: 'SMF17',
    approved_by: 'John Smith',
    approved_at: '2025-01-14T10:00:00Z',
    comments_count: 1,
  },
]

export default function ApprovalsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredApprovals = MOCK_APPROVALS.filter(
    (approval) => filterStatus === 'all' || approval.status === filterStatus
  )

  const pendingCount = MOCK_APPROVALS.filter((a) => a.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-200 mb-2">Approvals</h1>
            <p className="text-slate-400 text-lg">
              Review and approve policy documents
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-sm text-amber-300">Pending Approval</div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">Filter by Status:</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterStatus(option.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  filterStatus === option.value
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300'
                    : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <div
            key={approval.id}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-slate-200">
                    {approval.policy_name}
                  </h3>
                  <span className="px-2 py-0.5 bg-slate-800/50 rounded text-xs text-slate-400">
                    v{approval.policy_version}
                  </span>
                  {approval.status === 'pending' && (
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-300 font-medium">
                      Pending Approval
                    </span>
                  )}
                  {approval.status === 'approved' && (
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 font-medium">
                      ✓ Approved
                    </span>
                  )}
                  {approval.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 font-medium">
                      ✗ Rejected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-slate-500">Firm:</span>
                    <span className="text-slate-300 ml-2">{approval.firm_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Requested By:</span>
                    <span className="text-slate-300 ml-2">{approval.requested_by}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Required Approver:</span>
                    <span className="text-slate-300 ml-2">{approval.approver_role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Requested:</span>
                    <span className="text-slate-300 ml-2">
                      {new Date(approval.requested_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {approval.status === 'approved' && approval.approved_by && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                    <span className="text-green-400">
                      Approved by {approval.approved_by} on{' '}
                      {new Date(approval.approved_at!).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {approval.comments_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-3">
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
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    {approval.comments_count} comment{approval.comments_count !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Link
                  href={`/admin/approvals/${approval.id}`}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-colors text-center"
                >
                  View Details
                </Link>
                {approval.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        // In production: open approval modal
                        if (confirm('Approve this policy document?')) {
                          alert('Approval functionality would go here')
                        }
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        // In production: open rejection modal
                        if (confirm('Reject this policy document?')) {
                          alert('Rejection functionality would go here')
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredApprovals.length === 0 && (
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-400">No approvals found matching your filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
