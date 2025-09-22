import { useMemo } from "react";
import type { RiskRecord } from "../lib/riskConstants";

export interface RiskMetricsSummary {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  averageControlEffectiveness: number;
}

export function useRiskCalculations(risks: RiskRecord[]): RiskMetricsSummary {
  return useMemo(() => {
    if (risks.length === 0) {
      return {
        totalRisks: 0,
        highRisks: 0,
        mediumRisks: 0,
        lowRisks: 0,
        averageControlEffectiveness: 0,
      };
    }

    let highRisks = 0;
    let mediumRisks = 0;
    let lowRisks = 0;
    let controlSum = 0;
    let controlCount = 0;

    risks.forEach((risk) => {
      const inherentScore = risk.likelihood * risk.impact;
      if (inherentScore >= 15) highRisks += 1;
      else if (inherentScore >= 7) mediumRisks += 1;
      else lowRisks += 1;

      if (typeof risk.controlEffectiveness === "number") {
        controlSum += risk.controlEffectiveness;
        controlCount += 1;
      }
    });

    return {
      totalRisks: risks.length,
      highRisks,
      mediumRisks,
      lowRisks,
      averageControlEffectiveness: controlCount ? controlSum / controlCount : 0,
    };
  }, [risks]);
}
