"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Speech bubble characters high-fiving after resolution
export function ComplaintsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Celebration sparkles */}
      <g>
        <text x="100" y="25" textAnchor="middle" fontSize="16">✨</text>
        <text x="70" y="40" fontSize="12">⭐</text>
        <text x="130" y="35" fontSize="12">⭐</text>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite"/>
      </g>

      {/* Left speech bubble - Customer */}
      <g transform="translate(55, 70)">
        {/* Bubble body */}
        <ellipse cx="0" cy="0" rx="35" ry="30" fill="#60A5FA"/>
        {/* Bubble tail */}
        <polygon points="-5,25 5,25 -10,40" fill="#60A5FA"/>

        {/* Face - initially worried, now happy */}
        <circle cx="-10" cy="-5" r="6" fill="white"/>
        <circle cx="10" cy="-5" r="6" fill="white"/>
        <circle cx="-8" cy="-4" r="3" fill="#1E1E2E"/>
        <circle cx="12" cy="-4" r="3" fill="#1E1E2E"/>
        <circle cx="-7" cy="-6" r="1" fill="white"/>
        <circle cx="13" cy="-6" r="1" fill="white"/>

        {/* Happy relieved smile */}
        <path d="M-10 8 Q0 18 10 8" stroke="#1E40AF" strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Happy eyebrows */}
        <path d="M-18 -12 Q-10 -16 -5 -12" stroke="#1E40AF" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M5 -12 Q10 -16 18 -12" stroke="#1E40AF" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Arm reaching for high-five */}
        <ellipse cx="35" cy="5" rx="12" ry="8" fill="#60A5FA" transform="rotate(-20, 35, 5)"/>
        <circle cx="48" cy="0" r="8" fill="#93C5FD"/>
      </g>

      {/* Right speech bubble - Support */}
      <g transform="translate(145, 70)">
        {/* Bubble body */}
        <ellipse cx="0" cy="0" rx="35" ry="30" fill="#34D399"/>
        {/* Bubble tail */}
        <polygon points="-5,25 5,25 10,40" fill="#34D399"/>

        {/* Helpful happy face */}
        <circle cx="-10" cy="-5" r="6" fill="white"/>
        <circle cx="10" cy="-5" r="6" fill="white"/>
        <circle cx="-8" cy="-4" r="3" fill="#1E1E2E"/>
        <circle cx="12" cy="-4" r="3" fill="#1E1E2E"/>
        <circle cx="-7" cy="-6" r="1" fill="white"/>
        <circle cx="13" cy="-6" r="1" fill="white"/>

        {/* Big helpful smile */}
        <path d="M-10 8 Q0 18 10 8" stroke="#065F46" strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Confident eyebrows */}
        <path d="M-18 -12 Q-10 -16 -5 -12" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M5 -12 Q10 -16 18 -12" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Arm reaching for high-five */}
        <ellipse cx="-35" cy="5" rx="12" ry="8" fill="#34D399" transform="rotate(20, -35, 5)"/>
        <circle cx="-48" cy="0" r="8" fill="#6EE7B7"/>
      </g>

      {/* High-five impact burst */}
      <g transform="translate(100, 70)">
        {/* Impact lines */}
        <line x1="0" y1="-15" x2="0" y2="-25" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
        <line x1="10" y1="-12" x2="18" y2="-20" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-10" y1="-12" x2="-18" y2="-20" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
        <line x1="12" y1="0" x2="22" y2="0" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>
        <line x1="-12" y1="0" x2="-22" y2="0" stroke="#FCD34D" strokeWidth="3" strokeLinecap="round"/>

        {/* Impact star */}
        <polygon
          points="0,-8 2,-3 7,-3 3,1 5,6 0,3 -5,6 -3,1 -7,-3 -2,-3"
          fill="#FCD34D"
        >
          <animateTransform attributeName="transform" type="scale" values="1;1.2;1" dur="0.5s" repeatCount="indefinite"/>
        </polygon>
      </g>

      {/* Resolution checkmark badge */}
      <g transform="translate(100, 125)">
        <circle cx="0" cy="0" r="18" fill="#10B981"/>
        <path d="M-8 0 L-3 5 L8 -5" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* "RESOLVED" banner */}
      <g transform="translate(100, 148)">
        <rect x="-35" y="-8" width="70" height="16" rx="8" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
        <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#065F46" fontWeight="bold">RESOLVED!</text>
      </g>

      {/* Before/After indicators */}
      <g transform="translate(25, 120)" opacity="0.6">
        <text fontSize="8" fill="#6B7280">😟→😊</text>
      </g>
    </svg>
  );
}
