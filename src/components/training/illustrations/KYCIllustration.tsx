"use client";

import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

// Friendly robot scanning ID card with checkmarks appearing
export function KYCIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 150" className={cn("w-full h-full", className)}>
      {/* Floating verification badges */}
      <g>
        <circle cx="30" cy="35" r="12" fill="#10B981">
          <animate attributeName="cy" values="35;30;35" dur="2s" repeatCount="indefinite"/>
        </circle>
        <path d="M25 35 L28 38 L35 31" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      <g>
        <circle cx="170" cy="45" r="10" fill="#10B981">
          <animate attributeName="cy" values="45;40;45" dur="2s" begin="0.5s" repeatCount="indefinite"/>
        </circle>
        <path d="M166 45 L168 47 L174 41" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      <g>
        <circle cx="55" cy="120" r="8" fill="#10B981">
          <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <path d="M52 120 L54 122 L58 118" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>

      {/* Robot body */}
      <rect x="85" y="60" width="50" height="70" rx="12" fill="#667EEA"/>

      {/* Robot belly screen */}
      <rect x="93" y="75" width="34" height="25" rx="4" fill="#1E1E2E"/>
      <rect x="97" y="79" width="26" height="4" rx="2" fill="#4ADE80"/>
      <rect x="97" y="86" width="18" height="4" rx="2" fill="#60A5FA"/>
      <rect x="97" y="93" width="22" height="4" rx="2" fill="#4ADE80"/>

      {/* Robot head */}
      <rect x="80" y="20" width="60" height="45" rx="10" fill="#818CF8"/>

      {/* Antenna */}
      <line x1="110" y1="20" x2="110" y2="8" stroke="#667EEA" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="110" cy="5" r="5" fill="#F472B6">
        <animate attributeName="fill" values="#F472B6;#A78BFA;#F472B6" dur="1s" repeatCount="indefinite"/>
      </circle>

      {/* Robot eyes - scanning */}
      <rect x="88" y="32" width="16" height="16" rx="4" fill="#1E1E2E"/>
      <rect x="116" y="32" width="16" height="16" rx="4" fill="#1E1E2E"/>

      {/* Eye glow - scanning animation */}
      <rect x="90" y="34" width="12" height="12" rx="3" fill="#4ADE80">
        <animate attributeName="fill" values="#4ADE80;#60A5FA;#4ADE80" dur="0.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="118" y="34" width="12" height="12" rx="3" fill="#4ADE80">
        <animate attributeName="fill" values="#4ADE80;#60A5FA;#4ADE80" dur="0.8s" repeatCount="indefinite"/>
      </rect>

      {/* Cute smile */}
      <path d="M100 55 Q110 62 120 55" stroke="#1E1E2E" strokeWidth="3" fill="none" strokeLinecap="round"/>

      {/* Robot arms */}
      <rect x="65" y="70" width="20" height="10" rx="5" fill="#667EEA"/>
      <rect x="135" y="70" width="20" height="10" rx="5" fill="#667EEA"/>

      {/* Robot hands holding ID card */}
      <circle cx="60" cy="85" r="8" fill="#818CF8"/>
      <circle cx="160" cy="85" r="8" fill="#818CF8"/>

      {/* ID Card being scanned */}
      <g transform="translate(20, 75)">
        <rect x="0" y="0" width="45" height="30" rx="4" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        {/* Photo placeholder */}
        <rect x="5" y="5" width="12" height="14" rx="2" fill="#CBD5E1"/>
        <circle cx="11" cy="10" r="4" fill="#94A3B8"/>
        {/* Info lines */}
        <rect x="20" y="6" width="20" height="3" rx="1" fill="#94A3B8"/>
        <rect x="20" y="12" width="15" height="3" rx="1" fill="#CBD5E1"/>
        <rect x="20" y="18" width="18" height="3" rx="1" fill="#CBD5E1"/>

        {/* Scanning beam */}
        <rect x="0" y="0" width="45" height="3" fill="#4ADE80" opacity="0.6" rx="1">
          <animate attributeName="y" values="0;27;0" dur="1.5s" repeatCount="indefinite"/>
        </rect>
      </g>

      {/* Robot legs */}
      <rect x="92" y="130" width="12" height="15" rx="4" fill="#667EEA"/>
      <rect x="116" y="130" width="12" height="15" rx="4" fill="#667EEA"/>

      {/* Robot feet */}
      <ellipse cx="98" cy="147" rx="10" ry="5" fill="#818CF8"/>
      <ellipse cx="122" cy="147" rx="10" ry="5" fill="#818CF8"/>
    </svg>
  );
}
