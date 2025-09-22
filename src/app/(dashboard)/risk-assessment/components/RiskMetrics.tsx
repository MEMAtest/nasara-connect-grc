import type { RiskMetricsSummary } from "../hooks/useRiskCalculations";

interface RiskMetricsProps {
  summary: RiskMetricsSummary;
}

export function RiskMetrics({ summary }: RiskMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Total Risks</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalRisks}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">High</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{summary.highRisks}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500">Medium</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{summary.mediumRisks}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">Avg Control</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {summary.averageControlEffectiveness.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
