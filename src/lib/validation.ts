/**
 * Validation utilities for API routes
 */

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate that a string is a valid UUID format
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validate that a string is a valid email format
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Validate that a value is a valid positive number
 */
export function isValidPositiveNumber(value: unknown): value is number {
  if (typeof value === "number") {
    return !isNaN(value) && isFinite(value) && value >= 0;
  }
  if (typeof value === "string") {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0;
  }
  return false;
}

/**
 * Parse and validate a number, returning null if invalid
 */
export function parsePositiveNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return null;
  }
  return num;
}

/**
 * Validate that a date string is valid and return Date object or null
 */
export function parseValidDate(value: unknown): Date | null {
  if (!value || typeof value !== "string") {
    return null;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

/**
 * Sanitize a string to prevent XSS attacks
 * Removes HTML tags and encodes special characters
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "&": "&amp;",
      };
      return entities[char] || char;
    })
    .trim();
}

/**
 * Sanitize a string but allow basic formatting (no HTML)
 * Use for notes and descriptions
 */
export function sanitizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  // Remove any HTML/script tags but preserve newlines and basic text
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Validate that a value is one of the allowed enum values
 */
export function isValidEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[]
): value is T {
  return typeof value === "string" && allowedValues.includes(value as T);
}

// PEP Register enums
export const PEP_TYPES = ["customer", "beneficial_owner", "director", "shareholder"] as const;
export const PEP_CATEGORIES = ["pep", "rca", "family_member"] as const;
export const RISK_RATINGS = ["low", "medium", "high", "critical"] as const;
export const PEP_STATUSES = ["active", "inactive", "archived", "under_review"] as const;
export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;

// Third-Party Register enums
export const VENDOR_TYPES = [
  "technology",
  "cloud_services",
  "payment_processing",
  "data_provider",
  "compliance_services",
  "audit_services",
  "legal_services",
  "consulting",
  "infrastructure",
  "security",
  "other",
] as const;
export const CRITICALITY_LEVELS = ["low", "medium", "high", "critical"] as const;
export const THIRD_PARTY_STATUSES = [
  "active",
  "inactive",
  "pending",
  "terminated",
  "under_review",
] as const;

// Complaints Register enums
export const COMPLAINT_TYPES = [
  "product",
  "service",
  "staff_conduct",
  "fees",
  "advice",
  "delay",
  "communication",
  "other",
] as const;
export const COMPLAINT_CATEGORIES = [
  "upheld",
  "partially_upheld",
  "rejected",
  "pending",
] as const;
export const COMPLAINT_STATUSES = [
  "open",
  "investigating",
  "resolved",
  "closed",
  "escalated",
] as const;

// Incident Register enums
export const INCIDENT_TYPES = [
  "operational",
  "security",
  "data_breach",
  "system_failure",
  "fraud",
  "compliance",
  "human_error",
  "third_party",
  "other",
] as const;
export const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const INCIDENT_STATUSES = [
  "detected",
  "investigating",
  "contained",
  "resolved",
  "closed",
] as const;

// Conflicts of Interest Register enums
export const CONFLICT_TYPES = [
  "personal_interest",
  "family_relationship",
  "outside_employment",
  "financial_interest",
  "gift_hospitality",
  "board_membership",
  "shareholder",
  "other",
] as const;
export const COI_STATUSES = [
  "active",
  "mitigated",
  "resolved",
  "archived",
] as const;

// Gifts & Hospitality Register enums
export const GIFT_ENTRY_TYPES = [
  "gift_received",
  "gift_given",
  "hospitality_received",
  "hospitality_given",
] as const;

// Shared enums
export const REVIEW_FREQUENCIES = [
  "annual",
  "semi_annual",
  "quarterly",
  "monthly",
  "ad_hoc",
] as const;
export const PRIORITY_LEVELS = ["low", "medium", "high", "urgent"] as const;

// Type exports
export type PEPType = (typeof PEP_TYPES)[number];
export type PEPCategory = (typeof PEP_CATEGORIES)[number];
export type RiskRating = (typeof RISK_RATINGS)[number];
export type PEPStatus = (typeof PEP_STATUSES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type VendorType = (typeof VENDOR_TYPES)[number];
export type CriticalityLevel = (typeof CRITICALITY_LEVELS)[number];
export type ThirdPartyStatus = (typeof THIRD_PARTY_STATUSES)[number];
export type ComplaintType = (typeof COMPLAINT_TYPES)[number];
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type ConflictType = (typeof CONFLICT_TYPES)[number];
export type COIStatus = (typeof COI_STATUSES)[number];
export type GiftEntryType = (typeof GIFT_ENTRY_TYPES)[number];
export type ReviewFrequency = (typeof REVIEW_FREQUENCIES)[number];
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
