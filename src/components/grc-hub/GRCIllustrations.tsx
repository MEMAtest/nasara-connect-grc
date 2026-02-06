"use client";

import { motion } from "framer-motion";

// Authorization Pack - 3D Isometric folder stack with documents
export function AuthorizationIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="auth-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Back folder - dark */}
      <path d="M8 20 L8 52 L48 52 L48 24 L28 24 L24 20 Z" fill="#334155" filter="url(#auth-shadow)"/>

      {/* Document 1 */}
      <rect x="14" y="18" width="24" height="30" rx="2" fill="#f8fafc" filter="url(#auth-shadow)"/>
      <rect x="18" y="24" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="18" y="29" width="16" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="18" y="34" width="10" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="18" y="39" width="14" height="2" rx="1" fill="#cbd5e1"/>

      {/* Front folder - lighter */}
      <path d="M12 28 L12 56 L52 56 L52 32 L32 32 L28 28 Z" fill="#64748b"/>
      <path d="M12 28 L28 28 L32 32 L12 32 Z" fill="#475569"/>

      {/* Checkmark badge */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <circle cx="48" cy="16" r="10" fill="#10b981" filter="url(#auth-shadow)"/>
        <path d="M43 16 L46 19 L53 12" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </motion.g>
    </motion.svg>
  );
}

// Compliance Framework - 3D Clipboard with checkboxes and pen
export function ComplianceIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="comp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Clipboard back */}
      <rect x="10" y="8" width="36" height="50" rx="4" fill="#0d9488" filter="url(#comp-shadow)"/>

      {/* Clip */}
      <rect x="20" y="4" width="16" height="10" rx="2" fill="#115e59"/>
      <rect x="24" y="2" width="8" height="6" rx="2" fill="#5eead4"/>

      {/* Paper */}
      <rect x="14" y="16" width="28" height="38" rx="2" fill="#f8fafc"/>

      {/* Checkboxes */}
      <rect x="18" y="22" width="6" height="6" rx="1" fill="#10b981"/>
      <path d="M19.5 25 L21 26.5 L24 23.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="27" y="23" width="12" height="3" rx="1" fill="#cbd5e1"/>

      <rect x="18" y="32" width="6" height="6" rx="1" fill="#10b981"/>
      <path d="M19.5 35 L21 36.5 L24 33.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <rect x="27" y="33" width="10" height="3" rx="1" fill="#cbd5e1"/>

      <rect x="18" y="42" width="6" height="6" rx="1" fill="#f59e0b"/>
      <rect x="20" y="44.5" width="2" height="1" rx="0.5" fill="white"/>
      <rect x="27" y="43" width="8" height="3" rx="1" fill="#cbd5e1"/>

      {/* Pen */}
      <motion.g
        initial={{ rotate: -10, x: 5 }}
        animate={{ rotate: 0, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <rect x="44" y="20" width="6" height="32" rx="1" fill="#1e293b" transform="rotate(15 47 36)" filter="url(#comp-shadow)"/>
        <polygon points="44,52 47,58 50,52" fill="#f59e0b" transform="rotate(15 47 55)"/>
        <rect x="44" y="20" width="6" height="6" rx="1" fill="#64748b" transform="rotate(15 47 23)"/>
      </motion.g>
    </motion.svg>
  );
}

// Risk Assessment - 3D Gauge/Meter with needle
export function RiskIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="risk-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Base plate */}
      <ellipse cx="32" cy="50" rx="28" ry="8" fill="#334155"/>

      {/* Gauge body */}
      <circle cx="32" cy="32" r="26" fill="#1e293b" filter="url(#risk-shadow)"/>
      <circle cx="32" cy="32" r="22" fill="#f8fafc"/>

      {/* Colored segments */}
      <path d="M32 32 L14 20 A22 22 0 0 1 32 10 Z" fill="#10b981"/>
      <path d="M32 32 L32 10 A22 22 0 0 1 50 20 Z" fill="#f59e0b"/>
      <path d="M32 32 L50 20 A22 22 0 0 1 54 32 Z" fill="#ef4444"/>

      {/* Inner circle */}
      <circle cx="32" cy="32" r="8" fill="#1e293b"/>

      {/* Needle */}
      <motion.g
        initial={{ rotate: -60 }}
        animate={{ rotate: 15 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
        style={{ transformOrigin: "32px 32px" }}
      >
        <polygon points="32,12 29,32 35,32" fill="#ef4444"/>
        <circle cx="32" cy="32" r="4" fill="#ef4444"/>
      </motion.g>

      {/* Tick marks */}
      <circle cx="18" cy="22" r="2" fill="#10b981"/>
      <circle cx="32" cy="14" r="2" fill="#f59e0b"/>
      <circle cx="46" cy="22" r="2" fill="#ef4444"/>
    </motion.svg>
  );
}

// Policy Register - 3D Open book with bookmark
export function PolicyIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="policy-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Book spine */}
      <rect x="29" y="12" width="6" height="44" fill="#059669" filter="url(#policy-shadow)"/>

      {/* Left page */}
      <path d="M6 14 Q6 12 8 12 L29 12 L29 56 L8 56 Q6 56 6 54 Z" fill="#f8fafc" filter="url(#policy-shadow)"/>
      <rect x="10" y="20" width="14" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="10" y="26" width="16" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="10" y="32" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="10" y="38" width="14" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="10" y="44" width="10" height="2" rx="1" fill="#cbd5e1"/>

      {/* Right page */}
      <path d="M35 12 L56 12 Q58 12 58 14 L58 54 Q58 56 56 56 L35 56 Z" fill="#f8fafc" filter="url(#policy-shadow)"/>
      <rect x="40" y="20" width="14" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="40" y="26" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="40" y="32" width="16" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="40" y="38" width="10" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="40" y="44" width="14" height="2" rx="1" fill="#cbd5e1"/>

      {/* Bookmark */}
      <motion.path
        d="M50 8 L50 24 L54 20 L58 24 L58 8 Z"
        fill="#ef4444"
        filter="url(#policy-shadow)"
        initial={{ y: -5 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      />
    </motion.svg>
  );
}

// SMCR - 3D Person with badge/certificate
export function SMCRIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="smcr-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Body */}
      <path d="M16 58 L16 42 Q16 34 24 32 L24 32 L40 32 Q48 34 48 42 L48 58" fill="#7c3aed" filter="url(#smcr-shadow)"/>

      {/* Head */}
      <circle cx="32" cy="18" r="12" fill="#fcd34d" filter="url(#smcr-shadow)"/>
      <circle cx="28" cy="16" r="2" fill="#1e293b"/>
      <circle cx="36" cy="16" r="2" fill="#1e293b"/>
      <path d="M28 22 Q32 26 36 22" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* Badge */}
      <motion.g
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <circle cx="50" cy="44" r="10" fill="#10b981" filter="url(#smcr-shadow)"/>
        <path d="M46 44 L48 46 L54 40" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </motion.g>

      {/* Tie */}
      <polygon points="32,32 28,38 32,58 36,38" fill="#1e293b"/>
    </motion.svg>
  );
}

// Training - 3D Graduation cap on book
export function TrainingIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="train-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Book stack */}
      <rect x="8" y="44" width="48" height="8" rx="2" fill="#3b82f6" filter="url(#train-shadow)"/>
      <rect x="10" y="38" width="44" height="8" rx="2" fill="#60a5fa" filter="url(#train-shadow)"/>
      <rect x="12" y="32" width="40" height="8" rx="2" fill="#93c5fd" filter="url(#train-shadow)"/>

      {/* Graduation cap */}
      <motion.g
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {/* Cap base */}
        <polygon points="32,8 56,18 32,28 8,18" fill="#1e293b" filter="url(#train-shadow)"/>

        {/* Cap top */}
        <rect x="24" y="14" width="16" height="4" fill="#334155"/>

        {/* Button */}
        <circle cx="32" cy="12" r="3" fill="#f59e0b"/>

        {/* Tassel */}
        <motion.g
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ transformOrigin: "50px 18px" }}
        >
          <line x1="50" y1="18" x2="50" y2="32" stroke="#f59e0b" strokeWidth="2"/>
          <circle cx="50" cy="34" r="3" fill="#f59e0b"/>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

// PEP Register - 3D Shield with eye
export function PEPIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="pep-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Shield */}
      <path d="M32 4 L56 12 L56 32 Q56 52 32 60 Q8 52 8 32 L8 12 Z" fill="#e11d48" filter="url(#pep-shadow)"/>
      <path d="M32 10 L50 16 L50 32 Q50 48 32 54 Q14 48 14 32 L14 16 Z" fill="#f8fafc"/>

      {/* Eye */}
      <ellipse cx="32" cy="32" rx="14" ry="10" fill="#1e293b"/>
      <circle cx="32" cy="32" r="6" fill="#f8fafc"/>
      <circle cx="32" cy="32" r="3" fill="#1e293b"/>

      {/* Shine */}
      <circle cx="34" cy="30" r="1.5" fill="white"/>

      {/* Scan lines */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <line x1="18" y1="28" x2="46" y2="28" stroke="#e11d48" strokeWidth="1" opacity="0.5"/>
        <line x1="18" y1="36" x2="46" y2="36" stroke="#e11d48" strokeWidth="1" opacity="0.5"/>
      </motion.g>
    </motion.svg>
  );
}

// Third Party - 3D Building blocks / Network
export function ThirdPartyIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="tp-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Connection lines */}
      <line x1="32" y1="32" x2="14" y2="18" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="32" y1="32" x2="50" y2="18" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="32" y1="32" x2="14" y2="50" stroke="#cbd5e1" strokeWidth="2"/>
      <line x1="32" y1="32" x2="50" y2="50" stroke="#cbd5e1" strokeWidth="2"/>

      {/* Center building */}
      <rect x="22" y="24" width="20" height="24" fill="#0891b2" filter="url(#tp-shadow)"/>
      <rect x="24" y="28" width="6" height="6" fill="#cffafe"/>
      <rect x="34" y="28" width="6" height="6" fill="#cffafe"/>
      <rect x="24" y="38" width="6" height="6" fill="#cffafe"/>
      <rect x="34" y="38" width="6" height="6" fill="#cffafe"/>

      {/* Satellite nodes */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <circle cx="14" cy="18" r="8" fill="#06b6d4" filter="url(#tp-shadow)"/>
        <rect x="10" y="14" width="8" height="8" rx="1" fill="#f8fafc"/>
      </motion.g>

      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <circle cx="50" cy="18" r="8" fill="#06b6d4" filter="url(#tp-shadow)"/>
        <rect x="46" y="14" width="8" height="8" rx="1" fill="#f8fafc"/>
      </motion.g>

      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <circle cx="14" cy="50" r="8" fill="#06b6d4" filter="url(#tp-shadow)"/>
        <rect x="10" y="46" width="8" height="8" rx="1" fill="#f8fafc"/>
      </motion.g>

      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <circle cx="50" cy="50" r="8" fill="#06b6d4" filter="url(#tp-shadow)"/>
        <rect x="46" y="46" width="8" height="8" rx="1" fill="#f8fafc"/>
      </motion.g>
    </motion.svg>
  );
}

// Complaints - 3D Speech bubble with exclamation
export function ComplaintsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="comp2-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Speech bubble */}
      <path d="M8 8 L56 8 Q60 8 60 12 L60 40 Q60 44 56 44 L20 44 L12 56 L12 44 L8 44 Q4 44 4 40 L4 12 Q4 8 8 8 Z" fill="#f59e0b" filter="url(#comp2-shadow)"/>

      {/* Inner bubble */}
      <path d="M10 12 L54 12 Q56 12 56 14 L56 38 Q56 40 54 40 L20 40 L14 50 L14 40 L10 40 Q8 40 8 38 L8 14 Q8 12 10 12 Z" fill="#fef3c7"/>

      {/* Exclamation mark */}
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <rect x="28" y="18" width="8" height="14" rx="2" fill="#f59e0b"/>
        <rect x="28" y="36" width="8" height="6" rx="2" fill="#f59e0b"/>
      </motion.g>
    </motion.svg>
  );
}

// Incidents - 3D Warning triangle with lightning
export function IncidentsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="inc-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Triangle */}
      <polygon points="32,4 60,56 4,56" fill="#dc2626" filter="url(#inc-shadow)"/>
      <polygon points="32,12 54,52 10,52" fill="#fef2f2"/>

      {/* Lightning bolt */}
      <motion.polygon
        points="36,20 28,34 34,34 28,48 40,30 34,30"
        fill="#dc2626"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.svg>
  );
}

// Conflicts of Interest - 3D Balance scale
export function ConflictsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="coi-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Base */}
      <rect x="24" y="52" width="16" height="6" rx="2" fill="#1e293b" filter="url(#coi-shadow)"/>
      <rect x="28" y="20" width="8" height="34" fill="#64748b"/>

      {/* Top beam */}
      <motion.g
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{ transformOrigin: "32px 20px" }}
      >
        <rect x="8" y="16" width="48" height="6" rx="2" fill="#7c3aed" filter="url(#coi-shadow)"/>

        {/* Left pan */}
        <line x1="14" y1="22" x2="14" y2="36" stroke="#64748b" strokeWidth="2"/>
        <ellipse cx="14" cy="40" rx="10" ry="4" fill="#a78bfa" filter="url(#coi-shadow)"/>

        {/* Right pan */}
        <line x1="50" y1="22" x2="50" y2="32" stroke="#64748b" strokeWidth="2"/>
        <ellipse cx="50" cy="36" rx="10" ry="4" fill="#a78bfa" filter="url(#coi-shadow)"/>
      </motion.g>

      {/* Center ornament */}
      <circle cx="32" cy="14" r="6" fill="#7c3aed" filter="url(#coi-shadow)"/>
    </motion.svg>
  );
}

// Gifts & Hospitality - 3D Gift box
export function GiftsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="gift-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Box bottom */}
      <rect x="8" y="28" width="48" height="28" rx="2" fill="#ec4899" filter="url(#gift-shadow)"/>

      {/* Box vertical ribbon */}
      <rect x="28" y="28" width="8" height="28" fill="#f9a8d4"/>

      {/* Box lid */}
      <rect x="4" y="20" width="56" height="10" rx="2" fill="#db2777" filter="url(#gift-shadow)"/>

      {/* Lid ribbon */}
      <rect x="28" y="20" width="8" height="10" fill="#fbcfe8"/>

      {/* Bow */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <ellipse cx="22" cy="16" rx="10" ry="6" fill="#f9a8d4" filter="url(#gift-shadow)"/>
        <ellipse cx="42" cy="16" rx="10" ry="6" fill="#f9a8d4" filter="url(#gift-shadow)"/>
        <circle cx="32" cy="18" r="6" fill="#db2777"/>
      </motion.g>
    </motion.svg>
  );
}

// Hero illustration - 3D Command center / Dashboard
export function GRCHeroIllustration({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#1e293b" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Central hexagon */}
      <motion.polygon
        points="50,10 80,27 80,63 50,80 20,63 20,27"
        fill="#0d9488"
        filter="url(#hero-shadow)"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 45px" }}
      />

      <polygon points="50,16 74,30 74,60 50,74 26,60 26,30" fill="#14b8a6"/>

      {/* Inner elements */}
      <circle cx="50" cy="45" r="16" fill="#f0fdfa"/>

      {/* G R C letters */}
      <text x="38" y="42" fontSize="8" fontWeight="bold" fill="#0d9488">G</text>
      <text x="47" y="50" fontSize="8" fontWeight="bold" fill="#0d9488">R</text>
      <text x="55" y="42" fontSize="8" fontWeight="bold" fill="#0d9488">C</text>

      {/* Orbiting elements */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 45px" }}
      >
        <circle cx="50" cy="5" r="5" fill="#10b981"/>
      </motion.g>

      <motion.g
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 45px" }}
      >
        <circle cx="88" cy="45" r="4" fill="#6366f1"/>
      </motion.g>

      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 45px" }}
      >
        <circle cx="50" cy="88" r="4" fill="#f59e0b"/>
      </motion.g>
    </motion.svg>
  );
}

// Reporting Pack - 3D report sheet with a rising chart
export function ReportingIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="report-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Paper */}
      <rect x="14" y="8" width="36" height="48" rx="6" fill="#f8fafc" filter="url(#report-shadow)" />
      <rect x="14" y="8" width="36" height="9" rx="6" fill="#0d9488" />

      {/* Header lines */}
      <rect x="20" y="21" width="20" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="20" y="26" width="14" height="3" rx="1.5" fill="#e2e8f0" />

      {/* Chart bars */}
      <rect x="20" y="42" width="6" height="10" rx="1.5" fill="#14b8a6" />
      <rect x="29" y="36" width="6" height="16" rx="1.5" fill="#0ea5e9" />
      <rect x="38" y="30" width="6" height="22" rx="1.5" fill="#6366f1" />

      {/* Rising line */}
      <motion.path
        d="M20 40 L30 34 L39 28 L46 24"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.25, duration: 0.7 }}
      />
      <motion.path
        d="M46 24 L45 30 M46 24 L40 25"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.25 }}
      />
    </motion.svg>
  );
}

// Regulatory News - 3D newspaper with a "NEW" badge
export function RegulatoryNewsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="news-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Newspaper body */}
      <rect x="10" y="14" width="44" height="36" rx="6" fill="#f8fafc" filter="url(#news-shadow)" />
      <rect x="10" y="14" width="44" height="10" rx="6" fill="#334155" />

      {/* Title + lines */}
      <rect x="16" y="18" width="18" height="3" rx="1.5" fill="#e2e8f0" />
      <rect x="16" y="28" width="32" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="16" y="34" width="28" height="3" rx="1.5" fill="#e2e8f0" />
      <rect x="16" y="40" width="30" height="3" rx="1.5" fill="#e2e8f0" />

      {/* Photo block */}
      <rect x="36" y="18" width="12" height="8" rx="2" fill="#94a3b8" />
      <rect x="38" y="20" width="8" height="2" rx="1" fill="#e2e8f0" />

      {/* NEW badge */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 220, damping: 16 }}
      >
        <circle cx="50" cy="14" r="10" fill="#f59e0b" filter="url(#news-shadow)" />
        <text x="44" y="17" fontSize="7" fontWeight="700" fill="#0f172a">NEW</text>
      </motion.g>
    </motion.svg>
  );
}

// Payments - 3D card with shield-check badge
export function PaymentsIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="pay-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Card */}
      <rect x="8" y="18" width="48" height="30" rx="8" fill="#0ea5e9" filter="url(#pay-shadow)" />
      <rect x="8" y="26" width="48" height="6" fill="#0f172a" opacity="0.35" />

      {/* Chip */}
      <rect x="14" y="35" width="12" height="9" rx="2" fill="#f59e0b" />
      <rect x="16" y="38" width="8" height="1.8" rx="0.9" fill="#92400e" opacity="0.5" />
      <rect x="16" y="41" width="8" height="1.8" rx="0.9" fill="#92400e" opacity="0.5" />

      {/* Digits */}
      <rect x="30" y="37" width="20" height="2.8" rx="1.4" fill="#e0f2fe" opacity="0.9" />
      <rect x="30" y="42" width="14" height="2.8" rx="1.4" fill="#e0f2fe" opacity="0.7" />

      {/* Shield badge */}
      <motion.g
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 14 }}
      >
        <circle cx="50" cy="46" r="10" fill="#10b981" filter="url(#pay-shadow)" />
        <path
          d="M50 38 C46 40 44 41 44 45 C44 49 47 52 50 54 C53 52 56 49 56 45 C56 41 54 40 50 38 Z"
          fill="#065f46"
          opacity="0.35"
        />
        <path
          d="M46.5 46 L49 48.5 L54 43.5"
          stroke="#ffffff"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  );
}

// AI Assistant - 3D chat bubble with sparkles
export function AIAssistantIllustration({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <filter id="ai-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1e293b" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Chat bubble */}
      <path
        d="M14 18 C14 14.7 16.7 12 20 12 H44 C47.3 12 50 14.7 50 18 V34 C50 37.3 47.3 40 44 40 H28 L18 48 V40 H20 C16.7 40 14 37.3 14 34 Z"
        fill="#6366f1"
        filter="url(#ai-shadow)"
      />
      <path d="M20 20 H44" stroke="#eef2ff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <path d="M20 26 H36" stroke="#eef2ff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M20 32 H40" stroke="#eef2ff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />

      {/* Sparkles */}
      <motion.g
        animate={{ y: [0, -2, 0], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M54 14 L56 18 L60 20 L56 22 L54 26 L52 22 L48 20 L52 18 Z"
          fill="#f59e0b"
          filter="url(#ai-shadow)"
        />
      </motion.g>
      <motion.g
        animate={{ y: [0, 2, 0], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M8 30 L9.5 33 L12.5 34.5 L9.5 36 L8 39 L6.5 36 L3.5 34.5 L6.5 33 Z"
          fill="#10b981"
          filter="url(#ai-shadow)"
        />
      </motion.g>
    </motion.svg>
  );
}
