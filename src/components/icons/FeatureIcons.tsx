'use client'

import { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

// Authorization Pack - Document with checkmark
export function AuthorizationIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="auth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="url(#auth-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2V8H20" stroke="url(#auth-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15L11 17L15 13" stroke="url(#auth-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Risk Assessment - Shield with alert
export function RiskIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="risk-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke="url(#risk-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 8V12" stroke="url(#risk-gradient)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="url(#risk-gradient)" />
    </svg>
  )
}

// SM&CR - Person with badge
export function SmcrIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="smcr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="7" r="4" stroke="url(#smcr-gradient)" strokeWidth="2" />
      <path
        d="M5.5 21C5.5 17.134 8.41015 14 12 14C15.5899 14 18.5 17.134 18.5 21"
        stroke="url(#smcr-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="8" r="3" fill="url(#smcr-gradient)" />
      <path d="M17 8L18 9L20 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Policy Management - Stacked documents
export function PolicyIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="policy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <path
        d="M8 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H14"
        stroke="url(#policy-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="8" y="2" width="12" height="16" rx="2" stroke="url(#policy-gradient)" strokeWidth="2" />
      <path d="M12 6H16" stroke="url(#policy-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 10H16" stroke="url(#policy-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 14H14" stroke="url(#policy-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Compliance Monitoring - Globe with pulse
export function ComplianceIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#compliance-gradient)" strokeWidth="2" />
      <path d="M2 12H22" stroke="url(#compliance-gradient)" strokeWidth="2" />
      <path
        d="M12 2C14.5 4 16 7.5 16 12C16 16.5 14.5 20 12 22C9.5 20 8 16.5 8 12C8 7.5 9.5 4 12 2Z"
        stroke="url(#compliance-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="2" fill="url(#compliance-gradient)" />
    </svg>
  )
}

// Training Library - Book with graduation cap
export function TrainingIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="training-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      <path
        d="M4 19.5V5C4 4.20435 4.31607 3.44129 4.87868 2.87868C5.44129 2.31607 6.20435 2 7 2H20V17H7C6.20435 17 5.44129 17.3161 4.87868 17.8787C4.31607 18.4413 4 19.2044 4 20V20C4 20.7956 4.31607 21.5587 4.87868 22.1213C5.44129 22.6839 6.20435 23 7 23H20"
        stroke="url(#training-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 6L8 8.5L12 11L16 8.5L12 6Z" fill="url(#training-gradient)" />
      <path d="M8 8.5V12L12 14.5L16 12V8.5" stroke="url(#training-gradient)" strokeWidth="1.5" />
    </svg>
  )
}

// AI Assistant - Brain with sparkles
export function AiIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M12 4C8 4 5 7 5 11C5 13 6 15 7.5 16.5C7.5 18 7 20 7 20H17C17 20 16.5 18 16.5 16.5C18 15 19 13 19 11C19 7 16 4 12 4Z"
        stroke="url(#ai-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 20V22" stroke="url(#ai-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 20V22" stroke="url(#ai-gradient)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="9" cy="11" r="1.5" fill="url(#ai-gradient)" />
      <circle cx="15" cy="11" r="1.5" fill="url(#ai-gradient)" />
      <path d="M21 8L22 6L21 7L20 6L21 8Z" fill="url(#ai-gradient)" />
      <path d="M3 8L4 6L3 7L2 6L3 8Z" fill="url(#ai-gradient)" />
      <path d="M12 1L13 3L12 2L11 3L12 1Z" fill="url(#ai-gradient)" />
    </svg>
  )
}

// Fintech - Card with chip
export function FintechIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="fintech-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="url(#fintech-gradient)" strokeWidth="2" />
      <rect x="5" y="9" width="6" height="4" rx="1" fill="url(#fintech-gradient)" />
      <path d="M14 13H19" stroke="url(#fintech-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 16H17" stroke="url(#fintech-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Banks - Building with columns
export function BanksIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="banks-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M3 21H21" stroke="url(#banks-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 10H21" stroke="url(#banks-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3L21 10H3L12 3Z" stroke="url(#banks-gradient)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M5 10V21" stroke="url(#banks-gradient)" strokeWidth="2" />
      <path d="M9 10V21" stroke="url(#banks-gradient)" strokeWidth="2" />
      <path d="M15 10V21" stroke="url(#banks-gradient)" strokeWidth="2" />
      <path d="M19 10V21" stroke="url(#banks-gradient)" strokeWidth="2" />
    </svg>
  )
}

// Investment - Chart trending up
export function InvestmentIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="investment-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <path d="M3 3V21H21" stroke="url(#investment-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14L12 9L15 12L21 6" stroke="url(#investment-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6H21V10" stroke="url(#investment-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Insurance - Shield with heart
export function InsuranceIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="insurance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <path
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        stroke="url(#insurance-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8C10.5 8 9 9.5 9 11C9 14 12 16 12 16C12 16 15 14 15 11C15 9.5 13.5 8 12 8Z"
        fill="url(#insurance-gradient)"
      />
    </svg>
  )
}

// Crypto - Bitcoin/blockchain
export function CryptoIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="crypto-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#crypto-gradient)" strokeWidth="2" />
      <path d="M9 8H14C15.1 8 16 8.9 16 10C16 11.1 15.1 12 14 12H9V8Z" stroke="url(#crypto-gradient)" strokeWidth="2" />
      <path d="M9 12H15C16.1 12 17 12.9 17 14C17 15.1 16.1 16 15 16H9V12Z" stroke="url(#crypto-gradient)" strokeWidth="2" />
      <path d="M10 6V8" stroke="url(#crypto-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 6V8" stroke="url(#crypto-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 16V18" stroke="url(#crypto-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 16V18" stroke="url(#crypto-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Consumer Finance - Wallet
export function ConsumerIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="consumer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path
        d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z"
        stroke="url(#consumer-gradient)"
        strokeWidth="2"
      />
      <path d="M16 14C16 14.5523 15.5523 15 15 15C14.4477 15 14 14.5523 14 14C14 13.4477 14.4477 13 15 13C15.5523 13 16 13.4477 16 14Z" fill="url(#consumer-gradient)" />
      <path d="M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7" stroke="url(#consumer-gradient)" strokeWidth="2" />
    </svg>
  )
}

// Documentation - Book open
export function DocsIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="docs-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="url(#docs-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="url(#docs-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Guides - Target/bullseye
export function GuidesIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="guides-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#guides-gradient)" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" stroke="url(#guides-gradient)" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="url(#guides-gradient)" />
      <path d="M12 2V4" stroke="url(#guides-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20V22" stroke="url(#guides-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12H4" stroke="url(#guides-gradient)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12H22" stroke="url(#guides-gradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Blog - Pen/writing
export function BlogIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="blog-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M12 20H21" stroke="url(#blog-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 3.50001C16.8978 3.10219 17.4374 2.87869 18 2.87869C18.2786 2.87869 18.5544 2.93356 18.8118 3.04017C19.0692 3.14677 19.303 3.30303 19.5 3.50001C19.697 3.69699 19.8532 3.93083 19.9598 4.18822C20.0665 4.4456 20.1213 4.72141 20.1213 5.00001C20.1213 5.27862 20.0665 5.55443 19.9598 5.81181C19.8532 6.0692 19.697 6.30303 19.5 6.50001L7 19L3 20L4 16L16.5 3.50001Z" stroke="url(#blog-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Map of all icons for easy lookup
export const featureIcons = {
  authorization: AuthorizationIcon,
  risk: RiskIcon,
  smcr: SmcrIcon,
  policies: PolicyIcon,
  cmp: ComplianceIcon,
  training: TrainingIcon,
  ai: AiIcon,
}

export const audienceIcons = {
  fintech: FintechIcon,
  banks: BanksIcon,
  investment: InvestmentIcon,
  insurance: InsuranceIcon,
  crypto: CryptoIcon,
  consumer: ConsumerIcon,
}

export const resourceIcons = {
  docs: DocsIcon,
  guides: GuidesIcon,
  blog: BlogIcon,
}
