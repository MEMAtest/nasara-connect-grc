"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Royal crown on a podium with spotlight beams
export function PEPsIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Spotlight beams */}
      <defs>
        <linearGradient id="spotlight1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="spotlight2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#FCD34D" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Left spotlight */}
      <polygon points="40,0 70,150 10,150" fill="url(#spotlight1)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite"/>
      </polygon>

      {/* Right spotlight */}
      <polygon points="160,0 190,150 130,150" fill="url(#spotlight2)" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2s" begin="0.5s" repeatCount="indefinite"/>
      </polygon>

      {/* Center spotlight */}
      <polygon points="100,0 140,150 60,150" fill="url(#spotlight1)" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" begin="0.25s" repeatCount="indefinite"/>
      </polygon>

      {/* Sparkles */}
      <g>
        <text x="45" y="40" fontSize="12" opacity="0.8">✨</text>
        <text x="155" y="35" fontSize="10" opacity="0.8">✨</text>
        <text x="80" y="25" fontSize="8" opacity="0.6">✨</text>
        <text x="130" y="50" fontSize="10" opacity="0.7">✨</text>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
      </g>

      {/* Podium */}
      <g transform="translate(100, 130)">
        {/* Top platform */}
        <rect x="-35" y="-20" width="70" height="15" rx="3" fill="#7C3AED"/>
        <rect x="-35" y="-20" width="70" height="5" rx="2" fill="#8B5CF6"/>

        {/* Middle section */}
        <rect x="-30" y="-5" width="60" height="20" fill="#6D28D9"/>

        {/* Number 1 badge */}
        <circle cx="0" cy="5" r="10" fill="#FCD34D"/>
        <text x="0" y="9" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7C3AED">1</text>
      </g>

      {/* Crown character */}
      <g transform="translate(100, 75)">
        {/* Crown base */}
        <rect x="-30" y="10" width="60" height="20" rx="4" fill="#FCD34D"/>
        <rect x="-30" y="10" width="60" height="8" fill="#FBBF24" rx="2"/>

        {/* Crown jewel band */}
        <rect x="-28" y="18" width="56" height="8" fill="#F59E0B"/>
        <circle cx="-15" cy="22" r="4" fill="#EF4444"/>
        <circle cx="0" cy="22" r="4" fill="#3B82F6"/>
        <circle cx="15" cy="22" r="4" fill="#10B981"/>

        {/* Crown spikes */}
        <polygon points="-25,-15 -20,10 -30,10" fill="#FCD34D"/>
        <polygon points="0,-25 8,10 -8,10" fill="#FCD34D"/>
        <polygon points="25,-15 30,10 20,10" fill="#FCD34D"/>

        {/* Spike jewels */}
        <circle cx="-25" cy="-5" r="4" fill="#F472B6"/>
        <circle cx="0" cy="-15" r="5" fill="#A78BFA">
          <animate attributeName="r" values="5;6;5" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="25" cy="-5" r="4" fill="#F472B6"/>

        {/* Face on crown */}
        {/* Eyes */}
        <circle cx="-10" cy="0" r="4" fill="#1E1E2E"/>
        <circle cx="10" cy="0" r="4" fill="#1E1E2E"/>
        <circle cx="-9" cy="-1" r="1.5" fill="white"/>
        <circle cx="11" cy="-1" r="1.5" fill="white"/>

        {/* Regal smile */}
        <path d="M-8 6 Q0 12 8 6" stroke="#1E1E2E" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Rosy cheeks */}
        <ellipse cx="-18" cy="3" rx="5" ry="3" fill="#FECACA" opacity="0.6"/>
        <ellipse cx="18" cy="3" rx="5" ry="3" fill="#FECACA" opacity="0.6"/>
      </g>

      {/* Floating stars */}
      <g>
        <polygon points="30,80 32,86 38,86 33,90 35,96 30,92 25,96 27,90 22,86 28,86" fill="#FCD34D" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 30 88" to="360 30 88" dur="4s" repeatCount="indefinite"/>
        </polygon>
        <polygon points="170,75 171,79 175,79 172,82 173,86 170,84 167,86 168,82 165,79 169,79" fill="#FCD34D" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 170 80" to="360 170 80" dur="3s" repeatCount="indefinite"/>
        </polygon>
      </g>
    </svg>
  );
}
