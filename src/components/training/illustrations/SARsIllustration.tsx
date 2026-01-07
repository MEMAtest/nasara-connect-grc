"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Alert bell character holding a flag and notepad
export function SARsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Alert waves */}
      <g opacity="0.4">
        <circle cx="100" cy="50" r="60" fill="none" stroke="#F59E0B" strokeWidth="2">
          <animate attributeName="r" values="40;60;40" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="50" r="50" fill="none" stroke="#F59E0B" strokeWidth="2">
          <animate attributeName="r" values="30;50;30" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
        </circle>
      </g>

      {/* Bell character body */}
      <g transform="translate(100, 75)">
        {/* Bell top curve */}
        <path
          d="M-35 20 Q-35 -30 0 -35 Q35 -30 35 20"
          fill="#FBBF24"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Bell body */}
        <rect x="-40" y="15" width="80" height="20" rx="3" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2"/>

        {/* Bell rim */}
        <rect x="-45" y="30" width="90" height="10" rx="5" fill="#F59E0B"/>

        {/* Bell clapper */}
        <circle cx="0" cy="45" r="8" fill="#78350F"/>

        {/* Bell top knob */}
        <rect x="-8" y="-40" width="16" height="10" rx="4" fill="#F59E0B"/>
        <circle cx="0" cy="-40" r="6" fill="#FBBF24"/>

        {/* Face */}
        {/* Eyes - alert expression */}
        <ellipse cx="-12" cy="-5" rx="8" ry="10" fill="white"/>
        <ellipse cx="12" cy="-5" rx="8" ry="10" fill="white"/>
        <circle cx="-10" cy="-3" r="5" fill="#1E1E2E"/>
        <circle cx="14" cy="-3" r="5" fill="#1E1E2E"/>
        <circle cx="-9" cy="-5" r="2" fill="white"/>
        <circle cx="15" cy="-5" r="2" fill="white"/>

        {/* Concerned/alert eyebrows */}
        <path d="M-20 -18 L-5 -14" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20 -18 L5 -14" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>

        {/* Open mouth - alerting */}
        <ellipse cx="0" cy="12" rx="8" ry="6" fill="#78350F"/>
        <ellipse cx="0" cy="10" rx="5" ry="3" fill="#FCA5A5"/>
      </g>

      {/* Left arm holding flag */}
      <g transform="translate(45, 80)">
        {/* Arm */}
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#FBBF24"/>

        {/* Flag pole */}
        <line x1="-15" y1="-40" x2="-15" y2="5" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>

        {/* Flag */}
        <g>
          <path d="M-15 -40 L15 -30 L-15 -20 Z" fill="#EF4444">
            <animateTransform attributeName="transform" type="rotate" values="0 -15 -30;5 -15 -30;0 -15 -30" dur="1s" repeatCount="indefinite"/>
          </path>
          <text x="-5" y="-28" fontSize="8" fill="white" fontWeight="bold">!</text>
        </g>
      </g>

      {/* Right arm holding notepad */}
      <g transform="translate(155, 80)">
        {/* Arm */}
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#FBBF24"/>

        {/* Notepad */}
        <g transform="translate(-5, -35)">
          <rect x="0" y="0" width="30" height="40" rx="3" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
          {/* Spiral binding */}
          <circle cx="5" cy="5" r="2" fill="#94A3B8"/>
          <circle cx="5" cy="12" r="2" fill="#94A3B8"/>
          <circle cx="5" cy="19" r="2" fill="#94A3B8"/>
          <circle cx="5" cy="26" r="2" fill="#94A3B8"/>
          <circle cx="5" cy="33" r="2" fill="#94A3B8"/>
          {/* Writing lines */}
          <line x1="10" y1="8" x2="25" y2="8" stroke="#CBD5E1" strokeWidth="1"/>
          <line x1="10" y1="14" x2="22" y2="14" stroke="#CBD5E1" strokeWidth="1"/>
          <line x1="10" y1="20" x2="25" y2="20" stroke="#CBD5E1" strokeWidth="1"/>
          <line x1="10" y1="26" x2="20" y2="26" stroke="#CBD5E1" strokeWidth="1"/>
          {/* Checkmarks */}
          <path d="M11 10 L13 12 L17 6" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M11 16 L13 18 L17 12" stroke="#10B981" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </g>

      {/* Exclamation marks */}
      <g fill="#EF4444">
        <text x="30" y="40" fontSize="16" fontWeight="bold">!</text>
        <text x="165" y="45" fontSize="14" fontWeight="bold">!</text>
        <text x="50" y="130" fontSize="12" fontWeight="bold">!</text>
      </g>
    </svg>
  );
}
