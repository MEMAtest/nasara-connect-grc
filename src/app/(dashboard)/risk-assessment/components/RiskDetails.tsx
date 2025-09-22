import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { RiskRecord } from "../lib/riskConstants";

interface RiskDetailsProps {
  risk: RiskRecord | null;
  onClose: () => void;
  children?: ReactNode;
}

export function RiskDetails({ risk, onClose, children }: RiskDetailsProps) {
  if (!risk) {
    return null;
  }

  const inherentScore = risk.likelihood * risk.impact;
  const residualScore = (risk.residualLikelihood ?? risk.likelihood) * (risk.residualImpact ?? risk.impact);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-500">Risk {risk.riskId}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{risk.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{risk.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
              {risk.category}
            </Badge>
            {risk.subCategory ? (
              <Badge variant="outline" className="border-slate-200 text-slate-500">
                {risk.subCategory}
              </Badge>
            ) : null}
            {risk.consumerDutyRelevant ? (
              <Badge className="bg-teal-100 text-teal-700">Consumer Duty</Badge>
            ) : null}
            {risk.reportableToFCA ? (
              <Badge className="bg-rose-100 text-rose-700">Regulator notified</Badge>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:bg-slate-100"
        >
          Close
        </button>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Inherent Score</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{inherentScore}</p>
          <p className="text-xs text-slate-500">Likelihood {risk.likelihood} × impact {risk.impact}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Residual Score</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{residualScore}</p>
          <p className="text-xs text-slate-500">
            Likelihood {risk.residualLikelihood ?? risk.likelihood} × impact {risk.residualImpact ?? risk.impact}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Owner</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{risk.riskOwner}</p>
          <p className="text-xs text-slate-500">{risk.businessUnit || "Business unit TBD"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Process</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{risk.process || "Not specified"}</p>
          <p className="text-xs text-slate-500">Review {risk.reviewFrequency}</p>
        </div>
      </section>

      <Separator />

      {children}
    </div>
  );
}
