"use client";

import { ENV_CONFIG, type EnvironmentName } from "@/lib/env-config";

const ENV_COLORS: Record<EnvironmentName, string> = {
  development: "bg-green-500",
  uat: "bg-amber-500",
  local: "bg-blue-500",
  production: "", // Not shown in production
};

const ENV_LABELS: Record<EnvironmentName, string> = {
  development: "DEVELOPMENT",
  uat: "UAT",
  local: "LOCAL",
  production: "",
};

/**
 * Environment banner component
 * Shows a visual indicator for non-production environments
 * Hidden in production to avoid confusing end users
 */
export function EnvironmentBanner() {
  // Don't show banner in production
  if (ENV_CONFIG.isProd) {
    return null;
  }

  const envName = ENV_CONFIG.envName;
  const colorClass = ENV_COLORS[envName] || ENV_COLORS.local;
  const label = ENV_LABELS[envName] || envName.toUpperCase();

  return (
    <div
      className={`${colorClass} text-white text-center text-xs font-medium py-1 px-2 z-50`}
      role="banner"
      aria-label={`${label} environment indicator`}
    >
      {label} Environment
      {ENV_CONFIG.isLocal && (
        <span className="ml-2 opacity-75">
          (localhost:{typeof window !== 'undefined' ? window.location.port : '3000'})
        </span>
      )}
    </div>
  );
}
