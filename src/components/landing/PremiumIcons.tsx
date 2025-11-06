// Premium SVG Icons for Landing Page

export function PaymentIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="56" height="36" rx="4" fill="url(#payment-gradient)" />
      <rect x="4" y="24" width="56" height="8" fill="rgba(255,255,255,0.2)" />
      <rect x="12" y="38" width="20" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
      <circle cx="48" cy="42" r="6" fill="rgba(255,255,255,0.3)" />
      <path d="M46 42l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="payment-gradient" x1="4" y1="16" x2="60" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function RiskIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="url(#risk-gradient)" opacity="0.2" />
      <circle cx="32" cy="32" r="20" fill="url(#risk-gradient)" opacity="0.3" />
      <path d="M32 12L44 24L56 36L32 60L8 36L20 24Z" fill="url(#risk-gradient)" />
      <path d="M32 24v16M32 44v2" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="risk-gradient" x1="8" y1="12" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ControlIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8L52 16V28C52 42 42 54 32 58C22 54 12 42 12 28V16L32 8Z" fill="url(#control-gradient)" />
      <path d="M24 32l6 6 10-12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="26" stroke="url(#control-gradient)" strokeWidth="2" opacity="0.3" />
      <defs>
        <linearGradient id="control-gradient" x1="12" y1="8" x2="52" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function AuthorizationIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="8" width="40" height="48" rx="3" fill="url(#auth-gradient)" />
      <rect x="18" y="16" width="28" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="18" y="24" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
      <rect x="18" y="30" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="46" cy="46" r="12" fill="#22c55e" />
      <path d="M42 46l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="auth-gradient" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ComplianceIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6L54 14V30C54 46 44 58 32 62C20 58 10 46 10 30V14L32 6Z" fill="url(#compliance-gradient)" />
      <rect x="26" y="24" width="12" height="20" rx="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="32" cy="28" r="3" fill="white" />
      <path d="M32 32v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id="compliance-gradient" x1="10" y1="6" x2="54" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function DashboardIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="48" height="48" rx="4" fill="url(#dashboard-gradient)" />
      <rect x="14" y="14" width="18" height="14" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="36" y="14" width="14" height="14" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="14" y="32" width="14" height="18" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="32" y="32" width="18" height="18" rx="2" fill="rgba(255,255,255,0.2)" />
      <defs>
        <linearGradient id="dashboard-gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function IntegrationIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="32" r="8" fill="url(#integration-gradient-1)" />
      <circle cx="48" cy="32" r="8" fill="url(#integration-gradient-2)" />
      <circle cx="32" cy="16" r="8" fill="url(#integration-gradient-3)" />
      <circle cx="32" cy="48" r="8" fill="url(#integration-gradient-4)" />
      <path d="M22 28l8-8M38 28l-8-8M22 36l8 8M38 36l-8 8" stroke="url(#integration-line)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="32" r="6" fill="#ffffff" />
      <defs>
        <linearGradient id="integration-gradient-1"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#2563eb" /></linearGradient>
        <linearGradient id="integration-gradient-2"><stop stopColor="#10b981" /><stop offset="1" stopColor="#059669" /></linearGradient>
        <linearGradient id="integration-gradient-3"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" /></linearGradient>
        <linearGradient id="integration-gradient-4"><stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#7c3aed" /></linearGradient>
        <linearGradient id="integration-line"><stop stopColor="#64748b" /><stop offset="1" stopColor="#475569" /></linearGradient>
      </defs>
    </svg>
  )
}

export function AIPoweredIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="26" fill="url(#ai-gradient)" opacity="0.2" />
      <circle cx="32" cy="32" r="18" fill="url(#ai-gradient)" />
      <path d="M32 20v24M26 26l12 12M26 38l12-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4" fill="white" />
      <circle cx="20" cy="20" r="3" fill="#fbbf24" />
      <circle cx="44" cy="20" r="3" fill="#fbbf24" />
      <circle cx="20" cy="44" r="3" fill="#fbbf24" />
      <circle cx="44" cy="44" r="3" fill="#fbbf24" />
      <defs>
        <linearGradient id="ai-gradient" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
