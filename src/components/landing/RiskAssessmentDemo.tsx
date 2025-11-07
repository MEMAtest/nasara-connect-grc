'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingDown, Shield, Info } from 'lucide-react'

interface Risk {
  id: string
  title: string
  category: string
  likelihood: number // 1-5
  impact: number // 1-5
  status: 'open' | 'mitigating' | 'closed'
  mitigation?: string
}

const mockRisks: Risk[] = [
  { id: 'R-001', title: 'AML Screening Gap', category: 'Compliance', likelihood: 4, impact: 5, status: 'mitigating', mitigation: 'Enhanced screening implemented' },
  { id: 'R-002', title: 'Vendor Due Diligence', category: 'Operational', likelihood: 3, impact: 3, status: 'open' },
  { id: 'R-003', title: 'Data Privacy', category: 'Security', likelihood: 2, impact: 4, status: 'mitigating', mitigation: 'GDPR audit in progress' },
  { id: 'R-004', title: 'Transaction Monitoring', category: 'Compliance', likelihood: 4, impact: 4, status: 'open' },
  { id: 'R-005', title: 'Business Continuity', category: 'Operational', likelihood: 2, impact: 5, status: 'closed' },
  { id: 'R-006', title: 'Third-Party Risk', category: 'Operational', likelihood: 3, impact: 4, status: 'open' },
]

export default function RiskAssessmentDemo() {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(mockRisks[0])
  const [hoveredCell, setHoveredCell] = useState<{ likelihood: number, impact: number } | null>(null)

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact
    if (score >= 16) return { level: 'Critical', color: 'bg-red-600', text: 'text-red-600' }
    if (score >= 12) return { level: 'High', color: 'bg-orange-500', text: 'text-orange-600' }
    if (score >= 6) return { level: 'Medium', color: 'bg-amber-400', text: 'text-amber-600' }
    return { level: 'Low', color: 'bg-green-500', text: 'text-green-600' }
  }

  const getStatusColor = (status: Risk['status']) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'mitigating': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
      case 'closed': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  const getRisksInCell = (likelihood: number, impact: number) => {
    return mockRisks.filter(r => r.likelihood === likelihood && r.impact === impact)
  }

  return (
    <div className="space-y-6">
      {/* Risk Heatmap */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-2 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Interactive Risk Heatmap</h3>
          <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            12 Active Risks
          </Badge>
        </div>

        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-slate-600 dark:text-slate-400">
            Impact
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-6 gap-2">
            {/* Header row */}
            <div className="col-span-1" />
            {[1, 2, 3, 4, 5].map(l => (
              <div key={l} className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                {l}
              </div>
            ))}

            {/* Rows (from high to low impact) */}
            {[5, 4, 3, 2, 1].map(impact => (
              <>
                <div key={`label-${impact}`} className="flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  {impact}
                </div>
                {[1, 2, 3, 4, 5].map(likelihood => {
                  const risksInCell = getRisksInCell(likelihood, impact)
                  const riskLevel = getRiskLevel(likelihood, impact)
                  const isHovered = hoveredCell?.likelihood === likelihood && hoveredCell?.impact === impact

                  return (
                    <motion.div
                      key={`${likelihood}-${impact}`}
                      whileHover={{ scale: 1.05 }}
                      onHoverStart={() => setHoveredCell({ likelihood, impact })}
                      onHoverEnd={() => setHoveredCell(null)}
                      className={`aspect-square rounded-lg ${riskLevel.color} opacity-60 hover:opacity-100 transition-all cursor-pointer relative group`}
                      onClick={() => risksInCell.length > 0 && setSelectedRisk(risksInCell[0])}
                    >
                      {risksInCell.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="text-white font-bold text-lg">{risksInCell.length}</span>
                        </motion.div>
                      )}

                      {isHovered && risksInCell.length > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap">
                          {risksInCell[0].title}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </>
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 mt-2">
            Likelihood
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          {[
            { level: 'Low', color: 'bg-green-500' },
            { level: 'Medium', color: 'bg-amber-400' },
            { level: 'High', color: 'bg-orange-500' },
            { level: 'Critical', color: 'bg-red-600' }
          ].map(item => (
            <div key={item.level} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.level}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected Risk Details */}
      {selectedRisk && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 border-2 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{selectedRisk.id}</span>
                  <Badge className={getStatusColor(selectedRisk.status)}>
                    {selectedRisk.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">{selectedRisk.title}</h3>
                <Badge variant="outline" className="mb-4">{selectedRisk.category}</Badge>
              </div>
              <div className={`px-4 py-2 rounded-lg ${getRiskLevel(selectedRisk.likelihood, selectedRisk.impact).color} text-white font-semibold`}>
                {getRiskLevel(selectedRisk.likelihood, selectedRisk.impact).level}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Likelihood</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{selectedRisk.likelihood}</span>
                  <span className="text-slate-600 dark:text-slate-400">/5</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Impact</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{selectedRisk.impact}</span>
                  <span className="text-slate-600 dark:text-slate-400">/5</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Risk Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getRiskLevel(selectedRisk.likelihood, selectedRisk.impact).text}`}>
                    {selectedRisk.likelihood * selectedRisk.impact}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">/25</span>
                </div>
              </div>
            </div>

            {selectedRisk.mitigation && (
              <div className="p-4 rounded-lg bg-white dark:bg-slate-800 flex items-start gap-3">
                <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Mitigation Strategy</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedRisk.mitigation}</p>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Click on any cell in the heatmap to view risk details
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Critical Risks</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-3xl font-bold text-red-600">2</span>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Mitigating</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-bold text-amber-600">4</span>
        </Card>

        <Card className="p-4 border-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Risk Reduction</span>
            <TrendingDown className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-3xl font-bold text-green-600">-18%</span>
        </Card>
      </div>
    </div>
  )
}
