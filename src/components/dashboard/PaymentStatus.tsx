'use client'

/**
 * Payment Status Widget
 * Track payment processing, invoices, and transaction history
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Payment {
  id: string
  type: 'subscription' | 'invoice' | 'usage'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  description: string
  date: string
}

export default function PaymentStatus() {
  const [payments] = useState<Payment[]>([
    {
      id: 'PAY-001',
      type: 'subscription',
      amount: 299.0,
      currency: 'GBP',
      status: 'completed',
      description: 'Monthly Subscription - Pro Plan',
      date: '2025-01-15',
    },
    {
      id: 'PAY-002',
      type: 'invoice',
      amount: 150.0,
      currency: 'GBP',
      status: 'processing',
      description: 'Custom Policy Development',
      date: '2025-01-14',
    },
    {
      id: 'PAY-003',
      type: 'usage',
      amount: 45.5,
      currency: 'GBP',
      status: 'pending',
      description: 'Additional Document Generation',
      date: '2025-01-13',
    },
  ])

  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalCompleted = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'pending':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
    }
  }

  const getTypeIcon = (type: Payment['type']) => {
    switch (type) {
      case 'subscription':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )
      case 'invoice':
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
      case 'usage':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Payment Status</h3>
            <p className="text-sm text-slate-400">Track your transactions</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-400">£{totalPending.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-400">£{totalCompleted.toFixed(2)}</div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-3">
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-slate-800/20 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-300">
                  {getTypeIcon(payment.type)}
                </div>
                <div>
                  <div className="font-medium text-slate-200">{payment.description}</div>
                  <div className="text-xs text-slate-500">{payment.id}</div>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                  payment.status
                )}`}
              >
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
              <div className="text-sm text-slate-400">
                {new Date(payment.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="text-lg font-bold text-slate-200">
                £{payment.amount.toFixed(2)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-6 border-t border-slate-800 flex gap-3">
        <button className="flex-1 px-4 py-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors text-sm font-medium">
          View All Transactions
        </button>
        <button className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
          Download Invoice
        </button>
      </div>
    </div>
  )
}
