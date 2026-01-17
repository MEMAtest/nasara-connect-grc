/**
 * Chart utility functions for generating trend data from records
 */

interface RecordWithDate {
  created_at?: string;
  date_received?: string;
  [key: string]: unknown;
}

/**
 * Generate trend data by aggregating record counts by month
 * @param records - Array of records with date fields
 * @param months - Number of months to include (default: 6)
 * @param dateField - The field name to use for date (default: 'created_at')
 * @returns Array of { label: string; value: number } for the chart
 */
export function generateTrendData<T extends RecordWithDate>(
  records: T[],
  months: number = 6,
  dateField: keyof T = 'created_at' as keyof T
): { label: string; value: number }[] {
  const now = new Date();
  const result: { label: string; value: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    const count = records.filter(r => {
      const dateValue = r[dateField] || r.created_at;
      if (!dateValue) return false;
      const recordDate = new Date(dateValue as string);
      return recordDate >= monthStart && recordDate <= monthEnd;
    }).length;

    result.push({ label: monthLabel, value: count });
  }

  return result;
}
