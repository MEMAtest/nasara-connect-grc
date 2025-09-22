"use client";

import { useMemo } from "react";
import { Eye, FileDown, Pencil, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RiskFilters } from "./RiskFilters";
import type { RiskFiltersState, RiskRecord } from "../lib/riskConstants";

interface RiskRegisterProps {
  risks: RiskRecord[];
  filteredRisks: RiskRecord[];
  filters: RiskFiltersState;
  onFiltersChange: (filters: RiskFiltersState) => void;
  isLoading?: boolean;
  error?: string | null;
  onCreateRisk?: () => void;
  onExport?: () => void;
  onViewRisk?: (risk: RiskRecord) => void;
  onEditRisk?: (risk: RiskRecord) => void;
  onSuggestMitigation?: (risk: RiskRecord) => void;
  categories: string[];
}

function getScoreColor(score: number) {
  if (score <= 4) return "bg-emerald-100 text-emerald-700";
  if (score <= 9) return "bg-amber-100 text-amber-700";
  if (score <= 14) return "bg-orange-100 text-orange-700";
  return "bg-rose-100 text-rose-700";
}

function formatScore(score: number) {
  if (score <= 4) return "Low";
  if (score <= 9) return "Moderate";
  if (score <= 14) return "High";
  return "Critical";
}

function getStatusBadge(status: RiskRecord["status"]) {
  switch (status) {
    case "open":
      return { label: "Open", className: "bg-rose-100 text-rose-700" };
    case "under_review":
      return { label: "Under Review", className: "bg-amber-100 text-amber-700" };
    case "mitigated":
      return { label: "Mitigated", className: "bg-emerald-100 text-emerald-700" };
    default:
      return { label: "Archived", className: "bg-slate-200 text-slate-600" };
  }
}

export function RiskRegister({
  risks,
  filteredRisks,
  filters,
  onFiltersChange,
  isLoading = false,
  error,
  onCreateRisk,
  onExport,
  onViewRisk,
  onEditRisk,
  onSuggestMitigation,
  categories,
}: RiskRegisterProps) {
  const rows = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 6 }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="border-b border-slate-100">
          <td colSpan={6} className="px-4 py-5">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </td>
        </tr>
      ));
    }

    if (filteredRisks.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
            No risks match the current filters. Try adjusting the filters or add a new risk.
          </td>
        </tr>
      );
    }

    return filteredRisks.map((risk) => {
      const inherentScore = risk.likelihood * risk.impact;
      const residualScore = (risk.residualLikelihood ?? risk.likelihood) * (risk.residualImpact ?? risk.impact);
      const status = getStatusBadge(risk.status);

      return (
        <tr
          key={risk.id}
          className="group border-b border-slate-100 transition hover:bg-slate-50/70"
        >
          <td className="px-4 py-4 font-mono text-xs text-slate-500">{risk.riskId}</td>
          <td className="px-4 py-4 align-top">
            <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
            <p className="text-xs text-slate-500">{risk.description.slice(0, 90)}{risk.description.length > 90 ? "…" : ""}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
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
            </div>
          </td>
          <td className="px-4 py-4 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow">
              <span className={clsx("rounded-full px-2 py-px text-xs font-semibold", getScoreColor(inherentScore))}>
                {formatScore(inherentScore)}
              </span>
              <span className="font-semibold text-slate-700">{inherentScore}</span>
            </div>
          </td>
          <td className="px-4 py-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">{risk.controlCount ?? 0}</span>
                {typeof risk.controlEffectiveness === "number" ? (
                  <Progress value={(risk.controlEffectiveness ?? 0) * 20} className="h-2 w-32" />
                ) : null}
              </div>
              <p className="text-xs text-slate-400">{risk.controlEffectiveness ? `${Math.round((risk.controlEffectiveness ?? 0) * 20)}% effective` : "No controls mapped"}</p>
            </div>
          </td>
          <td className="px-4 py-4 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow">
              <span className={clsx("rounded-full px-2 py-px text-xs font-semibold", getScoreColor(residualScore))}>
                {formatScore(residualScore)}
              </span>
              <span className="font-semibold text-slate-700">{residualScore}</span>
            </div>
          </td>
          <td className="px-4 py-4 text-sm">
            <div className="flex items-center gap-3">
              <Badge className={clsx("px-2 py-1 text-xs font-semibold", status.className)}>{status.label}</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewRisk?.(risk)}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">View risk</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditRisk?.(risk)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Edit risk</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-600" onClick={() => onSuggestMitigation?.(risk)}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">AI suggest mitigation</span>
                </Button>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  }, [filteredRisks, isLoading, onEditRisk, onSuggestMitigation, onViewRisk]);

  return (
    <section className="rounded-3xl border border-slate-100 bg-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Risk Register</h2>
          <p className="text-sm text-slate-500">Searchable, filterable register covering inherent and residual risk posture.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button size="sm" onClick={onCreateRisk} className="bg-teal-600 hover:bg-teal-700">
            + Add Risk
          </Button>
        </div>
      </div>

      <div className="px-6">
        <RiskFilters
          filters={filters}
          onChange={onFiltersChange}
          categories={categories}
          risks={risks}
        />
      </div>

      <Separator className="mt-4" />

      {error ? (
        <div className="px-6 pt-4 text-sm text-rose-600">{error}</div>
      ) : null}

      <div className="overflow-x-auto px-2 pb-6">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Risk ID</th>
              <th className="px-4 py-3">Title &amp; Category</th>
              <th className="px-4 py-3">Inherent Risk</th>
              <th className="px-4 py-3">Controls</th>
              <th className="px-4 py-3">Residual Risk</th>
              <th className="px-4 py-3">Status &amp; Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">{rows}</tbody>
        </table>
      </div>
    </section>
  );
}
