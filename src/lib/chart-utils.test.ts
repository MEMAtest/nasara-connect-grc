import { describe, expect, it } from "vitest";
import { generateTrendData, getMonthBuckets, getMonthKey } from "@/lib/chart-utils";

describe("chart-utils month bucketing", () => {
  it("uses UTC month keys for timestamps near month end", () => {
    expect(getMonthKey("2025-01-31T23:30:00Z")).toBe("2025-01");
    expect(getMonthKey("2025-02-01T00:00:00Z")).toBe("2025-02");
  });

  it("builds stable month buckets from an anchor date", () => {
    const anchor = new Date(Date.UTC(2025, 0, 15));
    const buckets = getMonthBuckets(3, "en-US", anchor);

    expect(buckets.map((b) => b.monthKey)).toEqual([
      "2024-11",
      "2024-12",
      "2025-01",
    ]);

    const january = buckets[buckets.length - 1];
    expect(january.startDate).toBe("2025-01-01T00:00:00.000Z");
    expect(january.endDate).toBe("2025-01-31T23:59:59.999Z");
  });

  it("aggregates records into UTC month buckets", () => {
    const anchor = new Date(Date.UTC(2025, 0, 15));
    const records = [
      { created_at: "2024-12-10T12:00:00Z" },
      { created_at: "2025-01-01" },
      { created_at: "2025-01-31T23:59:59Z" },
      { created_at: "2025-02-01T00:00:00Z" },
    ];

    const trend = generateTrendData(records, 3, "created_at", anchor);
    const valuesByKey = Object.fromEntries(trend.map((point) => [point.monthKey, point.value]));

    expect(valuesByKey["2024-11"]).toBe(0);
    expect(valuesByKey["2024-12"]).toBe(1);
    expect(valuesByKey["2025-01"]).toBe(2);
  });
});

