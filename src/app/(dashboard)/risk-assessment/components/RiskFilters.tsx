"use client";

import { useMemo } from "react";
import type { RiskFiltersState, RiskRecord } from "../lib/riskConstants";
import { RISK_STATUSES } from "../lib/riskConstants";

interface RiskFiltersProps {
  filters: RiskFiltersState;
  onChange: (filters: RiskFiltersState) => void;
  categories: string[];
  risks: RiskRecord[];
}

const riskLevelOptions = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function RiskFilters({ filters, onChange, categories, risks }: RiskFiltersProps) {
  const totals = useMemo(() => ({
    total: risks.length,
    filtered: risks.filter((risk) => {
      const inherentScore = risk.likelihood * risk.impact;
      const matchesLevel = (() => {
        if (filters.riskLevel === "all") return true;
        if (filters.riskLevel === "low") return inherentScore <= 6;
        if (filters.riskLevel === "medium") return inherentScore > 6 && inherentScore <= 14;
        return inherentScore > 14;
      })();
      const matchesCategory = filters.category === "all" || risk.category === filters.category;
      const matchesStatus = filters.status === "all" || risk.status === filters.status;
      const matchesSearch = filters.search
        ? [risk.riskId, risk.title, risk.description].some((value) =>
            value.toLowerCase().includes(filters.search.toLowerCase()),
          )
        : true;
      return matchesCategory && matchesStatus && matchesLevel && matchesSearch;
    }).length,
  }), [filters, risks]);

  const handleChange = (key: keyof RiskFiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => onChange({ ...filters, category: "all", status: "all", riskLevel: "all", search: "" });

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Filters
        </div>
        <div className="text-xs text-slate-500">
          Showing {totals.filtered} of {totals.total} risks
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Category
          <select
            value={filters.category}
            onChange={(event) => handleChange("category", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Status
          <select
            value={filters.status}
            onChange={(event) => handleChange("status", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All statuses</option>
            {RISK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Risk level
          <select
            value={filters.riskLevel}
            onChange={(event) => handleChange("riskLevel", event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
          >
            {riskLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Search
          <input
            type="search"
            value={filters.search}
            onChange={(event) => handleChange("search", event.target.value)}
            placeholder="Search risk title, description, owner"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-teal-600 transition hover:text-teal-500"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
