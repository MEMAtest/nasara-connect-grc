"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Detective owl with magnifying glass examining money trail
export function AMLIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Background coins with trail */}
      <circle cx="35" cy="110" r="14" fill="#FFD700" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="95" r="11" fill="#FFD700" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2s" begin="0.3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="85" cy="85" r="9" fill="#FFD700" opacity="0.7">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" begin="0.6s" repeatCount="indefinite"/>
      </circle>

      {/* Dotted trail line */}
      <path
        d="M35 110 Q60 90 85 85"
        stroke="#FFD700"
        strokeWidth="3"
        strokeDasharray="6 4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Owl body - rounded and friendly */}
      <ellipse cx="135" cy="95" rx="38" ry="42" fill="#8B5E3C"/>

      {/* Owl belly */}
      <ellipse cx="135" cy="105" rx="25" ry="28" fill="#D4A574"/>

      {/* Owl face */}
      <circle cx="135" cy="70" r="30" fill="#D4A574"/>

      {/* Eye whites */}
      <circle cx="122" cy="65" r="14" fill="white"/>
      <circle cx="148" cy="65" r="14" fill="white"/>

      {/* Pupils - looking at magnifying glass */}
      <circle cx="126" cy="67" r="7" fill="#2D3748">
        <animate attributeName="cx" values="126;128;126" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="152" cy="67" r="7" fill="#2D3748">
        <animate attributeName="cx" values="152;154;152" dur="3s" repeatCount="indefinite"/>
      </circle>

      {/* Eye shine */}
      <circle cx="124" cy="64" r="2" fill="white"/>
      <circle cx="150" cy="64" r="2" fill="white"/>

      {/* Beak */}
      <path d="M130 78 L135 88 L140 78 Z" fill="#FF9F43"/>

      {/* Eyebrows - curious expression */}
      <path d="M110 52 Q122 48 128 52" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M142 52 Q148 48 160 52" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round"/>

      {/* Detective hat */}
      <ellipse cx="135" cy="42" rx="35" ry="10" fill="#2D3748"/>
      <rect x="105" y="32" width="60" height="12" rx="2" fill="#2D3748"/>
      <rect x="115" y="36" width="40" height="4" fill="#4A5568"/>

      {/* Magnifying glass */}
      <g transform="translate(160, 90)">
        <circle cx="0" cy="0" r="18" fill="rgba(255,255,255,0.3)" stroke="#4A5568" strokeWidth="4"/>
        <circle cx="0" cy="0" r="14" fill="rgba(200,230,255,0.4)"/>
        <line x1="13" y1="13" x2="28" y2="28" stroke="#4A5568" strokeWidth="5" strokeLinecap="round"/>
        {/* Shine on glass */}
        <path d="M-8 -8 Q-4 -12 0 -8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>

      {/* Wing holding magnifying glass */}
      <ellipse cx="165" cy="95" rx="15" ry="20" fill="#6D4C2A" transform="rotate(-20, 165, 95)"/>

      {/* Feet */}
      <ellipse cx="120" cy="135" rx="12" ry="6" fill="#FF9F43"/>
      <ellipse cx="150" cy="135" rx="12" ry="6" fill="#FF9F43"/>
    </svg>
  );
}
