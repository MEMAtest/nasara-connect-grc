'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function AnimatedComplianceScore() {
  const [score, setScore] = useState(98)
  const [trend, setTrend] = useState('+5%')
  const [isIncreasing, setIsIncreasing] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate between 95-99%
      const newScore = Math.floor(Math.random() * 5) + 95
      const diff = newScore - score

      setScore(newScore)
      setIsIncreasing(diff >= 0)
      setTrend(`${diff >= 0 ? '+' : ''}${Math.abs(diff)}%`)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [score])

  return (
    <motion.div
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-10 right-10 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-500/20"
    >
      <div className="text-sm text-slate-400 mb-1">Compliance Score</div>
      <motion.div
        key={score}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
      >
        {score}%
      </motion.div>
      <div className={`flex items-center gap-1 mt-2 text-xs ${isIncreasing ? 'text-emerald-400' : 'text-amber-400'}`}>
        {isIncreasing ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>{trend} this month</span>
      </div>
    </motion.div>
  )
}
