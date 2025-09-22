import { describe, expect, it } from "vitest";
import { filterRisksByState } from "./useRiskData";
import type { RiskFiltersState, RiskRecord } from "../lib/riskConstants";

const baseRisk: RiskRecord = {
  id: "r1",
  riskId: "RA-001",
  title: "Test Risk",
  description: "Sample risk for testing",
  category: "operational",
  likelihood: 3,
  impact: 3,
  residualLikelihood: 2,
  residualImpact: 2,
  velocity: "medium",
  riskOwner: "Owner",
  reviewFrequency: "quarterly",
  status: "open",
  controlCount: 0,
  controlEffectiveness: 0,
};

describe("filterRisksByState", () => {
  it("returns all risks when filters are set to all", () => {
    const filters: RiskFiltersState = {
      category: "all",
      status: "all",
      riskLevel: "all",
      search: "",
    };
    const result = filterRisksByState([baseRisk], filters);
    expect(result).toHaveLength(1);
  });

  it("filters by risk level", () => {
    const highRisk: RiskRecord = { ...baseRisk, id: "r2", likelihood: 5, impact: 4 };
    const filters: RiskFiltersState = {
      category: "all",
      status: "all",
      riskLevel: "high",
      search: "",
    };
    const result = filterRisksByState([baseRisk, highRisk], filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("r2");
  });

  it("applies text search across key fields", () => {
    const filters: RiskFiltersState = {
      category: "all",
      status: "all",
      riskLevel: "all",
      search: "sample",
    };
    const result = filterRisksByState([baseRisk], filters);
    expect(result).toHaveLength(1);
    const missFilters: RiskFiltersState = { ...filters, search: "missing" };
    expect(filterRisksByState([baseRisk], missFilters)).toHaveLength(0);
  });

  it("matches status and category filters", () => {
    const risk: RiskRecord = { ...baseRisk, category: "compliance", status: "mitigated" };
    const filters: RiskFiltersState = {
      category: "compliance",
      status: "mitigated",
      riskLevel: "all",
      search: "",
    };
    expect(filterRisksByState([risk], filters)).toHaveLength(1);
    expect(filterRisksByState([risk], { ...filters, status: "open" })).toHaveLength(0);
  });
});
