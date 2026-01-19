'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { CaseStudyIcon } from './CaseStudyIcons'
import { CaseStudyModal } from './CaseStudyModal'
import type { CaseStudy } from '@/lib/database'

export function CaseStudiesSection() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchCaseStudies()
  }, [])

  async function fetchCaseStudies() {
    try {
      const response = await fetch('/api/case-studies')
      if (response.ok) {
        const data = await response.json()
        setCaseStudies(data)
      }
    } catch (error) {
      console.error('Failed to fetch case studies:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleCardClick(study: CaseStudy) {
    setSelectedStudy(study)
    setModalOpen(true)
  }

  return (
    <section className="py-20 px-4 border-y border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            How We Help Financial Institutions
          </h2>
          <Link href="/case-studies" className="text-emerald-400 hover:text-emerald-300 text-sm inline-flex items-center gap-1">
            Read our case studies
            <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {loading ? (
            // Loading Skeletons
            [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800/30 border border-slate-700 h-32"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 animate-pulse mb-2" />
                <div className="w-20 h-4 rounded bg-slate-700/50 animate-pulse" />
              </motion.div>
            ))
          ) : caseStudies.length > 0 ? (
            // Case Study Cards
            caseStudies.map((study, i) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => handleCardClick(study)}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group"
              >
                {/* Icon with hover effect */}
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  <CaseStudyIcon iconKey={study.iconKey} className="w-12 h-12" />
                </motion.div>

                {/* Display Name */}
                <span className="text-slate-400 group-hover:text-slate-200 font-medium text-sm text-center transition-colors">
                  {study.displayName}
                </span>

                {/* Hover indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  View Case Study
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              </motion.div>
            ))
          ) : (
            // Fallback static cards (if no data)
            defaultCaseStudies.map((study, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-all group"
              >
                <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                  <CaseStudyIcon iconKey={study.iconKey} className="w-12 h-12" />
                </div>
                <span className="text-slate-400 group-hover:text-slate-300 font-medium text-sm text-center transition-colors">
                  {study.displayName}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Case Study Modal */}
      <CaseStudyModal
        caseStudy={selectedStudy}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  )
}

// Fallback data if API fails
const defaultCaseStudies = [
  { displayName: 'Banking', iconKey: 'shield-matrix' },
  { displayName: 'FinTech', iconKey: 'risk-radar' },
  { displayName: 'Card Issuing', iconKey: 'integration-mesh' },
  { displayName: 'Payments', iconKey: 'data-flow' },
  { displayName: 'Asset Management', iconKey: 'compliance-nodes' },
  { displayName: 'Digital Banking', iconKey: 'speed-lines' },
]
