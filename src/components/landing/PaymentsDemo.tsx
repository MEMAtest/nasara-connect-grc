'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react'

interface Transaction {
  id: string
  from: string
  to: string
  amount: number
  status: 'approved' | 'flagged' | 'reviewing'
  risk: 'low' | 'medium' | 'high'
  timestamp: string
}

const mockTransactions: Transaction[] = [
  { id: 'TX-001', from: 'Acme Corp', to: 'Supplier Ltd', amount: 45000, status: 'approved', risk: 'low', timestamp: '2 min ago' },
  { id: 'TX-002', from: 'TechStart Inc', to: 'Vendor Co', amount: 125000, status: 'flagged', risk: 'high', timestamp: '5 min ago' },
  { id: 'TX-003', from: 'Finance Ltd', to: 'Service Provider', amount: 8500, status: 'approved', risk: 'low', timestamp: '8 min ago' },
  { id: 'TX-004', from: 'Global Trade', to: 'Logistics Inc', amount: 67000, status: 'reviewing', risk: 'medium', timestamp: '12 min ago' },
]

export default function PaymentsDemo() {
  const [transactions, setTransactions] = useState(mockTransactions)

  useEffect(() => {
    const interval = setInterval(() => {
      const newTx: Transaction = {
        id: `TX-${Math.floor(Math.random() * 1000)}`,
        from: ['Acme Corp', 'TechStart', 'Finance Ltd', 'Global Trade'][Math.floor(Math.random() * 4)],
        to: ['Supplier', 'Vendor', 'Service Provider', 'Logistics'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 150000) + 5000,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: ['approved', 'flagged', 'reviewing'][Math.floor(Math.random() * 3)] as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        timestamp: 'Just now'
      }
      setTransactions(prev => [newTx, ...prev.slice(0, 3)])
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'flagged': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'reviewing': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    }
  }

  const getRiskColor = (risk: Transaction['risk']) => {
    switch (risk) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-amber-600'
      case 'high': return 'text-red-600'
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Transaction List */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-2 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Live Transactions</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Monitoring</span>
          </div>
        </div>

        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedTx(tx)}
              className="p-4 rounded-lg border-2 hover:border-teal-500 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{tx.id}</span>
                <Badge className={getStatusColor(tx.status)}>
                  {tx.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-400">{tx.from}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{tx.to}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">£{tx.amount.toLocaleString()}</span>
                <span className={`text-xs font-medium ${getRiskColor(tx.risk)}`}>
                  {tx.risk.toUpperCase()} RISK
                </span>
              </div>

              <span className="text-xs text-slate-500">{tx.timestamp}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Analytics Panel */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 shadow-xl">
        <h3 className="text-xl font-semibold mb-6">Real-Time Analytics</h3>

        <div className="space-y-6">
          {/* Volume Metrics */}
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Transaction Volume (24h)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">£2.4M</span>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
          </div>

          {/* Status Distribution */}
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Status Distribution</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Approved</span>
                </div>
                <span className="font-semibold">87%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-green-500"
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Flagged</span>
                </div>
                <span className="font-semibold">8%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '8%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-red-500"
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-600" />
                  <span className="text-sm">Under Review</span>
                </div>
                <span className="font-semibold">5%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '5%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Compliance Score</span>
              <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                Excellent
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-teal-600">96</span>
              <span className="text-slate-600 dark:text-slate-400">/100</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
