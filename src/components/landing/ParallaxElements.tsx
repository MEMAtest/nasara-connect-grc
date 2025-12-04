'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxElementsProps {
  className?: string
}

// Geometric shape components
function Hexagon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
        fill="url(#hexGradient)"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
    </svg>
  )
}

function Circle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#circleGradient)"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.15"
      />
    </svg>
  )
}

function Diamond({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 95,50 50,95 5,50"
        fill="url(#diamondGradient)"
        stroke="#14b8a6"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
    </svg>
  )
}

function Triangle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="triangleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <polygon
        points="50,10 90,85 10,85"
        fill="url(#triangleGradient)"
        stroke="#10b981"
        strokeWidth="1"
        strokeOpacity="0.15"
      />
    </svg>
  )
}

function Ring({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#ringGradient)"
        strokeWidth="4"
      />
    </svg>
  )
}

export function ParallaxElements({ className = '' }: ParallaxElementsProps) {
  const { scrollY } = useScroll()

  // Different parallax speeds for depth effect
  const y1 = useTransform(scrollY, [0, 2000], [0, -200])  // Slow - far away
  const y2 = useTransform(scrollY, [0, 2000], [0, -400])  // Medium
  const y3 = useTransform(scrollY, [0, 2000], [0, -600])  // Fast - close

  // Subtle rotation based on scroll
  const rotate1 = useTransform(scrollY, [0, 2000], [0, 45])
  const rotate2 = useTransform(scrollY, [0, 2000], [0, -30])
  const rotate3 = useTransform(scrollY, [0, 2000], [0, 60])

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* Layer 1 - Slow (far away, larger) */}
      <motion.div
        style={{ y: y1, rotate: rotate1 }}
        className="absolute top-[10%] left-[5%]"
      >
        <Hexagon className="w-32 h-32 opacity-40" />
      </motion.div>

      <motion.div
        style={{ y: y1 }}
        className="absolute top-[60%] right-[8%]"
      >
        <Circle className="w-40 h-40 opacity-30" />
      </motion.div>

      {/* Layer 2 - Medium */}
      <motion.div
        style={{ y: y2, rotate: rotate2 }}
        className="absolute top-[25%] right-[15%]"
      >
        <Diamond className="w-20 h-20 opacity-50" />
      </motion.div>

      <motion.div
        style={{ y: y2 }}
        className="absolute top-[45%] left-[12%]"
      >
        <Triangle className="w-24 h-24 opacity-40" />
      </motion.div>

      <motion.div
        style={{ y: y2, rotate: rotate1 }}
        className="absolute top-[75%] left-[25%]"
      >
        <Ring className="w-28 h-28 opacity-35" />
      </motion.div>

      {/* Layer 3 - Fast (close, smaller) */}
      <motion.div
        style={{ y: y3, rotate: rotate3 }}
        className="absolute top-[15%] right-[30%]"
      >
        <Circle className="w-12 h-12 opacity-60" />
      </motion.div>

      <motion.div
        style={{ y: y3 }}
        className="absolute top-[55%] right-[40%]"
      >
        <Hexagon className="w-16 h-16 opacity-50" />
      </motion.div>

      <motion.div
        style={{ y: y3, rotate: rotate2 }}
        className="absolute top-[85%] right-[20%]"
      >
        <Diamond className="w-14 h-14 opacity-55" />
      </motion.div>
    </div>
  )
}

// Alternative: Hero-specific parallax with different positioning
export function HeroParallaxElements() {
  const { scrollY } = useScroll()

  const y1 = useTransform(scrollY, [0, 800], [0, -150])
  const y2 = useTransform(scrollY, [0, 800], [0, -300])
  const opacity = useTransform(scrollY, [0, 600], [1, 0])

  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* Top left cluster */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[15%] left-[8%]"
      >
        <Hexagon className="w-24 h-24 opacity-30" />
      </motion.div>

      {/* Top right */}
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[10%] right-[20%]"
      >
        <Circle className="w-16 h-16 opacity-40" />
      </motion.div>

      {/* Middle left */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-[45%] left-[3%]"
      >
        <Diamond className="w-20 h-20 opacity-25" />
      </motion.div>

      {/* Bottom scattered */}
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-[20%] left-[15%]"
      >
        <Triangle className="w-18 h-18 opacity-35" />
      </motion.div>

      <motion.div
        style={{ y: y1 }}
        className="absolute bottom-[30%] right-[10%]"
      >
        <Ring className="w-28 h-28 opacity-25" />
      </motion.div>
    </motion.div>
  )
}
