// Abstract/Geometric SVG Icons for Case Studies
// Emerald-to-teal gradient theme matching the 3D aesthetic

interface IconProps {
  className?: string;
}

// Icon 1: Network Nodes - 3 hexagons in triangle, connected by gradient lines
export function NetworkNodesIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Connection Lines */}
      <path d="M16 44L32 16L48 44" stroke="url(#network-line)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M16 44H48" stroke="url(#network-line)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

      {/* Top Hexagon */}
      <path d="M32 8L38 12V20L32 24L26 20V12L32 8Z" fill="url(#network-gradient)" />
      <path d="M32 10L36 13V19L32 22L28 19V13L32 10Z" fill="rgba(255,255,255,0.2)" />

      {/* Bottom Left Hexagon */}
      <path d="M16 40L22 44V52L16 56L10 52V44L16 40Z" fill="url(#network-gradient)" />
      <path d="M16 42L20 45V51L16 54L12 51V45L16 42Z" fill="rgba(255,255,255,0.2)" />

      {/* Bottom Right Hexagon */}
      <path d="M48 40L54 44V52L48 56L42 52V44L48 40Z" fill="url(#network-gradient)" />
      <path d="M48 42L52 45V51L48 54L44 51V45L48 42Z" fill="rgba(255,255,255,0.2)" />

      {/* Center Node */}
      <circle cx="32" cy="38" r="4" fill="url(#network-gradient)" />
      <circle cx="32" cy="38" r="2" fill="white" opacity="0.8" />

      <defs>
        <linearGradient id="network-gradient" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="network-line" x1="10" y1="16" x2="54" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 2: Data Flow - Flowing curves with geometric data points
export function DataFlowIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flow Lines */}
      <path d="M8 32C16 20 24 44 32 32C40 20 48 44 56 32" stroke="url(#flow-gradient)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M8 38C16 26 24 50 32 38C40 26 48 50 56 38" stroke="url(#flow-gradient)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M8 26C16 14 24 38 32 26C40 14 48 38 56 26" stroke="url(#flow-gradient)" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Data Points */}
      <circle cx="8" cy="26" r="4" fill="url(#flow-gradient)" />
      <circle cx="20" cy="32" r="3" fill="url(#flow-gradient)" />
      <circle cx="32" cy="26" r="5" fill="url(#flow-gradient)" />
      <circle cx="44" cy="32" r="3" fill="url(#flow-gradient)" />
      <circle cx="56" cy="26" r="4" fill="url(#flow-gradient)" />

      {/* Inner highlights */}
      <circle cx="32" cy="26" r="2" fill="white" opacity="0.8" />

      <defs>
        <linearGradient id="flow-gradient" x1="8" y1="14" x2="56" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 3: Shield Matrix - Shield made of hexagonal honeycomb cells
export function ShieldMatrixIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield Outline */}
      <path d="M32 6L54 14V30C54 46 44 56 32 60C20 56 10 46 10 30V14L32 6Z" fill="url(#shield-gradient)" opacity="0.9" />

      {/* Honeycomb Pattern */}
      <path d="M32 16L36 18V22L32 24L28 22V18L32 16Z" fill="rgba(255,255,255,0.3)" />
      <path d="M24 22L28 24V28L24 30L20 28V24L24 22Z" fill="rgba(255,255,255,0.2)" />
      <path d="M40 22L44 24V28L40 30L36 28V24L40 22Z" fill="rgba(255,255,255,0.2)" />
      <path d="M32 28L36 30V34L32 36L28 34V30L32 28Z" fill="rgba(255,255,255,0.25)" />
      <path d="M24 34L28 36V40L24 42L20 40V36L24 34Z" fill="rgba(255,255,255,0.15)" />
      <path d="M40 34L44 36V40L40 42L36 40V36L40 34Z" fill="rgba(255,255,255,0.15)" />
      <path d="M32 40L36 42V46L32 48L28 46V42L32 40Z" fill="rgba(255,255,255,0.2)" />

      {/* Shield Glow */}
      <path d="M32 6L54 14V30C54 46 44 56 32 60C20 56 10 46 10 30V14L32 6Z" stroke="url(#shield-gradient)" strokeWidth="2" fill="none" opacity="0.5" />

      <defs>
        <linearGradient id="shield-gradient" x1="10" y1="6" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 4: Growth Graph - Abstract bar chart with stacked geometric segments
export function GrowthGraphIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bars */}
      <rect x="8" y="40" width="10" height="16" rx="2" fill="url(#growth-gradient)" opacity="0.4" />
      <rect x="8" y="44" width="10" height="12" rx="1" fill="url(#growth-gradient)" opacity="0.6" />

      <rect x="22" y="28" width="10" height="28" rx="2" fill="url(#growth-gradient)" opacity="0.5" />
      <rect x="22" y="34" width="10" height="22" rx="1" fill="url(#growth-gradient)" opacity="0.7" />

      <rect x="36" y="20" width="10" height="36" rx="2" fill="url(#growth-gradient)" opacity="0.6" />
      <rect x="36" y="28" width="10" height="28" rx="1" fill="url(#growth-gradient)" opacity="0.8" />

      <rect x="50" y="10" width="10" height="46" rx="2" fill="url(#growth-gradient)" />
      <rect x="50" y="20" width="10" height="36" rx="1" fill="url(#growth-gradient)" opacity="0.9" />

      {/* Trend Line */}
      <path d="M13 38L27 26L41 18L55 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" opacity="0.6" />

      {/* Arrow */}
      <path d="M52 6L58 6L58 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <linearGradient id="growth-gradient" x1="8" y1="10" x2="60" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 5: Process Hexagon - Central hexagon with 3 orbiting smaller hexagons
export function ProcessHexagonIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Orbit Path */}
      <circle cx="32" cy="32" r="22" stroke="url(#process-gradient)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4" />

      {/* Central Hexagon */}
      <path d="M32 18L44 24V40L32 46L20 40V24L32 18Z" fill="url(#process-gradient)" />
      <path d="M32 22L40 26V38L32 42L24 38V26L32 22Z" fill="rgba(255,255,255,0.2)" />

      {/* Orbiting Hexagons */}
      <path d="M32 4L36 6V10L32 12L28 10V6L32 4Z" fill="url(#process-gradient)" />
      <path d="M10 44L14 46V50L10 52L6 50V46L10 44Z" fill="url(#process-gradient)" />
      <path d="M54 44L58 46V50L54 52L50 50V46L54 44Z" fill="url(#process-gradient)" />

      {/* Connection Lines */}
      <path d="M32 12V18" stroke="url(#process-gradient)" strokeWidth="2" opacity="0.6" />
      <path d="M14 46L20 40" stroke="url(#process-gradient)" strokeWidth="2" opacity="0.6" />
      <path d="M50 46L44 40" stroke="url(#process-gradient)" strokeWidth="2" opacity="0.6" />

      {/* Center Dot */}
      <circle cx="32" cy="32" r="4" fill="white" opacity="0.9" />

      {/* Rotation Arrows */}
      <path d="M48 12C52 16 54 22 54 28" stroke="url(#process-gradient)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M52 10L48 12L50 16" stroke="url(#process-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />

      <defs>
        <linearGradient id="process-gradient" x1="6" y1="4" x2="58" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 6: Compliance Nodes - 3 overlapping circles with center checkmark
export function ComplianceNodesIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three Overlapping Circles */}
      <circle cx="24" cy="26" r="16" fill="url(#compliance-gradient)" opacity="0.3" />
      <circle cx="40" cy="26" r="16" fill="url(#compliance-gradient)" opacity="0.3" />
      <circle cx="32" cy="42" r="16" fill="url(#compliance-gradient)" opacity="0.3" />

      {/* Circle Borders */}
      <circle cx="24" cy="26" r="16" stroke="url(#compliance-gradient)" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="40" cy="26" r="16" stroke="url(#compliance-gradient)" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="32" cy="42" r="16" stroke="url(#compliance-gradient)" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Center Intersection */}
      <circle cx="32" cy="32" r="8" fill="url(#compliance-gradient)" />

      {/* Checkmark */}
      <path d="M28 32L31 35L37 29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Connection Dots */}
      <circle cx="24" cy="26" r="3" fill="url(#compliance-gradient)" />
      <circle cx="40" cy="26" r="3" fill="url(#compliance-gradient)" />
      <circle cx="32" cy="42" r="3" fill="url(#compliance-gradient)" />

      <defs>
        <linearGradient id="compliance-gradient" x1="8" y1="10" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 7: Speed Lines - Horizontal motion lines with circular endpoint
export function SpeedLinesIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Motion Lines */}
      <path d="M8 20H36" stroke="url(#speed-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <path d="M12 28H40" stroke="url(#speed-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M8 36H44" stroke="url(#speed-gradient)" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M12 44H40" stroke="url(#speed-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M8 52H36" stroke="url(#speed-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

      {/* Speed Blur Effect */}
      <ellipse cx="46" cy="36" rx="4" ry="16" fill="url(#speed-gradient)" opacity="0.3" />

      {/* Main Circle (Endpoint) */}
      <circle cx="52" cy="36" r="10" fill="url(#speed-gradient)" />
      <circle cx="52" cy="36" r="6" fill="rgba(255,255,255,0.2)" />
      <circle cx="52" cy="36" r="3" fill="white" opacity="0.9" />

      {/* Arrow */}
      <path d="M50 32L54 36L50 40" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

      <defs>
        <linearGradient id="speed-gradient" x1="8" y1="20" x2="62" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 8: Risk Radar - Concentric circles with radar sweep
export function RiskRadarIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Concentric Circles */}
      <circle cx="32" cy="32" r="26" stroke="url(#radar-gradient)" strokeWidth="1.5" fill="none" opacity="0.3" />
      <circle cx="32" cy="32" r="20" stroke="url(#radar-gradient)" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="32" cy="32" r="14" stroke="url(#radar-gradient)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <circle cx="32" cy="32" r="8" stroke="url(#radar-gradient)" strokeWidth="1.5" fill="none" opacity="0.6" />

      {/* Radar Sweep */}
      <path d="M32 32L32 6" stroke="url(#radar-gradient)" strokeWidth="2" opacity="0.8" />
      <path d="M32 32L50 14" stroke="url(#radar-gradient)" strokeWidth="1.5" opacity="0.4" />
      <path d="M32 6C48 6 58 18 58 32" fill="url(#radar-gradient)" opacity="0.2" />

      {/* Detection Points */}
      <circle cx="32" cy="12" r="3" fill="url(#radar-gradient)" />
      <circle cx="44" cy="20" r="2.5" fill="url(#radar-gradient)" opacity="0.8" />
      <circle cx="20" cy="26" r="2" fill="url(#radar-gradient)" opacity="0.6" />
      <circle cx="38" cy="38" r="2" fill="url(#radar-gradient)" opacity="0.7" />

      {/* Center */}
      <circle cx="32" cy="32" r="4" fill="url(#radar-gradient)" />
      <circle cx="32" cy="32" r="2" fill="white" opacity="0.9" />

      {/* Cross Hairs */}
      <path d="M32 26V38M26 32H38" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

      <defs>
        <linearGradient id="radar-gradient" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 9: Integration Mesh - Grid of connected dots in abstract pattern
export function IntegrationMeshIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Connection Lines */}
      <path d="M12 12L24 24M24 12L36 24M36 12L48 24" stroke="url(#mesh-gradient)" strokeWidth="1.5" opacity="0.4" />
      <path d="M12 24L24 36M24 24L36 36M36 24L48 36" stroke="url(#mesh-gradient)" strokeWidth="1.5" opacity="0.5" />
      <path d="M12 36L24 48M24 36L36 48M36 36L48 48" stroke="url(#mesh-gradient)" strokeWidth="1.5" opacity="0.4" />
      <path d="M12 12L12 48M24 12L24 48M36 12L36 48M48 12L48 48" stroke="url(#mesh-gradient)" strokeWidth="1.5" opacity="0.3" />
      <path d="M12 24H48M12 36H48" stroke="url(#mesh-gradient)" strokeWidth="1.5" opacity="0.3" />

      {/* Main Connection Path */}
      <path d="M12 12L24 24L24 36L36 48L48 36L48 24L36 12" stroke="url(#mesh-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Nodes */}
      <circle cx="12" cy="12" r="4" fill="url(#mesh-gradient)" />
      <circle cx="24" cy="24" r="5" fill="url(#mesh-gradient)" />
      <circle cx="24" cy="36" r="4" fill="url(#mesh-gradient)" />
      <circle cx="36" cy="48" r="5" fill="url(#mesh-gradient)" />
      <circle cx="48" cy="36" r="4" fill="url(#mesh-gradient)" />
      <circle cx="48" cy="24" r="4" fill="url(#mesh-gradient)" />
      <circle cx="36" cy="12" r="4" fill="url(#mesh-gradient)" />

      {/* Center highlight */}
      <circle cx="24" cy="24" r="2" fill="white" opacity="0.8" />
      <circle cx="36" cy="48" r="2" fill="white" opacity="0.8" />

      <defs>
        <linearGradient id="mesh-gradient" x1="12" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon 10: Secure Lock - Geometric padlock with hexagonal elements
export function SecureLockIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lock Body with Hexagonal Pattern */}
      <rect x="14" y="28" width="36" height="28" rx="4" fill="url(#lock-gradient)" />

      {/* Hexagonal Pattern on Lock Body */}
      <path d="M24 36L28 38V42L24 44L20 42V38L24 36Z" fill="rgba(255,255,255,0.15)" />
      <path d="M40 36L44 38V42L40 44L36 42V38L40 36Z" fill="rgba(255,255,255,0.15)" />
      <path d="M32 44L36 46V50L32 52L28 50V46L32 44Z" fill="rgba(255,255,255,0.2)" />

      {/* Shackle */}
      <path d="M22 28V20C22 14.5 26.5 10 32 10C37.5 10 42 14.5 42 20V28" stroke="url(#lock-gradient)" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M24 28V20C24 15.5 27.5 12 32 12C36.5 12 40 15.5 40 20V28" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Keyhole (Hexagonal) */}
      <path d="M32 38L36 40V44L32 46L28 44V40L32 38Z" fill="url(#lock-gradient)" />
      <circle cx="32" cy="42" r="3" fill="white" opacity="0.9" />
      <path d="M32 44V48" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

      {/* Shine Effect */}
      <path d="M18 32L20 34L18 36" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      <defs>
        <linearGradient id="lock-gradient" x1="14" y1="10" x2="50" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Icon Registry for dynamic rendering
export const caseStudyIcons = {
  'network-nodes': NetworkNodesIcon,
  'data-flow': DataFlowIcon,
  'shield-matrix': ShieldMatrixIcon,
  'growth-graph': GrowthGraphIcon,
  'process-hexagon': ProcessHexagonIcon,
  'compliance-nodes': ComplianceNodesIcon,
  'speed-lines': SpeedLinesIcon,
  'risk-radar': RiskRadarIcon,
  'integration-mesh': IntegrationMeshIcon,
  'secure-lock': SecureLockIcon,
} as const;

export type CaseStudyIconKey = keyof typeof caseStudyIcons;

// Helper function to render icon by key
export function CaseStudyIcon({ iconKey, className = "w-12 h-12" }: { iconKey: string; className?: string }) {
  const IconComponent = caseStudyIcons[iconKey as CaseStudyIconKey];

  if (!IconComponent) {
    // Fallback to network-nodes if icon not found
    return <NetworkNodesIcon className={className} />;
  }

  return <IconComponent className={className} />;
}

// Export all icon keys for admin interface
export const iconKeys = Object.keys(caseStudyIcons) as CaseStudyIconKey[];
