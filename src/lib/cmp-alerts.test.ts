import { describe, expect, it } from "vitest";
import { buildCmpAlerts } from "./cmp-alerts";
import type { CmpSummary } from "@/data/cmp/types";

const summary = (overrides: Partial<CmpSummary>): CmpSummary => ({
  totalControls: 5,
  dueSoon: 0,
  overdue: 0,
  openFindings: 0,
  avgPassRate: 0.95,
  ...overrides,
});

describe("buildCmpAlerts", () => {
  it("returns empty array when no summary", () => {
    expect(buildCmpAlerts(null)).toEqual([]);
  });

  it("creates overdue alerts", () => {
    const alerts = buildCmpAlerts(summary({ overdue: 2 }));
    expect(alerts[0]?.id).toBe("cmp-overdue");
  });

  it("creates due soon alerts", () => {
    const alerts = buildCmpAlerts(summary({ dueSoon: 1 }));
    expect(alerts.some((alert) => alert.id === "cmp-due-soon")).toBe(true);
  });

  it("creates pass rate alert when below threshold", () => {
    const alerts = buildCmpAlerts(summary({ avgPassRate: 0.6 }));
    expect(alerts.some((alert) => alert.id === "cmp-pass-rate")).toBe(true);
  });
});
