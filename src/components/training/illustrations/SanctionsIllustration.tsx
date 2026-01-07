"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Globe character wearing sunglasses blocking suspicious items
export function SanctionsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Blocked items floating around */}
      <g opacity="0.7">
        {/* Blocked money bag */}
        <g transform="translate(25, 30)">
          <circle cx="15" cy="15" r="15" fill="#FEE2E2"/>
          <text x="15" y="20" textAnchor="middle" fontSize="14">💰</text>
          <line x1="5" y1="5" x2="25" y2="25" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <line x1="25" y1="5" x2="5" y2="25" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <animateTransform attributeName="transform" type="translate" values="25,30;25,25;25,30" dur="2s" repeatCount="indefinite"/>
        </g>

        {/* Blocked document */}
        <g transform="translate(155, 35)">
          <circle cx="15" cy="15" r="15" fill="#FEE2E2"/>
          <text x="15" y="20" textAnchor="middle" fontSize="12">📄</text>
          <line x1="5" y1="5" x2="25" y2="25" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <line x1="25" y1="5" x2="5" y2="25" stroke="#EF4444" strokeWidth="3" strokeLinecap="round"/>
          <animateTransform attributeName="transform" type="translate" values="155,35;155,30;155,35" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </g>
      </g>

      {/* Globe character */}
      <g transform="translate(100, 85)">
        {/* Globe body */}
        <circle cx="0" cy="0" r="45" fill="#60A5FA"/>

        {/* Globe continents - simplified */}
        <ellipse cx="-15" cy="-10" rx="15" ry="20" fill="#34D399" transform="rotate(-20)"/>
        <ellipse cx="20" cy="5" rx="12" ry="18" fill="#34D399" transform="rotate(10)"/>
        <circle cx="-5" cy="25" r="10" fill="#34D399"/>

        {/* Globe lines */}
        <ellipse cx="0" cy="0" rx="45" ry="20" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5"/>
        <ellipse cx="0" cy="0" rx="20" ry="45" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5"/>
        <line x1="-45" y1="0" x2="45" y2="0" stroke="#3B82F6" strokeWidth="1.5" opacity="0.5"/>

        {/* Cool sunglasses */}
        <g transform="translate(0, -8)">
          {/* Left lens */}
          <rect x="-30" y="-8" width="22" height="16" rx="4" fill="#1E1E2E"/>
          {/* Right lens */}
          <rect x="8" y="-8" width="22" height="16" rx="4" fill="#1E1E2E"/>
          {/* Bridge */}
          <rect x="-8" y="-2" width="16" height="4" rx="2" fill="#1E1E2E"/>
          {/* Lens shine */}
          <rect x="-28" y="-6" width="8" height="3" rx="1" fill="#4B5563" opacity="0.5"/>
          <rect x="10" y="-6" width="8" height="3" rx="1" fill="#4B5563" opacity="0.5"/>
        </g>

        {/* Confident smile */}
        <path d="M-15 15 Q0 28 15 15" stroke="#1E1E2E" strokeWidth="3" fill="none" strokeLinecap="round"/>

        {/* Arms */}
        <g>
          {/* Left arm - stop gesture */}
          <ellipse cx="-55" cy="5" rx="12" ry="8" fill="#60A5FA"/>
          <g transform="translate(-70, -10)">
            <rect x="0" y="0" width="20" height="25" rx="4" fill="#FBBF24"/>
            <rect x="3" y="5" width="3" height="15" rx="1" fill="#F59E0B"/>
            <rect x="8" y="3" width="3" height="17" rx="1" fill="#F59E0B"/>
            <rect x="13" y="5" width="3" height="15" rx="1" fill="#F59E0B"/>
          </g>
        </g>

        <g>
          {/* Right arm - thumbs up */}
          <ellipse cx="55" cy="5" rx="12" ry="8" fill="#60A5FA"/>
          <circle cx="70" cy="5" r="10" fill="#FBBF24"/>
        </g>

        {/* Little feet */}
        <ellipse cx="-15" cy="48" rx="10" ry="5" fill="#3B82F6"/>
        <ellipse cx="15" cy="48" rx="10" ry="5" fill="#3B82F6"/>
      </g>

      {/* Stop sign badge */}
      <g transform="translate(140, 100)">
        <polygon points="0,-18 13,-13 18,0 13,13 0,18 -13,13 -18,0 -13,-13" fill="#EF4444"/>
        <text x="0" y="5" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">STOP</text>
      </g>
    </svg>
  );
}
