"use client";

import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

// Dashboard Icon - Building with people (Indigo → Purple)
export function DashboardIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <path
        d="M24 12L12 20V36H20V28H28V36H36V20L24 12Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="24" r="3" fill="white" />
      <circle cx="18" cy="32" r="2" fill="white" opacity="0.7" />
      <circle cx="30" cy="32" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}

// People Icon - Person with badge (Teal → Emerald)
export function PeopleIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <circle cx="24" cy="18" r="5" stroke="white" strokeWidth="2" fill="none" />
      <path
        d="M14 36C14 30.477 18.477 26 24 26C29.523 26 34 30.477 34 36"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="30" y="14" width="8" height="6" rx="1" fill="white" opacity="0.9" />
      <path d="M32 17H36" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// SMFs Icon - Shield with crown (Gold → Amber)
export function SmfIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <path
        d="M24 10L12 16V24C12 31.732 17.268 38.456 24 40C30.732 38.456 36 31.732 36 24V16L24 10Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M18 20L21 24L18 28H30L27 24L30 20H18Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="24" cy="24" r="2" fill="#eab308" />
    </svg>
  );
}

// Certifications Icon - Certificate/award (Blue → Cyan)
export function CertificationIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <rect x="12" y="12" width="24" height="18" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <path d="M16 18H32" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 22H28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="30" r="6" stroke="white" strokeWidth="2" fill="none" />
      <path d="M30 27V30L32 32" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 36L30 38L34 36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// F&P Icon - Clipboard with check (Green → Teal)
export function FitnessProprietyIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <rect x="14" y="14" width="20" height="26" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <rect x="18" y="10" width="12" height="6" rx="1" fill="white" />
      <path d="M19 24L22 27L29 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 32H29" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M19 36H26" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

// Conduct Rules Icon - Scale/balance (Purple → Pink)
export function ConductRulesIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <path d="M24 12V36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 36H28" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18H36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 18L16 28H12L8 28"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="12" cy="28" rx="4" ry="2" stroke="white" strokeWidth="1.5" fill="none" />
      <path
        d="M36 18L32 28H36L40 28"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="36" cy="28" rx="4" ry="2" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="14" r="3" fill="white" />
    </svg>
  );
}

// Workflows Icon - Flow chart (Sky → Indigo)
export function WorkflowsIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <rect x="18" y="10" width="12" height="8" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <rect x="10" y="30" width="10" height="8" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <rect x="28" y="30" width="10" height="8" rx="2" stroke="white" strokeWidth="2" fill="none" />
      <path d="M24 18V24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 24H15V30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 24H33V30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Org Chart Icon - Hierarchy tree (Violet → Purple)
export function OrgChartIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <circle cx="24" cy="14" r="4" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="14" cy="28" r="3" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="24" cy="28" r="3" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="34" cy="28" r="3" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="10" cy="38" r="2" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="18" cy="38" r="2" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="38" r="2" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="38" cy="38" r="2" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M24 18V22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 22H14V25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 22V25" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 22H34V25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 31V34H10V36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 34H18V36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 31V34H30V36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 34H38V36" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Breaches Icon - Warning triangle with exclamation (Rose → Red)
export function BreachesIcon({ className = "", size = 48 }: IconProps) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${id}-grad)`} />
      <path
        d="M24 12L38 36H10L24 12Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M24 22V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="32" r="1.5" fill="white" />
    </svg>
  );
}

// Export map for easy access
export const SmcrIconMap = {
  dashboard: DashboardIcon,
  people: PeopleIcon,
  smfs: SmfIcon,
  certifications: CertificationIcon,
  fitnessPropriety: FitnessProprietyIcon,
  conductRules: ConductRulesIcon,
  workflows: WorkflowsIcon,
  orgChart: OrgChartIcon,
  breaches: BreachesIcon,
} as const;

export type SmcrIconName = keyof typeof SmcrIconMap;
