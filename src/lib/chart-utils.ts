/**
 * Chart utility functions for generating trend data from records
 */

interface RecordWithDate {
  created_at?: string;
  date_received?: string;
  [key: string]: unknown;
}

export interface TrendPoint {
  label: string;
  value: number;
  monthKey: string;
  startDate: string;
  endDate: string;
}

export interface MonthBucket {
  label: string;
  monthKey: string;
  startDate: string;
  endDate: string;
}

function parseDateValue(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    const utcDate = new Date(Date.UTC(year, month, day));
    return Number.isNaN(utcDate.getTime()) ? null : utcDate;
  }
  const altIsoMatch = /^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})$/.exec(raw);
  if (altIsoMatch) {
    const year = Number(altIsoMatch[1]);
    const month = Number(altIsoMatch[2]) - 1;
    const day = Number(altIsoMatch[3]);
    const utcDate = new Date(Date.UTC(year, month, day));
    return Number.isNaN(utcDate.getTime()) ? null : utcDate;
  }
  const slashedMatch = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(raw);
  if (slashedMatch) {
    const first = Number(slashedMatch[1]);
    const second = Number(slashedMatch[2]);
    const year = Number(slashedMatch[3]);
    let day = first;
    let month = second - 1;
    if (first > 12 && second <= 12) {
      day = first;
      month = second - 1;
    } else if (second > 12 && first <= 12) {
      day = second;
      month = first - 1;
    }
    const utcDate = new Date(Date.UTC(year, month, day));
    return Number.isNaN(utcDate.getTime()) ? null : utcDate;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getMonthKey(value: unknown): string | null {
  const date = parseDateValue(value);
  if (!date) return null;
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

export function getMonthBuckets(
  months: number = 6,
  locale: string = "en-US",
  anchorDate?: Date
): MonthBucket[] {
  const now = anchorDate ?? new Date();
  const baseYear = now.getUTCFullYear();
  const baseMonth = now.getUTCMonth();
  const buckets: MonthBucket[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(Date.UTC(baseYear, baseMonth - i, 1));
    const monthLabel = date.toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
    const monthStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const monthEnd = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );
    const monthKey =
      getMonthKey(monthStart) ||
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    buckets.push({
      label: monthLabel,
      monthKey,
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
    });
  }

  return buckets;
}

/**
 * Generate trend data by aggregating record counts by month
 * @param records - Array of records with date fields
 * @param months - Number of months to include (default: 6)
 * @param dateField - The field name to use for date (default: 'created_at')
 * @returns Array of { label: string; value: number; monthKey: string; startDate: string; endDate: string } for the chart
 */
export function generateTrendData<T extends RecordWithDate>(
  records: T[],
  months: number = 6,
  dateField: keyof T = "created_at" as keyof T,
  anchorDate?: Date
): TrendPoint[] {
  const result: TrendPoint[] = [];
  const monthBuckets = getMonthBuckets(months, "en-US", anchorDate);

  for (const bucket of monthBuckets) {
    const monthStart = parseDateValue(bucket.startDate);
    const monthEnd = parseDateValue(bucket.endDate);
    if (!monthStart || !monthEnd) {
      result.push({
        label: bucket.label,
        value: 0,
        monthKey: bucket.monthKey,
        startDate: bucket.startDate,
        endDate: bucket.endDate,
      });
      continue;
    }

    const count = records.filter((r) => {
      const dateValue = r[dateField] || r.created_at;
      if (!dateValue) return false;
      const recordDate = parseDateValue(dateValue);
      if (!recordDate) return false;
      return recordDate >= monthStart && recordDate <= monthEnd;
    }).length;

    result.push({
      label: bucket.label,
      value: count,
      monthKey: bucket.monthKey,
      startDate: bucket.startDate,
      endDate: bucket.endDate,
    });
  }

  return result;
}
