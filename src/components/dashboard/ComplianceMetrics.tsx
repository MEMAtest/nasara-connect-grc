'use client'

/**
 * Compliance Metrics Widget
 * Display compliance status, policy coverage, and risk score
 */

import { motion } from 'framer-motion'

interface ComplianceMetric {
  label: string
  value: number
  max: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

export default function ComplianceMetrics() {
  const metrics: ComplianceMetric[] = [
    {
      label: 'Policy Coverage',
      value: 92,
      max: 100,
      status: 'excellent',
      trend: 'up',
    },
    {
      label: 'Documentation',
      value: 85,
      max: 100,
      status: 'good',
      trend: 'stable',
    },
    {
      label: 'Risk Score',
      value: 68,
      max: 100,
      status: 'warning',
      trend: 'down',
    },
  ]

  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + (m.value / m.max) * 100, 0) / metrics.length
  )

  const getStatusColor = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400 bg-green-500/20'
      case 'good':
        return 'text-blue-400 bg-blue-500/20'
      case 'warning':
        return 'text-amber-400 bg-amber-500/20'
      case 'critical':
        return 'text-red-400 bg-red-500/20'
    }
  }

  const getProgressColor = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-blue-500'
      case 'warning':
        return 'bg-amber-500'
      case 'critical':
        return 'bg-red-500'
    }
  }

  const getTrendIcon = (trend: ComplianceMetric['trend']) => {
    if (trend === 'up') {
      return (
        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else if (trend === 'down') {
      return (
        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Compliance Status</h3>
            <p className="text-sm text-slate-400">Overall health score</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="relative w-32 h-32 mx-auto">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-800"
            />
            {/* Progress circle */}
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 352 }}
              animate={{
                strokeDashoffset: 352 - (352 * overallScore) / 100,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: 352,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-200">{overallScore}</div>
              <div className="text-xs text-slate-400">Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">{metric.label}</span>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-200">{metric.value}%</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                    metric.status
                  )}`}
                >
                  {metric.status}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-full ${getProgressColor(metric.status)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
        <button className="w-full px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors text-sm font-medium text-left flex items-center justify-between">
          <span>Review Policy Gaps</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium text-left flex items-center justify-between">
          <span>Download Compliance Report</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
