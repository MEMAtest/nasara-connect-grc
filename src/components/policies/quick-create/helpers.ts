import type { FirmProfile } from "@/components/policies/policy-wizard/types";
import type { GovernanceState } from "./types";
import {
  BUSINESS_PROFILE_FIELDS,
  BUSINESS_PROFILE_OPTION_LOOKUP,
  BUSINESS_PROFILE_OTHER_OPTION,
  DEFAULT_EXTRA_FIRM_FIELDS,
  KNOWN_FIRM_KEYS,
  REVIEW_CADENCE_VALUES,
} from "./constants";

export const humanizeLabel = (value: string) =>
  value
    .replace(/\./g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatPlaceholder = (value: string) => `Enter ${humanizeLabel(value).toLowerCase()}`;

export const parseMultiSelectValue = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export const formatOptionId = (fieldKey: string, option: string) =>
  `${fieldKey}-${option.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const normalizeDistributionList = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }
  return [];
};

export const addMonthsToDate = (value: string, months: number) => {
  const parts = value.split("-").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return "";
  }
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
};

export const normalizeFirmProfile = (input?: Record<string, unknown> | null): FirmProfile => {
  const source = input ?? {};
  const sicCodes = Array.isArray(source.sicCodes)
    ? source.sicCodes
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
    : typeof source.sicCodes === "string"
      ? source.sicCodes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

  return {
    name: typeof source.name === "string" ? source.name : "",
    tradingName: typeof source.tradingName === "string" ? source.tradingName : "",
    registeredAddress: typeof source.registeredAddress === "string" ? source.registeredAddress : "",
    companyNumber: typeof source.companyNumber === "string" ? source.companyNumber : "",
    fcaReference: typeof source.fcaReference === "string" ? source.fcaReference : "",
    website: typeof source.website === "string" ? source.website : "",
    sicCodes,
  };
};

const extractExtraFirmFields = (input?: Record<string, unknown> | null): Record<string, string> => {
  if (!input) return {};
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    if (KNOWN_FIRM_KEYS.has(key)) return acc;
    if (typeof value === "string" && value.trim().length > 0) {
      acc[key] = value.trim();
    }
    return acc;
  }, {});
};

export const buildExtraFirmFields = (input?: Record<string, unknown> | null) => ({
  ...DEFAULT_EXTRA_FIRM_FIELDS,
  ...extractExtraFirmFields(input),
});

export const buildFirmProfilePayload = (profile: FirmProfile, extras: Record<string, string>) => {
  const normalizedExtras = Object.fromEntries(
    Object.entries(extras)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value.length > 0),
  );

  BUSINESS_PROFILE_FIELDS.forEach((field) => {
    const selections = parseMultiSelectValue(normalizedExtras[field.key]).filter(
      (value) => value !== BUSINESS_PROFILE_OTHER_OPTION,
    );
    const otherValues = parseMultiSelectValue(normalizedExtras[`${field.key}Other`]);
    const combined = Array.from(new Set([...selections, ...otherValues]));
    if (combined.length) {
      normalizedExtras[field.key] = combined.join(", ");
    } else {
      delete normalizedExtras[field.key];
    }
  });

  return {
    ...normalizedExtras,
    name: profile.name.trim(),
    tradingName: profile.tradingName?.trim() || "",
    registeredAddress: profile.registeredAddress?.trim() || "",
    companyNumber: profile.companyNumber?.trim() || "",
    fcaReference: profile.fcaReference?.trim() || "",
    website: profile.website?.trim() || "",
    sicCodes: (profile.sicCodes ?? []).map((code) => code.trim()).filter(Boolean),
  };
};

export const buildGovernanceDefaultsPayload = (state: GovernanceState) => ({
  owner: state.owner.trim(),
  version: state.version.trim(),
  effectiveDate: state.effectiveDate,
  nextReviewAt: state.reviewCadence === "one-off" ? "" : state.nextReviewAt,
  scopeStatement: state.scopeStatement.trim(),
  reviewCadence: state.reviewCadence,
  distributionList: state.distributionList.map((value) => value.trim()).filter(Boolean),
  linkedProcedures: state.linkedProcedures.trim(),
});

export const coerceReviewCadence = (value: unknown): GovernanceState["reviewCadence"] | undefined =>
  typeof value === "string" && REVIEW_CADENCE_VALUES.has(value)
    ? (value as GovernanceState["reviewCadence"])
    : undefined;

export const stripUnknownBusinessProfileSelections = (fieldKey: string, selections: string[]) => {
  const knownOptions = new Set(BUSINESS_PROFILE_OPTION_LOOKUP[fieldKey] ?? []);
  return selections.filter((entry) => entry === BUSINESS_PROFILE_OTHER_OPTION || knownOptions.has(entry));
};
