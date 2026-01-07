"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Umbrella character protecting happy customers below
export function ConsumerDutyIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Rain drops (risks) being blocked */}
      <g opacity="0.4">
        <text x="30" y="25" fontSize="12">💧</text>
        <text x="60" y="15" fontSize="10">💧</text>
        <text x="90" y="20" fontSize="11">💧</text>
        <text x="120" y="12" fontSize="12">💧</text>
        <text x="150" y="22" fontSize="10">💧</text>
        <text x="170" y="18" fontSize="11">💧</text>
        <animateTransform attributeName="transform" type="translate" values="0,0;0,5;0,0" dur="1s" repeatCount="indefinite"/>
      </g>

      {/* Umbrella character */}
      <g transform="translate(100, 55)">
        {/* Umbrella canopy */}
        <path
          d="M-55 0 Q-55 -40 0 -45 Q55 -40 55 0 Z"
          fill="#10B981"
        />

        {/* Umbrella sections */}
        <path d="M-40 -5 Q-30 -35 0 -38" fill="none" stroke="#059669" strokeWidth="2"/>
        <path d="M0 -38 Q30 -35 40 -5" fill="none" stroke="#059669" strokeWidth="2"/>
        <path d="M-20 -5 Q-10 -38 0 -40" fill="none" stroke="#059669" strokeWidth="2"/>
        <path d="M0 -40 Q10 -38 20 -5" fill="none" stroke="#059669" strokeWidth="2"/>

        {/* Umbrella rim scallops */}
        <path
          d="M-55 0 Q-45 10 -35 0 Q-25 10 -15 0 Q-5 10 5 0 Q15 10 25 0 Q35 10 45 0 Q55 10 55 0"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="2"
        />

        {/* Umbrella face */}
        <circle cx="-15" cy="-18" r="5" fill="white"/>
        <circle cx="15" cy="-18" r="5" fill="white"/>
        <circle cx="-13" cy="-17" r="3" fill="#1E1E2E"/>
        <circle cx="17" cy="-17" r="3" fill="#1E1E2E"/>
        <circle cx="-12" cy="-18" r="1" fill="white"/>
        <circle cx="18" cy="-18" r="1" fill="white"/>

        {/* Happy protective smile */}
        <path d="M-10 -8 Q0 2 10 -8" stroke="#1E1E2E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Rosy cheeks */}
        <ellipse cx="-25" cy="-12" rx="6" ry="4" fill="#FCA5A5" opacity="0.5"/>
        <ellipse cx="25" cy="-12" rx="6" ry="4" fill="#FCA5A5" opacity="0.5"/>

        {/* Umbrella handle */}
        <line x1="0" y1="0" x2="0" y2="50" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>
        <path d="M0 50 Q-15 55 -15 65 Q-15 75 0 75" fill="none" stroke="#78350F" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Protected customers below */}
      {/* Customer 1 - Happy */}
      <g transform="translate(60, 125)">
        <circle cx="0" cy="0" r="15" fill="#FEF3C7"/>
        <circle cx="-4" cy="-3" r="2" fill="#1E1E2E"/>
        <circle cx="4" cy="-3" r="2" fill="#1E1E2E"/>
        <path d="M-5 4 Q0 9 5 4" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Happy arms up */}
        <line x1="-12" y1="5" x2="-18" y2="-5" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round"/>
        <line x1="12" y1="5" x2="18" y2="-5" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Customer 2 - Content */}
      <g transform="translate(100, 130)">
        <circle cx="0" cy="0" r="12" fill="#DBEAFE"/>
        <circle cx="-3" cy="-2" r="2" fill="#1E1E2E"/>
        <circle cx="3" cy="-2" r="2" fill="#1E1E2E"/>
        <path d="M-4 3 Q0 6 4 3" stroke="#1E1E2E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </g>

      {/* Customer 3 - Grateful */}
      <g transform="translate(140, 125)">
        <circle cx="0" cy="0" r="15" fill="#D1FAE5"/>
        <circle cx="-4" cy="-3" r="2" fill="#1E1E2E"/>
        <circle cx="4" cy="-3" r="2" fill="#1E1E2E"/>
        <path d="M-5 4 Q0 9 5 4" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* Heart above */}
        <text x="0" y="-20" textAnchor="middle" fontSize="10">❤️</text>
      </g>

      {/* Shield badge */}
      <g transform="translate(170, 70)">
        <path d="M0 -12 L12 -6 L12 6 L0 15 L-12 6 L-12 -6 Z" fill="#10B981"/>
        <path d="M-4 0 L-1 3 L5 -3" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* "Protected" sparkles */}
      <text x="35" y="110" fontSize="10" opacity="0.7">✨</text>
      <text x="165" y="108" fontSize="10" opacity="0.7">✨</text>
    </svg>
  );
}
