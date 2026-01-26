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

export function getMonthKey(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
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
  dateField: keyof T = 'created_at' as keyof T
): TrendPoint[] {
  const now = new Date();
  const result: TrendPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthKey = getMonthKey(monthStart) || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const count = records.filter(r => {
      const dateValue = r[dateField] || r.created_at;
      if (!dateValue) return false;
      const recordDate = new Date(dateValue as string);
      return recordDate >= monthStart && recordDate <= monthEnd;
    }).length;

    result.push({
      label: monthLabel,
      value: count,
      monthKey,
      startDate: monthStart.toISOString(),
      endDate: monthEnd.toISOString(),
    });
  }

  return result;
}
