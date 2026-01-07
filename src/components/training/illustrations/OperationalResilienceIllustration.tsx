"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Interlocking gears characters working together
export function OperationalResilienceIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Background circuit pattern */}
      <g opacity="0.1">
        <line x1="20" y1="30" x2="60" y2="30" stroke="#0D9488" strokeWidth="2"/>
        <line x1="140" y1="30" x2="180" y2="30" stroke="#0D9488" strokeWidth="2"/>
        <line x1="20" y1="120" x2="60" y2="120" stroke="#0D9488" strokeWidth="2"/>
        <line x1="140" y1="120" x2="180" y2="120" stroke="#0D9488" strokeWidth="2"/>
        <circle cx="20" cy="30" r="3" fill="#0D9488"/>
        <circle cx="180" cy="30" r="3" fill="#0D9488"/>
        <circle cx="20" cy="120" r="3" fill="#0D9488"/>
        <circle cx="180" cy="120" r="3" fill="#0D9488"/>
      </g>

      {/* Main gear - center */}
      <g transform="translate(100, 75)">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="8s" repeatCount="indefinite"/>
          {/* Gear teeth */}
          <path
            d="M0 -40 L8 -40 L10 -32 L-10 -32 L-8 -40 Z
               M28 -28 L34 -22 L28 -16 L22 -22 Z
               M40 0 L40 -8 L32 -10 L32 10 L40 8 Z
               M28 28 L34 22 L28 16 L22 22 Z
               M0 40 L-8 40 L-10 32 L10 32 L8 40 Z
               M-28 28 L-34 22 L-28 16 L-22 22 Z
               M-40 0 L-40 8 L-32 10 L-32 -10 L-40 -8 Z
               M-28 -28 L-34 -22 L-28 -16 L-22 -22 Z"
            fill="#14B8A6"
          />
          {/* Gear body */}
          <circle cx="0" cy="0" r="28" fill="#0D9488"/>
          <circle cx="0" cy="0" r="20" fill="#14B8A6"/>
        </g>

        {/* Face - determined expression */}
        <circle cx="-8" cy="-5" r="5" fill="white"/>
        <circle cx="8" cy="-5" r="5" fill="white"/>
        <circle cx="-6" cy="-4" r="3" fill="#1E1E2E"/>
        <circle cx="10" cy="-4" r="3" fill="#1E1E2E"/>

        {/* Determined smile */}
        <path d="M-8 8 Q0 14 8 8" stroke="#065F46" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Strong eyebrows */}
        <path d="M-15 -12 L-3 -10" stroke="#065F46" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 -10 L15 -12" stroke="#065F46" strokeWidth="2" strokeLinecap="round"/>
      </g>

      {/* Left gear - smaller */}
      <g transform="translate(45, 60)">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="6s" repeatCount="indefinite"/>
          {/* Gear teeth */}
          <path
            d="M0 -25 L5 -25 L6 -20 L-6 -20 L-5 -25 Z
               M18 -18 L22 -14 L18 -10 L14 -14 Z
               M25 0 L25 -5 L20 -6 L20 6 L25 5 Z
               M18 18 L22 14 L18 10 L14 14 Z
               M0 25 L-5 25 L-6 20 L6 20 L5 25 Z
               M-18 18 L-22 14 L-18 10 L-14 14 Z
               M-25 0 L-25 5 L-20 6 L-20 -6 L-25 -5 Z
               M-18 -18 L-22 -14 L-18 -10 L-14 -14 Z"
            fill="#F59E0B"
          />
          {/* Gear body */}
          <circle cx="0" cy="0" r="17" fill="#D97706"/>
          <circle cx="0" cy="0" r="12" fill="#F59E0B"/>
        </g>

        {/* Face - happy helper */}
        <circle cx="-4" cy="-2" r="3" fill="white"/>
        <circle cx="4" cy="-2" r="3" fill="white"/>
        <circle cx="-3" cy="-1" r="2" fill="#1E1E2E"/>
        <circle cx="5" cy="-1" r="2" fill="#1E1E2E"/>
        <path d="M-4 5 Q0 9 4 5" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>

      {/* Right gear - smaller */}
      <g transform="translate(155, 90)">
        <g>
          <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="6s" repeatCount="indefinite"/>
          {/* Gear teeth */}
          <path
            d="M0 -25 L5 -25 L6 -20 L-6 -20 L-5 -25 Z
               M18 -18 L22 -14 L18 -10 L14 -14 Z
               M25 0 L25 -5 L20 -6 L20 6 L25 5 Z
               M18 18 L22 14 L18 10 L14 14 Z
               M0 25 L-5 25 L-6 20 L6 20 L5 25 Z
               M-18 18 L-22 14 L-18 10 L-14 14 Z
               M-25 0 L-25 5 L-20 6 L-20 -6 L-25 -5 Z
               M-18 -18 L-22 -14 L-18 -10 L-14 -14 Z"
            fill="#8B5CF6"
          />
          {/* Gear body */}
          <circle cx="0" cy="0" r="17" fill="#7C3AED"/>
          <circle cx="0" cy="0" r="12" fill="#8B5CF6"/>
        </g>

        {/* Face - supportive */}
        <circle cx="-4" cy="-2" r="3" fill="white"/>
        <circle cx="4" cy="-2" r="3" fill="white"/>
        <circle cx="-3" cy="-1" r="2" fill="#1E1E2E"/>
        <circle cx="5" cy="-1" r="2" fill="#1E1E2E"/>
        <path d="M-4 5 Q0 9 4 5" stroke="#5B21B6" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>

      {/* Connection lines */}
      <g opacity="0.4">
        <line x1="65" y1="65" x2="72" y2="70" stroke="#14B8A6" strokeWidth="2" strokeDasharray="4 2"/>
        <line x1="128" y1="80" x2="135" y2="85" stroke="#14B8A6" strokeWidth="2" strokeDasharray="4 2"/>
      </g>

      {/* Stability indicator */}
      <g transform="translate(100, 130)">
        <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
        <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#065F46" fontWeight="bold">⚡ RESILIENT</text>
      </g>

      {/* Shield in corner */}
      <g transform="translate(175, 25)">
        <path d="M0 -12 L10 -6 L10 4 L0 12 L-10 4 L-10 -6 Z" fill="#14B8A6"/>
        <path d="M-4 0 L-1 3 L5 -3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>

      {/* Teamwork sparkle */}
      <text x="100" y="25" textAnchor="middle" fontSize="14">🤝</text>
    </svg>
  );
}
