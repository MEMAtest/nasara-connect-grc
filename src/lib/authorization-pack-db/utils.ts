/**
 * Shared utility functions for authorization pack database operations
 */

export const normalizeEvidenceName = (value: string) => value.trim().toLowerCase();

export const normalizeSectionKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const parseAnnexNumber = (value: string | null) => {
  if (!value) return 0;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
};

export const coerceJsonArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const coerceJsonObject = <T>(value: unknown): T => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as T;
      }
    } catch {
      return {} as T;
    }
  }
  return {} as T;
};

export function average(values: number[]) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}

export function calcPercent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}
