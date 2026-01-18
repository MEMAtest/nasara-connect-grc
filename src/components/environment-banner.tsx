"use client";

import { useEffect, useState } from "react";

type EnvironmentName = "development" | "uat" | "production" | "local";

const ENV_COLORS: Record<EnvironmentName, string> = {
  development: "bg-green-500",
  uat: "bg-amber-500",
  local: "bg-blue-500",
  production: "",
};

const ENV_LABELS: Record<EnvironmentName, string> = {
  development: "DEVELOPMENT",
  uat: "UAT",
  local: "LOCAL",
  production: "",
};

function detectEnvironment(): EnvironmentName {
  if (typeof window === "undefined") return "local";

  const hostname = window.location.hostname;

  // Production: nasaraconnect.com (without subdomain)
  if (hostname === "nasaraconnect.com" || hostname === "www.nasaraconnect.com") {
    return "production";
  }

  // Development: dev.nasaraconnect.com
  if (hostname.startsWith("dev.")) {
    return "development";
  }

  // UAT: uat.nasaraconnect.com
  if (hostname.startsWith("uat.")) {
    return "uat";
  }

  // Vercel preview URLs
  if (hostname.includes("vercel.app")) {
    return "development";
  }

  // Local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "local";
  }

  return "local";
}

/**
 * Environment banner component
 * Shows a visual indicator for non-production environments
 * Hidden in production to avoid confusing end users
 */
export function EnvironmentBanner() {
  const [envName, setEnvName] = useState<EnvironmentName>("production");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnvName(detectEnvironment());
    setMounted(true);
  }, []);

  // Don't render until mounted (avoids hydration mismatch)
  if (!mounted) return null;

  // Don't show banner in production
  if (envName === "production") {
    return null;
  }

  const colorClass = ENV_COLORS[envName] || ENV_COLORS.local;
  const label = ENV_LABELS[envName] || envName.toUpperCase();

  return (
    <div
      className={`${colorClass} text-white text-center text-xs font-medium py-1 px-2 z-50`}
      role="banner"
      aria-label={`${label} environment indicator`}
    >
      {label} Environment
      {envName === "local" && (
        <span className="ml-2 opacity-75">
          (localhost:{window.location.port || "3000"})
        </span>
      )}
    </div>
  );
}
