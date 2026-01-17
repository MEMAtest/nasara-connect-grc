/**
 * Validation utilities for API routes
 */

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Maximum string length to prevent DoS
const MAX_STRING_LENGTH = 10000;
const MAX_TEXT_LENGTH = 50000;

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
 * Uses multi-layer sanitization for defense in depth
 */
export function sanitizeString(value: unknown, maxLength = MAX_STRING_LENGTH): string {
  if (typeof value !== "string") {
    return "";
  }

  let sanitized = value;

  // Truncate to max length first (DoS prevention)
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Remove null bytes (prevents truncation attacks)
  sanitized = sanitized.replace(/\0/g, "");

  // Remove all script tags and their contents (including variations)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<script[^>]*>/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: protocol (except safe image types)
  sanitized = sanitized.replace(/data:(?!image\/(png|jpg|jpeg|gif|webp))/gi, "");

  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Encode remaining special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return sanitized.trim();
}

/**
 * Sanitize a string but allow basic formatting (no HTML)
 * Use for notes and descriptions - preserves newlines
 */
export function sanitizeText(value: unknown, maxLength = MAX_TEXT_LENGTH): string {
  if (typeof value !== "string") {
    return "";
  }

  let sanitized = value;

  // Truncate to max length first (DoS prevention)
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove all script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove all HTML tags but preserve content
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  return sanitized.trim();
}

/**
 * Validate and sanitize a column name for SQL queries
 * Only allows alphanumeric characters and underscores
 */
export function isValidColumnName(name: string): boolean {
  return /^[a-z][a-z0-9_]*$/i.test(name) && name.length <= 64;
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
