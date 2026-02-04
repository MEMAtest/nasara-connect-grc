import { DEFAULT_PERMISSIONS, type FirmPermissions } from "@/lib/policies/permissions";
import type { FirmProfile } from "@/components/policies/policy-wizard/types";

export interface AuthorizationProjectBasics {
  [key: string]: unknown;
}

export interface AuthorizationProjectContext {
  id: string;
  name?: string | null;
  permissionCode?: string | null;
  policyTemplates?: string[];
  assessmentData?: {
    basics?: AuthorizationProjectBasics;
  };
}

const toStringValue = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function buildFirmProfileFromBasics(
  basics: AuthorizationProjectBasics | undefined,
  fallbackName?: string | null,
): Partial<FirmProfile> | undefined {
  if (!basics) return undefined;
  const name = toStringValue(basics.legalName) || toStringValue(basics.tradingName) || toStringValue(fallbackName);
  const tradingName = toStringValue(basics.tradingName);
  const companyNumber = toStringValue(basics.companyNumber);
  const addressParts = [
    toStringValue(basics.addressLine1),
    toStringValue(basics.addressLine2),
    toStringValue(basics.city),
    toStringValue(basics.postcode),
    toStringValue(basics.country),
  ].filter(Boolean);
  const registeredAddress = addressParts.length ? addressParts.join(", ") : "";
  const sicValue = basics.sicCode;
  const sicCodes =
    typeof sicValue === "string" || typeof sicValue === "number"
      ? String(sicValue)
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];

  const profile: Partial<FirmProfile> = {};
  if (name) profile.name = name;
  if (tradingName) profile.tradingName = tradingName;
  if (companyNumber) profile.companyNumber = companyNumber;
  if (registeredAddress) profile.registeredAddress = registeredAddress;
  if (sicCodes.length) profile.sicCodes = sicCodes;

  return Object.keys(profile).length ? profile : undefined;
}

export function buildPermissionsFromProject(
  permissionCode?: string | null,
  basics?: AuthorizationProjectBasics,
): FirmPermissions | undefined {
  if (!permissionCode) return undefined;
  const permissions: FirmPermissions = { ...DEFAULT_PERMISSIONS };
  const normalized = permissionCode.toLowerCase();

  if (normalized === "payments") {
    permissions.paymentServices = true;
    permissions.safeguarding = true;
  }
  if (normalized === "investments") {
    permissions.investmentServices = true;
  }
  if (normalized === "consumer-credit") {
    permissions.creditBroking = true;
  }
  if (normalized === "insurance") {
    permissions.insuranceMediation = true;
  }

  const regulatedActivities =
    typeof basics?.regulatedActivities === "string"
      ? basics.regulatedActivities
          .split(",")
          .map((entry: string) => entry.trim())
          .filter(Boolean)
      : [];
  if (regulatedActivities.includes("e-money-issuance")) {
    permissions.eMoney = true;
  }
  if (regulatedActivities.some((value: string) => value.startsWith("ps-") || value === "payment-services")) {
    permissions.paymentServices = true;
  }

  return permissions;
}

export function mergeFirmProfiles(
  base: FirmProfile,
  updates: Array<Partial<FirmProfile> | undefined>,
): FirmProfile {
  const next = { ...base };
  updates.filter(Boolean).forEach((update) => {
    if (!update) return;
    (Object.keys(update) as Array<keyof FirmProfile>).forEach((key) => {
      const value = update[key];
      if (typeof value === "string") {
        if (!next[key] || String(next[key]).trim().length === 0) {
          (next as Record<string, unknown>)[key] = value;
        }
        return;
      }
      if (Array.isArray(value)) {
        const existing = Array.isArray(next[key]) ? (next[key] as string[]) : [];
        const merged = Array.from(new Set([...existing, ...value.filter(Boolean)]));
        if (!existing.length) {
          (next as Record<string, unknown>)[key] = merged;
        }
      }
    });
  });
  return next;
}

export function mergePermissions(
  base: FirmPermissions,
  updates: Array<FirmPermissions | undefined>,
): FirmPermissions {
  return updates.filter((u): u is FirmPermissions => u !== undefined).reduce((acc, update) => {
    return Object.keys(acc).reduce((next, key) => {
      const typedKey = key as keyof FirmPermissions;
      next[typedKey] = acc[typedKey] || update[typedKey];
      return next;
    }, { ...acc });
  }, { ...base });
}
