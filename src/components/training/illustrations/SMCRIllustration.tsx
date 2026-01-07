"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Office building with smiling windows, accountability arrows
export function SMCRIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Accountability arrows */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1"/>
        </marker>
      </defs>

      {/* Connection lines with arrows */}
      <g opacity="0.6">
        <line x1="50" y1="50" x2="80" y2="70" stroke="#6366F1" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <line x1="150" y1="50" x2="120" y2="70" stroke="#6366F1" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <line x1="100" y1="30" x2="100" y2="55" stroke="#6366F1" strokeWidth="2" markerEnd="url(#arrowhead)"/>
      </g>

      {/* Main building */}
      <g transform="translate(100, 95)">
        {/* Building body */}
        <rect x="-40" y="-45" width="80" height="80" rx="8" fill="#6366F1"/>

        {/* Building top section */}
        <rect x="-35" y="-45" width="70" height="15" rx="4" fill="#818CF8"/>

        {/* Roof element */}
        <rect x="-20" y="-55" width="40" height="15" rx="4" fill="#4F46E5"/>
        <rect x="-10" y="-60" width="20" height="8" rx="2" fill="#6366F1"/>

        {/* Flag on top */}
        <line x1="0" y1="-60" x2="0" y2="-75" stroke="#4F46E5" strokeWidth="2"/>
        <rect x="0" y="-75" width="15" height="10" rx="2" fill="#10B981">
          <animate attributeName="width" values="15;13;15" dur="1s" repeatCount="indefinite"/>
        </rect>

        {/* Windows with faces - top row */}
        <g transform="translate(-25, -25)">
          <rect x="0" y="0" width="20" height="20" rx="3" fill="#1E1E2E"/>
          <rect x="2" y="2" width="16" height="16" rx="2" fill="#FEF3C7"/>
          {/* Happy face */}
          <circle cx="7" cy="8" r="2" fill="#1E1E2E"/>
          <circle cx="13" cy="8" r="2" fill="#1E1E2E"/>
          <path d="M6 13 Q10 16 14 13" stroke="#1E1E2E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>

        <g transform="translate(5, -25)">
          <rect x="0" y="0" width="20" height="20" rx="3" fill="#1E1E2E"/>
          <rect x="2" y="2" width="16" height="16" rx="2" fill="#DBEAFE"/>
          {/* Professional face */}
          <circle cx="7" cy="8" r="2" fill="#1E1E2E"/>
          <circle cx="13" cy="8" r="2" fill="#1E1E2E"/>
          <line x1="6" y1="13" x2="14" y2="13" stroke="#1E1E2E" strokeWidth="1.5" strokeLinecap="round"/>
        </g>

        {/* Windows - bottom row */}
        <g transform="translate(-25, 0)">
          <rect x="0" y="0" width="20" height="20" rx="3" fill="#1E1E2E"/>
          <rect x="2" y="2" width="16" height="16" rx="2" fill="#D1FAE5"/>
          {/* Winking face */}
          <circle cx="7" cy="8" r="2" fill="#1E1E2E"/>
          <line x1="11" y1="8" x2="15" y2="8" stroke="#1E1E2E" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 13 Q10 16 14 13" stroke="#1E1E2E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>

        <g transform="translate(5, 0)">
          <rect x="0" y="0" width="20" height="20" rx="3" fill="#1E1E2E"/>
          <rect x="2" y="2" width="16" height="16" rx="2" fill="#FCE7F3"/>
          {/* Focused face */}
          <rect x="5" y="7" width="4" height="3" rx="1" fill="#1E1E2E"/>
          <rect x="11" y="7" width="4" height="3" rx="1" fill="#1E1E2E"/>
          <ellipse cx="10" cy="14" rx="4" ry="2" fill="#1E1E2E"/>
        </g>

        {/* Door */}
        <rect x="-10" y="20" width="20" height="25" rx="3" fill="#4338CA"/>
        <circle cx="5" cy="33" r="2" fill="#FCD34D"/>
      </g>

      {/* Person icons around building */}
      {/* Top person - Senior Manager */}
      <g transform="translate(100, 25)">
        <circle cx="0" cy="0" r="12" fill="#8B5CF6"/>
        <circle cx="0" cy="-3" r="6" fill="#FEF3C7"/>
        <ellipse cx="0" cy="6" rx="8" ry="5" fill="#FEF3C7"/>
        <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#1E1E2E">👔</text>
      </g>

      {/* Left person */}
      <g transform="translate(40, 45)">
        <circle cx="0" cy="0" r="10" fill="#EC4899"/>
        <circle cx="0" cy="-2" r="5" fill="#FEF3C7"/>
        <ellipse cx="0" cy="5" rx="6" ry="4" fill="#FEF3C7"/>
      </g>

      {/* Right person */}
      <g transform="translate(160, 45)">
        <circle cx="0" cy="0" r="10" fill="#14B8A6"/>
        <circle cx="0" cy="-2" r="5" fill="#FEF3C7"/>
        <ellipse cx="0" cy="5" rx="6" ry="4" fill="#FEF3C7"/>
      </g>

      {/* Accountability labels */}
      <g fontSize="7" fill="#6366F1" fontWeight="bold">
        <text x="100" y="12" textAnchor="middle">SMF</text>
        <text x="30" y="40" textAnchor="middle">CF</text>
        <text x="170" y="40" textAnchor="middle">CF</text>
      </g>
    </svg>
  );
}
