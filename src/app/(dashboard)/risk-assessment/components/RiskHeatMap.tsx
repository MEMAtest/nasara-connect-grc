"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { RiskRecord } from "../lib/riskConstants";

export type HeatMapView = "inherent" | "residual";

export interface RiskHeatMapProps {
  risks: RiskRecord[];
  view: HeatMapView;
  onViewChange?: (view: HeatMapView) => void;
  onCellClick?: (likelihood: number, impact: number) => void;
}

type HeatMapCell = {
  likelihood: number;
  impact: number;
  risks: RiskRecord[];
};

const LIKELIHOOD_LABELS = [
  "1 – Very Unlikely",
  "2 – Unlikely",
  "3 – Possible",
  "4 – Likely",
  "5 – Very Likely",
];

const IMPACT_LABELS = [
  "1 – Negligible",
  "2 – Minor",
  "3 – Moderate",
  "4 – Major",
  "5 – Severe",
];

function buildGrid(risks: RiskRecord[], view: HeatMapView): HeatMapCell[][] {
  const grid = Array.from({ length: 5 }, (_, impactIndex) =>
    Array.from({ length: 5 }, (_, likelihoodIndex) => ({
      likelihood: likelihoodIndex + 1,
      impact: 5 - impactIndex,
      risks: [] as RiskRecord[],
    })),
  );

  risks.forEach((risk) => {
    const likelihood = view === "inherent" ? risk.likelihood : risk.residualLikelihood ?? risk.likelihood;
    const impact = view === "inherent" ? risk.impact : risk.residualImpact ?? risk.impact;

    if (!likelihood || !impact) return;

    const i = 5 - impact;
    const j = likelihood - 1;
    if (grid[i]?.[j]) {
      grid[i][j].risks.push(risk);
    }
  });

  return grid;
}

function getCellTone(score: number) {
  if (score <= 4) return "from-emerald-200 to-emerald-300 border-emerald-200/70";
  if (score <= 9) return "from-amber-200 to-amber-300 border-amber-300/70";
  if (score <= 14) return "from-orange-300 to-orange-400 border-orange-300/70";
  if (score <= 19) return "from-rose-400 to-rose-500 border-rose-400/70";
  return "from-rose-500 to-rose-600 border-rose-500/80";
}

export function RiskHeatMap({ risks, view, onViewChange, onCellClick }: RiskHeatMapProps) {
  const grid = useMemo(() => buildGrid(risks, view), [risks, view]);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Risk Heat Map</h3>
          <p className="text-sm text-slate-500">
            {view === "inherent"
              ? "Likelihood × impact based on raw exposures."
              : "Residual view after existing controls."}
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 p-1 text-sm">
          {(["inherent", "residual"] as HeatMapView[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onViewChange?.(option)}
              className={clsx(
                "rounded-full px-3 py-1 font-semibold capitalize transition",
                option === view
                  ? "bg-white text-teal-600 shadow"
                  : "text-slate-500 hover:text-slate-700",
              )}
              aria-pressed={option === view}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col justify-between text-right text-xs font-medium text-slate-500">
          {IMPACT_LABELS.slice().reverse().map((label) => (
            <span key={label} className="py-2">
              {label}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-1 rounded-2xl bg-slate-50 p-2 shadow-inner">
            {grid.map((row) =>
              row.map((cell) => {
                const score = cell.likelihood * cell.impact;
                const hasRisks = cell.risks.length > 0;
                return (
                  <motion.button
                    key={`${cell.impact}-${cell.likelihood}`}
                    type="button"
                    className={clsx(
                      "relative aspect-square rounded-xl border bg-gradient-to-br text-sm font-semibold text-slate-700 transition-all",
                      getCellTone(score),
                      hasRisks ? "shadow-lg" : "shadow-sm",
                    )}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onCellClick?.(cell.likelihood, cell.impact)}
                    aria-label={`${cell.risks.length} risks at likelihood ${cell.likelihood} and impact ${cell.impact}`}
                  >
                    <span className="text-lg font-bold text-slate-900">
                      {hasRisks ? cell.risks.length : ""}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/70 px-3 text-center text-xs font-medium text-white opacity-0 transition-opacity duration-200 hover:opacity-100">
                      {hasRisks ? `View ${cell.risks.length} risk${cell.risks.length > 1 ? "s" : ""}` : `${score} score`}
                    </div>
                  </motion.button>
                );
              }),
            )}
          </div>
          <div className="grid grid-cols-5 gap-1 text-center text-xs font-medium text-slate-500">
            {LIKELIHOOD_LABELS.map((label) => (
              <span key={label} className="pt-2">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="font-semibold uppercase tracking-[0.3em] text-slate-400">Legend</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1">1-4 Low</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1">5-9 Moderate</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1">10-14 Elevated</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-200 px-2 py-1">15-19 High</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-300 px-2 py-1">20-25 Critical</span>
      </div>
    </section>
  );
}
