'use client'

/**
 * Activity Feed Widget
 * Display recent actions, policy updates, and system events
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Activity {
  id: string
  type: 'policy' | 'document' | 'approval' | 'user' | 'system'
  action: string
  description: string
  user: string
  timestamp: string
  metadata?: {
    policy_name?: string
    document_id?: string
    status?: string
  }
}

export default function ActivityFeed() {
  const [filter, setFilter] = useState<'all' | Activity['type']>('all')

  const activities: Activity[] = [
    {
      id: '1',
      type: 'policy',
      action: 'Policy Updated',
      description: 'AML/CTF Policy updated to v1.3.0',
      user: 'Sarah Johnson',
      timestamp: '2025-01-15T14:30:00Z',
      metadata: {
        policy_name: 'AML/CTF Policy',
      },
    },
    {
      id: '2',
      type: 'document',
      action: 'Document Generated',
      description: 'New compliance document generated',
      user: 'System',
      timestamp: '2025-01-15T13:15:00Z',
      metadata: {
        document_id: 'DOC-2025-001',
      },
    },
    {
      id: '3',
      type: 'approval',
      action: 'Approval Requested',
      description: 'Data Protection Policy pending SMF17 approval',
      user: 'Michael Chen',
      timestamp: '2025-01-15T11:45:00Z',
      metadata: {
        status: 'pending',
      },
    },
    {
      id: '4',
      type: 'user',
      action: 'User Invited',
      description: 'New team member added to compliance team',
      user: 'Admin',
      timestamp: '2025-01-15T10:20:00Z',
    },
    {
      id: '5',
      type: 'system',
      action: 'System Update',
      description: 'Scheduled maintenance completed successfully',
      user: 'System',
      timestamp: '2025-01-15T03:00:00Z',
    },
  ]

  const filteredActivities =
    filter === 'all' ? activities : activities.filter((a) => a.type === filter)

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'policy':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        )
      case 'approval':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )
      case 'system':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          </svg>
        )
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'policy':
        return 'bg-violet-500/20 text-violet-400'
      case 'document':
        return 'bg-blue-500/20 text-blue-400'
      case 'approval':
        return 'bg-amber-500/20 text-amber-400'
      case 'user':
        return 'bg-green-500/20 text-green-400'
      case 'system':
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
            <h3 className="text-lg font-semibold text-slate-200">Recent Activity</h3>
            <p className="text-sm text-slate-400">Latest updates and events</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(['all', 'policy', 'document', 'approval', 'user', 'system'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === type
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:border-slate-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {filteredActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(
                activity.type
              )}`}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-200">{activity.action}</div>
                  <div className="text-xs text-slate-400 mt-1">{activity.description}</div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {getRelativeTime(activity.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 bg-slate-700/50 rounded-full flex items-center justify-center text-[10px] text-slate-300">
                  {activity.user.charAt(0)}
                </div>
                <div className="text-xs text-slate-500">{activity.user}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <button className="w-full px-4 py-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
          View All Activity →
        </button>
      </div>
    </div>
  )
}
