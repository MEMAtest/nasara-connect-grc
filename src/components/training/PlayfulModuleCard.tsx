"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowRight, CheckCircle2, RotateCcw, Award, UserPlus } from "lucide-react";

interface ModuleProgress {
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percentage: number;
  score?: number | null;
}

interface CertificateDownload {
  module_id: string;
  download_count: number;
}

interface PlayfulModuleCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  progress?: ModuleProgress;
  certificate?: CertificateDownload;
  assignmentCount?: number;
  assignmentNote?: string;
  onAssign?: (moduleId: string) => void;
  className?: string;
}

// Category color schemes
const categoryStyles: Record<string, { gradient: string; accent: string; light: string; dark: string }> = {
  "financial-crime-prevention": {
    gradient: "from-rose-500 to-orange-500",
    accent: "#F43F5E",
    light: "#FFF1F2",
    dark: "#BE123C",
  },
  "regulatory-compliance": {
    gradient: "from-violet-500 to-purple-600",
    accent: "#8B5CF6",
    light: "#F5F3FF",
    dark: "#6D28D9",
  },
  "customer-protection": {
    gradient: "from-emerald-500 to-teal-500",
    accent: "#10B981",
    light: "#ECFDF5",
    dark: "#047857",
  },
  "operational-risk": {
    gradient: "from-amber-500 to-orange-500",
    accent: "#F59E0B",
    light: "#FFFBEB",
    dark: "#B45309",
  },
};

// Map module IDs to categories
const moduleCategoryMap: Record<string, string> = {
  // Financial Crime Prevention
  "aml-fundamentals": "financial-crime-prevention",
  "kyc-fundamentals": "financial-crime-prevention",
  "sanctions-training": "financial-crime-prevention",
  "peps-training": "financial-crime-prevention",
  "sars-training": "financial-crime-prevention",
  "financial-crime-aml": "financial-crime-prevention",
  "money-laundering-red-flags": "financial-crime-prevention",
  // Regulatory Compliance
  "smcr-training": "regulatory-compliance",
  "client-categorisation": "regulatory-compliance",
  "suitability-appropriateness": "regulatory-compliance",
  // Customer Protection
  "consumer-duty": "customer-protection",
  "consumer-duty-implementation": "customer-protection",
  "vulnerable-customers": "customer-protection",
  "complaints-handling": "customer-protection",
  "financial-promotions": "customer-protection",
  // Operational Risk
  "operational-resilience": "operational-risk",
  "operational-resilience-framework": "operational-risk",
  "outsourcing-third-party": "operational-risk",
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "bg-emerald-100 text-emerald-700" },
  intermediate: { label: "Intermediate", color: "bg-amber-100 text-amber-700" },
  advanced: { label: "Advanced", color: "bg-rose-100 text-rose-700" },
};

const categoryLabels: Record<string, string> = {
  "financial-crime-prevention": "Financial Crime",
  "regulatory-compliance": "Regulatory",
  "customer-protection": "Customer Protection",
  "operational-risk": "Operational Risk",
};

// Beautiful detailed SVG icons with gradients, shadows, and depth
function PremiumIcon({ moduleId, accent, dark }: { moduleId: string; accent: string; dark: string }) {
  const icons: Record<string, JSX.Element> = {
    // AML - Magnifying glass with currency detection
    "aml-fundamentals": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="aml-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="aml-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="aml-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor={dark} floodOpacity="0.3"/>
          </filter>
        </defs>
        {/* Handle */}
        <rect x="42" y="42" width="8" height="20" rx="3" fill={`url(#aml-ring)`} transform="rotate(45 46 52)" filter="url(#aml-shadow)"/>
        {/* Outer ring */}
        <circle cx="26" cy="26" r="20" fill="none" stroke={`url(#aml-ring)`} strokeWidth="5" filter="url(#aml-shadow)"/>
        {/* Glass */}
        <circle cx="26" cy="26" r="15" fill="url(#aml-glass)"/>
        {/* Shine */}
        <ellipse cx="20" cy="20" rx="6" ry="4" fill="white" opacity="0.6" transform="rotate(-30 20 20)"/>
        {/* Currency symbol */}
        <text x="26" y="32" textAnchor="middle" fontSize="16" fontWeight="bold" fill={dark}>$</text>
        {/* Alert dot */}
        <circle cx="40" cy="12" r="6" fill="#EF4444"/>
        <circle cx="40" cy="12" r="4" fill="#FCA5A5"/>
      </svg>
    ),

    // KYC - ID Card with verification
    "kyc-fundamentals": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="kyc-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#E5E5E5" />
          </linearGradient>
          <linearGradient id="kyc-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="kyc-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Card body */}
        <rect x="4" y="12" width="56" height="40" rx="4" fill="url(#kyc-card)" filter="url(#kyc-shadow)"/>
        {/* Header stripe */}
        <rect x="4" y="12" width="56" height="10" rx="4" fill={`url(#kyc-accent)`}/>
        <rect x="4" y="18" width="56" height="4" fill={`url(#kyc-accent)`}/>
        {/* Photo placeholder */}
        <rect x="8" y="26" width="16" height="20" rx="2" fill="#D4D4D4"/>
        <circle cx="16" cy="32" r="5" fill="#A3A3A3"/>
        <ellipse cx="16" cy="42" rx="6" ry="4" fill="#A3A3A3"/>
        {/* Text lines */}
        <rect x="28" y="28" width="24" height="3" rx="1" fill="#A3A3A3"/>
        <rect x="28" y="34" width="18" height="3" rx="1" fill="#D4D4D4"/>
        <rect x="28" y="40" width="20" height="3" rx="1" fill="#D4D4D4"/>
        {/* Verification badge */}
        <circle cx="52" cy="44" r="8" fill="#10B981"/>
        <path d="M48 44 L51 47 L56 41" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Sanctions - Globe with shield
    "sanctions-training": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="sanc-globe" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <linearGradient id="sanc-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="sanc-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Globe */}
        <circle cx="28" cy="32" r="22" fill="url(#sanc-globe)" filter="url(#sanc-shadow)"/>
        {/* Globe lines */}
        <ellipse cx="28" cy="32" rx="22" ry="10" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5"/>
        <ellipse cx="28" cy="32" rx="10" ry="22" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5"/>
        <line x1="6" y1="32" x2="50" y2="32" stroke="#3B82F6" strokeWidth="1.5" opacity="0.3"/>
        <line x1="28" y1="10" x2="28" y2="54" stroke="#3B82F6" strokeWidth="1.5" opacity="0.3"/>
        {/* Continents suggestion */}
        <ellipse cx="22" cy="28" rx="8" ry="5" fill="#60A5FA" opacity="0.6"/>
        <ellipse cx="34" cy="36" rx="6" ry="4" fill="#60A5FA" opacity="0.6"/>
        {/* Shield */}
        <path d="M48 20 L48 36 C48 44 40 50 40 50 C40 50 32 44 32 36 L32 20 L40 16 L48 20 Z" fill="url(#sanc-shield)" filter="url(#sanc-shadow)"/>
        <path d="M36 32 L39 35 L45 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // PEPs - Crown with star
    "peps-training": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="pep-crown" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="pep-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="pep-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#92400E" floodOpacity="0.3"/>
          </filter>
          <filter id="pep-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Crown base */}
        <rect x="12" y="44" width="40" height="8" rx="2" fill="url(#pep-crown)" filter="url(#pep-shadow)"/>
        {/* Crown body */}
        <path d="M12 44 L12 28 L22 36 L32 20 L42 36 L52 28 L52 44 Z" fill="url(#pep-crown)" filter="url(#pep-shadow)"/>
        {/* Crown jewels */}
        <circle cx="32" cy="20" r="4" fill={accent} filter="url(#pep-glow)"/>
        <circle cx="12" cy="28" r="3" fill="#EF4444"/>
        <circle cx="52" cy="28" r="3" fill="#3B82F6"/>
        {/* Crown details */}
        <circle cx="22" cy="48" r="2" fill={dark}/>
        <circle cx="32" cy="48" r="2" fill={dark}/>
        <circle cx="42" cy="48" r="2" fill={dark}/>
        {/* Sparkle */}
        <path d="M54 12 L56 16 L60 18 L56 20 L54 24 L52 20 L48 18 L52 16 Z" fill="#FDE68A" filter="url(#pep-glow)"/>
      </svg>
    ),

    // SARs - Alert bell with document
    "sars-training": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="sar-bell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id="sar-doc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#E5E5E5" />
          </linearGradient>
          <filter id="sar-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Document */}
        <rect x="6" y="24" width="28" height="36" rx="2" fill="url(#sar-doc)" filter="url(#sar-shadow)"/>
        <rect x="10" y="30" width="16" height="2" rx="1" fill="#A3A3A3"/>
        <rect x="10" y="36" width="20" height="2" rx="1" fill="#D4D4D4"/>
        <rect x="10" y="42" width="14" height="2" rx="1" fill="#D4D4D4"/>
        <rect x="10" y="48" width="18" height="2" rx="1" fill="#D4D4D4"/>
        {/* Bell */}
        <path d="M44 8 L44 12" stroke={dark} strokeWidth="3" strokeLinecap="round"/>
        <path d="M32 42 L32 28 C32 20 38 14 44 14 C50 14 56 20 56 28 L56 42 L32 42" fill="url(#sar-bell)" filter="url(#sar-shadow)"/>
        <rect x="30" y="42" width="28" height="5" rx="2.5" fill={dark}/>
        <circle cx="44" cy="52" r="5" fill={accent}/>
        {/* Alert badge */}
        <circle cx="54" cy="18" r="8" fill="#EF4444" filter="url(#sar-shadow)"/>
        <text x="54" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">!</text>
      </svg>
    ),

    // SMCR - Building with people
    "smcr-training": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="smcr-build" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </linearGradient>
          <linearGradient id="smcr-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="smcr-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Building */}
        <rect x="14" y="20" width="36" height="40" rx="2" fill="url(#smcr-build)" filter="url(#smcr-shadow)"/>
        {/* Roof */}
        <polygon points="32,6 54,20 10,20" fill={`url(#smcr-accent)`}/>
        {/* Windows */}
        <rect x="18" y="26" width="8" height="8" rx="1" fill={accent} opacity="0.7"/>
        <rect x="28" y="26" width="8" height="8" rx="1" fill={accent} opacity="0.7"/>
        <rect x="38" y="26" width="8" height="8" rx="1" fill={accent} opacity="0.7"/>
        <rect x="18" y="38" width="8" height="8" rx="1" fill={accent} opacity="0.7"/>
        <rect x="38" y="38" width="8" height="8" rx="1" fill={accent} opacity="0.7"/>
        {/* Door */}
        <rect x="28" y="46" width="8" height="14" rx="1" fill={dark}/>
        {/* People silhouettes */}
        <circle cx="8" cy="50" r="4" fill={dark}/>
        <ellipse cx="8" cy="60" rx="4" ry="6" fill={dark}/>
        <circle cx="56" cy="50" r="4" fill={dark}/>
        <ellipse cx="56" cy="60" rx="4" ry="6" fill={dark}/>
      </svg>
    ),

    // Consumer Duty - Shield with heart
    "consumer-duty": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="cd-shield" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id="cd-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id="cd-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
          </filter>
          <filter id="cd-inner" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#fff" floodOpacity="0.3"/>
          </filter>
        </defs>
        {/* Shield */}
        <path d="M32 4 L56 14 L56 34 C56 48 32 60 32 60 C32 60 8 48 8 34 L8 14 L32 4 Z" fill="url(#cd-shield)" filter="url(#cd-shadow)"/>
        {/* Shield inner highlight */}
        <path d="M32 10 L50 18 L50 34 C50 44 32 54 32 54" fill="none" stroke="white" strokeWidth="2" opacity="0.2"/>
        {/* Heart */}
        <path d="M32 46 C26 40 18 34 18 26 C18 20 22 16 28 16 C30 16 32 18 32 18 C32 18 34 16 36 16 C42 16 46 20 46 26 C46 34 38 40 32 46" fill="url(#cd-heart)" filter="url(#cd-inner)"/>
        {/* Heart shine */}
        <ellipse cx="26" cy="24" rx="3" ry="2" fill="white" opacity="0.5"/>
      </svg>
    ),

    // Vulnerable Customers - Hands holding heart
    "vulnerable-customers": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="vc-hands" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="vc-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="vc-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
          <filter id="vc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Left hand */}
        <path d="M8 44 C8 36 14 32 20 36 L20 24 C20 22 22 20 24 20 C26 20 28 22 28 24 L28 40" fill="url(#vc-hands)" filter="url(#vc-shadow)"/>
        <ellipse cx="12" cy="50" rx="8" ry="4" fill="url(#vc-hands)"/>
        {/* Right hand */}
        <path d="M56 44 C56 36 50 32 44 36 L44 24 C44 22 42 20 40 20 C38 20 36 22 36 24 L36 40" fill="url(#vc-hands)" filter="url(#vc-shadow)"/>
        <ellipse cx="52" cy="50" rx="8" ry="4" fill="url(#vc-hands)"/>
        {/* Heart */}
        <path d="M32 50 C24 42 14 34 14 24 C14 16 20 10 28 10 C30 10 32 12 32 12 C32 12 34 10 36 10 C44 10 50 16 50 24 C50 34 40 42 32 50" fill="url(#vc-heart)" filter="url(#vc-glow)"/>
        {/* Heart shine */}
        <ellipse cx="24" cy="22" rx="4" ry="3" fill="white" opacity="0.4"/>
      </svg>
    ),

    // Complaints - Chat bubbles with resolution
    "complaints-handling": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="ch-bubble1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <linearGradient id="ch-bubble2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="ch-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* First bubble */}
        <rect x="4" y="6" width="32" height="24" rx="4" fill="url(#ch-bubble1)" filter="url(#ch-shadow)"/>
        <polygon points="12,30 20,30 16,38" fill="#93C5FD"/>
        <rect x="10" y="14" width="20" height="3" rx="1" fill="#3B82F6" opacity="0.5"/>
        <rect x="10" y="20" width="14" height="3" rx="1" fill="#3B82F6" opacity="0.3"/>
        {/* Second bubble */}
        <rect x="28" y="30" width="32" height="24" rx="4" fill="url(#ch-bubble2)" filter="url(#ch-shadow)"/>
        <polygon points="52,54 44,54 48,62" fill={dark}/>
        <rect x="34" y="38" width="20" height="3" rx="1" fill="white" opacity="0.5"/>
        <rect x="34" y="44" width="14" height="3" rx="1" fill="white" opacity="0.3"/>
        {/* Success checkmark */}
        <circle cx="52" cy="16" r="10" fill="#10B981" filter="url(#ch-shadow)"/>
        <path d="M47 16 L50 19 L57 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Financial Promotions - Megaphone with checkmark
    "financial-promotions": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="fp-mega" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id="fp-handle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1F2937" />
          </linearGradient>
          <filter id="fp-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Megaphone body */}
        <path d="M10 26 L10 38 L18 38 L42 54 L42 10 L18 26 Z" fill="url(#fp-mega)" filter="url(#fp-shadow)"/>
        {/* Handle */}
        <rect x="4" y="28" width="8" height="8" rx="2" fill="url(#fp-handle)"/>
        {/* Sound waves */}
        <path d="M48 22 Q56 32 48 42" fill="none" stroke={accent} strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
        <path d="M52 16 Q64 32 52 48" fill="none" stroke={accent} strokeWidth="3" opacity="0.4" strokeLinecap="round"/>
        {/* Megaphone end */}
        <ellipse cx="42" cy="32" rx="4" ry="14" fill={dark}/>
        {/* Approval badge */}
        <circle cx="18" cy="50" r="10" fill="#10B981" filter="url(#fp-shadow)"/>
        <path d="M13 50 L16 53 L23 46" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Operational Resilience - Connected gears
    "operational-resilience": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="or-gear1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id="or-gear2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="or-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Large gear */}
        <g filter="url(#or-shadow)">
          <circle cx="24" cy="28" r="16" fill="url(#or-gear1)"/>
          <circle cx="24" cy="28" r="6" fill="white"/>
          {/* Teeth */}
          <rect x="20" y="8" width="8" height="6" fill="url(#or-gear1)"/>
          <rect x="20" y="42" width="8" height="6" fill="url(#or-gear1)"/>
          <rect x="4" y="24" width="6" height="8" fill="url(#or-gear1)"/>
          <rect x="38" y="24" width="6" height="8" fill="url(#or-gear1)"/>
          <rect x="8" y="12" width="6" height="6" transform="rotate(45 11 15)" fill="url(#or-gear1)"/>
          <rect x="34" y="12" width="6" height="6" transform="rotate(45 37 15)" fill="url(#or-gear1)"/>
          <rect x="8" y="38" width="6" height="6" transform="rotate(45 11 41)" fill="url(#or-gear1)"/>
          <rect x="34" y="38" width="6" height="6" transform="rotate(45 37 41)" fill="url(#or-gear1)"/>
        </g>
        {/* Small gear */}
        <g filter="url(#or-shadow)">
          <circle cx="46" cy="46" r="12" fill="url(#or-gear2)"/>
          <circle cx="46" cy="46" r="4" fill="white"/>
          {/* Teeth */}
          <rect x="43" y="32" width="6" height="4" fill="url(#or-gear2)"/>
          <rect x="43" y="56" width="6" height="4" fill="url(#or-gear2)"/>
          <rect x="32" y="43" width="4" height="6" fill="url(#or-gear2)"/>
          <rect x="56" y="43" width="4" height="6" fill="url(#or-gear2)"/>
        </g>
        {/* Connection indicator */}
        <circle cx="36" cy="36" r="3" fill="#10B981"/>
      </svg>
    ),

    // Consumer Duty Implementation - Scales with checklist
    "consumer-duty-implementation": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="cdi-scale" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="cdi-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Scale beam */}
        <rect x="30" y="8" width="4" height="8" fill={dark}/>
        <circle cx="32" cy="8" r="4" fill={accent}/>
        <rect x="8" y="16" width="48" height="4" rx="2" fill="url(#cdi-scale)" filter="url(#cdi-shadow)"/>
        {/* Left pan */}
        <line x1="16" y1="20" x2="16" y2="32" stroke={dark} strokeWidth="2"/>
        <ellipse cx="16" cy="36" rx="12" ry="4" fill="url(#cdi-scale)"/>
        {/* Right pan */}
        <line x1="48" y1="20" x2="48" y2="32" stroke={dark} strokeWidth="2"/>
        <ellipse cx="48" cy="36" rx="12" ry="4" fill="url(#cdi-scale)"/>
        {/* Checklist */}
        <rect x="22" y="44" width="20" height="16" rx="2" fill="#FAFAFA" filter="url(#cdi-shadow)"/>
        <rect x="25" y="48" width="6" height="2" fill="#10B981"/>
        <rect x="33" y="48" width="6" height="2" fill="#D4D4D4"/>
        <rect x="25" y="52" width="6" height="2" fill="#10B981"/>
        <rect x="33" y="52" width="6" height="2" fill="#D4D4D4"/>
        <rect x="25" y="56" width="6" height="2" fill="#D4D4D4"/>
        <rect x="33" y="56" width="6" height="2" fill="#D4D4D4"/>
      </svg>
    ),

    // Financial Crime AML - Network detection
    "financial-crime-aml": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="fca-node" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="fca-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Network connections */}
        <line x1="32" y1="20" x2="16" y2="36" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="32" y1="20" x2="48" y2="36" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="32" y1="20" x2="32" y2="44" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="16" y1="36" x2="32" y2="44" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="48" y1="36" x2="32" y2="44" stroke="#D4D4D4" strokeWidth="2"/>
        {/* Central node - suspicious */}
        <circle cx="32" cy="20" r="10" fill="url(#fca-node)" filter="url(#fca-shadow)"/>
        <text x="32" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">$</text>
        {/* Side nodes */}
        <circle cx="16" cy="36" r="8" fill="#E5E7EB" filter="url(#fca-shadow)"/>
        <circle cx="48" cy="36" r="8" fill="#E5E7EB" filter="url(#fca-shadow)"/>
        <circle cx="32" cy="44" r="8" fill="#E5E7EB" filter="url(#fca-shadow)"/>
        {/* Alert indicator */}
        <circle cx="44" cy="12" r="6" fill="#EF4444"/>
        <text x="44" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">!</text>
        {/* Magnifying glass */}
        <circle cx="52" cy="52" r="8" fill="none" stroke={dark} strokeWidth="2"/>
        <line x1="57" y1="57" x2="62" y2="62" stroke={dark} strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),

    // Client Categorisation - User tiers
    "client-categorisation": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="cc-card1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="cc-card2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
          <linearGradient id="cc-card3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <filter id="cc-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Gold tier card */}
        <rect x="4" y="8" width="24" height="32" rx="3" fill="url(#cc-card1)" filter="url(#cc-shadow)"/>
        <circle cx="16" cy="18" r="6" fill="white" opacity="0.5"/>
        <rect x="8" y="28" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
        <rect x="8" y="32" width="12" height="2" rx="1" fill="white" opacity="0.3"/>
        {/* Silver tier card */}
        <rect x="20" y="16" width="24" height="32" rx="3" fill="url(#cc-card2)" filter="url(#cc-shadow)"/>
        <circle cx="32" cy="26" r="6" fill="white" opacity="0.5"/>
        <rect x="24" y="36" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
        <rect x="24" y="40" width="12" height="2" rx="1" fill="white" opacity="0.3"/>
        {/* Bronze tier card */}
        <rect x="36" y="24" width="24" height="32" rx="3" fill="url(#cc-card3)" filter="url(#cc-shadow)"/>
        <circle cx="48" cy="34" r="6" fill="white" opacity="0.5"/>
        <rect x="40" y="44" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
        <rect x="40" y="48" width="12" height="2" rx="1" fill="white" opacity="0.3"/>
        {/* Badge */}
        <circle cx="52" cy="12" r="8" fill={accent} filter="url(#cc-shadow)"/>
        <text x="52" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">3</text>
      </svg>
    ),

    // Suitability & Appropriateness - Target with checkmark
    "suitability-appropriateness": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="sa-target" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="sa-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Target rings */}
        <circle cx="32" cy="32" r="26" fill="#FEE2E2" filter="url(#sa-shadow)"/>
        <circle cx="32" cy="32" r="20" fill="#FECACA"/>
        <circle cx="32" cy="32" r="14" fill="#FCA5A5"/>
        <circle cx="32" cy="32" r="8" fill="url(#sa-target)"/>
        {/* Arrow */}
        <line x1="48" y1="16" x2="36" y2="28" stroke={dark} strokeWidth="3" strokeLinecap="round"/>
        <polygon points="34,26 38,30 42,22" fill={dark}/>
        {/* Checkmark badge */}
        <circle cx="52" cy="48" r="10" fill="#10B981" filter="url(#sa-shadow)"/>
        <path d="M47 48 L50 51 L57 44" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Outsourcing & Third Party - Handshake with document
    "outsourcing-third-party": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="otp-hand" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="otp-doc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <filter id="otp-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Left hand */}
        <path d="M8 36 L20 36 L24 32 L28 36 L28 44 L8 44 Z" fill="url(#otp-hand)" filter="url(#otp-shadow)"/>
        {/* Right hand */}
        <path d="M56 36 L44 36 L40 32 L36 36 L36 44 L56 44 Z" fill="url(#otp-hand)" filter="url(#otp-shadow)"/>
        {/* Handshake center */}
        <ellipse cx="32" cy="38" rx="6" ry="4" fill="#D97706"/>
        {/* Document */}
        <rect x="22" y="8" width="20" height="24" rx="2" fill="#FAFAFA" filter="url(#otp-shadow)"/>
        <rect x="22" y="8" width="20" height="6" rx="2" fill="url(#otp-doc)"/>
        <rect x="25" y="18" width="14" height="2" rx="1" fill="#D4D4D4"/>
        <rect x="25" y="22" width="10" height="2" rx="1" fill="#D4D4D4"/>
        <rect x="25" y="26" width="12" height="2" rx="1" fill="#D4D4D4"/>
        {/* Connection lines */}
        <path d="M18 50 L32 56 L46 50" stroke={accent} strokeWidth="2" fill="none" strokeDasharray="3 2"/>
        {/* Buildings */}
        <rect x="4" y="48" width="12" height="14" rx="1" fill={accent}/>
        <rect x="48" y="48" width="12" height="14" rx="1" fill={dark}/>
      </svg>
    ),

    // Operational Resilience Framework - Connected systems
    "operational-resilience-framework": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="orf-center" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
          <linearGradient id="orf-node" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <filter id="orf-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15"/>
          </filter>
        </defs>
        {/* Connection lines */}
        <line x1="32" y1="32" x2="16" y2="16" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="32" y1="32" x2="48" y2="16" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="32" y1="32" x2="16" y2="48" stroke="#D4D4D4" strokeWidth="2"/>
        <line x1="32" y1="32" x2="48" y2="48" stroke="#D4D4D4" strokeWidth="2"/>
        {/* Outer ring */}
        <circle cx="32" cy="32" r="24" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 2"/>
        {/* Center hub */}
        <circle cx="32" cy="32" r="12" fill="url(#orf-center)" filter="url(#orf-shadow)"/>
        <path d="M28 32 L31 35 L37 29" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Outer nodes */}
        <circle cx="16" cy="16" r="8" fill="url(#orf-node)" filter="url(#orf-shadow)"/>
        <circle cx="48" cy="16" r="8" fill="url(#orf-node)" filter="url(#orf-shadow)"/>
        <circle cx="16" cy="48" r="8" fill="url(#orf-node)" filter="url(#orf-shadow)"/>
        <circle cx="48" cy="48" r="8" fill="url(#orf-node)" filter="url(#orf-shadow)"/>
        {/* Node icons */}
        <rect x="13" y="13" width="6" height="6" rx="1" fill="#3B82F6"/>
        <circle cx="48" cy="16" r="3" fill="#3B82F6"/>
        <polygon points="16,45 13,51 19,51" fill="#3B82F6"/>
        <rect x="46" y="46" width="4" height="4" fill="#3B82F6"/>
      </svg>
    ),

    // Money Laundering Red Flags - Warning flags with money
    "money-laundering-red-flags": (
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <defs>
          <linearGradient id="mlrf-flag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="mlrf-coin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="mlrf-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
          </filter>
        </defs>
        {/* Flag poles */}
        <rect x="14" y="8" width="3" height="40" fill="#6B7280"/>
        <rect x="34" y="12" width="3" height="36" fill="#6B7280"/>
        <rect x="54" y="16" width="3" height="32" fill="#6B7280"/>
        {/* Flags */}
        <path d="M17 8 L17 24 L32 16 Z" fill="url(#mlrf-flag)" filter="url(#mlrf-shadow)"/>
        <path d="M37 12 L37 26 L50 19 Z" fill="url(#mlrf-flag)" filter="url(#mlrf-shadow)"/>
        <path d="M57 16 L57 28 L68 22 Z" fill="url(#mlrf-flag)" filter="url(#mlrf-shadow)"/>
        {/* Warning symbols on flags */}
        <text x="22" y="18" fontSize="6" fontWeight="bold" fill="white">!</text>
        <text x="41" y="21" fontSize="6" fontWeight="bold" fill="white">!</text>
        {/* Coins at bottom */}
        <ellipse cx="20" cy="54" rx="10" ry="4" fill="url(#mlrf-coin)" filter="url(#mlrf-shadow)"/>
        <ellipse cx="20" cy="52" rx="10" ry="4" fill="url(#mlrf-coin)"/>
        <text x="20" y="54" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#92400E">$</text>
        <ellipse cx="40" cy="56" rx="8" ry="3" fill="url(#mlrf-coin)" filter="url(#mlrf-shadow)"/>
        <ellipse cx="40" cy="54" rx="8" ry="3" fill="url(#mlrf-coin)"/>
        <text x="40" y="56" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#92400E">$</text>
      </svg>
    ),
  };

  // Default fallback icon
  const defaultIcon = (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <defs>
        <linearGradient id="def-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="40" height="40" rx="8" fill="url(#def-grad)"/>
      <circle cx="32" cy="32" r="10" fill="white" opacity="0.3"/>
    </svg>
  );

  return icons[moduleId] || defaultIcon;
}

export function PlayfulModuleCard({
  id,
  title,
  description,
  category,
  duration,
  difficulty,
  progress,
  certificate,
  assignmentCount,
  assignmentNote,
  onAssign,
  className,
}: PlayfulModuleCardProps) {
  const categoryKey = moduleCategoryMap[id] || category || "financial-crime-prevention";
  const styles = categoryStyles[categoryKey] || categoryStyles["financial-crime-prevention"];

  const isCompleted = progress?.status === "completed";
  const isInProgress = progress?.status === "in_progress";
  const progressPercent = progress?.progress_percentage || 0;

  const actionLabel = isCompleted ? "Review" : isInProgress ? "Continue" : "Start";
  const ActionIcon = isCompleted ? RotateCcw : ArrowRight;
  const diffConfig = difficultyConfig[difficulty] || difficultyConfig.beginner;

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border border-slate-200 overflow-hidden",
        "transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1",
        isCompleted && "ring-2 ring-emerald-500 ring-offset-2",
        className
      )}
    >
      {/* Header with premium icon */}
      <div className="relative h-36 flex items-center justify-center bg-slate-50/80">
        {/* Icon */}
        <div className="w-24 h-24 transition-transform duration-300 group-hover:scale-110">
          <PremiumIcon moduleId={id} accent={styles.accent} dark={styles.dark} />
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className={cn("text-white font-medium shadow-sm border-0 bg-gradient-to-r", styles.gradient)}>
            {categoryLabels[categoryKey] || category?.replace(/-/g, " ")}
          </Badge>
        </div>

        {/* Status indicators */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isCompleted && (
            <div className="bg-white rounded-full p-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}
          {certificate && (
            <div className="bg-white rounded-full p-1.5 shadow-sm">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 leading-tight mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Progress bar (if in progress) */}
        {isInProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-medium">Progress</span>
              <span className="font-semibold text-slate-700">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Score display (if completed) */}
        {isCompleted && progress?.score && (
          <div className="mb-4 px-3 py-2 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700">Your Score</span>
              <span className="text-sm font-bold text-emerald-700">{progress.score}%</span>
            </div>
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
            <Clock className="w-3 h-3 mr-1" />
            {duration} min
          </Badge>
          <Badge variant="secondary" className={cn("text-xs border-0", diffConfig.color)}>
            {diffConfig.label}
          </Badge>
          {assignmentCount ? (
            <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
              <UserPlus className="w-3 h-3 mr-1" />
              {assignmentCount} assigned
            </Badge>
          ) : null}
        </div>
        {assignmentNote ? (
          <p className="-mt-2 mb-4 text-xs text-slate-500">{assignmentNote}</p>
        ) : null}

        {/* CTA */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={() => onAssign?.(id)}
            disabled={!onAssign}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
          <Button
            asChild
            className={cn(
              "w-full font-medium transition-all bg-gradient-to-r",
              isCompleted
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 from-slate-100 to-slate-100"
                : `${styles.gradient} hover:opacity-90 text-white`
            )}
          >
            <a href={`/training-library/lesson/${id}`} className="flex items-center justify-center gap-2">
              {actionLabel}
              <ActionIcon className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
