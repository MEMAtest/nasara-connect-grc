'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  className?: string
  onComplete?: () => void
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2,
  className = '',
  onComplete,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    if (decimals > 0) {
      return latest.toFixed(decimals)
    }
    return Math.round(latest).toLocaleString()
  })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier for smooth easing
        onComplete,
      })
      return controls.stop
    }
  }, [isInView, value, duration, count, onComplete])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

// Convenience components for common formats
export function PercentCounter({
  value,
  className = '',
  duration = 2,
}: {
  value: number
  className?: string
  duration?: number
}) {
  return (
    <AnimatedCounter
      value={value}
      suffix="%"
      decimals={value % 1 !== 0 ? 1 : 0}
      duration={duration}
      className={className}
    />
  )
}

export function CurrencyCounter({
  value,
  currency = '$',
  className = '',
  duration = 2,
}: {
  value: number
  currency?: string
  className?: string
  duration?: number
}) {
  return (
    <AnimatedCounter
      value={value}
      prefix={currency}
      decimals={value >= 1000000 ? 1 : 0}
      duration={duration}
      className={className}
    />
  )
}

export function PlusCounter({
  value,
  className = '',
  duration = 2,
}: {
  value: number
  className?: string
  duration?: number
}) {
  return (
    <AnimatedCounter
      value={value}
      suffix="+"
      duration={duration}
      className={className}
    />
  )
}

// Animated stat card with glow effect
interface AnimatedStatProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  decimals?: number
  colorClass?: string
}

export function AnimatedStat({
  value,
  label,
  suffix = '',
  prefix = '',
  decimals = 0,
  colorClass = 'from-emerald-400 to-teal-400',
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />

      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors">
        <div className={`text-4xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
          <AnimatedCounter
            value={value}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals}
            duration={2}
          />
        </div>
        <div className="text-slate-400 text-sm mt-1">{label}</div>
      </div>
    </motion.div>
  )
}
