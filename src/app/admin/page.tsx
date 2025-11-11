'use client'

/**
 * Admin Dashboard Overview
 * Main landing page for admin CMS
 */

import Link from 'next/link'

export default function AdminDashboard() {
  // Mock statistics - in production, fetch from API
  const stats = {
    policies: 5,
    clauses: 48,
    questions: 32,
    rules: 24,
    pending_approvals: 3,
    active_runs: 12,
  }

  const quickActions = [
    {
      name: 'Create New Clause',
      href: '/admin/clauses/new',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      color: 'violet',
    },
    {
      name: 'Add Question',
      href: '/admin/questions/new',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      name: 'Create Rule',
      href: '/admin/rules/new',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      name: 'Review Approvals',
      href: '/admin/approvals',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'amber',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 text-lg">
          Manage policies, clauses, questions, and approval workflows
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-violet-400"
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
            <Link
              href="/admin/policies"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{stats.policies}</div>
          <div className="text-sm text-slate-400">Active Policies</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <Link
              href="/admin/clauses"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{stats.clauses}</div>
          <div className="text-sm text-slate-400">Policy Clauses</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Link
              href="/admin/questions"
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{stats.questions}</div>
          <div className="text-sm text-slate-400">Wizard Questions</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <Link
              href="/admin/rules"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{stats.rules}</div>
          <div className="text-sm text-slate-400">Active Rules</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Link
              href="/admin/approvals"
              className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">
            {stats.pending_approvals}
          </div>
          <div className="text-sm text-slate-400">Pending Approvals</div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-400"
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
          </div>
          <div className="text-3xl font-bold text-slate-200 mb-1">{stats.active_runs}</div>
          <div className="text-sm text-slate-400">Active Policy Runs</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-200 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-${action.color}-500/50 transition-colors group`}
            >
              <div
                className={`w-12 h-12 bg-${action.color}-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${action.color}-500/30 transition-colors`}
              >
                <div className={`text-${action.color}-400`}>{action.icon}</div>
              </div>
              <div className="font-semibold text-slate-200">{action.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-4">Recent Activity</h2>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="space-y-4">
            {[
              {
                action: 'Clause updated',
                target: 'AML Enhanced Due Diligence',
                user: 'Admin',
                time: '2 hours ago',
                color: 'blue',
              },
              {
                action: 'Rule created',
                target: 'PEP Domestic Detection',
                user: 'Admin',
                time: '4 hours ago',
                color: 'green',
              },
              {
                action: 'Document approved',
                target: 'AML Policy v1.2.0',
                user: 'SMF17',
                time: '1 day ago',
                color: 'violet',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0"
              >
                <div
                  className={`w-10 h-10 bg-${item.color}-500/20 rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <div className={`w-2 h-2 bg-${item.color}-400 rounded-full`}></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{item.action}</div>
                  <div className="text-sm text-slate-400">{item.target}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">{item.user}</div>
                  <div className="text-xs text-slate-500">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
