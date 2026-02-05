"use client";

import type { ComponentType, ReactNode } from "react";
import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

const baseMotionProps = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 },
};

function useIllustrationId(prefix: string) {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, "");
  return `${prefix}-${safeId}`;
}

function IllustrationSvg({ className, children }: { className?: string; children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const motionProps = prefersReducedMotion ? {} : baseMotionProps;

  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...motionProps}
    >
      {children}
    </motion.svg>
  );
}

export function DefaultRegisterIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("default-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <polygon points="32 8 52 20 32 32 12 20" fill="#94a3b8" filter={`url(#${shadowId})`} />
      <polygon points="12 20 32 32 32 54 12 42" fill="#64748b" />
      <polygon points="52 20 32 32 32 54 52 42" fill="#475569" />
    </IllustrationSvg>
  );
}

export function PEPIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("pep-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M32 4 L56 12 L56 32 Q56 52 32 60 Q8 52 8 32 L8 12 Z" fill="#e11d48" filter={`url(#${shadowId})`} />
      <path d="M32 10 L50 16 L50 32 Q50 48 32 54 Q14 48 14 32 L14 16 Z" fill="#f8fafc" />
      <ellipse cx="32" cy="32" rx="14" ry="10" fill="#1e293b" />
      <circle cx="32" cy="32" r="6" fill="#f8fafc" />
      <circle cx="32" cy="32" r="3" fill="#1e293b" />
      <circle cx="34" cy="30" r="1.5" fill="white" />
      <line x1="18" y1="28" x2="46" y2="28" stroke="#e11d48" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="36" x2="46" y2="36" stroke="#e11d48" strokeWidth="1" opacity="0.5" />
    </IllustrationSvg>
  );
}

export function ThirdPartyIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("tp-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <line x1="32" y1="32" x2="14" y2="18" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="32" y1="32" x2="50" y2="18" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="32" y1="32" x2="14" y2="50" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="32" y1="32" x2="50" y2="50" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="22" y="24" width="20" height="24" fill="#0891b2" filter={`url(#${shadowId})`} />
      <rect x="24" y="28" width="6" height="6" fill="#cffafe" />
      <rect x="34" y="28" width="6" height="6" fill="#cffafe" />
      <rect x="24" y="38" width="6" height="6" fill="#cffafe" />
      <rect x="34" y="38" width="6" height="6" fill="#cffafe" />
      <circle cx="14" cy="18" r="8" fill="#06b6d4" filter={`url(#${shadowId})`} />
      <rect x="10" y="14" width="8" height="8" rx="1" fill="#f8fafc" />
      <circle cx="50" cy="18" r="8" fill="#06b6d4" filter={`url(#${shadowId})`} />
      <rect x="46" y="14" width="8" height="8" rx="1" fill="#f8fafc" />
      <circle cx="14" cy="50" r="8" fill="#06b6d4" filter={`url(#${shadowId})`} />
      <rect x="10" y="46" width="8" height="8" rx="1" fill="#f8fafc" />
      <circle cx="50" cy="50" r="8" fill="#06b6d4" filter={`url(#${shadowId})`} />
      <rect x="46" y="46" width="8" height="8" rx="1" fill="#f8fafc" />
    </IllustrationSvg>
  );
}

export function ComplaintsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("complaints-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path
        d="M8 8 L56 8 Q60 8 60 12 L60 40 Q60 44 56 44 L20 44 L12 56 L12 44 L8 44 Q4 44 4 40 L4 12 Q4 8 8 8 Z"
        fill="#f59e0b"
        filter={`url(#${shadowId})`}
      />
      <path
        d="M10 12 L54 12 Q56 12 56 14 L56 38 Q56 40 54 40 L20 40 L14 50 L14 40 L10 40 Q8 40 8 38 L8 14 Q8 12 10 12 Z"
        fill="#fef3c7"
      />
      <rect x="28" y="18" width="8" height="14" rx="2" fill="#f59e0b" />
      <rect x="28" y="36" width="8" height="6" rx="2" fill="#f59e0b" />
    </IllustrationSvg>
  );
}

export function IncidentsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("inc-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <polygon points="32,4 60,56 4,56" fill="#dc2626" filter={`url(#${shadowId})`} />
      <polygon points="32,12 54,52 10,52" fill="#fef2f2" />
      <polygon points="36,20 28,34 34,34 28,48 40,30 34,30" fill="#dc2626" />
    </IllustrationSvg>
  );
}

export function ConflictsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("coi-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="24" y="52" width="16" height="6" rx="2" fill="#1e293b" filter={`url(#${shadowId})`} />
      <rect x="28" y="20" width="8" height="34" fill="#64748b" />
      <rect x="8" y="16" width="48" height="6" rx="2" fill="#7c3aed" filter={`url(#${shadowId})`} />
      <line x1="14" y1="22" x2="14" y2="36" stroke="#64748b" strokeWidth="2" />
      <ellipse cx="14" cy="40" rx="10" ry="4" fill="#a78bfa" filter={`url(#${shadowId})`} />
      <line x1="50" y1="22" x2="50" y2="32" stroke="#64748b" strokeWidth="2" />
      <ellipse cx="50" cy="36" rx="10" ry="4" fill="#a78bfa" filter={`url(#${shadowId})`} />
      <circle cx="32" cy="14" r="6" fill="#7c3aed" filter={`url(#${shadowId})`} />
    </IllustrationSvg>
  );
}

export function GiftsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("gift-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="8" y="28" width="48" height="28" rx="2" fill="#ec4899" filter={`url(#${shadowId})`} />
      <rect x="28" y="28" width="8" height="28" fill="#f9a8d4" />
      <rect x="4" y="20" width="56" height="10" rx="2" fill="#db2777" filter={`url(#${shadowId})`} />
      <rect x="28" y="20" width="8" height="10" fill="#fbcfe8" />
      <ellipse cx="22" cy="16" rx="10" ry="6" fill="#f9a8d4" filter={`url(#${shadowId})`} />
      <ellipse cx="42" cy="16" rx="10" ry="6" fill="#f9a8d4" filter={`url(#${shadowId})`} />
      <circle cx="32" cy="18" r="6" fill="#db2777" />
    </IllustrationSvg>
  );
}

export function SanctionsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("sanctions-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M32 6 L54 12 L54 32 Q54 48 32 58 Q10 48 10 32 L10 12 Z" fill="#1d4ed8" filter={`url(#${shadowId})`} />
      <path d="M32 12 L48 16 L48 32 Q48 44 32 52 Q16 44 16 32 L16 16 Z" fill="#eff6ff" />
      <circle cx="32" cy="32" r="10" fill="#ef4444" />
      <line x1="24" y1="40" x2="40" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

export function AmlCddIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("aml-cdd-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="12" y="8" width="34" height="46" rx="4" fill="#0ea5e9" filter={`url(#${shadowId})`} />
      <rect x="16" y="12" width="26" height="38" rx="3" fill="#f8fafc" />
      <rect x="20" y="18" width="18" height="2" rx="1" fill="#cbd5e1" />
      <rect x="20" y="24" width="14" height="2" rx="1" fill="#cbd5e1" />
      <rect x="20" y="30" width="16" height="2" rx="1" fill="#cbd5e1" />
      <circle cx="44" cy="42" r="7" fill="#38bdf8" filter={`url(#${shadowId})`} />
      <circle cx="44" cy="42" r="4" fill="#f8fafc" />
      <rect x="48" y="46" width="8" height="3" rx="1.5" fill="#0f172a" transform="rotate(45 52 47.5)" />
    </IllustrationSvg>
  );
}

export function EddCasesIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("edd-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="14" y="10" width="36" height="44" rx="4" fill="#f59e0b" filter={`url(#${shadowId})`} />
      <rect x="18" y="14" width="28" height="36" rx="3" fill="#fef3c7" />
      <rect x="22" y="20" width="20" height="2" rx="1" fill="#d97706" />
      <rect x="22" y="26" width="16" height="2" rx="1" fill="#d97706" />
      <polygon
        points="32,26 34,31 40,31 35,34 37,39 32,36 27,39 29,34 24,31 30,31"
        fill="#f97316"
      />
    </IllustrationSvg>
  );
}

export function SarNcaIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("sar-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="12" y="8" width="36" height="46" rx="4" fill="#f97316" filter={`url(#${shadowId})`} />
      <rect x="16" y="12" width="28" height="38" rx="3" fill="#fff7ed" />
      <rect x="20" y="18" width="20" height="2" rx="1" fill="#fdba74" />
      <polygon points="32,20 44,40 20,40" fill="#fb7185" filter={`url(#${shadowId})`} />
      <line x1="32" y1="26" x2="32" y2="34" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="37" r="1.8" fill="white" />
    </IllustrationSvg>
  );
}

export function TxMonitoringIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("tx-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="8" y="14" width="48" height="30" rx="4" fill="#0f172a" filter={`url(#${shadowId})`} />
      <rect x="12" y="18" width="40" height="22" rx="3" fill="#f8fafc" />
      <polyline points="14,34 22,28 30,30 38,22 46,26" fill="none" stroke="#0ea5e9" strokeWidth="2" />
      <circle cx="22" cy="28" r="2" fill="#0ea5e9" />
      <circle cx="38" cy="22" r="2" fill="#0ea5e9" />
      <rect x="24" y="46" width="16" height="4" rx="2" fill="#334155" />
      <rect x="20" y="50" width="24" height="4" rx="2" fill="#475569" />
    </IllustrationSvg>
  );
}

export function FinPromIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("finprom-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <polygon points="12,22 38,16 38,48 12,42" fill="#3b82f6" filter={`url(#${shadowId})`} />
      <rect x="38" y="24" width="8" height="16" rx="2" fill="#1d4ed8" />
      <rect x="20" y="42" width="8" height="10" rx="2" fill="#0f172a" />
      <line x1="46" y1="22" x2="54" y2="18" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="32" x2="56" y2="32" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="42" x2="54" y2="46" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

export function VulnerableCustomersIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("vulnerable-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path
        d="M32 26 C32 20 24 18 20 24 C16 30 20 36 32 44 C44 36 48 30 44 24 C40 18 32 20 32 26 Z"
        fill="#ec4899"
        filter={`url(#${shadowId})`}
      />
      <path d="M14 42 Q22 50 30 48" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50 42 Q42 50 34 48" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" fill="none" />
    </IllustrationSvg>
  );
}

export function ProductGovernanceIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("product-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <polygon points="32 10 52 20 32 30 12 20" fill="#fbbf24" filter={`url(#${shadowId})`} />
      <polygon points="12 20 32 30 32 50 12 40" fill="#f59e0b" />
      <polygon points="52 20 32 30 32 50 52 40" fill="#f97316" />
      <circle cx="32" cy="32" r="4" fill="#fef3c7" />
    </IllustrationSvg>
  );
}

export function TcRecordIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("tc-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="8" y="12" width="22" height="40" rx="3" fill="#f8fafc" filter={`url(#${shadowId})`} />
      <rect x="34" y="12" width="22" height="40" rx="3" fill="#f8fafc" filter={`url(#${shadowId})`} />
      <rect x="30" y="12" width="4" height="40" fill="#0ea5e9" />
      <rect x="12" y="20" width="12" height="2" rx="1" fill="#cbd5e1" />
      <rect x="38" y="20" width="12" height="2" rx="1" fill="#cbd5e1" />
      <path d="M40 34 L44 38 L52 28" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </IllustrationSvg>
  );
}

export function SmcrCertificationIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("smcr-cert-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="12" y="10" width="40" height="44" rx="4" fill="#f8fafc" filter={`url(#${shadowId})`} />
      <rect x="16" y="18" width="20" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="16" y="26" width="26" height="3" rx="1.5" fill="#cbd5e1" />
      <circle cx="44" cy="36" r="6" fill="#7c3aed" />
      <polygon points="41,42 44,50 47,42" fill="#6d28d9" />
    </IllustrationSvg>
  );
}

export function RegulatoryReturnsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("returns-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="10" y="12" width="44" height="40" rx="4" fill="#e2e8f0" filter={`url(#${shadowId})`} />
      <rect x="10" y="12" width="44" height="10" rx="4" fill="#2563eb" />
      <rect x="16" y="28" width="8" height="6" rx="1" fill="#cbd5e1" />
      <rect x="28" y="28" width="8" height="6" rx="1" fill="#cbd5e1" />
      <rect x="40" y="28" width="8" height="6" rx="1" fill="#cbd5e1" />
      <path d="M22 40 A10 10 0 1 0 40 40" stroke="#10b981" strokeWidth="2" fill="none" />
      <polygon points="40,40 44,38 42,44" fill="#10b981" />
    </IllustrationSvg>
  );
}

export function PaDealingIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("pa-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="8" y="16" width="48" height="30" rx="5" fill="#0ea5e9" filter={`url(#${shadowId})`} />
      <rect x="12" y="22" width="24" height="4" rx="2" fill="#e0f2fe" />
      <rect x="12" y="30" width="14" height="3" rx="1.5" fill="#bae6fd" />
      <path d="M32 38 L40 34 L48 38" stroke="#f8fafc" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 38 L40 42 L48 38" stroke="#f8fafc" strokeWidth="2" fill="none" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

export function InsiderListIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("insider-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <ellipse cx="32" cy="16" rx="18" ry="6" fill="#6366f1" filter={`url(#${shadowId})`} />
      <rect x="14" y="16" width="36" height="28" fill="#6366f1" />
      <ellipse cx="32" cy="44" rx="18" ry="6" fill="#4f46e5" />
      <rect x="20" y="24" width="18" height="3" rx="1.5" fill="#e0e7ff" />
      <rect x="20" y="30" width="14" height="3" rx="1.5" fill="#e0e7ff" />
      <rect x="20" y="36" width="12" height="3" rx="1.5" fill="#e0e7ff" />
    </IllustrationSvg>
  );
}

export function OutsideBusinessIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("outside-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <rect x="12" y="22" width="40" height="28" rx="4" fill="#f59e0b" filter={`url(#${shadowId})`} />
      <rect x="22" y="16" width="20" height="8" rx="2" fill="#d97706" />
      <rect x="12" y="30" width="40" height="4" fill="#fbbf24" />
      <rect x="26" y="26" width="12" height="4" rx="2" fill="#fef3c7" />
    </IllustrationSvg>
  );
}

export function DataBreachIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("breach-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M32 6 L54 12 L54 32 Q54 48 32 58 Q10 48 10 32 L10 12 Z" fill="#dc2626" filter={`url(#${shadowId})`} />
      <path d="M32 12 L48 16 L48 32 Q48 44 32 52 Q16 44 16 32 L16 16 Z" fill="#fee2e2" />
      <path d="M24 22 L30 30 L26 36 L34 44 L40 38" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

export function OpResilienceIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("resilience-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <path d="M32 6 L54 12 L54 32 Q54 48 32 58 Q10 48 10 32 L10 12 Z" fill="#14b8a6" filter={`url(#${shadowId})`} />
      <path d="M32 12 L48 16 L48 32 Q48 44 32 52 Q16 44 16 32 L16 16 Z" fill="#ccfbf1" />
      <circle cx="32" cy="28" r="3" fill="#0f766e" />
      <circle cx="22" cy="22" r="2" fill="#0f766e" />
      <circle cx="42" cy="22" r="2" fill="#0f766e" />
      <circle cx="22" cy="36" r="2" fill="#0f766e" />
      <circle cx="42" cy="36" r="2" fill="#0f766e" />
      <line x1="32" y1="28" x2="22" y2="22" stroke="#0f766e" strokeWidth="1.5" />
      <line x1="32" y1="28" x2="42" y2="22" stroke="#0f766e" strokeWidth="1.5" />
      <line x1="32" y1="28" x2="22" y2="36" stroke="#0f766e" strokeWidth="1.5" />
      <line x1="32" y1="28" x2="42" y2="36" stroke="#0f766e" strokeWidth="1.5" />
    </IllustrationSvg>
  );
}

export function RegulatoryBreachIllustration({ className = "w-16 h-16" }: { className?: string }) {
  const shadowId = useIllustrationId("reg-breach-shadow");

  return (
    <IllustrationSvg className={className}>
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>
      <polygon
        points="22,8 42,8 56,22 56,42 42,56 22,56 8,42 8,22"
        fill="#ef4444"
        filter={`url(#${shadowId})`}
      />
      <polygon points="26,12 38,12 52,26 52,38 38,52 26,52 12,38 12,26" fill="#fee2e2" />
      <line x1="32" y1="22" x2="32" y2="36" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="42" r="2.5" fill="#ef4444" />
    </IllustrationSvg>
  );
}

export const REGISTER_ILLUSTRATIONS: Record<string, ComponentType<{ className?: string }>> = {
  pep: PEPIllustration,
  sanctions: SanctionsIllustration,
  "aml-cdd": AmlCddIllustration,
  "edd-cases": EddCasesIllustration,
  "sar-nca": SarNcaIllustration,
  "tx-monitoring": TxMonitoringIllustration,
  complaints: ComplaintsIllustration,
  conflicts: ConflictsIllustration,
  "gifts-hospitality": GiftsIllustration,
  "fin-prom": FinPromIllustration,
  "vulnerable-customers": VulnerableCustomersIllustration,
  "product-governance": ProductGovernanceIllustration,
  "tc-record": TcRecordIllustration,
  "smcr-certification": SmcrCertificationIllustration,
  "regulatory-returns": RegulatoryReturnsIllustration,
  "pa-dealing": PaDealingIllustration,
  "insider-list": InsiderListIllustration,
  "outside-business": OutsideBusinessIllustration,
  incidents: IncidentsIllustration,
  "third-party": ThirdPartyIllustration,
  "data-breach-dsar": DataBreachIllustration,
  "op-resilience": OpResilienceIllustration,
  "regulatory-breach": RegulatoryBreachIllustration,
};
