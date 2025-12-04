'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CaseStudyIcon } from './CaseStudyIcons'
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CaseStudy } from '@/lib/database'

interface CaseStudyModalProps {
  caseStudy: CaseStudy | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CaseStudyModal({ caseStudy, open, onOpenChange }: CaseStudyModalProps) {
  if (!caseStudy) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 p-0 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-8">
          {/* Header with Icon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            {/* Large Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 mb-6 shadow-lg shadow-emerald-500/20"
            >
              <CaseStudyIcon iconKey={caseStudy.iconKey} className="w-16 h-16" />
            </motion.div>

            <DialogHeader className="text-center space-y-2">
              <DialogTitle className="text-2xl font-bold text-white">
                {caseStudy.title}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base">
                {caseStudy.subtitle}
              </DialogDescription>
            </DialogHeader>
          </motion.div>

          {/* Metrics Section */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {caseStudy.metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:border-emerald-500/50 transition-colors"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-white mb-0.5">
                    {metric.label}
                  </div>
                  {metric.description && (
                    <div className="text-xs text-slate-500">
                      {metric.description}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Before/After Section */}
          {caseStudy.beforeAfter && caseStudy.beforeAfter.before && caseStudy.beforeAfter.after && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              {/* Before */}
              <div className="bg-slate-800/30 border border-red-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                    Before
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {caseStudy.beforeAfter.before.label}
                </div>
                <div className="text-2xl font-bold text-red-400 mb-3">
                  {caseStudy.beforeAfter.before.value}
                </div>
                {caseStudy.beforeAfter.before.details && (
                  <ul className="space-y-1.5">
                    {caseStudy.beforeAfter.before.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <Minus className="w-3 h-3 text-slate-600" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* After */}
              <div className="bg-slate-800/30 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    After
                  </span>
                </div>
                <div className="text-lg font-bold text-white mb-1">
                  {caseStudy.beforeAfter.after.label}
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-3">
                  {caseStudy.beforeAfter.after.value}
                </div>
                {caseStudy.beforeAfter.after.details && (
                  <ul className="space-y-1.5">
                    {caseStudy.beforeAfter.after.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <ArrowRight className="w-3 h-3 text-emerald-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {/* Description */}
          {caseStudy.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-slate-400 text-sm leading-relaxed text-center"
            >
              {caseStudy.description}
            </motion.p>
          )}

          {/* Industry Tag */}
          {caseStudy.industry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="flex justify-center mt-6"
            >
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {formatIndustry(caseStudy.industry)}
              </span>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper to format industry name
function formatIndustry(industry: string): string {
  const industryNames: Record<string, string> = {
    'banking': 'Banking',
    'fintech': 'FinTech',
    'payments': 'Payments',
    'issuing': 'Card Issuing',
    'asset-management': 'Asset Management',
    'digital-banking': 'Digital Banking',
    'insurance': 'Insurance',
  }
  return industryNames[industry] || industry.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
