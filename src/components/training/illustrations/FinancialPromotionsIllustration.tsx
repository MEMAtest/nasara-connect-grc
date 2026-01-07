"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Megaphone character with compliance shield badge
export function FinancialPromotionsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Sound waves */}
      <g opacity="0.3">
        <path d="M130 60 Q150 60 150 75 Q150 90 130 90" fill="none" stroke="#F472B6" strokeWidth="3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite"/>
        </path>
        <path d="M140 50 Q170 50 170 75 Q170 100 140 100" fill="none" stroke="#F472B6" strokeWidth="3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" begin="0.2s" repeatCount="indefinite"/>
        </path>
        <path d="M150 40 Q190 40 190 75 Q190 110 150 110" fill="none" stroke="#F472B6" strokeWidth="3">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" begin="0.4s" repeatCount="indefinite"/>
        </path>
      </g>

      {/* Floating approval stamps */}
      <g>
        <g transform="translate(160, 35)">
          <circle cx="0" cy="0" r="15" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
          <path d="M-6 0 L-2 4 L6 -4" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <animate attributeName="transform" values="translate(160,35);translate(160,30);translate(160,35)" dur="2s" repeatCount="indefinite"/>
        </g>

        <g transform="translate(175, 110)">
          <circle cx="0" cy="0" r="12" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2"/>
          <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#3B82F6">✓</text>
          <animate attributeName="transform" values="translate(175,110);translate(175,105);translate(175,110)" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </g>
      </g>

      {/* Megaphone character */}
      <g transform="translate(75, 75)">
        {/* Megaphone body */}
        <path
          d="M-30 -10 L50 -35 L50 35 L-30 10 Z"
          fill="#F472B6"
        />

        {/* Megaphone cone highlight */}
        <path
          d="M-30 -10 L50 -35 L50 -20 L-30 0 Z"
          fill="#F9A8D4"
          opacity="0.5"
        />

        {/* Megaphone bell end */}
        <ellipse cx="50" cy="0" rx="8" ry="40" fill="#EC4899"/>
        <ellipse cx="50" cy="0" rx="5" ry="35" fill="#1E1E2E" opacity="0.3"/>

        {/* Handle */}
        <rect x="-45" y="-8" width="20" height="16" rx="4" fill="#BE185D"/>
        <rect x="-55" y="-5" width="15" height="10" rx="3" fill="#9D174D"/>

        {/* Face on megaphone body */}
        {/* Eyes */}
        <ellipse cx="0" cy="-8" rx="8" ry="9" fill="white"/>
        <ellipse cx="20" cy="-15" rx="7" ry="8" fill="white"/>
        <circle cx="2" cy="-7" r="4" fill="#1E1E2E"/>
        <circle cx="22" cy="-14" r="4" fill="#1E1E2E"/>
        <circle cx="3" cy="-9" r="1.5" fill="white"/>
        <circle cx="23" cy="-16" r="1.5" fill="white"/>

        {/* Energetic happy expression */}
        <path d="M5 5 Q15 12 25 2" stroke="#9D174D" strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Excited eyebrows */}
        <path d="M-5 -18 L8 -22" stroke="#9D174D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M15 -25 L28 -28" stroke="#9D174D" strokeWidth="2" strokeLinecap="round"/>

        {/* Little arms */}
        <ellipse cx="-20" cy="20" rx="10" ry="6" fill="#F472B6"/>
        <ellipse cx="10" cy="25" rx="10" ry="6" fill="#F472B6"/>
      </g>

      {/* Compliance shield badge on megaphone */}
      <g transform="translate(45, 85)">
        <path
          d="M0 -15 L12 -8 L12 5 L0 15 L-12 5 L-12 -8 Z"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="2"
        />
        {/* Checkmark */}
        <path d="M-5 0 L-1 4 L6 -4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* "APPROVED" stamp */}
      <g transform="translate(40, 130)">
        <rect x="-30" y="-10" width="60" height="20" rx="4" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2"/>
        <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#10B981" fontWeight="bold">APPROVED</text>
      </g>

      {/* Warning - fair and clear badge */}
      <g transform="translate(150, 130)">
        <rect x="-25" y="-10" width="50" height="20" rx="4" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
        <text x="0" y="5" textAnchor="middle" fontSize="8" fill="#B45309" fontWeight="bold">FAIR & CLEAR</text>
      </g>

      {/* Message bubbles coming out */}
      <g transform="translate(145, 65)" opacity="0.8">
        <rect x="0" y="0" width="30" height="15" rx="4" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
        <text x="15" y="11" textAnchor="middle" fontSize="7" fill="#6B7280">T&Cs</text>
      </g>
      <g transform="translate(155, 85)" opacity="0.8">
        <rect x="0" y="0" width="25" height="12" rx="3" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
        <text x="12" y="9" textAnchor="middle" fontSize="6" fill="#6B7280">Risks</text>
      </g>
    </svg>
  );
}
