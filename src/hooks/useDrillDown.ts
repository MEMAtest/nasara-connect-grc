"use client";

import { useState, useCallback, useMemo } from "react";

export interface DrillDownFilter {
  key: string;
  value: string;
}

export interface UseDrillDownReturn<T> {
  filter: DrillDownFilter | null;
  handleDrillDown: (key: string, value: string) => void;
  clearDrillDown: () => void;
  isActive: (key: string, value?: string) => boolean;
  filterData: (data: T[], keyMap?: Record<string, string>) => T[];
}

/**
 * Hook for managing drill-down filtering on charts
 *
 * @example
 * ```tsx
 * const { filter, handleDrillDown, clearDrillDown, filterData } = useDrillDown<MyRecord>();
 *
 * // In chart click handler
 * <DonutChart
 *   onSegmentClick={(label) => handleDrillDown("status", label.toLowerCase())}
 *   activeSegment={filter?.key === "status" ? filter.value : undefined}
 * />
 *
 * // Filter table data
 * const filteredData = filterData(records);
 * ```
 */
export function useDrillDown<T extends Record<string, unknown>>(): UseDrillDownReturn<T> {
  const [filter, setFilter] = useState<DrillDownFilter | null>(null);

  const handleDrillDown = useCallback((key: string, value: string) => {
    setFilter((current) => {
      // Toggle off if clicking the same filter
      if (current?.key === key && current?.value === value) {
        return null;
      }
      return { key, value };
    });
  }, []);

  const clearDrillDown = useCallback(() => {
    setFilter(null);
  }, []);

  const isActive = useCallback(
    (key: string, value?: string) => {
      if (!filter) return false;
      if (value !== undefined) {
        return filter.key === key && filter.value === value;
      }
      return filter.key === key;
    },
    [filter]
  );

  /**
   * Filter data based on current drill-down selection
   * @param data - Array of records to filter
   * @param keyMap - Optional mapping from filter keys to record property names
   *                 e.g., { "status": "complaint_status" } maps filter key "status" to record property "complaint_status"
   */
  const filterData = useCallback(
    (data: T[], keyMap?: Record<string, string>): T[] => {
      if (!filter) return data;

      const recordKey = keyMap?.[filter.key] || filter.key;

      return data.filter((record) => {
        const recordValue = record[recordKey];

        // Handle different value types
        if (recordValue === null || recordValue === undefined) {
          return false;
        }

        // Case-insensitive string comparison
        const normalizedRecordValue = String(recordValue).toLowerCase().replace(/_/g, " ");
        const normalizedFilterValue = filter.value.toLowerCase().replace(/_/g, " ");

        return normalizedRecordValue === normalizedFilterValue;
      });
    },
    [filter]
  );

  return {
    filter,
    handleDrillDown,
    clearDrillDown,
    isActive,
    filterData,
  };
}

/**
 * Badge component props for displaying active drill-down filter
 */
export interface DrillDownBadgeProps {
  filter: DrillDownFilter | null;
  onClear: () => void;
}

/**
 * Helper to format filter value for display
 */
export function formatFilterValue(value: string): string {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
