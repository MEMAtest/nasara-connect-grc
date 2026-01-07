"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Heart character with protective shield hugging person
export function VulnerableCustomersIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Warm background glow */}
      <defs>
        <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDF2F8" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FDF2F8" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="75" r="70" fill="url(#warmGlow)"/>

      {/* Floating hearts */}
      <g opacity="0.5">
        <text x="30" y="40" fontSize="14">💕</text>
        <text x="160" y="50" fontSize="12">💗</text>
        <text x="45" y="130" fontSize="10">💓</text>
        <text x="155" y="120" fontSize="11">💕</text>
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
      </g>

      {/* Main heart character */}
      <g transform="translate(85, 70)">
        {/* Heart shape body */}
        <path
          d="M0 25
             C-5 20 -25 15 -30 -5
             C-35 -25 -15 -40 0 -25
             C15 -40 35 -25 30 -5
             C25 15 5 20 0 25Z"
          fill="#EC4899"
          transform="scale(1.8)"
        >
          <animate attributeName="transform" values="scale(1.8);scale(1.85);scale(1.8)" dur="1s" repeatCount="indefinite"/>
        </path>

        {/* Heart face */}
        {/* Caring eyes */}
        <ellipse cx="-15" cy="-15" rx="8" ry="9" fill="white"/>
        <ellipse cx="15" cy="-15" rx="8" ry="9" fill="white"/>
        <circle cx="-13" cy="-13" r="5" fill="#1E1E2E"/>
        <circle cx="17" cy="-13" r="5" fill="#1E1E2E"/>
        <circle cx="-11" cy="-15" r="2" fill="white"/>
        <circle cx="19" cy="-15" r="2" fill="white"/>

        {/* Gentle, caring smile */}
        <path d="M-12 5 Q0 18 12 5" stroke="#BE185D" strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Rosy cheeks */}
        <ellipse cx="-28" cy="-5" rx="8" ry="5" fill="#FDA4AF" opacity="0.6"/>
        <ellipse cx="28" cy="-5" rx="8" ry="5" fill="#FDA4AF" opacity="0.6"/>

        {/* Arms hugging */}
        <path
          d="M-45 10 Q-60 30 -50 50"
          stroke="#EC4899"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M45 10 Q60 30 50 50"
          stroke="#EC4899"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Person being protected/hugged */}
      <g transform="translate(85, 115)">
        {/* Person head */}
        <circle cx="0" cy="0" r="18" fill="#FEF3C7"/>

        {/* Hair */}
        <ellipse cx="0" cy="-12" rx="16" ry="10" fill="#78350F"/>

        {/* Grateful/peaceful expression */}
        {/* Closed happy eyes */}
        <path d="M-8 -2 Q-5 -5 -2 -2" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M2 -2 Q5 -5 8 -2" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Gentle smile */}
        <path d="M-6 6 Q0 11 6 6" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Blush */}
        <ellipse cx="-10" cy="3" rx="4" ry="2" fill="#FCA5A5" opacity="0.5"/>
        <ellipse cx="10" cy="3" rx="4" ry="2" fill="#FCA5A5" opacity="0.5"/>
      </g>

      {/* Protective shield */}
      <g transform="translate(145, 55)">
        <path
          d="M0 -20 L18 -10 L18 10 L0 25 L-18 10 L-18 -10 Z"
          fill="#8B5CF6"
          stroke="#7C3AED"
          strokeWidth="2"
        />
        {/* Shield shine */}
        <path d="M-8 -10 L-8 5 L2 -5 Z" fill="#A78BFA" opacity="0.5"/>
        {/* Heart on shield */}
        <path
          d="M0 5 C-2 3 -6 2 -7 -2 C-8 -6 -4 -9 0 -5 C4 -9 8 -6 7 -2 C6 2 2 3 0 5Z"
          fill="#EC4899"
        />
      </g>

      {/* Supportive hands icon */}
      <g transform="translate(40, 100)">
        <text fontSize="20">🤲</text>
      </g>

      {/* "Care" text badge */}
      <g transform="translate(160, 115)">
        <rect x="-20" y="-10" width="40" height="20" rx="10" fill="#FDF2F8" stroke="#EC4899" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#BE185D" fontWeight="bold">CARE</text>
      </g>
    </svg>
  );
}
